// src/pages/PortfolioPage.tsx
import React from 'react';
import { useAppStore } from '../state/useAppStore';
import { PortfolioView } from '../components/views/PortfolioView';
import { PieChart } from 'lucide-react';

export const PortfolioPage: React.FC = () => {
  const { activeTicker, analysisResult } = useAppStore();

  const hhiScore = analysisResult?.telemetry?.risk_concentration_score ?? 0.28;

  return (
    <div className="space-y-4">
      <div className="panel-card p-4 bg-gradient-to-r from-blue-50/60 via-white to-indigo-50/40">
        <div className="flex items-center space-x-2">
          <PieChart className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Retail Portfolio Intelligence & Concentration Metrics
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitor asset allocations, current exposures, and the Herfindahl-Hirschman Index (HHI) concentration score.
            </p>
          </div>
        </div>
      </div>

      <PortfolioView activeTicker={activeTicker} hhiScore={hhiScore} />
    </div>
  );
};
