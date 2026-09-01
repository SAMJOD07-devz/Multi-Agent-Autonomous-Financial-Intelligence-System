// src/pages/SettingsPage.tsx
import React from 'react';
import { SettingsView } from '../components/views/SettingsView';
import { Settings, Sparkles } from 'lucide-react';

interface SettingsPageProps {
  onOpenTour: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onOpenTour }) => {
  return (
    <div className="space-y-4">
      <div className="panel-card p-4 bg-gradient-to-r from-blue-50/60 via-white to-indigo-50/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Settings, Preferences & Tour Controls
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure FastAPI connections, QA simulation scenarios, mock mode settings, and replay the guided tour.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenTour}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center space-x-1.5 shadow-sm shadow-blue-500/20"
          >
            <Sparkles className="w-4 h-4" />
            <span>Replay Guided Product Tour</span>
          </button>
        </div>
      </div>

      <SettingsView />
    </div>
  );
};
