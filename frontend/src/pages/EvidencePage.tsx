// src/pages/EvidencePage.tsx
import React from 'react';
import { useAppStore } from '../state/useAppStore';
import { EvidenceView } from '../components/views/EvidenceView';
import { CitationDrawer } from '../components/agents/CitationDrawer';
import { FileText } from 'lucide-react';

export const EvidencePage: React.FC = () => {
  const {
    analysisResult,
    selectedCitation,
    isCitationDrawerOpen,
    setSelectedCitation,
    setCitationDrawerOpen
  } = useAppStore();

  return (
    <div className="space-y-4">
      <div className="panel-card p-4 bg-gradient-to-r from-blue-50/60 via-white to-indigo-50/40">
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Grounded Regulatory Disclosures & Source Citations Library
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect retrieved SEBI corporate disclosures, exchange filings, and earnings transcripts that ground our multi-agent reasoning.
            </p>
          </div>
        </div>
      </div>

      <EvidenceView
        citations={analysisResult?.citations || []}
        onSelectCitation={(c) => setSelectedCitation(c)}
      />

      <CitationDrawer
        citation={selectedCitation}
        isOpen={isCitationDrawerOpen}
        onClose={() => setCitationDrawerOpen(false)}
      />
    </div>
  );
};
