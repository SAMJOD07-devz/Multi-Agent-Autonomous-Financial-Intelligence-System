// src/components/common/DegradedAlert.tsx
// Clean amber/rose degraded state using semantic risk colors only
import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface DegradedAlertProps {
  reason: string;
  unavailableData: string[];
  safeNextStep?: string | null;
  onRetry?: () => void;
}

export const DegradedAlert: React.FC<DegradedAlertProps> = ({
  reason,
  unavailableData,
  safeNextStep,
  onRetry,
}) => {
  return (
    <div
      style={{
        padding: '14px 16px',
        background: 'var(--color-risk-watch-bg)',
        border: '1px solid var(--color-risk-watch-border)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}
    >
      <AlertTriangle
        size={16}
        style={{ color: 'var(--color-risk-watch)', flexShrink: 0, marginTop: 2 }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--color-risk-watch)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Degraded Data Mode
          </span>
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 11,
              color: 'var(--color-ink-muted)',
            }}
          >
            · Recommendation suppressed
          </span>
        </div>

        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            color: 'var(--color-ink)',
            margin: 0,
            lineHeight: 1.55,
            marginBottom: unavailableData.length > 0 || safeNextStep ? 10 : 0,
          }}
        >
          {reason}
        </p>

        {unavailableData.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: safeNextStep ? 10 : 0 }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-muted)' }}>
              Unavailable feeds:
            </span>
            {unavailableData.map(feed => (
              <span
                key={feed}
                style={{
                  fontFamily: 'var(--font-data)',
                  fontSize: 11,
                  color: 'var(--color-ink-muted)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  padding: '1px 7px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {feed}
              </span>
            ))}
          </div>
        )}

        {safeNextStep && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 12,
                color: 'var(--color-ink-muted)',
                margin: 0,
                flex: 1,
              }}
            >
              {safeNextStep}
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="btn-ghost"
                style={{ flexShrink: 0, fontSize: 12 }}
              >
                <RefreshCw size={12} />
                Retry
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
