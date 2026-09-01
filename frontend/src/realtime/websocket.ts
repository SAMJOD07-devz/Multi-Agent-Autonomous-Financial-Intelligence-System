// src/realtime/websocket.ts
import type { WSEvent, AnalysisRequest } from '../types';

const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

export class AgentTraceWebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isIntentionalClose = false;
  private onEvent: (event: WSEvent) => void;
  private onStateChange: (state: 'disconnected' | 'connecting' | 'live' | 'reconnecting' | 'error') => void;

  constructor(
    onEvent: (event: WSEvent) => void,
    onStateChange: (state: 'disconnected' | 'connecting' | 'live' | 'reconnecting' | 'error') => void
  ) {
    this.onEvent = onEvent;
    this.onStateChange = onStateChange;
  }

  public connect(request: AnalysisRequest) {
    this.isIntentionalClose = false;
    this.onStateChange('connecting');

    try {
      const wsUrl = `${WS_BASE_URL}/ws/agent-trace`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.onStateChange('live');

        // Send handshake subscription payload
        const payload = {
          ticker: request.ticker.toUpperCase(),
          behavioral_profile: request.behavioral_profile,
          session_id: request.request_id || `sess_ws_${Date.now()}`,
          scenario: request.scenario || null
        };
        this.ws?.send(JSON.stringify(payload));
      };

      this.ws.onmessage = (event) => {
        try {
          const wsData: WSEvent = JSON.parse(event.data);
          this.onEvent(wsData);
        } catch (e) {
          console.error('Failed to parse WebSocket message:', event.data);
        }
      };

      this.ws.onclose = (event) => {
        // Code 1000 is a normal completion closure sent by FastAPI after streaming trace events finish
        if (event.code === 1000 || this.isIntentionalClose) {
          this.onStateChange('disconnected');
        } else if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.onStateChange('reconnecting');
          const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 8000);
          this.reconnectAttempts++;
          setTimeout(() => this.connect(request), delay);
        } else {
          this.onStateChange('disconnected');
        }
      };

      this.ws.onerror = (err) => {
        console.warn('WebSocket error encountered:', err);
        this.onStateChange('error');
      };
    } catch (err) {
      this.onStateChange('error');
    }
  }

  public disconnect() {
    this.isIntentionalClose = true;
    if (this.ws) {
      this.ws.close(1000, 'User initiated disconnect');
      this.ws = null;
    }
    this.onStateChange('disconnected');
  }
}
