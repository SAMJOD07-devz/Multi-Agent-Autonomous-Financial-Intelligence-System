// src/components/agents/ReasoningTrace.tsx
// The agent reasoning trail is the primary hero content.
// No dark console panel in default view. Status is a compact inline row, not a card grid.
import React, { useState } from 'react';
import type { WSEvent, AgentOutput, Citation } from '../../types';
import { AgentCard } from './AgentCard';
import { ChevronDown, ChevronUp, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

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
  onSelectCitation,
}) => {
  const [showRawLog, setShowRawLog] = useState(false);

  const agents = ['fundamental', 'technical', 'sentiment'];

  return (
    <div>
      {/* Section header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--color-ink)',
            margin: 0,
          }}
        >
          Agent Reasoning
        </h2>

        {/* Compact status row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {agents.map(key => {
            const output = agentOutputs.find(a => a.agent_name.toLowerCase() === key);
            const done = output && (output.status === 'completed' || output.status === 'SUCCESS');
            const failed = output && (output.status === 'failed' || output.status === 'unavailable');
            return (
              <div
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontFamily: 'var(--font-ui)',
                  fontSize: 12,
                  color: done
                    ? 'var(--color-risk-safe)'
                    : failed
                    ? 'var(--color-risk-breach)'
                    : isAnalyzing
                    ? 'var(--color-ink-muted)'
                    : 'var(--color-ink-faint)',
                }}
              >
                {done ? (
                  <CheckCircle2 size={13} />
                ) : failed ? (
                  <AlertCircle size={13} />
                ) : isAnalyzing ? (
                  <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: 'var(--color-border-md)',
                      display: 'inline-block',
                    }}
                  />
                )}
                <span style={{ textTransform: 'capitalize' }}>{key}</span>
              </div>
            );
          })}

          {/* Developer raw log toggle — quiet, not prominent */}
          <button
            onClick={() => setShowRawLog(v => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-ui)',
              fontSize: 11,
              color: 'var(--color-ink-faint)',
              padding: '2px 0',
            }}
          >
            Raw log
            {showRawLog ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        </div>
      </div>

      {/* Raw event log — collapsed by default */}
      {showRawLog && (
        <div
          style={{
            background: '#F8F8F6',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginBottom: 16,
            maxHeight: 180,
            overflowY: 'auto',
          }}
        >
          {wsEvents.length === 0 ? (
            <p
              style={{
                fontFamily: 'var(--font-data)',
                fontSize: 11,
                color: 'var(--color-ink-faint)',
                margin: 0,
              }}
            >
              No events received. Start an analysis to stream trace events.
            </p>
          ) : (
            wsEvents.slice(-50).map((evt, i) => (
              <div
                key={i}
                style={{
                  fontFamily: 'var(--font-data)',
                  fontSize: 11,
                  color: 'var(--color-ink-muted)',
                  lineHeight: 1.6,
                }}
              >
                <span style={{ color: 'var(--color-ink-faint)' }}>
                  [{evt.timestamp?.slice(11, 19) ?? '—'}]
                </span>{' '}
                <span style={{ fontWeight: 700 }}>{evt.event_type}</span>{' '}
                {JSON.stringify(evt.payload)}
              </div>
            ))
          )}
        </div>
      )}

      {/* Agent reasoning rows — the hero */}
      {agentOutputs.length === 0 && !isAnalyzing ? (
        <div
          style={{
            padding: '32px 0',
            textAlign: 'center',
            fontFamily: 'var(--font-ui)',
            fontSize: 13,
            color: 'var(--color-ink-faint)',
          }}
        >
          Run an analysis to see agent reasoning.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {agentOutputs.map((agent, i) => (
            <AgentCard
              key={agent.agent_name}
              agent={agent}
              onSelectCitation={onSelectCitation}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
};
