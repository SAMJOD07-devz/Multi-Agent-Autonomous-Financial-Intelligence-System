// src/components/synthesis/Recommendation.tsx
// Synthesis hero block — the first thing eyes land on.
// Confidence shown once here; never duplicated in header or agent cards' parent.
import React from 'react';
import type { Recommendation, RiskProfile } from '../../types';
import { ShieldCheck, AlertTriangle, ExternalLink } from 'lucide-react';

interface RecommendationProps {
  recommendation: Recommendation | null;
  profile: RiskProfile;
  citationCount: number;
  onViewCitations: () => void;
  degradedState: boolean;
}

// Recommendation label → display style
const LABEL_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  BUY:       { color: 'var(--color-risk-safe)',   bg: 'var(--color-risk-safe-bg)',   border: 'var(--color-risk-safe-border)' },
  ACCUMULATE:{ color: 'var(--color-risk-safe)',   bg: 'var(--color-risk-safe-bg)',   border: 'var(--color-risk-safe-border)' },
  WATCH:     { color: 'var(--color-risk-watch)',  bg: 'var(--color-risk-watch-bg)',  border: 'var(--color-risk-watch-border)' },
  HOLD:      { color: 'var(--color-risk-watch)',  bg: 'var(--color-risk-watch-bg)',  border: 'var(--color-risk-watch-border)' },
  REDUCE:    { color: 'var(--color-risk-breach)', bg: 'var(--color-risk-breach-bg)', border: 'var(--color-risk-breach-border)' },
  SELL:      { color: 'var(--color-risk-breach)', bg: 'var(--color-risk-breach-bg)', border: 'var(--color-risk-breach-border)' },
};

export const RecommendationCard: React.FC<RecommendationProps> = ({
  recommendation,
  profile,
  citationCount,
  onViewCitations,
  degradedState,
}) => {
  if (degradedState || !recommendation) {
    return (
      <div
        style={{
          padding: '16px 20px',
          background: 'var(--color-risk-breach-bg)',
          border: '1px solid var(--color-risk-breach-border)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
        }}
      >
        <AlertTriangle size={18} style={{ color: 'var(--color-risk-breach)', flexShrink: 0, marginTop: 1 }} />
        <div>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--color-ink)',
              margin: 0,
              marginBottom: 4,
            }}
          >
            Recommendation suppressed
          </p>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 13,
              color: 'var(--color-ink-muted)',
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            The system is in degraded feed mode. Per investor safety policy, ungrounded recommendations are blocked. Review the agent reasoning for available partial findings.
          </p>
        </div>
      </div>
    );
  }

  const labelKey = recommendation.label?.toUpperCase() ?? 'WATCH';
  const style = LABEL_STYLES[labelKey] ?? LABEL_STYLES.WATCH;
  const confidencePct = Math.round(recommendation.confidence * 100);

  return (
    <div>
      {/* Primary action + confidence — the hero row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Recommendation label — large */}
          <span
            style={{
              display: 'inline-block',
              padding: '6px 14px',
              background: style.bg,
              color: style.color,
              border: `1px solid ${style.border}`,
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-ui)',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            {recommendation.label}
          </span>

          {/* Action text if present */}
          {recommendation.action && (
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 20,
                fontWeight: 700,
                color: 'var(--color-ink)',
                letterSpacing: '-0.02em',
              }}
            >
              {recommendation.action}
            </span>
          )}
        </div>

        {/* Confidence — shown once, right side */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div
            style={{
              fontFamily: 'var(--font-data)',
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--color-ink)',
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            {confidencePct}%
          </div>
          <div
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 11,
              color: 'var(--color-ink-faint)',
              marginTop: 3,
            }}
          >
            signal confidence
          </div>
        </div>
      </div>

      {/* Summary */}
      <p
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: 14,
          lineHeight: 1.65,
          color: 'var(--color-ink-muted)',
          margin: 0,
          marginBottom: 12,
        }}
      >
        {recommendation.summary}
      </p>

      {/* Rationale — slightly de-emphasized */}
      <div
        style={{
          padding: '12px 14px',
          background: 'var(--color-subtle)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 14,
        }}
      >
        <p
          className="section-label"
          style={{ marginBottom: 6, marginTop: 0 }}
        >
          Profile rationale — {profile}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            lineHeight: 1.6,
            color: 'var(--color-ink-muted)',
            margin: 0,
          }}
        >
          {recommendation.rationale}
        </p>
      </div>

      {/* Footer: horizon + citations link */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {recommendation.target_timeframe && (
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 12,
                color: 'var(--color-ink-muted)',
              }}
            >
              Horizon:{' '}
              <span
                style={{
                  fontFamily: 'var(--font-data)',
                  fontWeight: 600,
                  color: 'var(--color-ink)',
                }}
              >
                {recommendation.target_timeframe}
              </span>
            </span>
          )}
        </div>

        {citationCount > 0 && (
          <button
            onClick={onViewCitations}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--color-accent-text)',
              padding: 0,
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            <ShieldCheck size={13} />
            {citationCount} grounded SEBI citations
            <ExternalLink size={11} />
          </button>
        )}
      </div>
    </div>
  );
};
