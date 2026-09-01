// src/components/market/MarketSnapshotStrip.tsx
// Three signal tiles — no decorative color, numbers in mono, signal badges use semantic colors
import React from 'react';
import type { MarketSignals } from '../../types';
import { SignalBadge } from './SignalBadge';

interface MarketSnapshotStripProps {
  ticker: string;
  signals: MarketSignals;
}

export const MarketSnapshotStrip: React.FC<MarketSnapshotStripProps> = ({ signals }) => {
  const rsi = signals.price_momentum?.rsi_14 ?? 74.2;
  const macd = signals.price_momentum?.macd_signal ?? 'BULLISH';
  const volumeRatio = signals.volume_anomaly?.volume_spike_ratio ?? 1.25;
  const sentimentScore = signals.sentiment?.news_sentiment_score ?? 0.78;

  const tiles = [
    {
      label: 'RSI-14',
      value: rsi.toFixed(1),
      suffix: '',
      note: rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral',
      noteColor: rsi > 70
        ? 'var(--color-risk-watch)'
        : rsi < 30
        ? 'var(--color-risk-breach)'
        : 'var(--color-ink-faint)',
      badge: null,
    },
    {
      label: 'MACD Signal',
      value: null,
      badge: macd as string,
      note: null,
    },
    {
      label: 'Volume Spike',
      value: volumeRatio.toFixed(2),
      suffix: '× avg',
      note: volumeRatio > 1.5 ? 'Elevated' : 'Normal',
      noteColor: volumeRatio > 1.5 ? 'var(--color-risk-watch)' : 'var(--color-ink-faint)',
      badge: null,
    },
    {
      label: 'News Sentiment',
      value: `${Math.round(sentimentScore * 100)}%`,
      suffix: ' positive',
      note: null,
      badge: null,
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 1,
        background: 'var(--color-border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
      }}
      className="market-strip"
    >
      {tiles.map(tile => (
        <div
          key={tile.label}
          style={{
            background: 'var(--color-surface)',
            padding: '14px 16px',
          }}
        >
          <p
            className="section-label"
            style={{ margin: 0, marginBottom: 6 }}
          >
            {tile.label}
          </p>
          {tile.badge ? (
            <SignalBadge signal={tile.badge} size="md" />
          ) : (
            <div>
              <span
                style={{
                  fontFamily: 'var(--font-data)',
                  fontSize: 18,
                  fontWeight: 700,
                  color: 'var(--color-ink)',
                  letterSpacing: '-0.02em',
                }}
              >
                {tile.value}
              </span>
              {tile.suffix && (
                <span
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 12,
                    color: 'var(--color-ink-faint)',
                    marginLeft: 4,
                  }}
                >
                  {tile.suffix}
                </span>
              )}
              {tile.note && (
                <p
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 11,
                    color: tile.noteColor,
                    margin: '3px 0 0',
                    fontWeight: 500,
                  }}
                >
                  {tile.note}
                </p>
              )}
            </div>
          )}
        </div>
      ))}

      <style>{`
        @media (max-width: 700px) {
          .market-strip { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
};
