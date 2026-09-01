// src/components/market/SignalBadge.tsx
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { SignalType } from '../../types';

interface SignalBadgeProps {
  signal: SignalType;
  confidence?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SignalBadge: React.FC<SignalBadgeProps> = ({
  signal,
  confidence,
  label,
  size = 'md'
}) => {
  const getColors = () => {
    switch (signal) {
      case 'BULLISH':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'BEARISH':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'NEUTRAL':
      default:
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    }
  };

  const getIcon = () => {
    switch (signal) {
      case 'BULLISH':
        return <TrendingUp className="w-3.5 h-3.5" />;
      case 'BEARISH':
        return <TrendingDown className="w-3.5 h-3.5" />;
      case 'NEUTRAL':
      default:
        return <Minus className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div
      className={`inline-flex items-center space-x-1.5 rounded-full border font-semibold tracking-wide uppercase shadow-sm ${getColors()} ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : size === 'lg' ? 'px-3.5 py-1.5 text-xs' : 'px-2.5 py-1 text-[11px]'
      }`}
    >
      {getIcon()}
      <span>{label || signal}</span>
      {typeof confidence === 'number' && (
        <span className="tabular-nums font-bold opacity-85 ml-1 border-l border-current/30 pl-1.5">
          {Math.round(confidence * 100)}%
        </span>
      )}
    </div>
  );
};
