// src/components/views/SettingsView.tsx
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../state/useAppStore';
import { fetchHealth } from '../../api/client';
import { Settings, Server, RefreshCw, Cpu } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    activeScenario,
    setActiveScenario,
    isMockMode,
    setMockMode
  } = useAppStore();

  const [health, setHealth] = useState<{ status: string; service?: string }>({ status: 'checking' });

  const checkStatus = async () => {
    setHealth({ status: 'checking' });
    const res = await fetchHealth();
    setHealth(res);
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="panel-card p-4">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold tracking-tight text-[var(--fg-primary)]">
            System Settings & QA Simulation Console
          </h3>
        </div>
      </div>

      <div className="panel-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-[var(--fg-primary)]">FastAPI Backend Service Connection</span>
          </div>

          <button
            onClick={checkStatus}
            className="px-2.5 py-1 rounded bg-[var(--bg-base)] hover:bg-zinc-800 text-[10px] font-mono text-[var(--fg-secondary)] border border-[var(--border-hairline)] flex items-center space-x-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Check Health</span>
          </button>
        </div>

        <div className="p-3 rounded bg-[var(--bg-base)] border border-[var(--border-hairline)] flex items-center justify-between text-xs font-mono">
          <div>
            <span className="text-[var(--fg-tertiary)] block text-[10px]">REST Base URL:</span>
            <span className="text-cyan-300">{import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}</span>
          </div>
          <div>
            <span className="text-[var(--fg-tertiary)] block text-[10px]">Health Status:</span>
            <span
              className={`font-bold ${
                health.status === 'healthy' ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {health.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="panel-card p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
          <Cpu className="w-4 h-4" />
          <span>Deterministic Mock Mode & Simulation Scenarios</span>
        </h3>

        <div className="flex items-center justify-between p-3 rounded bg-[var(--bg-base)] border border-[var(--border-hairline)]">
          <div>
            <div className="text-xs font-bold text-[var(--fg-primary)]">Force Offline Mock Data Mode</div>
            <div className="text-[10px] text-[var(--fg-tertiary)] mt-0.5">
              Simulates clean responses and WebSocket event streams when backend is unavailable.
            </div>
          </div>
          <button
            onClick={() => setMockMode(!isMockMode)}
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition ${
              isMockMode ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
            }`}
          >
            {isMockMode ? 'Mock Mode ON' : 'Mock Mode OFF'}
          </button>
        </div>

        <div className="p-3 rounded bg-[var(--bg-base)] border border-[var(--border-hairline)] space-y-2">
          <label className="text-xs font-bold text-[var(--fg-primary)] block">
            Select Simulation Scenario (QA Testing)
          </label>
          <select
            value={activeScenario}
            onChange={(e) => setActiveScenario(e.target.value)}
            className="w-full text-xs bg-zinc-900 border border-zinc-700 text-zinc-200 rounded p-2 font-mono"
          >
            <option value="">Clean Execution (Normal Execution)</option>
            <option value="timeout">Live Market Feed Timeout (Degraded State)</option>
            <option value="missing_filing">Missing Regulatory Disclosure (Degraded State)</option>
            <option value="conflicting">Conflicting Signals (BULLISH vs BEARISH)</option>
            <option value="uncited">Uncited Output (Zero-Uncited Safety Block)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
