// src/components/agents/ReasoningTrace.tsx
import React, { useState } from 'react';
import type { WSEvent, AgentOutput, Citation } from '../../types';
import { AgentCard } from './AgentCard';
import { Terminal, Cpu, CheckCircle2, Loader2 } from 'lucide-react';

interface ReasoningTraceProps {
  agentOutputs: AgentOutput[];
  wsEvents: WSEvent[];
  isAnalyzing: boolean;
  onSelectCitation: (citation: Citation) => void;
}

export const ReasoningTrace: React.FC<ReasoningTraceProps> = ({
  agentOutputs,
  wsEvents,
  isAnalyzing,
  onSelectCitation
}) => {
  const [showRawConsole, setShowRawConsole] = useState(false);

  return (
    <div className="space-y-4">
      <div className="panel-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-primary)]">
              Multi-Agent Parallel Execution Chain
            </h3>
          </div>

          <button
            onClick={() => setShowRawConsole(!showRawConsole)}
            className="px-2.5 py-1 rounded bg-[var(--bg-base)] hover:bg-zinc-800 text-[10px] font-mono text-[var(--fg-secondary)] border border-[var(--border-hairline)] flex items-center space-x-1.5 transition"
          >
            <Terminal className="w-3 h-3 text-cyan-400" />
            <span>{showRawConsole ? 'Hide Event Console' : 'View Realtime Event Log'}</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {['fundamental', 'technical', 'sentiment'].map((agentKey) => {
            const output = agentOutputs.find((a) => a.agent_name.toLowerCase() === agentKey);
            const isDone = output && (output.status === 'completed' || output.status === 'SUCCESS');

            return (
              <div
                key={agentKey}
                className={`p-2 rounded border text-left flex items-center space-x-2 transition ${
                  isDone
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                    : isAnalyzing
                    ? 'bg-cyan-950/20 border-cyan-500/30 text-cyan-300 animate-pulse'
                    : 'bg-[var(--bg-base)] border-[var(--border-hairline)] text-[var(--fg-tertiary)]'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : isAnalyzing ? (
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-zinc-600 shrink-0" />
                )}
                <div className="truncate">
                  <div className="text-[11px] font-bold capitalize">{agentKey} Agent</div>
                  <div className="text-[9px] opacity-75">
                    {isDone ? `${output?.classification} (${Math.round((output?.confidence || 0) * 100)}%)` : isAnalyzing ? 'Streaming Reasoning...' : 'Idle'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showRawConsole && (
        <div className="panel-card p-3 bg-black/80 border-cyan-500/30">
          <div className="flex items-center justify-between text-xs text-cyan-400 mb-2 font-mono">
            <span className="flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5" />
              <span>WebSocket Realtime Event Console ({wsEvents.length} frames)</span>
            </span>
            <span className="text-[10px] text-zinc-500">Max 200 Bounded Buffer</span>
          </div>

          <div className="trace-console-scroll p-2 bg-zinc-950 rounded border border-zinc-800 space-y-1">
            {wsEvents.length === 0 ? (
              <div className="text-zinc-600 italic">No WebSocket trace events received yet. Click 'Run Analysis' to stream.</div>
            ) : (
              wsEvents.map((evt, idx) => (
                <div key={idx} className="text-[11px] font-mono leading-tight">
                  <span className="text-zinc-500">[{evt.timestamp?.slice(11, 19) || 'LOG'}]</span>{' '}
                  <span className="text-cyan-400 font-semibold">#{evt.sequence_number}</span>{' '}
                  <span className="text-purple-300 font-bold uppercase">{evt.event_type}</span>:{' '}
                  <span className="text-zinc-300">{JSON.stringify(evt.payload)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {agentOutputs.map((agent, index) => (
          <AgentCard key={index} agent={agent} onSelectCitation={onSelectCitation} />
        ))}
      </div>
    </div>
  );
};
