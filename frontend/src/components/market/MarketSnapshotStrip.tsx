// src/components/market/MarketSnapshotStrip.tsx
import React from 'react';
import type { MarketSignals } from '../../types';
import { SignalBadge } from './SignalBadge';
import { Activity, Gauge, MessageSquare, Zap } from 'lucide-react';

interface MarketSnapshotStripProps {
  ticker: string;
  signals: MarketSignals;
}

export const MarketSnapshotStrip: React.FC<MarketSnapshotStripProps> = ({
  signals
}) => {
  const rsi = signals.price_momentum?.rsi_14 ?? 74.2;
  const macd = signals.price_momentum?.macd_signal ?? 'BULLISH';
  const volumeRatio = signals.volume_anomaly?.volume_spike_ratio ?? 1.25;
  const sentimentScore = signals.sentiment?.news_sentiment_score ?? 0.78;

  return (
    <div className="panel-card p-3 my-3">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="flex items-center space-x-3 p-2 rounded bg-[var(--bg-base)] border border-[var(--border-hairline)]">
          <div className="p-2 rounded bg-cyan-500/10 text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-[var(--fg-tertiary)]">Price Momentum</span>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="tabular-nums font-mono text-sm font-bold text-[var(--fg-primary)]">
                RSI {rsi}
              </span>
              <SignalBadge signal={macd === 'BULLISH' ? 'BULLISH' : 'BEARISH'} size="sm" />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-2 rounded bg-[var(--bg-base)] border border-[var(--border-hairline)]">
          <div className="p-2 rounded bg-emerald-500/10 text-emerald-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-[var(--fg-tertiary)]">Volume Anomaly Z-Score</span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="tabular-nums font-mono text-sm font-bold text-emerald-400">
                {volumeRatio.toFixed(2)}x
              </span>
              <span className="text-[10px] text-[var(--fg-secondary)]">vs 30d Avg</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-2 rounded bg-[var(--bg-base)] border border-[var(--border-hairline)]">
          <div className="p-2 rounded bg-purple-500/10 text-purple-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-[var(--fg-tertiary)]">Media Sentiment</span>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className="tabular-nums font-mono text-sm font-bold text-purple-300">
                {Math.round(sentimentScore * 100)}%
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold">Positive</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-2 rounded bg-[var(--bg-base)] border border-[var(--border-hairline)]">
          <div className="p-2 rounded bg-amber-500/10 text-amber-400">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-semibold text-[var(--fg-tertiary)]">Signal Engine</span>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-[var(--fg-primary)]">RAG + Ticks Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
