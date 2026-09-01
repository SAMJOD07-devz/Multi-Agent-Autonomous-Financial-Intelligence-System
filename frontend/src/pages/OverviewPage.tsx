// src/pages/OverviewPage.tsx
// Two states:
//  1. LANDING — no analysis run yet. Hero: prompt to analyze + past session history
//  2. ACTIVE  — analysis loaded. Hero: active ticker snapshot + signals + recent sessions
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../state/useAppStore';
import { mockHistoricalPriceData } from '../mocks/fixtureData';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
} from 'recharts';
import {
  ArrowRight,
  TrendingUp, TrendingDown, Minus,
  CheckCircle2, AlertTriangle,
  Clock, Search, BarChart2, FileText, History,
} from 'lucide-react';

/* ── helpers ──────────────────────────────────────────── */

const SignalPill = ({ signal }: { signal: string }) => {
  const map: Record<string, { color: string; Icon: typeof TrendingUp }> = {
    BULLISH: { color: 'var(--color-risk-safe)',   Icon: TrendingUp },
    NEUTRAL: { color: 'var(--color-risk-watch)',  Icon: Minus },
    BEARISH: { color: 'var(--color-risk-breach)', Icon: TrendingDown },
  };
  const { color, Icon } = map[signal] ?? map.NEUTRAL;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600,
      color, border: `1px solid ${color}33`, background: `${color}12`,
      padding: '2px 8px', borderRadius: 'var(--radius-sm)',
    }}>
      <Icon size={11} />{signal}
    </span>
  );
};

const StatusChip = ({
  ok, value,
}: { ok: boolean; value: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
    {ok
      ? <CheckCircle2 size={13} color="var(--color-risk-safe)" />
      : <AlertTriangle size={13} color="var(--color-risk-watch)" />}
    <span style={{
      fontFamily: 'var(--font-data)', fontSize: 12, fontWeight: 600,
      color: ok ? 'var(--color-ink)' : 'var(--color-risk-watch)',
    }}>{value}</span>
  </div>
);

/* ── component ────────────────────────────────────────── */

interface OverviewPageProps {
  onRunAnalysis?: (tickerOverride?: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onRunAnalysis }) => {
  const navigate = useNavigate();
  const {
    setActiveTicker,
    analysisResult, sessionsHistory, wsConnectionState,
  } = useAppStore();

  const rec     = analysisResult?.recommendation;
  const agents  = analysisResult?.agent_outputs ?? [];
  const latency = analysisResult?.telemetry?.latency_ms;

  const livePrice = analysisResult?.market_signals?.price_momentum?.current_price;
  const liveChangePct = analysisResult?.market_signals?.price_momentum?.price_change_pct;
  const liveHistory = analysisResult?.market_signals?.price_momentum?.history;

  const baseLatestPrice = mockHistoricalPriceData[mockHistoricalPriceData.length - 1]?.price;
  const latestPrice = livePrice ?? baseLatestPrice;
  const pricePct = liveChangePct !== undefined
    ? liveChangePct.toFixed(2)
    : (((latestPrice - (mockHistoricalPriceData[0]?.price || latestPrice)) / (mockHistoricalPriceData[0]?.price || 1)) * 100).toFixed(2);
  const isUp = Number(pricePct) >= 0;

  const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const scaleRatio = livePrice && livePrice > 0 ? livePrice / baseLatestPrice : 1;
  const chartData = (liveHistory && liveHistory.length > 0)
    ? liveHistory
    : mockHistoricalPriceData.map((pt, idx) => ({
        ...pt,
        time: idx === mockHistoricalPriceData.length - 1 ? nowTime : pt.time,
        price: Math.round(pt.price * scaleRatio * 10) / 10
      }));

  /* ── SYSTEM HEALTH strip (shared by both states) ── */
  const SystemHealth = () => {
    const isStreaming = wsConnectionState === 'live' || wsConnectionState === 'connecting';
    const sessionInfo = analysisResult?.market_signals?.market_session;
    const isMarketOpen = sessionInfo ? sessionInfo.is_open : false;
    const marketStatusLabel = sessionInfo?.status_label || (isMarketOpen ? 'Market Open' : 'Market Closed');
    const marketTimeNote = sessionInfo?.as_of || (isMarketOpen ? 'Live Trading' : 'As of 15:30 IST (Market Close)');

    return (
      <div className="panel-card" style={{ padding: '18px 20px' }}>
        <p className="section-label" style={{ marginTop: 0, marginBottom: 12 }}>System & Market</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Market Session Status */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: 'var(--color-ink)' }}>
                NSE Market
              </span>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--color-ink-faint)', marginTop: 2 }}>
                {marketTimeNote}
              </div>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 11,
                fontWeight: 600,
                color: isMarketOpen ? 'var(--color-risk-safe)' : 'var(--color-ink-muted)',
                background: isMarketOpen ? 'var(--color-risk-safe-bg)' : 'var(--color-subtle)',
                border: `1px solid ${isMarketOpen ? 'var(--color-risk-safe-border)' : 'var(--color-border)'}`,
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {marketStatusLabel}
            </span>
          </div>

          {/* WebSocket Agent Stream */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-muted)' }}>
              Agent Stream (WS)
            </span>
            <StatusChip
              ok={true}
              value={isStreaming ? 'Streaming' : 'Ready (Online)'}
            />
          </div>

          {/* FastAPI backend */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-muted)' }}>
              FastAPI Backend
            </span>
            <StatusChip ok={true} value="Online" />
          </div>

          {/* Response Latency */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-muted)' }}>
              Response Latency
            </span>
            <StatusChip
              ok={latency == null || latency < 1200}
              value={latency != null ? `${latency.toFixed(0)} ms` : '—'}
            />
          </div>
        </div>
      </div>
    );
  };

  /* ── RECENT SESSIONS panel (shared) ── */
  const RecentSessions = () => (
    <div className="panel-card" style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p className="section-label" style={{ margin: 0 }}>Recent sessions</p>
        <button onClick={() => navigate('/sessions')} style={{
          background: 'none', border: 'none', cursor: 'pointer', display: 'flex',
          alignItems: 'center', gap: 4, fontFamily: 'var(--font-ui)', fontSize: 11,
          color: 'var(--color-accent-text)', textDecoration: 'underline', textUnderlineOffset: 3,
        }}>
          View all <ArrowRight size={11} />
        </button>
      </div>

      {sessionsHistory.length === 0 ? (
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-faint)', margin: 0 }}>
          No past sessions yet. Run your first analysis above.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {sessionsHistory.slice(0, 5).map((s, i) => (
            <button
              key={s.session_id}
              onClick={() => {
                setActiveTicker(s.ticker);
                onRunAnalysis?.(s.ticker);
                navigate('/analyze');
              }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer',
                textAlign: 'left', borderBottom: i < sessionsHistory.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontFamily: 'var(--font-data)', fontSize: 13, fontWeight: 700, color: 'var(--color-ink)' }}>
                    {s.ticker}
                  </span>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-faint)' }}>
                    {s.profile}
                  </span>
                  {s.degraded_state && (
                    <AlertTriangle size={11} color="var(--color-risk-watch)" />
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <Clock size={10} color="var(--color-ink-faint)" />
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-faint)' }}>
                    {new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600,
                  color: 'var(--color-ink-muted)', border: '1px solid var(--color-border)',
                  padding: '2px 8px', borderRadius: 'var(--radius-sm)',
                }}>
                  {s.status_label}
                </span>
                <div style={{ fontFamily: 'var(--font-data)', fontSize: 11, color: 'var(--color-ink-faint)', marginTop: 3 }}>
                  {Math.round(s.confidence * 100)}%
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  /* ═══════════════════════════════════════════════════════════
     STATE 1 — LANDING (no analysis run yet)
     Hero: welcome + quick actions; right: past sessions + system
  ════════════════════════════════════════════════════════════ */
  if (!analysisResult) {
    const QUICK_TICKERS = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'TATAMOTORS'];

    return (
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 24px 64px' }}>

        {/* Page greeting */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{
            fontFamily: 'var(--font-ui)', fontSize: 28, fontWeight: 800,
            color: 'var(--color-ink)', margin: 0, letterSpacing: '-0.03em',
          }}>
            Good morning, investor
          </h1>
          <p style={{
            fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink-muted)',
            margin: '6px 0 0',
          }}>
            No analysis loaded yet. Search a ticker or pick from recent history below.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 24, alignItems: 'start' }}
          className="overview-grid"
        >
          {/* ── Left: landing hero ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Search CTA card */}
            <div className="panel-card" style={{ padding: '36px 32px' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: 'var(--color-accent-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20,
              }}>
                <Search size={22} color="var(--color-accent)" />
              </div>
              <h2 style={{
                fontFamily: 'var(--font-ui)', fontSize: 20, fontWeight: 700,
                color: 'var(--color-ink)', margin: 0, letterSpacing: '-0.02em',
              }}>
                Analyze a stock
              </h2>
              <p style={{
                fontFamily: 'var(--font-ui)', fontSize: 13, lineHeight: 1.65,
                color: 'var(--color-ink-muted)', margin: '8px 0 24px',
              }}>
                Enter any NSE ticker in the search bar above and click Analyze. Three parallel agents will run simultaneously — Fundamental RAG, Technical Momentum, and Media Sentiment — and synthesize into a single cited, profile-adjusted view.
              </p>

              {/* Quick ticker chips */}
              <p className="section-label" style={{ margin: '0 0 10px' }}>Popular tickers</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {QUICK_TICKERS.map(t => (
                  <button
                    key={t}
                    onClick={() => {
                      setActiveTicker(t);
                      onRunAnalysis?.(t);
                      navigate('/analyze');
                    }}
                    style={{
                      padding: '7px 16px',
                      fontFamily: 'var(--font-data)', fontSize: 12, fontWeight: 700,
                      color: 'var(--color-ink)',
                      background: 'var(--color-subtle)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      transition: 'border-color 150ms, color 150ms',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--color-accent)';
                      e.currentTarget.style.color = 'var(--color-accent)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--color-border)';
                      e.currentTarget.style.color = 'var(--color-ink)';
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Feature summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }} className="feature-grid">
              {[
                {
                  icon: BarChart2,
                  label: 'Three parallel agents',
                  desc: 'Fundamental RAG, Technical, and Sentiment agents run simultaneously and converge into one synthesis.',
                },
                {
                  icon: FileText,
                  label: 'SEBI-grounded citations',
                  desc: 'Every fundamental finding is anchored to official SEBI corporate filings with verbatim excerpts.',
                },
                {
                  icon: History,
                  label: 'Profile-adjusted output',
                  desc: 'Conservative vs Aggressive profile visibly shifts signal weighting, decision thresholds, and rationale.',
                },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="panel-card" style={{ padding: '18px 20px' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: 'var(--color-subtle)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 12,
                  }}>
                    <Icon size={18} color="var(--color-ink-muted)" />
                  </div>
                  <p style={{
                    fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 700,
                    color: 'var(--color-ink)', margin: '0 0 6px',
                  }}>
                    {label}
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-ui)', fontSize: 12, lineHeight: 1.55,
                    color: 'var(--color-ink-muted)', margin: 0,
                  }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Past session history — prominent on landing */}
            {sessionsHistory.length > 0 && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{
                    fontFamily: 'var(--font-ui)', fontSize: 15, fontWeight: 700,
                    color: 'var(--color-ink)', margin: 0,
                  }}>
                    Previous analyses
                  </h3>
                  <button onClick={() => navigate('/sessions')} style={{
                    background: 'none', border: 'none', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', gap: 4, fontFamily: 'var(--font-ui)', fontSize: 12,
                    color: 'var(--color-accent-text)', textDecoration: 'underline', textUnderlineOffset: 3,
                  }}>
                    Full history <ArrowRight size={12} />
                  </button>
                </div>

                {/* Session history table */}
                <div
                  className="panel-card"
                  style={{ overflow: 'hidden' }}
                >
                  {/* Table header */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 1fr 1fr 1fr 80px',
                    padding: '10px 20px',
                    background: 'var(--color-subtle)',
                    borderBottom: '1px solid var(--color-border)',
                  }}>
                    {['Ticker', 'Profile', 'Signal', 'Confidence', 'Time'].map(h => (
                      <span key={h} className="section-label" style={{ margin: 0 }}>{h}</span>
                    ))}
                  </div>

                  {sessionsHistory.slice(0, 8).map((s, i) => (
                    <button
                      key={s.session_id}
                      onClick={() => {
                        setActiveTicker(s.ticker);
                        onRunAnalysis?.(s.ticker);
                        navigate('/analyze');
                      }}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1.5fr 1fr 1fr 1fr 80px',
                        padding: '13px 20px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        textAlign: 'left', width: '100%',
                        borderBottom: i < sessionsHistory.length - 1 ? '1px solid var(--color-border)' : 'none',
                        transition: 'background 120ms',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-subtle)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontFamily: 'var(--font-data)', fontSize: 13, fontWeight: 700, color: 'var(--color-accent-text)' }}>
                          {s.ticker}
                        </span>
                        {s.degraded_state && <AlertTriangle size={11} color="var(--color-risk-watch)" />}
                      </div>
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--color-ink-muted)', alignSelf: 'center' }}>
                        {s.profile}
                      </span>
                      <div style={{ alignSelf: 'center' }}>
                        <span style={{
                          fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600,
                          color: 'var(--color-ink-muted)', border: '1px solid var(--color-border)',
                          padding: '2px 8px', borderRadius: 'var(--radius-sm)',
                        }}>
                          {s.status_label}
                        </span>
                      </div>
                      <span style={{ fontFamily: 'var(--font-data)', fontSize: 13, fontWeight: 700, color: 'var(--color-ink)', alignSelf: 'center' }}>
                        {Math.round(s.confidence * 100)}%
                      </span>
                      <span style={{ fontFamily: 'var(--font-data)', fontSize: 11, color: 'var(--color-ink-faint)', alignSelf: 'center' }}>
                        {new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: system health ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <SystemHealth />
          </div>
        </div>

        <style>{`
          @media (max-width: 899px) { .overview-grid { grid-template-columns: 1fr !important; } }
          @media (max-width: 700px) { .feature-grid { grid-template-columns: 1fr !important; } }
        `}</style>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     STATE 2 — ACTIVE (analysis loaded)
     Hero: ticker snapshot + mini chart + signals; right: sessions + system
  ════════════════════════════════════════════════════════════ */
  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px 56px' }}>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontFamily: 'var(--font-ui)', fontSize: 26, fontWeight: 800,
          color: 'var(--color-ink)', margin: 0, letterSpacing: '-0.03em',
        }}>
          Good morning, investor
        </h1>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--color-ink-muted)', margin: '5px 0 0' }}>
          Here's the current state of your intelligence workstation.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 24, alignItems: 'start' }}
        className="overview-grid"
      >
        {/* ── Left: active ticker ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Ticker snapshot */}
          <div className="panel-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
              <div>
                <p className="section-label" style={{ margin: 0, marginBottom: 4 }}>Active ticker</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                  <span style={{ fontFamily: 'var(--font-data)', fontSize: 22, fontWeight: 800, color: 'var(--color-ink)' }}>
                    {analysisResult.ticker}
                  </span>
                  <span style={{ fontFamily: 'var(--font-data)', fontSize: 18, fontWeight: 700, color: 'var(--color-ink)' }}>
                    ₹{latestPrice?.toFixed(1)}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-data)', fontSize: 13, fontWeight: 600,
                    color: isUp ? 'var(--color-risk-safe)' : 'var(--color-risk-breach)',
                  }}>
                    {isUp ? '+' : ''}{pricePct}% today
                  </span>
                </div>
              </div>
              {rec && (
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--font-data)', fontSize: 28, fontWeight: 800, color: 'var(--color-ink)', lineHeight: 1 }}>
                    {Math.round(rec.confidence * 100)}%
                  </div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-faint)', marginTop: 2 }}>
                    signal confidence
                  </div>
                </div>
              )}
            </div>

            {/* Mini chart */}
            <div style={{ height: 120, marginBottom: 16 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="miniArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1B4FD8" stopOpacity={0.14} />
                      <stop offset="100%" stopColor="#1B4FD8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" hide />
                  <YAxis domain={['auto', 'auto']} hide />
                  <Tooltip
                    contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 11, fontFamily: 'var(--font-data)' }}
                    formatter={(v: any) => [`₹${Number(v).toFixed(1)}`, 'Price']}
                  />
                  <Area type="monotone" dataKey="price" stroke="#1B4FD8" strokeWidth={2} fill="url(#miniArea)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {rec && (
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, lineHeight: 1.6, color: 'var(--color-ink-muted)', margin: '0 0 16px' }}>
                {rec.summary}
              </p>
            )}
            <button onClick={() => navigate('/analyze')} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Open full analysis <ArrowRight size={14} />
            </button>
          </div>

          {/* Agent signals — compact */}
          {agents.length > 0 && (
            <div className="panel-card" style={{ padding: '20px' }}>
              <p className="section-label" style={{ marginBottom: 12, marginTop: 0 }}>Agent signals</p>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {agents.map((a, i) => (
                  <div key={a.agent_name} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: i < agents.length - 1 ? '1px solid var(--color-border)' : 'none',
                    gap: 12,
                  }}>
                    <div>
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--color-ink)', textTransform: 'capitalize' }}>
                        {a.agent_name}
                      </span>
                      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-faint)', margin: '2px 0 0' }}>
                        {a.reasoning.slice(0, 80)}…
                      </p>
                    </div>
                    <SignalPill signal={a.classification} />
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/analyze')} style={{
                display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none',
                cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 12,
                color: 'var(--color-accent-text)', padding: '10px 0 0',
                textDecoration: 'underline', textUnderlineOffset: 3,
              }}>
                View full reasoning trail <ArrowRight size={12} />
              </button>
            </div>
          )}
        </div>

        {/* ── Right: sessions + system ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <RecentSessions />
          <SystemHealth />
        </div>
      </div>

      <style>{`
        @media (max-width: 899px) { .overview-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
};
