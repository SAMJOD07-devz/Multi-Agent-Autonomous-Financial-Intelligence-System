// src/components/common/ErrorCodeDisclosure.tsx
import React, { useState } from 'react';
import { Code, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface ErrorCodeDisclosureProps {
  data: any;
  title?: string;
}

export const ErrorCodeDisclosure: React.FC<ErrorCodeDisclosureProps> = ({
  data,
  title = 'Developer QA Raw Payload Disclosure'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4 border border-[var(--border-hairline)] rounded-[var(--radius-md)] bg-[var(--bg-elevated-1)] overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-xs text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-elevated-2)] transition"
      >
        <div className="flex items-center space-x-2">
          <Code className="w-4 h-4 text-[var(--accent)]" />
          <span className="font-semibold">{title}</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="p-3 bg-black/60 border-t border-[var(--border-hairline)] relative">
          <button
            onClick={handleCopy}
            className="absolute top-5 right-5 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300 rounded border border-zinc-700 flex items-center space-x-1"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy JSON'}</span>
          </button>
          <pre className="text-[11px] font-mono text-emerald-400 overflow-x-auto p-2 max-h-60 leading-relaxed">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
