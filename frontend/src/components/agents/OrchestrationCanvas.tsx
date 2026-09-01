// src/components/agents/OrchestrationCanvas.tsx
import React, { useState, useEffect } from 'react';
import type { AgentOutput } from '../../types';
import { Cpu, Sparkles, CheckCircle2 } from 'lucide-react';

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

  const getAgentColor = (agentName: string) => {
    const output = agentOutputs.find((a) => a.agent_name.toLowerCase() === agentName);
    if (!output) return '#94a3b8';
    if (output.status === 'completed' || output.status === 'SUCCESS') {
      return output.classification === 'BULLISH' ? '#059669' : output.classification === 'BEARISH' ? '#dc2626' : '#d97706';
    }
    return '#2563eb';
  };

  return (
    <div className="panel-card p-5 relative overflow-hidden bg-gradient-to-b from-white to-slate-50 border-slate-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Cpu className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
            Multi-Agent Parallel Orchestration Graph
          </h3>
        </div>
        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono font-bold flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-blue-600" />
          <span>{isAnalyzing ? 'ORCHESTRATING PARALLEL TRACE' : 'SYNTHESIS ENGINE READY'}</span>
        </span>
      </div>

      <div className="h-56 w-full flex items-center justify-center relative">
        <svg viewBox="0 0 440 220" className="w-full h-full max-w-xl">
          <defs>
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0f172a" floodOpacity="0.08" />
            </filter>
            <linearGradient id="blueGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>

          {/* Connection Lines from 3 Agent Nodes to Core Synthesis Node */}
          <path
            d="M 100 55 Q 160 80 220 110"
            fill="none"
            stroke={getAgentColor('fundamental')}
            strokeWidth="2"
            strokeDasharray={isAnalyzing && !reducedMotion ? "5 5" : "none"}
            className={isAnalyzing && !reducedMotion ? "animate-pulse" : ""}
          />
          <path
            d="M 340 55 Q 280 80 220 110"
            fill="none"
            stroke={getAgentColor('technical')}
            strokeWidth="2"
            strokeDasharray={isAnalyzing && !reducedMotion ? "5 5" : "none"}
            className={isAnalyzing && !reducedMotion ? "animate-pulse" : ""}
          />
          <path
            d="M 220 175 L 220 110"
            fill="none"
            stroke={getAgentColor('sentiment')}
            strokeWidth="2"
            strokeDasharray={isAnalyzing && !reducedMotion ? "5 5" : "none"}
            className={isAnalyzing && !reducedMotion ? "animate-pulse" : ""}
          />

          {/* Core Synthesis Convergence Node */}
          <g transform="translate(220, 110)" filter="url(#softShadow)">
            <circle cx="0" cy="0" r="28" fill="#ffffff" stroke="url(#blueGlow)" strokeWidth="3" />
            <circle cx="0" cy="0" r="20" fill="#eff6ff" />
            <text x="0" y="3" textAnchor="middle" fill="#1e1b4b" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
              SYNTHESIS
            </text>
          </g>

          {/* Agent 1: Fundamental RAG Node */}
          <g transform="translate(100, 55)" filter="url(#softShadow)">
            <circle cx="0" cy="0" r="20" fill="#ffffff" stroke={getAgentColor('fundamental')} strokeWidth="2.5" />
            <text x="0" y="-28" textAnchor="middle" fill="#0f172a" fontSize="10" fontWeight="bold">
              Fundamental RAG
            </text>
            <text x="0" y="4" textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="bold" fontFamily="monospace">
              SEBI
            </text>
          </g>

          {/* Agent 2: Technical Momentum Node */}
          <g transform="translate(340, 55)" filter="url(#softShadow)">
            <circle cx="0" cy="0" r="20" fill="#ffffff" stroke={getAgentColor('technical')} strokeWidth="2.5" />
            <text x="0" y="-28" textAnchor="middle" fill="#0f172a" fontSize="10" fontWeight="bold">
              Technical Momentum
            </text>
            <text x="0" y="4" textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="bold" fontFamily="monospace">
              NSE
            </text>
          </g>

          {/* Agent 3: Media Sentiment Node */}
          <g transform="translate(220, 175)" filter="url(#softShadow)">
            <circle cx="0" cy="0" r="20" fill="#ffffff" stroke={getAgentColor('sentiment')} strokeWidth="2.5" />
            <text x="0" y="34" textAnchor="middle" fill="#0f172a" fontSize="10" fontWeight="bold">
              Media Sentiment
            </text>
            <text x="0" y="4" textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="bold" fontFamily="monospace">
              RAG
            </text>
          </g>
        </svg>
      </div>

      <div className="flex flex-wrap justify-between items-center text-[10px] text-slate-500 border-t border-slate-100 pt-2.5 mt-1 font-mono">
        <span className="flex items-center space-x-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
          <span>Nodes converge in real-time onto Core Decision Engine</span>
        </span>
        <span>Active Policy: <strong className="text-slate-800">{activeProfile} Risk Persona</strong></span>
      </div>
    </div>
  );
};
