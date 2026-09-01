// src/components/synthesis/PersonaSelector.tsx
import React from 'react';
import { ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import type { RiskProfile } from '../../types';

interface PersonaSelectorProps {
  activeProfile: RiskProfile;
  onSelectProfile: (profile: RiskProfile) => void;
  hasDiverged?: boolean;
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  activeProfile,
  onSelectProfile,
  hasDiverged
}) => {
  return (
    <div className="panel-card p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--fg-tertiary)] flex items-center space-x-1.5">
          <span>Behavioral Risk Profile</span>
        </span>
        {hasDiverged && (
          <span className="text-[10px] text-amber-400 font-medium px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 animate-pulse flex items-center space-x-1">
            <AlertCircle className="w-3 h-3" />
            <span>Policy Divergence Triggered</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onSelectProfile('Conservative')}
          className={`p-2.5 rounded-md border text-left transition flex items-start space-x-2.5 ${
            activeProfile === 'Conservative'
              ? 'bg-[var(--bg-elevated-2)] border-[var(--accent)] text-[var(--fg-primary)] shadow-md shadow-cyan-900/20'
              : 'bg-[var(--bg-base)] border-[var(--border-hairline)] text-[var(--fg-secondary)] hover:border-zinc-700'
          }`}
        >
          <div
            className={`p-1.5 rounded-md mt-0.5 shrink-0 ${
              activeProfile === 'Conservative' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold flex items-center space-x-1">
              <span>Conservative</span>
              {activeProfile === 'Conservative' && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              )}
            </div>
            <p className="text-[10px] text-[var(--fg-tertiary)] mt-0.5 leading-tight">
              Capital Preservation Focus · Overbought Penalty · Lower Drawdown Tolerance
            </p>
          </div>
        </button>

        <button
          onClick={() => onSelectProfile('Aggressive')}
          className={`p-2.5 rounded-md border text-left transition flex items-start space-x-2.5 ${
            activeProfile === 'Aggressive'
              ? 'bg-[var(--bg-elevated-2)] border-purple-500 text-[var(--fg-primary)] shadow-md shadow-purple-900/20'
              : 'bg-[var(--bg-base)] border-[var(--border-hairline)] text-[var(--fg-secondary)] hover:border-zinc-700'
          }`}
        >
          <div
            className={`p-1.5 rounded-md mt-0.5 shrink-0 ${
              activeProfile === 'Aggressive' ? 'bg-purple-500/20 text-purple-400' : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold flex items-center space-x-1">
              <span>Aggressive</span>
              {activeProfile === 'Aggressive' && (
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              )}
            </div>
            <p className="text-[10px] text-[var(--fg-tertiary)] mt-0.5 leading-tight">
              Growth & Momentum Focus · Technical Weighting · Tactical Risk Conviction
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
