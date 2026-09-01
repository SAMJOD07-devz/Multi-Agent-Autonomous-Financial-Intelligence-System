// src/pages/AnalyzePage.tsx
// Two-column layout: main (synthesis + agent reasoning + chart) | sidebar (risk + holdings)
// Everything appears once. No duplicated metrics. Profile selector collapsed by default.
import React, { useState } from 'react';
import { useAppStore } from '../state/useAppStore';
import { ReasoningTrace } from '../components/agents/ReasoningTrace';
import { RecommendationCard } from '../components/synthesis/Recommendation';
import { PriceChart } from '../components/market/PriceChart';
import { PortfolioRiskMeter } from '../components/portfolio/PortfolioRiskMeter';
import { CitationDrawer } from '../components/agents/CitationDrawer';
import { DegradedAlert } from '../components/common/DegradedAlert';
import { mockUserHoldings } from '../mocks/fixtureData';
import { ChevronDown, ChevronUp, ShieldCheck, Zap } from 'lucide-react';

interface AnalyzePageProps {
  onRunAnalysis: () => void;
}

export const AnalyzePage: React.FC<AnalyzePageProps> = ({ onRunAnalysis }) => {
  const {
    activeTicker,
    activeProfile,
    setActiveProfile,
    isLoading,
    analysisResult,
    wsEvents,
    selectedCitation,
    isCitationDrawerOpen,
    setSelectedCitation,
    setCitationDrawerOpen,
  } = useAppStore();

  const [profileOpen, setProfileOpen] = useState(false);

  const portfolioContext = analysisResult?.portfolio_context;
  const hhiScore = analysisResult?.telemetry?.risk_concentration_score ?? portfolioContext?.hhi_score ?? 0.28;
  const holdings = (portfolioContext?.holdings && portfolioContext.holdings.length > 0)
    ? portfolioContext.holdings
    : mockUserHoldings;

  return (
    <>
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '28px 24px 48px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 32,
        }}
      >
        {/* ── Main column ─────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Page heading — ticker appears here, once */}
          <div style={{ marginBottom: 24 }}>
            <p className="section-label" style={{ marginBottom: 4, marginTop: 0 }}>
              Analysis
            </p>
            <h1
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 24,
                fontWeight: 800,
                color: 'var(--color-ink)',
                margin: 0,
                letterSpacing: '-0.03em',
              }}
            >
              <span style={{ fontFamily: 'var(--font-data)' }}>{activeTicker}</span>
              {analysisResult?.recommendation && (
                <span
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 14,
                    fontWeight: 400,
                    color: 'var(--color-ink-muted)',
                    marginLeft: 12,
                  }}
                >
                  {analysisResult.profile} profile
                </span>
              )}
            </h1>
          </div>

          {/* Profile selector — collapsed by default */}
          <div
            style={{
              marginBottom: 20,
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => setProfileOpen(v => !v)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 16px',
                background: 'var(--color-surface)',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-ui)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="section-label" style={{ margin: 0 }}>
                  Risk Profile
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--color-ink)',
                  }}
                >
                  {activeProfile}
                </span>
              </div>
              {profileOpen ? <ChevronUp size={15} color="var(--color-ink-faint)" /> : <ChevronDown size={15} color="var(--color-ink-faint)" />}
            </button>

            {profileOpen && (
              <div
                style={{
                  borderTop: '1px solid var(--color-border)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 0,
                }}
              >
                {(['Conservative', 'Aggressive'] as const).map(p => {
                  const isActive = activeProfile === p;
                  return (
                    <button
                      key={p}
                      onClick={() => { setActiveProfile(p); setProfileOpen(false); onRunAnalysis(); }}
                      style={{
                        padding: '14px 18px',
                        background: isActive ? 'var(--color-accent-light)' : 'var(--color-surface)',
                        border: 'none',
                        borderLeft: isActive ? '3px solid var(--color-accent)' : '3px solid transparent',
                        borderRight: p === 'Conservative' ? '1px solid var(--color-border)' : 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                        {p === 'Conservative'
                          ? <ShieldCheck size={14} color={isActive ? 'var(--color-accent)' : 'var(--color-ink-faint)'} />
                          : <Zap size={14} color={isActive ? 'var(--color-accent)' : 'var(--color-ink-faint)'} />}
                        <span
                          style={{
                            fontFamily: 'var(--font-ui)',
                            fontSize: 13,
                            fontWeight: 700,
                            color: isActive ? 'var(--color-accent)' : 'var(--color-ink)',
                          }}
                        >
                          {p}
                        </span>
                      </div>
                      <p
                        style={{
                          fontFamily: 'var(--font-ui)',
                          fontSize: 12,
                          color: 'var(--color-ink-muted)',
                          margin: 0,
                          lineHeight: 1.4,
                        }}
                      >
                        {p === 'Conservative'
                          ? 'Capital preservation. Heavy weight on SEBI filings. Penalizes overbought RSI.'
                          : 'Growth focus. Prioritizes technical momentum signals and volume breakouts.'}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Degraded state alert — before synthesis */}
          {analysisResult?.degraded_state && (
            <div style={{ marginBottom: 20 }}>
              <DegradedAlert
                reason={analysisResult.degradation_reason || 'Backend feed degradation.'}
                unavailableData={analysisResult.unavailable_data || []}
                safeNextStep={analysisResult.safe_next_step}
                onRetry={onRunAnalysis}
              />
            </div>
          )}

          {/* ── HERO: Synthesis ─────────────── */}
          <div
            className="panel-card"
            style={{ padding: '24px', marginBottom: 24 }}
          >
            <RecommendationCard
              recommendation={analysisResult?.recommendation ?? null}
              profile={activeProfile}
              citationCount={analysisResult?.citations?.length ?? 0}
              onViewCitations={() => {
                if (analysisResult?.citations?.length) {
                  setSelectedCitation(analysisResult.citations[0]);
                }
              }}
              degradedState={Boolean(analysisResult?.degraded_state)}
            />
          </div>

          {/* ── Agent Reasoning Trail ────────── */}
          <div className="panel-card" style={{ padding: '24px', marginBottom: 24 }}>
            <ReasoningTrace
              agentOutputs={analysisResult?.agent_outputs ?? []}
              wsEvents={wsEvents}
              isAnalyzing={isLoading}
              onSelectCitation={c => setSelectedCitation(c)}
            />
          </div>

          {/* ── Price Chart — full width ─────── */}
          <div className="panel-card" style={{ padding: '24px' }}>
            <PriceChart
              ticker={activeTicker}
              currentPrice={analysisResult?.market_signals?.price_momentum?.current_price}
              history={analysisResult?.market_signals?.price_momentum?.history}
              marketSession={analysisResult?.market_signals?.market_session}
            />
          </div>
        </div>

        {/* ── Right sidebar (risk + holdings — single source) ─ */}
        <aside
          style={{
            width: 280,
            flexShrink: 0,
          }}
          className="analyze-sidebar"
        >
          <div style={{ position: 'sticky', top: 68 }}>
            <div className="panel-card" style={{ padding: '20px' }}>
              <PortfolioRiskMeter
                hhiScore={hhiScore}
                holdings={holdings}
                activeTicker={activeTicker}
              />
            </div>
          </div>
        </aside>
      </div>

      {/* Citation drawer */}
      <CitationDrawer
        citation={selectedCitation}
        isOpen={isCitationDrawerOpen}
        onClose={() => setCitationDrawerOpen(false)}
      />

      {/* Responsive hide sidebar below 1000px */}
      <style>{`
        @media (max-width: 999px) {
          .analyze-sidebar { display: none !important; }
        }
      `}</style>
    </>
  );
};
