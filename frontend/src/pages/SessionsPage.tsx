// src/pages/SessionsPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../state/useAppStore';
import { SessionHistoryView } from '../components/views/SessionHistoryView';
import { History } from 'lucide-react';

export const SessionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { sessionsHistory, setActiveTicker, setActiveProfile } = useAppStore();

  return (
    <div className="space-y-4">
      <div className="panel-card p-4 bg-gradient-to-r from-blue-50/60 via-white to-indigo-50/40">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Historical Analysis Interaction Sessions
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review previous interaction sessions, compare Conservative vs Aggressive recommendations, and replay multi-agent execution traces.
            </p>
          </div>
        </div>
      </div>

      <SessionHistoryView
        sessions={sessionsHistory}
        onSelectSession={(s) => {
          setActiveTicker(s.ticker);
          setActiveProfile(s.profile);
          navigate('/analyze');
        }}
      />
    </div>
  );
};
