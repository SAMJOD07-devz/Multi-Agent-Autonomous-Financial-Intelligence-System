// src/pages/OverviewPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../state/useAppStore';
import { GettingStartedChecklist } from '../components/tour/GettingStartedChecklist';
import { MarketSnapshotStrip } from '../components/market/MarketSnapshotStrip';
import { PriceChart } from '../components/market/PriceChart';
import { OrchestrationCanvas } from '../components/agents/OrchestrationCanvas';
import { mockUserHoldings } from '../mocks/fixtureData';
import { Search, ArrowRight, Server, PieChart, Activity } from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    activeTicker,
    activeProfile,
    analysisResult,
    isLoading,
    sessionsHistory,
    setActiveTicker
  } = useAppStore();

  const hhiScore = analysisResult?.telemetry?.risk_concentration_score ?? 0.28;
  const isHighRisk = hhiScore > 0.25;

  return (
    <div className="space-y-4">
      <div className="panel-card-accent p-5 bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 font-mono">
                Executive Market Intelligence Briefing
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                Market Feed Active
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1">
              Autonomous Financial Intelligence Workstation
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Synthesizing real-time market data, technical momentum, and grounded SEBI corporate filings across three specialized reasoning agents. Tailored to your <strong>{activeProfile}</strong> risk profile.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => navigate('/analyze')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-md shadow-blue-500/20 flex items-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>Analyze Stock Ticker</span>
            </button>
          </div>
        </div>
      </div>

      <GettingStartedChecklist />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <MarketSnapshotStrip
            ticker={activeTicker}
            signals={analysisResult?.market_signals || {}}
          />

          <PriceChart ticker={activeTicker} />

          <OrchestrationCanvas
            agentOutputs={analysisResult?.agent_outputs || []}
            isAnalyzing={isLoading}
            activeProfile={activeProfile}
          />
        </div>

        <div className="space-y-4">
          <div className="panel-card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
                <PieChart className="w-4 h-4 text-blue-600" />
                <span>Portfolio at a Glance</span>
              </span>
              <button
                onClick={() => navigate('/portfolio')}
                className="text-[10px] font-bold text-blue-600 hover:underline flex items-center space-x-1"
              >
                <span>Full Portfolio</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 mb-3">
              <span className="text-[10px] uppercase font-semibold text-slate-500">Herfindahl Index (HHI)</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-lg font-bold font-mono text-slate-900">{hhiScore.toFixed(3)}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    isHighRisk
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {isHighRisk ? 'High Concentration' : 'Diversified'}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {mockUserHoldings.slice(0, 3).map((h) => (
                <div key={h.holding_id} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                  <span className="font-mono font-bold text-slate-900">{h.ticker}</span>
                  <span className="tabular-nums font-mono text-slate-600">₹{h.current_price.toFixed(1)}</span>
                  <span className="font-mono text-blue-600 font-bold">{Math.round(h.weight * 100)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel-card p-4 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5 mb-2">
              <Server className="w-4 h-4 text-emerald-600" />
              <span>System Health & Feeds</span>
            </span>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[9px]">FastAPI REST</span>
                <span className="text-emerald-700 font-bold">ONLINE</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[9px]">WS Agent Trace</span>
                <span className="text-emerald-700 font-bold">CONNECTED</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[9px]">SEBI RAG Pipeline</span>
                <span className="text-emerald-700 font-bold">VERIFIED</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[9px]">NSE Market Feed</span>
                <span className="text-emerald-700 font-bold">LIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="panel-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center space-x-1.5">
            <Activity className="w-4 h-4 text-blue-600" />
            <span>Recent Analysis Interaction Sessions</span>
          </h3>
          <button
            onClick={() => navigate('/sessions')}
            className="text-[10px] font-bold text-blue-600 hover:underline flex items-center space-x-1"
          >
            <span>View All Sessions</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {sessionsHistory.slice(0, 3).map((s) => (
            <div
              key={s.session_id}
              onClick={() => {
                setActiveTicker(s.ticker);
                navigate('/analyze');
              }}
              className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-400 cursor-pointer transition flex items-center justify-between"
            >
              <div>
                <div className="flex items-center space-x-2 font-mono font-bold text-slate-900 text-xs">
                  <span>{s.ticker}</span>
                  <span className="text-[10px] text-slate-500 font-normal">({s.profile})</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {new Date(s.created_at).toLocaleTimeString()}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 uppercase font-mono">
                  {s.status_label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
