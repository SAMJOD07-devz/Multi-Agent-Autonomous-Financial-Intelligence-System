// src/components/synthesis/Recommendation.tsx
import React from 'react';
import type { Recommendation, RiskProfile } from '../../types';
import { Info, ArrowUpRight, Lock, CheckCircle2 } from 'lucide-react';

interface RecommendationProps {
  recommendation: Recommendation | null;
  profile: RiskProfile;
  citationCount: number;
  onViewCitations: () => void;
  degradedState: boolean;
}

export const RecommendationCard: React.FC<RecommendationProps> = ({
  recommendation,
  profile,
  citationCount,
  onViewCitations,
  degradedState
}) => {
  if (degradedState || !recommendation) {
    return (
      <div className="panel-card p-5 border-amber-500/30 bg-amber-950/10">
        <div className="flex items-center space-x-2 text-amber-400">
          <Info className="w-5 h-5" />
          <h3 className="font-semibold text-sm">Actionable Synthesis Blocked</h3>
        </div>
        <p className="text-xs text-[var(--fg-secondary)] mt-2">
          System is in Degraded Data Mode or zero source citations were retrieved. Per strict institutional safety policy, uncited or unverified investment recommendations are suppressed.
        </p>
      </div>
    );
  }

  const getLabelBadgeStyle = (label: string) => {
    switch (label.toUpperCase()) {
      case 'BUY':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'ACCUMULATE':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
      case 'WATCH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'HOLD':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'REDUCE':
      case 'SELL':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <div className="panel-card-accent p-5 relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--fg-tertiary)]">
              Synthesized Intelligence Output
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono">
              Profile: {profile}
            </span>
          </div>

          <div className="flex items-center space-x-3 mt-2">
            <span
              className={`text-base font-black px-3.5 py-1 rounded-md border tracking-wide uppercase shadow-sm ${getLabelBadgeStyle(
                recommendation.label
              )}`}
            >
              {recommendation.label}
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-[var(--fg-primary)]">
                {recommendation.action || 'Recommended Action'}
              </span>
              <span className="text-[10px] text-[var(--fg-tertiary)]">
                Horizon: {recommendation.target_timeframe || '1-3 Months'}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-[var(--fg-tertiary)] uppercase font-medium">Confidence Score</div>
          <div className="text-xl font-bold tabular-nums text-emerald-400 mt-0.5">
            {Math.round(recommendation.confidence * 100)}%
          </div>
          <div className="text-[10px] text-zinc-400 mt-0.5">
            {recommendation.confidence >= 0.8 ? 'High Conviction' : 'Moderate Conviction'}
          </div>
        </div>
      </div>

      <p className="text-xs text-[var(--fg-primary)] mt-3.5 leading-relaxed font-normal">
        {recommendation.summary}
      </p>

      <div className="mt-3 p-3 rounded-md bg-[var(--bg-base)] border border-[var(--border-hairline)]">
        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1">
          <CheckCircle2 className="w-3 h-3" />
          <span>Synthesis Decision Rationale</span>
        </span>
        <p className="text-[11px] text-[var(--fg-secondary)] mt-1.5 leading-relaxed">
          {recommendation.rationale}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between">
        <button
          onClick={onViewCitations}
          className="text-xs font-semibold text-[var(--accent)] hover:text-cyan-300 flex items-center space-x-1 transition group"
        >
          <span>Inspect {citationCount} Grounded Citations</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
        </button>

        <div className="flex items-center space-x-1 text-[10px] text-[var(--fg-tertiary)]">
          <Lock className="w-3 h-3 text-emerald-400" />
          <span>Non-Authoritative Intelligence</span>
        </div>
      </div>
    </div>
  );
};
