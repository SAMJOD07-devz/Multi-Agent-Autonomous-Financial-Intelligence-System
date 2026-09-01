// src/components/layout/Navbar.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../state/useAppStore';
import { MetricCounter } from '../common/MetricCounter';
import { Search, Cpu, Sparkles } from 'lucide-react';

interface NavbarProps {
  onRunAnalysis: () => void;
  onOpenTour: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onRunAnalysis, onOpenTour }) => {
  const navigate = useNavigate();
  const {
    activeTicker,
    setActiveTicker,
    activeProfile,
    analysisResult,
    isLoading,
    wsConnectionState
  } = useAppStore();

  const [inputTicker, setInputTicker] = useState(activeTicker);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputTicker.trim()) {
      setActiveTicker(inputTicker.trim().toUpperCase());
      onRunAnalysis();
      navigate('/analyze');
    }
  };

  const tickerSuggestions = ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'TATAMOTORS'];

  const latency = analysisResult?.telemetry?.latency_ms ?? 142.5;
  const confidence = analysisResult?.telemetry?.combined_confidence ?? 0.79;
  const hhi = analysisResult?.telemetry?.risk_concentration_score ?? 0.28;

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-2.5 shadow-xs">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold tracking-tight text-slate-900 font-sans">
                AstraVest Intelligence
              </h1>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                Light Edition
              </span>
            </div>
            <p className="text-[10px] text-slate-500 flex items-center space-x-2">
              <span>Autonomous Financial Workstation</span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center space-x-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    wsConnectionState === 'live'
                      ? 'bg-emerald-500 animate-pulse'
                      : wsConnectionState === 'connecting'
                      ? 'bg-amber-500 animate-ping'
                      : 'bg-slate-400'
                  }`}
                />
                <span className="text-[9px] capitalize text-slate-600 font-medium">
                  WS: {wsConnectionState}
                </span>
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={inputTicker}
              onChange={(e) => setInputTicker(e.target.value.toUpperCase())}
              placeholder="Analyze Stock Ticker (e.g. RELIANCE)..."
              className="w-full pl-9 pr-16 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition tabular-nums font-semibold uppercase"
            />
            <button
              type="submit"
              disabled={isLoading || !inputTicker.trim()}
              className="absolute right-1 top-1 px-2.5 py-1 text-[10px] font-bold uppercase rounded-md bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 shadow-xs"
            >
              {isLoading ? 'Analyzing...' : 'Analyze'}
            </button>
          </form>

          <div className="hidden lg:flex items-center space-x-1">
            {tickerSuggestions.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setInputTicker(t);
                  setActiveTicker(t);
                  onRunAnalysis();
                  navigate('/analyze');
                }}
                className={`px-2 py-1 text-[10px] font-mono rounded-md border transition ${
                  activeTicker === t
                    ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4 border-l border-slate-200 pl-4">
          <MetricCounter label="Latency" value={latency.toFixed(1)} unit="ms" />
          <MetricCounter label="Confidence" value={`${Math.round(confidence * 100)}%`} />
          <MetricCounter label="HHI Score" value={hhi.toFixed(2)} alert={hhi > 0.25} />

          <div className="hidden xl:flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-medium">Profile</span>
            <span className="text-xs font-bold text-slate-900 font-mono">{activeProfile}</span>
          </div>

          <button
            onClick={onOpenTour}
            className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Product Tour</span>
          </button>
        </div>
      </div>
    </header>
  );
};
