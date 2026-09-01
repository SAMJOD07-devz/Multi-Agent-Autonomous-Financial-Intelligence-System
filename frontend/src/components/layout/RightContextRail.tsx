// src/components/layout/RightContextRail.tsx
import React from 'react';
import { useAppStore } from '../../state/useAppStore';
import { PortfolioRiskMeter } from '../portfolio/PortfolioRiskMeter';
import { mockUserHoldings } from '../../mocks/fixtureData';
import { Briefcase } from 'lucide-react';

export const RightContextRail: React.FC = () => {
  const { activeTicker, analysisResult } = useAppStore();

  const hhiScore = analysisResult?.telemetry?.risk_concentration_score ?? 0.28;

  return (
    <aside className="w-80 bg-white border-l border-slate-200 p-4 flex flex-col space-y-4 shrink-0 hidden lg:flex overflow-y-auto shadow-xs">
      <PortfolioRiskMeter
        hhiScore={hhiScore}
        holdings={mockUserHoldings}
        activeTicker={activeTicker}
      />

      <div className="panel-card p-4 flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5 font-mono">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span>Retail Portfolio Holdings</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">4 Assets</span>
        </div>

        <div className="space-y-2">
          {mockUserHoldings.map((h) => {
            const isTarget = h.ticker.toUpperCase() === activeTicker.toUpperCase();

            return (
              <div
                key={h.holding_id}
                className={`p-2.5 rounded-lg border transition flex items-center justify-between text-xs ${
                  isTarget
                    ? 'bg-blue-50/80 border-blue-300 text-slate-900 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-1.5 font-bold">
                    <span className="font-mono text-slate-900">{h.ticker}</span>
                    {isTarget && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-600 text-white font-semibold">
                        Active Ticker
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                    {h.quantity} Qty @ ₹{h.avg_buy_price.toFixed(1)}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-slate-900">
                    ₹{h.current_price.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-blue-700 font-mono font-bold">
                    {Math.round(h.weight * 100)}% Weight
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
