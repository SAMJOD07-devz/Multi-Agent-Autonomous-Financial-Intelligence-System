// src/components/portfolio/PortfolioRiskMeter.tsx
import React from 'react';
import { AlertTriangle, PieChart } from 'lucide-react';
import type { PortfolioHolding } from '../../types';

interface PortfolioRiskMeterProps {
  hhiScore: number;
  holdings: PortfolioHolding[];
  activeTicker: string;
}

export const PortfolioRiskMeter: React.FC<PortfolioRiskMeterProps> = ({
  hhiScore,
  holdings,
  activeTicker
}) => {
  const isHighRisk = hhiScore > 0.25;
  const isModerateRisk = hhiScore > 0.18 && hhiScore <= 0.25;

  const activeHolding = holdings.find((h) => h.ticker.toUpperCase() === activeTicker.toUpperCase());

  return (
    <div className="panel-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5 font-mono">
          <PieChart className="w-4 h-4 text-blue-600" />
          <span>Portfolio Risk Concentration</span>
        </span>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
            isHighRisk
              ? 'bg-red-50 text-red-700 border-red-200 font-semibold'
              : isModerateRisk
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          {isHighRisk ? 'HIGH CONCENTRATION' : isModerateRisk ? 'MODERATE' : 'WELL DIVERSIFIED'}
        </span>
      </div>

      <div className="mt-3">
        <div className="flex items-baseline justify-between text-xs">
          <span className="text-slate-600 font-medium">Herfindahl-Hirschman Score (HHI):</span>
          <span className="tabular-nums font-bold text-sm text-slate-900 font-mono">
            {hhiScore.toFixed(3)}
          </span>
        </div>

        <div className="relative w-full h-2 rounded-full bg-slate-200 mt-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              isHighRisk ? 'bg-red-600' : isModerateRisk ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(hhiScore * 200, 100)}%` }}
          />
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-red-600 z-10" />
        </div>
        <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-mono">
          <span>0.0 (Diversified)</span>
          <span className="text-red-600 font-semibold">0.25 Threshold</span>
          <span>0.50+ (Concentrated)</span>
        </div>
      </div>

      {activeHolding && (
        <div className="mt-3 p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span className="font-bold text-slate-900">{activeHolding.ticker} Exposure</span>
          </div>
          <span className="tabular-nums font-bold text-blue-700 font-mono">
            {Math.round(activeHolding.weight * 100)}% Portfolio
          </span>
        </div>
      )}

      {isHighRisk && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start space-x-2.5 text-xs">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p className="text-red-900 text-[11px] leading-relaxed">
            <strong className="text-red-950">Concentration Alert (HHI &gt; 0.25):</strong> Adding further exposure to {activeTicker} will exacerbate portfolio concentration risk.
          </p>
        </div>
      )}
    </div>
  );
};
