// src/types/index.ts
// Comprehensive TypeScript domain contracts for AstraVest Intelligence

export type RiskProfile = 'Conservative' | 'Aggressive' | 'Moderate';

export type SignalType = 'BULLISH' | 'BEARISH' | 'NEUTRAL';

export type AgentName = 'fundamental' | 'technical' | 'sentiment';

export type AgentExecutionStatus = 'completed' | 'failed' | 'unavailable' | 'SUCCESS' | 'running';

export type RecommendationLabel = 'BUY' | 'ACCUMULATE' | 'WATCH' | 'HOLD' | 'REDUCE' | 'SELL';

export interface Citation {
  title: string;
  source: string;
  locator: string;
  // Extended fields for citation drawer / excerpt viewer
  document_name?: string;
  page_number?: number | string;
  excerpt?: string;
  url?: string;
  published_at?: string;
}

export interface AgentOutput {
  agent_name: AgentName | string;
  status: AgentExecutionStatus;
  classification: SignalType;
  confidence: number; // 0.0 - 1.0
  reasoning: string;
  citations: Citation[];
  // Streaming execution metadata
  progress_percent?: number;
  elapsed_ms?: number;
}

export interface Recommendation {
  label: RecommendationLabel | string;
  summary: string;
  rationale: string;
  confidence: number;
  action?: string;
  target_timeframe?: string;
  risk_level?: string;
}

export interface Telemetry {
  latency_ms: number;
  risk_concentration_score: number | null; // HHI
  combined_confidence: number;
}

export interface PortfolioHolding {
  holding_id: string;
  portfolio_id?: string;
  ticker: string;
  quantity: number;
  avg_buy_price: number;
  current_price: number;
  asset_class: string;
  weight: number; // fractional weight (0 - 1)
}

export interface PortfolioContext {
  portfolio_id: string;
  hhi_score: number;
  total_holdings_count?: number;
  ticker_weight?: number;
  holdings?: PortfolioHolding[];
}

export interface MarketSignals {
  price_momentum?: {
    rsi_14?: number;
    macd_signal?: string;
    ema_spread?: number;
    current_price?: number;
    price_change_pct?: number;
  };
  volume_anomaly?: {
    volume_spike_ratio?: number;
    avg_daily_volume?: number;
  };
  sentiment?: {
    news_sentiment_score?: number;
    social_volume?: number;
  };
}

export interface AnalysisRequest {
  ticker: string;
  behavioral_profile: RiskProfile;
  user_id?: string;
  portfolio_id?: string;
  request_id?: string;
  scenario?: string;
}

export interface AnalysisResponse {
  session_id: string;
  ticker: string;
  profile: RiskProfile;
  degraded_state: boolean;
  degradation_reason: string | null;
  unavailable_data: string[];
  recommendation: Recommendation | null;
  agent_outputs: AgentOutput[];
  market_signals: MarketSignals;
  portfolio_context: PortfolioContext;
  citations: Citation[];
  safe_next_step: string | null;
  telemetry: Telemetry;
  created_at: string;
}

export interface WSEvent {
  session_id: string;
  sequence_number: number;
  event_type: 'connected' | 'agent_started' | 'agent_progress' | 'agent_completed' | 'synthesis_started' | 'synthesis_completed' | 'completed' | 'degraded' | 'error' | string;
  timestamp: string;
  payload: Record<string, any>;
}

export interface HistoricalPoint {
  time: string;
  price: number;
  volume: number;
  rsi: number;
  ma20: number;
}

export interface SessionRecord {
  session_id: string;
  ticker: string;
  profile: RiskProfile;
  created_at: string;
  status_label: string;
  confidence: number;
  degraded_state: boolean;
}
