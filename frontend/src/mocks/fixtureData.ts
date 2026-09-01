// src/mocks/fixtureData.ts
import type { AnalysisResponse, RiskProfile, HistoricalPoint, PortfolioHolding } from '../types';

export const mockCleanAnalysisResponse = (ticker: string = 'RELIANCE', profile: RiskProfile = 'Conservative'): AnalysisResponse => {
  const isConservative = profile === 'Conservative';

  return {
    session_id: `sess_clean_${Date.now()}`,
    ticker: ticker.toUpperCase(),
    profile: profile,
    degraded_state: false,
    degradation_reason: null,
    unavailable_data: [],
    recommendation: isConservative ? {
      label: 'WATCH',
      summary: `Fundamental health for ${ticker} is solid, but technical overbought levels indicate patience is prudent for conservative capital preservation.`,
      rationale: `Fundamental RAG rates ${ticker} valuation strong (conf: 0.85). Technical momentum flags overbought RSI (74.0). Conservative profile prioritizes capital protection given current market volatility.`,
      confidence: 0.79,
      action: 'HOLD & MONITOR',
      target_timeframe: '1-3 Months',
      risk_level: 'Low-Moderate'
    } : {
      label: 'BUY',
      summary: `Strong bullish momentum and revenue expansion catalysts identify ${ticker} as a high-conviction growth opportunity.`,
      rationale: `Aggressive profile leverages technical MACD breakout signal (conf: 0.78) and earnings expansion in SEBI Q3 disclosures (conf: 0.85). Tactical growth conviction outweighs short-term pullbacks.`,
      confidence: 0.88,
      action: 'TACTICAL ACCUMULATION',
      target_timeframe: '3-6 Months',
      risk_level: 'Moderate-High'
    },
    agent_outputs: [
      {
        agent_name: 'fundamental',
        status: 'completed',
        classification: 'BULLISH',
        confidence: 0.85,
        reasoning: `Robust financial balance sheet for ${ticker}, revenue up 12.4% YoY. Debt-to-Equity ratio remains healthy at 0.45. Operating margin expanded 180 bps in Q3.`,
        citations: [
          {
            title: `Q3 FY26 SEBI Disclosures - ${ticker}`,
            source: 'SEBI Corporate Filings',
            locator: `DocID: SEBI-2026-${ticker}-Q3, Page 14`,
            document_name: `SEBI_Q3_Disclosure_${ticker}.pdf`,
            page_number: 14,
            excerpt: `The Company reported quarterly standalone revenue from operations of INR 2.45,100 Crore, registering a YoY growth of 12.4%. Debt-to-Equity ratio stood at 0.45 with robust cash reserves.`
          },
          {
            title: `Audited Financial Statement 2025-26`,
            source: 'BSE India Disclosures',
            locator: 'BSE-FIN-2026-REL, Page 42',
            document_name: `BSE_Annual_Report_2025.pdf`,
            page_number: 42,
            excerpt: `Operating margins improved to 18.2% supported by retail digital revenue contribution.`
          }
        ]
      },
      {
        agent_name: 'technical',
        status: 'completed',
        classification: isConservative ? 'NEUTRAL' : 'BULLISH',
        confidence: 0.74,
        reasoning: `RSI-14 at 74.2 indicates near-term overbought zone. MACD line (+4.2) crossed above signal line (+1.8), establishing strong underlying medium-term momentum.`,
        citations: [
          {
            title: `NSE Realtime Market Feed - ${ticker}`,
            source: 'NSE Tick Feed Engine',
            locator: `Tick Feed ID: NSE-${ticker}-20260901`,
            document_name: `NSE_Indicator_Feed_${ticker}.json`,
            page_number: 1,
            excerpt: `RSI-14 = 74.20, MACD_Signal = BULLISH, EMA_20 = 1295.50, Volume_Spike_Ratio = 1.25x average.`
          }
        ]
      },
      {
        agent_name: 'sentiment',
        status: 'completed',
        classification: 'BULLISH',
        confidence: 0.81,
        reasoning: `Management earnings call transcript reflects highly optimistic executive commentary on clean energy expansion and retail subscriber growth. Media coverage sentiment ratio is 78% positive.`,
        citations: [
          {
            title: `Earnings Call Transcript Q3 FY26`,
            source: 'Corporate Relations',
            locator: 'Section: Outlook & Capex',
            document_name: `Earnings_Call_Transcript_Q3.pdf`,
            page_number: 8,
            excerpt: `We expect aggressive subscriber additions and clean energy commissioning to drive strong EBITDA accretion over the next 4 quarters.`
          }
        ]
      }
    ],
    market_signals: {
      price_momentum: { rsi_14: 74.2, macd_signal: 'BULLISH', ema_spread: 14.5 },
      volume_anomaly: { volume_spike_ratio: 1.25, avg_daily_volume: 8500000 },
      sentiment: { news_sentiment_score: 0.78, social_volume: 14200 }
    },
    portfolio_context: {
      portfolio_id: 'port_cons_01',
      hhi_score: 0.34,
      total_holdings_count: 4,
      holdings: mockUserHoldings,
      ticker_weight: ticker.toUpperCase() === 'RELIANCE' ? 0.50 : ticker.toUpperCase() === 'HDFCBANK' ? 0.11 : ticker.toUpperCase() === 'TCS' ? 0.24 : ticker.toUpperCase() === 'INFY' ? 0.15 : 0.0
    },
    citations: [
      {
        title: `Q3 FY26 SEBI Disclosures - ${ticker}`,
        source: 'SEBI Corporate Filings',
        locator: `DocID: SEBI-2026-${ticker}-Q3, Page 14`,
        document_name: `SEBI_Q3_Disclosure_${ticker}.pdf`,
        page_number: 14,
        excerpt: `The Company reported quarterly standalone revenue from operations of INR 2.45,100 Crore, registering a YoY growth of 12.4%.`
      }
    ],
    safe_next_step: null,
    telemetry: {
      latency_ms: 142.5,
      risk_concentration_score: 0.34,
      combined_confidence: isConservative ? 0.79 : 0.88
    },
    created_at: new Date().toISOString()
  };
};

export const mockTimeoutDegradedResponse = (ticker: string = 'RELIANCE'): AnalysisResponse => ({
  session_id: `sess_timeout_${Date.now()}`,
  ticker: ticker.toUpperCase(),
  profile: 'Conservative',
  degraded_state: true,
  degradation_reason: `Live market feed timed out for ticker '${ticker}'; current price and technical signals are unavailable.`,
  unavailable_data: ['live_market_feed', 'current_price', 'technical_indicators'],
  recommendation: null,
  agent_outputs: [
    {
      agent_name: 'fundamental',
      status: 'completed',
      classification: 'BULLISH',
      confidence: 0.85,
      reasoning: `SEBI corporate filings retrieved successfully for ${ticker}, but live tick feed is down.`,
      citations: [
        {
          title: `SEBI Filing - ${ticker}`,
          source: 'SEBI Disclosures',
          locator: 'Page 5',
          document_name: `SEBI_Filing_${ticker}.pdf`,
          page_number: 5,
          excerpt: `Revenue growth trajectory solid.`
        }
      ]
    },
    {
      agent_name: 'technical',
      status: 'failed',
      classification: 'NEUTRAL',
      confidence: 0.0,
      reasoning: `Live price tick feed connection timed out after 5000ms. Technical indicators could not be computed.`,
      citations: []
    }
  ],
  market_signals: {},
  portfolio_context: { portfolio_id: 'port_01', hhi_score: 0.28 },
  citations: [],
  safe_next_step: 'Retry when market data source is restored or review cited historical disclosures.',
  telemetry: {
    latency_ms: 5012.0,
    risk_concentration_score: 0.28,
    combined_confidence: 0.0
  },
  created_at: new Date().toISOString()
});

export const mockConflictingResponse = (ticker: string = 'RELIANCE'): AnalysisResponse => ({
  session_id: `sess_conflict_${Date.now()}`,
  ticker: ticker.toUpperCase(),
  profile: 'Conservative',
  degraded_state: true,
  degradation_reason: `Conflicting directional signals detected for '${ticker}': Fundamental agent evaluates BULLISH (conf: 0.88), while Technical agent evaluates BEARISH (conf: 0.85). Synthesis aborted for investor protection.`,
  unavailable_data: ['consensus_signal'],
  recommendation: null,
  agent_outputs: [
    {
      agent_name: 'fundamental',
      status: 'completed',
      classification: 'BULLISH',
      confidence: 0.88,
      reasoning: `Strong fundamental earnings expansion and cash flow generation reported in SEBI filing for ${ticker}.`,
      citations: [
        {
          title: `SEBI Q3 Corporate Filing`,
          source: 'SEBI Disclosures',
          locator: 'DocID: SEBI-2026-REL-Q3, Page 8',
          document_name: `SEBI_Q3_${ticker}.pdf`,
          page_number: 8,
          excerpt: `Net profits grew 15.2% year-on-year driven by retail segment expansion.`
        }
      ]
    },
    {
      agent_name: 'technical',
      status: 'completed',
      classification: 'BEARISH',
      confidence: 0.85,
      reasoning: `Severe head-and-shoulders reversal pattern on ${ticker} daily chart with high-volume breakdown below 200 SMA.`,
      citations: [
        {
          title: `NSE Technical Signal Engine`,
          source: 'NSE Market Feed',
          locator: 'Technical Pattern Engine L88',
          document_name: `NSE_Technical_Breakdown.json`,
          page_number: 1,
          excerpt: `Major support level at INR 1280 broken with 2.8x average volume.`
        }
      ]
    },
    {
      agent_name: 'sentiment',
      status: 'completed',
      classification: 'NEUTRAL',
      confidence: 0.60,
      reasoning: `Balanced news coverage with equal weight of positive quarterly earnings vs sector regulatory headwinds.`,
      citations: []
    }
  ],
  market_signals: {
    price_momentum: { rsi_14: 38.0, macd_signal: 'BEARISH' },
    volume_anomaly: { volume_spike_ratio: 2.80 },
    sentiment: { news_sentiment_score: 0.50 }
  },
  portfolio_context: { portfolio_id: 'port_01', hhi_score: 0.28 },
  citations: [],
  safe_next_step: 'Review individual agent reasoning traces and wait for market signal convergence before taking action.',
  telemetry: {
    latency_ms: 285.0,
    risk_concentration_score: 0.28,
    combined_confidence: 0.0
  },
  created_at: new Date().toISOString()
});

export const mockHistoricalPriceData: HistoricalPoint[] = [
  { time: '09:15', price: 1285.0, volume: 120000, rsi: 52.0, ma20: 1280.0 },
  { time: '10:00', price: 1292.5, volume: 240000, rsi: 58.4, ma20: 1285.0 },
  { time: '11:00', price: 1305.0, volume: 380000, rsi: 64.2, ma20: 1290.0 },
  { time: '12:00', price: 1298.0, volume: 190000, rsi: 61.5, ma20: 1292.0 },
  { time: '13:00', price: 1312.0, volume: 510000, rsi: 72.8, ma20: 1295.0 },
  { time: '14:00', price: 1318.4, volume: 620000, rsi: 74.2, ma20: 1300.0 },
  { time: '15:15', price: 1301.5, volume: 430000, rsi: 71.0, ma20: 1298.0 }
];

export const mockUserHoldings: PortfolioHolding[] = [
  { holding_id: 'h1', ticker: 'RELIANCE', quantity: 300, avg_buy_price: 1180.0, current_price: 1309.0, asset_class: 'Equity', weight: 0.50 },
  { holding_id: 'h2', ticker: 'TCS', quantity: 80, avg_buy_price: 2400.0, current_price: 2369.0, asset_class: 'Equity', weight: 0.24 },
  { holding_id: 'h3', ticker: 'INFY', quantity: 200, avg_buy_price: 1100.0, current_price: 1156.0, asset_class: 'Equity', weight: 0.15 },
  { holding_id: 'h4', ticker: 'HDFCBANK', quantity: 120, avg_buy_price: 680.0, current_price: 711.9, asset_class: 'Banking', weight: 0.11 }
];
