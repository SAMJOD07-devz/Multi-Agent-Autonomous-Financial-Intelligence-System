// src/components/views/PortfolioView.tsx
import React from 'react';
import { mockUserHoldings } from '../../mocks/fixtureData';
import { PortfolioRiskMeter } from '../portfolio/PortfolioRiskMeter';
import { Briefcase } from 'lucide-react';

interface PortfolioViewProps {
  activeTicker: string;
  hhiScore: number;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  activeTicker,
  hhiScore
}) => {
  const totalValue = mockUserHoldings.reduce(
    (acc, h) => acc + h.quantity * h.current_price,
    0
  );
  const totalCost = mockUserHoldings.reduce(
    (acc, h) => acc + h.quantity * h.avg_buy_price,
    0
  );
  const totalGain = totalValue - totalCost;
  const gainPct = (totalGain / totalCost) * 100;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="panel-card p-4">
          <span className="text-[10px] uppercase font-semibold text-[var(--fg-tertiary)]">Total Portfolio Value</span>
          <div className="text-xl font-bold tabular-nums font-mono text-[var(--fg-primary)] mt-1">
            ₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-[var(--fg-tertiary)]">4 Equity & Banking Assets</span>
        </div>

        <div className="panel-card p-4">
          <span className="text-[10px] uppercase font-semibold text-[var(--fg-tertiary)]">Unrealized Gain / Loss</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-xl font-bold tabular-nums font-mono text-emerald-400">
              +₹{totalGain.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              (+{gainPct.toFixed(2)}%)
            </span>
          </div>
          <span className="text-[10px] text-[var(--fg-tertiary)]">All positions profitable</span>
        </div>

        <div className="panel-card p-4">
          <span className="text-[10px] uppercase font-semibold text-[var(--fg-tertiary)]">HHI Risk Score</span>
          <div className="text-xl font-bold tabular-nums font-mono text-amber-400 mt-1">
            {hhiScore.toFixed(3)}
          </div>
          <span className="text-[10px] text-amber-300">
            {hhiScore > 0.25 ? 'High Risk (>0.25 Threshold)' : 'Moderate Concentration'}
          </span>
        </div>
      </div>

      <PortfolioRiskMeter
        hhiScore={hhiScore}
        holdings={mockUserHoldings}
        activeTicker={activeTicker}
      />

      <div className="panel-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-primary)] flex items-center space-x-1.5">
            <Briefcase className="w-4 h-4 text-cyan-400" />
            <span>Retail Asset Allocation & Weightings</span>
          </h3>
          <span className="text-[10px] text-[var(--fg-tertiary)] font-mono">Auto-Calculated Weights</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[var(--border-hairline)] text-[10px] uppercase text-[var(--fg-tertiary)] font-semibold">
                <th className="py-2 px-3">Asset Ticker</th>
                <th className="py-2 px-3">Asset Class</th>
                <th className="py-2 px-3 text-right">Quantity</th>
                <th className="py-2 px-3 text-right">Avg Buy Price</th>
                <th className="py-2 px-3 text-right">Current Price</th>
                <th className="py-2 px-3 text-right">Portfolio Weight</th>
                <th className="py-2 px-3 text-right">Gain / Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-hairline)]">
              {mockUserHoldings.map((h) => {
                const isTarget = h.ticker.toUpperCase() === activeTicker.toUpperCase();
                const gain = (h.current_price - h.avg_buy_price) * h.quantity;
                const gainP = ((h.current_price - h.avg_buy_price) / h.avg_buy_price) * 100;

                return (
                  <tr
                    key={h.holding_id}
                    className={`hover:bg-[var(--bg-elevated-2)] transition ${
                      isTarget ? 'bg-cyan-950/20 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-3 flex items-center space-x-2">
                      <span className="font-mono font-bold text-[var(--fg-primary)]">{h.ticker}</span>
                      {isTarget && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">
                          Active Ticker
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-[var(--fg-secondary)]">{h.asset_class}</td>
                    <td className="py-3 px-3 text-right tabular-nums font-mono">{h.quantity}</td>
                    <td className="py-3 px-3 text-right tabular-nums font-mono text-[var(--fg-secondary)]">₹{h.avg_buy_price.toFixed(1)}</td>
                    <td className="py-3 px-3 text-right tabular-nums font-mono font-bold text-[var(--fg-primary)]">₹{h.current_price.toFixed(1)}</td>
                    <td className="py-3 px-3 text-right tabular-nums font-mono font-bold text-cyan-400">{Math.round(h.weight * 100)}%</td>
                    <td className="py-3 px-3 text-right tabular-nums font-mono text-emerald-400 font-bold">
                      +₹{gain.toFixed(0)} ({gainP.toFixed(1)}%)
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
