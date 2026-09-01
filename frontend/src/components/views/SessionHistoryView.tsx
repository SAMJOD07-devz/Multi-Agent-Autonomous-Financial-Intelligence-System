// src/components/views/SessionHistoryView.tsx
import React from 'react';
import type { SessionRecord } from '../../types';
import { History, Play } from 'lucide-react';

interface SessionHistoryViewProps {
  sessions: SessionRecord[];
  onSelectSession: (session: SessionRecord) => void;
}

export const SessionHistoryView: React.FC<SessionHistoryViewProps> = ({
  sessions,
  onSelectSession
}) => {
  return (
    <div className="space-y-4">
      <div className="panel-card p-4">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-sm font-bold tracking-tight text-[var(--fg-primary)]">
              Historical Analysis Sessions
            </h3>
            <p className="text-xs text-[var(--fg-secondary)] mt-0.5">
              Inspect and replay past multi-agent evaluation traces and synthesized outputs.
            </p>
          </div>
        </div>
      </div>

      <div className="panel-card p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[var(--border-hairline)] text-[10px] uppercase text-[var(--fg-tertiary)] font-semibold">
                <th className="py-2 px-3">Session ID</th>
                <th className="py-2 px-3">Ticker</th>
                <th className="py-2 px-3">Profile</th>
                <th className="py-2 px-3">Timestamp</th>
                <th className="py-2 px-3">Status Label</th>
                <th className="py-2 px-3 text-right">Confidence</th>
                <th className="py-2 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-hairline)]">
              {sessions.map((s) => (
                <tr key={s.session_id} className="hover:bg-[var(--bg-elevated-2)] transition">
                  <td className="py-3 px-3 font-mono text-[var(--fg-tertiary)]">{s.session_id.slice(0, 12)}</td>
                  <td className="py-3 px-3 font-mono font-bold text-[var(--fg-primary)]">{s.ticker}</td>
                  <td className="py-3 px-3 text-[var(--fg-secondary)]">{s.profile}</td>
                  <td className="py-3 px-3 text-[var(--fg-tertiary)]">{new Date(s.created_at).toLocaleTimeString()}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                        s.degraded_state
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {s.status_label}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums font-mono font-bold text-cyan-300">
                    {Math.round(s.confidence * 100)}%
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => onSelectSession(s)}
                      className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-bold uppercase transition flex items-center space-x-1 mx-auto"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Replay</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
