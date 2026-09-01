// src/components/agents/AgentCard.tsx
// Full-width row layout — agent reasoning is the hero content.
// Left 3px border uses signal color (the ONE place signal color appears in reasoning trail).
// No colored card backgrounds. Citation inline below reasoning.
import React, { useState } from 'react';
import type { AgentOutput, Citation } from '../../types';
import { SignalBadge } from '../market/SignalBadge';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface AgentCardProps {
  agent: AgentOutput;
  onSelectCitation: (citation: Citation) => void;
  index: number;
}

const AGENT_DISPLAY: Record<string, { title: string; source: string }> = {
  fundamental: { title: 'Fundamental Agent', source: 'SEBI Corporate Filings & RAG' },
  technical:   { title: 'Technical Agent',   source: 'NSE Live Tick Feed' },
  sentiment:   { title: 'Sentiment Agent',   source: 'Earnings Transcripts & News' },
};

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onSelectCitation, index }) => {
  const [expanded, setExpanded] = useState(true);

  const key = agent.agent_name.toLowerCase();
  const display = AGENT_DISPLAY[key] ?? { title: `${agent.agent_name} Agent`, source: 'Data Feed' };
  const signal = agent.classification?.toUpperCase() ?? 'NEUTRAL';
  const isCompleted = agent.status === 'completed' || agent.status === 'SUCCESS';

  const borderClass =
    signal === 'BULLISH' ? 'agent-bullish' :
    signal === 'BEARISH' ? 'agent-bearish' :
    'agent-neutral';

  return (
    <div
      className={borderClass}
      style={{
        background: 'var(--color-surface)',
        borderRadius: `0 var(--radius-md) var(--radius-md) 0`,
        marginBottom: 2,
        overflow: 'hidden',
      }}
    >
      {/* Agent header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          {/* Step number */}
          <span
            style={{
              fontFamily: 'var(--font-data)',
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--color-ink-faint)',
              flexShrink: 0,
            }}
          >
            {String(index + 1).padStart(2, '0')}
          </span>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--color-ink)',
                }}
              >
                {display.title}
              </span>
              <SignalBadge signal={signal} confidence={agent.confidence} size="sm" />
              {!isCompleted && (
                <span
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: 11,
                    color: 'var(--color-risk-watch)',
                    fontWeight: 500,
                  }}
                >
                  {agent.status}
                </span>
              )}
            </div>
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 11,
                color: 'var(--color-ink-faint)',
                margin: 0,
                marginTop: 2,
              }}
            >
              {display.source}
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(v => !v)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-ink-faint)',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
          }}
          aria-label={expanded ? 'Collapse reasoning' : 'Expand reasoning'}
        >
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>

      {/* Expanded: reasoning text + citations */}
      {expanded && (
        <div
          style={{
            padding: '0 16px 14px 40px',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 13,
              lineHeight: 1.65,
              color: 'var(--color-ink-muted)',
              margin: 0,
            }}
          >
            {agent.reasoning}
          </p>

          {/* Citations inline */}
          {agent.citations && agent.citations.length > 0 && (
            <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {agent.citations.map((citation, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectCitation(citation)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '3px 9px',
                    background: 'var(--color-subtle)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 11,
                    fontWeight: 500,
                    color: 'var(--color-accent-text)',
                    cursor: 'pointer',
                    transition: 'border-color 150ms',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                >
                  {citation.source}
                  <ExternalLink size={10} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
