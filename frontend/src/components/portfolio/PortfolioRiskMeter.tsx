// src/components/portfolio/PortfolioRiskMeter.tsx
// Single source of truth for HHI. One gauge, one threshold marker, traffic-light color.
// This is the ONLY place HHI appears on screen.
import React from 'react';
import type { PortfolioHolding } from '../../types';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface PortfolioRiskMeterProps {
  hhiScore: number;
  holdings: PortfolioHolding[];
  activeTicker: string;
}

export const PortfolioRiskMeter: React.FC<PortfolioRiskMeterProps> = ({
  hhiScore,
  holdings,
  activeTicker,
}) => {
  const THRESHOLD = 0.25;
  const isBreach = hhiScore > THRESHOLD;
  const isWatch = hhiScore >= 0.22 && hhiScore <= THRESHOLD;

  const riskColor = isBreach
    ? 'var(--color-risk-breach)'
    : isWatch
    ? 'var(--color-risk-watch)'
    : 'var(--color-risk-safe)';

  const riskBg = isBreach
    ? 'var(--color-risk-breach-bg)'
    : isWatch
    ? 'var(--color-risk-watch-bg)'
    : 'var(--color-risk-safe-bg)';

  const riskBorder = isBreach
    ? 'var(--color-risk-breach-border)'
    : isWatch
    ? 'var(--color-risk-watch-border)'
    : 'var(--color-risk-safe-border)';

  const riskLabel = isBreach ? 'Breach' : isWatch ? 'Watch' : 'Safe';

  // Scale: 0.0 → 0.5 range displayed
  const gaugeMax = 0.5;
  const fillPct = Math.min((hhiScore / gaugeMax) * 100, 100);
  const thresholdPct = (THRESHOLD / gaugeMax) * 100;

  return (
    <div>
      {/* Section header */}
      <p
        className="section-label"
        style={{ marginBottom: 12, marginTop: 0 }}
      >
        Concentration Risk
      </p>

      {/* HHI gauge */}
      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 6,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              color: 'var(--color-ink-muted)',
            }}
          >
            HHI Score
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontFamily: 'var(--font-data)',
                fontSize: 18,
                fontWeight: 700,
                color: riskColor,
                letterSpacing: '-0.02em',
              }}
            >
              {hhiScore.toFixed(3)}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 11,
                fontWeight: 600,
                color: riskColor,
                background: riskBg,
                border: `1px solid ${riskBorder}`,
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {riskLabel}
            </span>
          </div>
        </div>

        {/* Track */}
        <div
          style={{
            position: 'relative',
            height: 8,
            background: 'var(--color-subtle)',
            borderRadius: 4,
            overflow: 'visible',
          }}
        >
          {/* Fill */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${fillPct}%`,
              background: riskColor,
              borderRadius: 4,
              transition: 'width 600ms ease',
            }}
          />
          {/* Threshold marker */}
          <div
            style={{
              position: 'absolute',
              left: `${thresholdPct}%`,
              top: -3,
              bottom: -3,
              width: 2,
              background: 'var(--color-ink)',
              borderRadius: 1,
            }}
            title={`Threshold: ${THRESHOLD}`}
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 4,
            fontFamily: 'var(--font-data)',
            fontSize: 10,
            color: 'var(--color-ink-faint)',
          }}
        >
          <span>0.0</span>
          <span style={{ color: 'var(--color-ink-muted)' }}>▲ {THRESHOLD} threshold</span>
          <span>0.5+</span>
        </div>
      </div>

      {/* Status callout */}
      {isBreach ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            padding: '10px 12px',
            background: 'var(--color-risk-breach-bg)',
            border: '1px solid var(--color-risk-breach-border)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 16,
          }}
        >
          <AlertTriangle size={14} style={{ color: 'var(--color-risk-breach)', flexShrink: 0, marginTop: 1 }} />
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              color: 'var(--color-ink)',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {holdings.some(h => h.ticker.toUpperCase() === activeTicker.toUpperCase())
              ? `Portfolio concentration (${hhiScore.toFixed(3)}) exceeds the 0.25 limit. ${activeTicker} currently represents ${Math.round((holdings.find(h => h.ticker.toUpperCase() === activeTicker.toUpperCase())?.weight || 0) * 100)}% of your portfolio.`
              : `Portfolio concentration (${hhiScore.toFixed(3)}) exceeds the 0.25 limit. Adding ${activeTicker} requires rebalancing existing positions.`}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 12px',
            background: 'var(--color-risk-safe-bg)',
            border: '1px solid var(--color-risk-safe-border)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 16,
          }}
        >
          <ShieldCheck size={13} style={{ color: 'var(--color-risk-safe)', flexShrink: 0 }} />
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              color: 'var(--color-ink-muted)',
              margin: 0,
            }}
          >
            Concentration risk is safe (HHI: {hhiScore.toFixed(3)}).
          </p>
        </div>
      )}

      {/* Holdings — single list, this is the only place holdings appear */}
      <p className="section-label" style={{ marginBottom: 10, marginTop: 0 }}>Holdings</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {holdings.map((h, i) => {
          const isActive = h.ticker.toUpperCase() === activeTicker.toUpperCase();
          const buyPrice = h.avg_buy_price && h.avg_buy_price > 0 ? h.avg_buy_price : h.current_price;
          const pnlPct = buyPrice > 0 ? ((h.current_price - buyPrice) / buyPrice) * 100 : 0;
          const isGain = pnlPct >= 0;

          return (
            <div
              key={h.holding_id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 0',
                borderBottom: i < holdings.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Weight bar */}
                <div
                  style={{
                    width: 3,
                    height: 28,
                    borderRadius: 2,
                    background: isActive ? 'var(--color-accent)' : 'var(--color-border-md)',
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-data)',
                        fontSize: 12,
                        fontWeight: 700,
                        color: isActive ? 'var(--color-accent)' : 'var(--color-ink)',
                      }}
                    >
                      {h.ticker}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-data)',
                        fontSize: 11,
                        color: 'var(--color-ink-faint)',
                      }}
                    >
                      {Math.round(h.weight * 100)}%
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: 11,
                      color: 'var(--color-ink-faint)',
                    }}
                  >
                    {h.quantity} shares
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-data)',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--color-ink)',
                  }}
                >
                  ₹{h.current_price.toFixed(1)}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-data)',
                    fontSize: 11,
                    color: isGain ? 'var(--color-risk-safe)' : 'var(--color-risk-breach)',
                  }}
                >
                  {isGain ? '+' : ''}{pnlPct.toFixed(1)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
