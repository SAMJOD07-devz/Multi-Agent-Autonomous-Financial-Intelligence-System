// src/components/views/AnalysisDetailView.tsx
import React from 'react';
import type { AnalysisResponse, Citation } from '../../types';
import { SignalBadge } from '../market/SignalBadge';
import { Cpu, ShieldCheck, FileText, HelpCircle, Scale } from 'lucide-react';

interface AnalysisDetailViewProps {
  analysis: AnalysisResponse | null;
  onSelectCitation: (citation: Citation) => void;
}

export const AnalysisDetailView: React.FC<AnalysisDetailViewProps> = ({
  analysis,
  onSelectCitation
}) => {
  if (!analysis) {
    return (
      <div className="panel-card p-8 text-center text-[var(--fg-tertiary)]">
        No analysis data loaded yet. Select a ticker and click Analyze.
      </div>
    );
  }

  const recommendation = analysis.recommendation;

  return (
    <div className="space-y-4">
      <div className="panel-card-accent p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-extrabold font-mono text-[var(--fg-primary)]">
                {analysis.ticker}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded bg-zinc-800 text-cyan-300 font-mono border border-zinc-700">
                Session ID: {analysis.session_id.slice(0, 8)}
              </span>
            </div>
            <p className="text-xs text-[var(--fg-secondary)] mt-1">
              Multi-Agent Autonomous Evaluation • Profile: <strong>{analysis.profile}</strong> • Timestamp: {new Date(analysis.created_at).toLocaleString()}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {recommendation ? (
              <SignalBadge
                signal={recommendation.label as any}
                confidence={recommendation.confidence}
                size="md"
              />
            ) : (
              <span className="px-3 py-1 rounded bg-red-500/20 text-red-400 font-bold text-xs border border-red-500/30">
                DEGRADED STATE
              </span>
            )}
          </div>
        </div>
      </div>

      {recommendation && (
        <div className="panel-card p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Institutional Investment Rationale & Horizon</span>
          </h3>

          <div className="p-3 rounded bg-[var(--bg-base)] border border-[var(--border-hairline)] space-y-2">
            <p className="text-xs text-[var(--fg-primary)] leading-relaxed">
              {recommendation.rationale}
            </p>
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[var(--border-hairline)] text-[11px]">
              <div>
                <span className="text-[var(--fg-tertiary)] block">Action:</span>
                <span className="font-bold text-emerald-400">{recommendation.action || 'HOLD & MONITOR'}</span>
              </div>
              <div>
                <span className="text-[var(--fg-tertiary)] block">Time Horizon:</span>
                <span className="font-bold text-cyan-300">{recommendation.target_timeframe || '1-3 Months'}</span>
              </div>
              <div>
                <span className="text-[var(--fg-tertiary)] block">Risk Classification:</span>
                <span className="font-bold text-amber-300">{recommendation.risk_level || 'Moderate'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="panel-card p-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-tertiary)] flex items-center space-x-1.5 mb-2">
          <Scale className="w-4 h-4 text-purple-400" />
          <span>Behavioral Risk Profile Impact ({analysis.profile})</span>
        </h3>
        <p className="text-xs text-[var(--fg-secondary)] leading-relaxed">
          {analysis.profile === 'Conservative'
            ? `Conservative weighting prioritized capital preservation by penalizing technical overbought signals (RSI 74.2) and requiring SEBI-verified fundamental backing before recommending capital deployment.`
            : `Aggressive weighting prioritized growth momentum, leveraging technical breakouts and clean energy expansion catalysts to recommend tactical accumulation.`}
        </p>
      </div>

      <div className="panel-card p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-primary)] flex items-center space-x-1.5">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>Agent-by-Agent Reasoning Breakdown</span>
        </h3>

        <div className="space-y-3">
          {analysis.agent_outputs.map((agent, idx) => (
            <div key={idx} className="p-3 rounded bg-[var(--bg-base)] border border-[var(--border-hairline)] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold capitalize text-[var(--fg-primary)]">
                    {agent.agent_name} Agent
                  </span>
                  <span className="text-[10px] text-[var(--fg-tertiary)] font-mono">
                    [{agent.status}]
                  </span>
                </div>
                <SignalBadge signal={agent.classification} confidence={agent.confidence} size="sm" />
              </div>

              <p className="text-xs text-[var(--fg-secondary)] leading-relaxed">
                {agent.reasoning}
              </p>

              {agent.citations.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {agent.citations.map((c, cIdx) => (
                    <button
                      key={cIdx}
                      onClick={() => onSelectCitation(c)}
                      className="px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono hover:bg-cyan-900/50 transition flex items-center space-x-1"
                    >
                      <FileText className="w-3 h-3" />
                      <span>{c.source}: {c.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="panel-card p-4 bg-zinc-900/40">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5 mb-2">
          <HelpCircle className="w-4 h-4" />
          <span>What Could Change This View? (Sensitivity Factors)</span>
        </h3>
        <ul className="text-xs text-[var(--fg-secondary)] space-y-1.5 list-disc pl-4">
          <li>RSI cool-down below 60 would remove the technical overbought penalty for Conservative investors.</li>
          <li>Q4 earnings disclosures reporting margin contraction &gt; 150 bps would trigger a downgrade to REDUCE.</li>
          <li>Portfolio concentration HHI increasing above 0.35 would trigger automated exposure warnings.</li>
        </ul>
      </div>
    </div>
  );
};
