// src/pages/AnalyzePage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../state/useAppStore';
import { PersonaSelector } from '../components/synthesis/PersonaSelector';
import { ReasoningTrace } from '../components/agents/ReasoningTrace';
import { RecommendationCard } from '../components/synthesis/Recommendation';
import { CitationDrawer } from '../components/agents/CitationDrawer';
import { DegradedAlert } from '../components/common/DegradedAlert';
import { Search, Cpu, Database, ArrowRight } from 'lucide-react';

interface AnalyzePageProps {
  onRunAnalysis: () => void;
}

export const AnalyzePage: React.FC<AnalyzePageProps> = ({ onRunAnalysis }) => {
  const navigate = useNavigate();
  const {
    activeTicker,
    setActiveTicker,
    activeProfile,
    setActiveProfile,
    isLoading,
    analysisResult,
    prevAnalysisResult,
    wsEvents,
    selectedCitation,
    isCitationDrawerOpen,
    setSelectedCitation,
    setCitationDrawerOpen
  } = useAppStore();

  const [inputTicker, setInputTicker] = useState(activeTicker);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputTicker.trim()) {
      setActiveTicker(inputTicker.trim().toUpperCase());
      onRunAnalysis();
    }
  };

  const hasDiverged = Boolean(
    prevAnalysisResult &&
      prevAnalysisResult.ticker === activeTicker &&
      prevAnalysisResult.profile !== activeProfile
  );

  return (
    <div className="space-y-4">
      <div className="panel-card p-4 bg-gradient-to-r from-blue-50/60 via-white to-indigo-50/40">
        <div className="flex items-center space-x-2">
          <Cpu className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Multi-Agent Guided Analysis Workflow
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a stock ticker and behavioral profile to execute parallel multi-agent evaluation.
            </p>
          </div>
        </div>
      </div>

      <div className="panel-card p-5 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-900 flex items-center justify-between">
                <span>1. Stock Ticker Symbol</span>
                <span className="text-[10px] text-slate-400 font-mono">Format: Uppercase Alphanumeric</span>
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={inputTicker}
                  onChange={(e) => setInputTicker(e.target.value.toUpperCase())}
                  placeholder="Enter Stock Ticker (e.g., RELIANCE, TCS, INFY)..."
                  className="w-full pl-9 pr-24 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold font-mono uppercase focus:border-blue-600 focus:bg-white focus:outline-none transition"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputTicker.trim()}
                  className="absolute right-1 top-1 px-4 py-1.5 text-xs font-bold uppercase rounded-md bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-50 shadow-xs flex items-center space-x-1"
                >
                  {isLoading ? 'Running...' : 'Analyze'}
                </button>
              </div>

              <div className="flex items-center space-x-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-medium">Suggestions:</span>
                {['RELIANCE', 'TCS', 'INFY', 'HDFCBANK'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setInputTicker(t);
                      setActiveTicker(t);
                      onRunAnalysis();
                    }}
                    className={`px-2 py-0.5 text-[10px] font-mono rounded border transition ${
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

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900">
                2. Active Risk Preference
              </label>
              <PersonaSelector
                activeProfile={activeProfile}
                onSelectProfile={(prof) => setActiveProfile(prof)}
                hasDiverged={hasDiverged}
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
            <span className="font-semibold text-slate-900 flex items-center space-x-1">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>Data Sources Configured:</span>
            </span>
            <div className="flex flex-wrap gap-2 text-[10px] font-mono">
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-emerald-700 font-semibold">
                ✓ SEBI Q3 Corporate Disclosures
              </span>
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-blue-700 font-semibold">
                ✓ NSE Realtime Tick Feed
              </span>
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-purple-700 font-semibold">
                ✓ Media & Call Transcripts
              </span>
            </div>
          </div>
        </form>
      </div>

      {analysisResult?.degraded_state && (
        <DegradedAlert
          reason={analysisResult.degradation_reason || 'Backend feed degradation.'}
          unavailableData={analysisResult.unavailable_data || []}
          safeNextStep={analysisResult.safe_next_step}
          onRetry={onRunAnalysis}
        />
      )}

      <RecommendationCard
        recommendation={analysisResult?.recommendation || null}
        profile={activeProfile}
        citationCount={analysisResult?.citations?.length || 0}
        onViewCitations={() => {
          if (analysisResult?.citations?.length) {
            setSelectedCitation(analysisResult.citations[0]);
          }
        }}
        degradedState={Boolean(analysisResult?.degraded_state)}
      />

      {analysisResult?.session_id && (
        <div className="flex justify-end">
          <button
            onClick={() => navigate(`/analysis/${analysisResult.session_id}`)}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center space-x-1.5 shadow-sm"
          >
            <span>Open Full Research Memo for {activeTicker}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <ReasoningTrace
        agentOutputs={analysisResult?.agent_outputs || []}
        wsEvents={wsEvents}
        isAnalyzing={isLoading}
        onSelectCitation={(citation) => setSelectedCitation(citation)}
      />

      <CitationDrawer
        citation={selectedCitation}
        isOpen={isCitationDrawerOpen}
        onClose={() => setCitationDrawerOpen(false)}
      />
    </div>
  );
};
