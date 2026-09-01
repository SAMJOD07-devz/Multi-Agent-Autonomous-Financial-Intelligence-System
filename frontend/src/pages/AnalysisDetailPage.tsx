// src/pages/AnalysisDetailPage.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../state/useAppStore';
import { AnalysisDetailView } from '../components/views/AnalysisDetailView';
import { CitationDrawer } from '../components/agents/CitationDrawer';
import { ErrorCodeDisclosure } from '../components/common/ErrorCodeDisclosure';
import { ArrowLeft } from 'lucide-react';

export const AnalysisDetailPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const {
    analysisResult,
    selectedCitation,
    isCitationDrawerOpen,
    setSelectedCitation,
    setCitationDrawerOpen
  } = useAppStore();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/analyze')}
          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center space-x-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Analysis Workflow</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-mono">
            Memo Reference: #{sessionId?.slice(0, 8)}
          </span>
        </div>
      </div>

      <AnalysisDetailView
        analysis={analysisResult}
        onSelectCitation={(c) => setSelectedCitation(c)}
      />

      <ErrorCodeDisclosure data={analysisResult} />

      <CitationDrawer
        citation={selectedCitation}
        isOpen={isCitationDrawerOpen}
        onClose={() => setCitationDrawerOpen(false)}
      />
    </div>
  );
};
