// src/components/market/SignalBadge.tsx
// Uses risk traffic-light colors — BULLISH=safe-green, NEUTRAL=amber, BEARISH=red
// This is intentional: signal direction == risk direction for this instrument
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { SignalType } from '../../types';

interface SignalBadgeProps {
  signal: SignalType | string;
  confidence?: number;
  size?: 'sm' | 'md';
}

export const SignalBadge: React.FC<SignalBadgeProps> = ({ signal, confidence, size = 'md' }) => {
  const normalized = signal?.toUpperCase();

  const styles = {
    BULLISH: {
      bg: 'var(--color-risk-safe-bg)',
      color: 'var(--color-risk-safe)',
      border: 'var(--color-risk-safe-border)',
    },
    NEUTRAL: {
      bg: 'var(--color-risk-watch-bg)',
      color: 'var(--color-risk-watch)',
      border: 'var(--color-risk-watch-border)',
    },
    BEARISH: {
      bg: 'var(--color-risk-breach-bg)',
      color: 'var(--color-risk-breach)',
      border: 'var(--color-risk-breach-border)',
    },
  };

  const s = styles[normalized as keyof typeof styles] ?? styles.NEUTRAL;
  const Icon = normalized === 'BULLISH' ? TrendingUp : normalized === 'BEARISH' ? TrendingDown : Minus;
  const iconSize = size === 'sm' ? 11 : 12;
  const fontSize = size === 'sm' ? 10 : 11;
  const px = size === 'sm' ? '7px' : '9px';
  const py = size === 'sm' ? '2px' : '3px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: `${py} ${px}`,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: 'var(--radius-sm)',
        fontFamily: 'var(--font-ui)',
        fontSize,
        fontWeight: 600,
        letterSpacing: '0.03em',
        userSelect: 'none',
      }}
    >
      <Icon size={iconSize} />
      {normalized}
      {typeof confidence === 'number' && (
        <span
          style={{
            fontFamily: 'var(--font-data)',
            fontSize,
            fontWeight: 700,
            borderLeft: `1px solid ${s.border}`,
            paddingLeft: 5,
            marginLeft: 2,
          }}
        >
          {Math.round(confidence * 100)}%
        </span>
      )}
    </span>
  );
};
