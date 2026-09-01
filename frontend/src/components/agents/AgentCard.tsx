// src/components/agents/AgentCard.tsx
import React from 'react';
import type { AgentOutput, Citation } from '../../types';
import { SignalBadge } from '../market/SignalBadge';
import { FileText, Cpu, CheckCircle, AlertTriangle } from 'lucide-react';

interface AgentCardProps {
  agent: AgentOutput;
  onSelectCitation: (citation: Citation) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onSelectCitation }) => {
  const getAgentTitle = (name: string) => {
    switch (name.toLowerCase()) {
      case 'fundamental':
        return 'Fundamental & SEBI Filings RAG Agent';
      case 'technical':
        return 'Technical & Price Momentum Agent';
      case 'sentiment':
        return 'Market Sentiment & Executive Transcript Agent';
      default:
        return `${name.toUpperCase()} Agent`;
    }
  };

  const isCompleted = agent.status === 'completed' || agent.status === 'SUCCESS';

  return (
    <div className="panel-card p-4 transition">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-md bg-[var(--bg-elevated-2)] border border-[var(--border-hairline)] text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-xs font-bold text-[var(--fg-primary)]">
                {getAgentTitle(agent.agent_name)}
              </h4>
              {isCompleted ? (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              )}
            </div>
            <div className="text-[10px] text-[var(--fg-tertiary)] mt-0.5 font-mono">
              Status: {agent.status.toUpperCase()}
            </div>
          </div>
        </div>

        <SignalBadge signal={agent.classification} confidence={agent.confidence} size="sm" />
      </div>

      <p className="text-xs text-[var(--fg-secondary)] mt-3 leading-relaxed">
        {agent.reasoning}
      </p>

      {agent.citations && agent.citations.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-[var(--border-hairline)]">
          <div className="text-[10px] uppercase font-semibold text-[var(--fg-tertiary)] mb-1.5 flex items-center space-x-1">
            <FileText className="w-3 h-3 text-cyan-400" />
            <span>Grounded Source Citations ({agent.citations.length})</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {agent.citations.map((citation, idx) => (
              <button
                key={idx}
                onClick={() => onSelectCitation(citation)}
                className="px-2 py-1 rounded bg-[var(--bg-base)] hover:bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono flex items-center space-x-1 transition group"
              >
                <span>[{citation.source || 'Filing'}]</span>
                <span className="truncate max-w-[120px]">{citation.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
