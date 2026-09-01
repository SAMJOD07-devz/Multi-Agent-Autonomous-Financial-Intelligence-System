// src/components/agents/OrchestrationCanvas.tsx
import React, { useState, useEffect } from 'react';
import type { AgentOutput } from '../../types';
import { Cpu } from 'lucide-react';

interface OrchestrationCanvasProps {
  agentOutputs: AgentOutput[];
  isAnalyzing: boolean;
  activeProfile: string;
}

export const OrchestrationCanvas: React.FC<OrchestrationCanvasProps> = ({
  agentOutputs,
  isAnalyzing,
  activeProfile
}) => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = () => setReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const getAgentStatusColor = (agentName: string) => {
    const output = agentOutputs.find((a) => a.agent_name.toLowerCase() === agentName);
    if (!output) return '#6b7280';
    if (output.status === 'completed' || output.status === 'SUCCESS') {
      return output.classification === 'BULLISH' ? '#10b981' : output.classification === 'BEARISH' ? '#ef4444' : '#f59e0b';
    }
    return '#38bdf8';
  };

  return (
    <div className="panel-card p-4 my-4 relative overflow-hidden bg-gradient-to-b from-[var(--bg-elevated-1)] to-[var(--bg-base)]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-primary)]">
            Signature Market Orchestration Mesh (3D / SVG Semantic Fallback)
          </h3>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-mono">
          {isAnalyzing ? 'ORCHESTRATING IN PARALLEL' : 'SYNTHESIS MESH READY'}
        </span>
      </div>

      <div className="h-52 w-full flex items-center justify-center relative">
        <svg viewBox="0 0 400 200" className="w-full h-full max-w-lg">
          <defs>
            <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.6} />
              <stop offset="100%" stopColor="#090d16" stopOpacity={0.0} />
            </radialGradient>
          </defs>

          <circle cx="200" cy="100" r="35" fill="url(#coreGlow)" />
          <circle
            cx="200"
            cy="100"
            r="22"
            fill="#111726"
            stroke="#38bdf8"
            strokeWidth="2"
            className={!reducedMotion && isAnalyzing ? 'animate-pulse' : ''}
          />
          <text x="200" y="103" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
            CORE SYNTHESIS
          </text>

          <line
            x1="100"
            y1="50"
            x2="200"
            y2="100"
            stroke={getAgentStatusColor('fundamental')}
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className={!reducedMotion && isAnalyzing ? 'animate-dash' : ''}
          />

          <line
            x1="300"
            y1="50"
            x2="200"
            y2="100"
            stroke={getAgentStatusColor('technical')}
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className={!reducedMotion && isAnalyzing ? 'animate-dash' : ''}
          />

          <line
            x1="200"
            y1="165"
            x2="200"
            y2="100"
            stroke={getAgentStatusColor('sentiment')}
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className={!reducedMotion && isAnalyzing ? 'animate-dash' : ''}
          />

          <g transform="translate(100, 50)">
            <circle cx="0" cy="0" r="18" fill="#192238" stroke={getAgentStatusColor('fundamental')} strokeWidth="2" />
            <text x="0" y="-24" textAnchor="middle" fill="#f3f4f6" fontSize="10" fontWeight="bold">
              Fundamental RAG
            </text>
          </g>

          <g transform="translate(300, 50)">
            <circle cx="0" cy="0" r="18" fill="#192238" stroke={getAgentStatusColor('technical')} strokeWidth="2" />
            <text x="0" y="-24" textAnchor="middle" fill="#f3f4f6" fontSize="10" fontWeight="bold">
              Technical Momentum
            </text>
          </g>

          <g transform="translate(200, 165)">
            <circle cx="0" cy="0" r="18" fill="#192238" stroke={getAgentStatusColor('sentiment')} strokeWidth="2" />
            <text x="0" y="32" textAnchor="middle" fill="#f3f4f6" fontSize="10" fontWeight="bold">
              Media Sentiment
            </text>
          </g>
        </svg>
      </div>

      <div className="flex justify-between items-center text-[10px] text-[var(--fg-tertiary)] border-t border-[var(--border-hairline)] pt-2 mt-1">
        <span>Node state color maps to classification & signal pulse</span>
        <span>Active Profile Weighting: <strong>{activeProfile} Policy</strong></span>
      </div>
    </div>
  );
};
