// src/api/client.ts
import type { AnalysisRequest, AnalysisResponse, RiskProfile } from '../types';
import {
  mockCleanAnalysisResponse,
  mockTimeoutDegradedResponse,
  mockConflictingResponse
} from '../mocks/fixtureData';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export async function fetchAnalysis(
  request: AnalysisRequest,
  signal?: AbortSignal,
  isMockMode: boolean = false
): Promise<AnalysisResponse> {
  const { ticker, behavioral_profile, scenario, user_id, portfolio_id, request_id } = request;

  if (isMockMode) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    if (scenario === 'timeout') return mockTimeoutDegradedResponse(ticker);
    if (scenario === 'conflicting') return mockConflictingResponse(ticker);
    return mockCleanAnalysisResponse(ticker, behavioral_profile);
  }

  let url = `${BASE_URL}/api/v1/analyze`;
  if (scenario) {
    url += `?scenario=${encodeURIComponent(scenario)}`;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(scenario ? { 'X-Scenario': scenario } : {})
      },
      body: JSON.stringify({
        ticker: ticker.toUpperCase(),
        behavioral_profile: behavioral_profile,
        user_id: user_id || 'user_cons_01',
        portfolio_id: portfolio_id || 'port_cons_01',
        request_id: request_id || `req_${Date.now()}`
      }),
      signal
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API returned HTTP ${response.status}: ${errText}`);
    }

    const data: AnalysisResponse = await response.json();
    return normalizeAnalysisResponse(data, ticker, behavioral_profile);
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw error;
    }
    console.warn(`Backend connection failed (${error.message}). Falling back to local mock data.`);
    
    if (scenario === 'timeout') return mockTimeoutDegradedResponse(ticker);
    if (scenario === 'conflicting') return mockConflictingResponse(ticker);
    return mockCleanAnalysisResponse(ticker, behavioral_profile);
  }
}

export async function fetchHealth(): Promise<{ status: string; service?: string }> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/health`, { method: 'GET' });
    if (res.ok) return await res.json();
    return { status: 'unhealthy' };
  } catch {
    return { status: 'offline' };
  }
}

function normalizeAnalysisResponse(
  raw: any,
  fallbackTicker: string,
  fallbackProfile: RiskProfile
): AnalysisResponse {
  return {
    session_id: raw.session_id || `sess_${Date.now()}`,
    ticker: (raw.ticker || fallbackTicker).toUpperCase(),
    profile: (raw.profile || fallbackProfile) as RiskProfile,
    degraded_state: Boolean(raw.degraded_state),
    degradation_reason: raw.degradation_reason || null,
    unavailable_data: Array.isArray(raw.unavailable_data) ? raw.unavailable_data : [],
    recommendation: raw.recommendation ? {
      label: raw.recommendation.label || 'WATCH',
      summary: raw.recommendation.summary || '',
      rationale: raw.recommendation.rationale || '',
      confidence: typeof raw.recommendation.confidence === 'number' ? raw.recommendation.confidence : 0.5,
      action: raw.recommendation.action || 'HOLD & MONITOR',
      target_timeframe: raw.recommendation.target_timeframe || '1-3 Months',
      risk_level: raw.recommendation.risk_level || 'Moderate'
    } : null,
    agent_outputs: Array.isArray(raw.agent_outputs)
      ? raw.agent_outputs.map((a: any) => ({
          agent_name: a.agent_name || 'agent',
          status: a.status || 'completed',
          classification: a.classification || 'NEUTRAL',
          confidence: typeof a.confidence === 'number' ? a.confidence : 0.5,
          reasoning: a.reasoning || '',
          citations: Array.isArray(a.citations)
            ? a.citations.map((c: any) => ({
                title: c.title || 'Source Citation',
                source: c.source || 'Internal DB',
                locator: c.locator || '',
                document_name: c.document_name || c.title || 'Document.pdf',
                page_number: c.page_number || 1,
                excerpt: c.excerpt || c.reasoning || 'Excerpt retrieved from filing database.'
              }))
            : []
        }))
      : [],
    market_signals: raw.market_signals || {},
    portfolio_context: raw.portfolio_context || { portfolio_id: 'default', hhi_score: 0.0 },
    citations: Array.isArray(raw.citations) ? raw.citations : [],
    safe_next_step: raw.safe_next_step || null,
    telemetry: {
      latency_ms: raw.telemetry?.latency_ms ?? 0,
      risk_concentration_score: raw.telemetry?.risk_concentration_score ?? raw.portfolio_context?.hhi_score ?? 0,
      combined_confidence: raw.telemetry?.combined_confidence ?? 0.5
    },
    created_at: raw.created_at || new Date().toISOString()
  };
}
