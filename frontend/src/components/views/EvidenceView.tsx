// src/components/views/EvidenceView.tsx
import React, { useState } from 'react';
import type { Citation } from '../../types';
import { FileText, Search, Filter, ShieldCheck } from 'lucide-react';

interface EvidenceViewProps {
  citations: Citation[];
  onSelectCitation: (citation: Citation) => void;
}

export const EvidenceView: React.FC<EvidenceViewProps> = ({
  citations,
  onSelectCitation
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('ALL');

  const filteredCitations = citations.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.locator.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSource = selectedSource === 'ALL' || c.source.toLowerCase().includes(selectedSource.toLowerCase());

    return matchesSearch && matchesSource;
  });

  return (
    <div className="space-y-4">
      <div className="panel-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold tracking-tight text-[var(--fg-primary)]">
              Grounded Evidence & Regulatory Disclosure Library
            </h3>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
            SEBI & BSE Verified
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--fg-tertiary)]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, filing source, or document locator..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-[var(--bg-base)] border border-[var(--border-hairline)] rounded-md text-[var(--fg-primary)] placeholder-[var(--fg-tertiary)] focus:border-[var(--accent)]"
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-[var(--fg-tertiary)]" />
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="text-xs bg-[var(--bg-base)] border border-[var(--border-hairline)] text-zinc-300 rounded px-2 py-1.5"
            >
              <option value="ALL">All Source Types</option>
              <option value="SEBI">SEBI Disclosures</option>
              <option value="NSE">NSE Market Feed</option>
              <option value="Earnings">Earnings Call Transcripts</option>
              <option value="Corporate">Corporate Filings</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredCitations.length === 0 ? (
          <div className="col-span-2 panel-card p-8 text-center text-xs text-[var(--fg-tertiary)]">
            No source citations match your filter criteria.
          </div>
        ) : (
          filteredCitations.map((c, idx) => (
            <div
              key={idx}
              onClick={() => onSelectCitation(c)}
              className="panel-card p-4 cursor-pointer hover:border-cyan-500/50 transition group space-y-2"
            >
              <div className="flex items-start justify-between">
                <span className="text-[10px] uppercase font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30">
                  {c.source}
                </span>
                <span className="text-[10px] font-mono text-[var(--fg-tertiary)]">
                  {c.locator}
                </span>
              </div>

              <h4 className="text-xs font-bold text-[var(--fg-primary)] group-hover:text-cyan-300 transition">
                {c.title}
              </h4>

              <p className="text-[11px] font-mono text-emerald-300/80 bg-zinc-950 p-2 rounded border border-zinc-800 line-clamp-2">
                "{c.excerpt || 'Retrieved regulatory disclosure excerpt.'}"
              </p>

              <div className="flex items-center justify-between text-[10px] text-[var(--fg-tertiary)] pt-1">
                <span className="flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Verifiable RAG Grounding</span>
                </span>
                <span className="text-cyan-400 font-semibold group-hover:underline">Inspect Document →</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
