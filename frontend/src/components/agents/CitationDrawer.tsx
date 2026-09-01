// src/components/agents/CitationDrawer.tsx
import React from 'react';
import type { Citation } from '../../types';
import { X, FileText, ShieldCheck, Bookmark, Scale } from 'lucide-react';

interface CitationDrawerProps {
  citation: Citation | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CitationDrawer: React.FC<CitationDrawerProps> = ({
  citation,
  isOpen,
  onClose
}) => {
  if (!isOpen || !citation) return null;

  return (
    <div className="fixed inset-0 z-[var(--z-drawer)] flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-lg bg-[var(--bg-elevated-1)] border-l border-[var(--border-hairline)] h-full p-6 overflow-y-auto flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-hairline)]">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded bg-cyan-500/10 text-cyan-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-cyan-400 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>SEBI Grounded Citation Excerpt</span>
                </span>
                <h3 className="text-sm font-bold text-[var(--fg-primary)] mt-0.5">
                  {citation.title}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 my-4 p-3 rounded-md bg-[var(--bg-base)] border border-[var(--border-hairline)] text-xs">
            <div>
              <span className="text-[10px] text-[var(--fg-tertiary)] uppercase font-semibold">Document Source</span>
              <div className="font-bold text-[var(--fg-primary)] mt-0.5">{citation.source}</div>
            </div>
            <div>
              <span className="text-[10px] text-[var(--fg-tertiary)] uppercase font-semibold">Filing Locator / Page</span>
              <div className="font-mono text-cyan-300 mt-0.5">{citation.locator}</div>
            </div>
            {citation.document_name && (
              <div className="col-span-2">
                <span className="text-[10px] text-[var(--fg-tertiary)] uppercase font-semibold">Official File Name</span>
                <div className="font-mono text-xs text-zinc-300 mt-0.5 truncate">{citation.document_name}</div>
              </div>
            )}
          </div>

          <div className="my-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--fg-secondary)] flex items-center space-x-1.5 mb-2">
              <Bookmark className="w-4 h-4 text-emerald-400" />
              <span>Verbatim Retrieved Document Excerpt</span>
            </span>

            <div className="p-4 rounded-md bg-zinc-950 border border-zinc-800 text-xs text-emerald-300 font-mono leading-relaxed relative">
              <div className="absolute top-2 right-2 text-[10px] text-zinc-600 uppercase">Exact Quote</div>
              "{citation.excerpt || 'No direct excerpt text available for this citation locator.'}"
            </div>
          </div>

          <div className="p-3 rounded bg-cyan-950/20 border border-cyan-500/30 text-xs text-cyan-200 flex items-start space-x-2">
            <Scale className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Regulatory Integrity Guarantee:</strong> Fundamental RAG recommendations are strictly constrained to facts verified in official exchange filings and disclosures.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--border-hairline)] flex items-center justify-between">
          <span className="text-[10px] text-[var(--fg-tertiary)]">
            Verified by RAG Pipeline Engine
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
