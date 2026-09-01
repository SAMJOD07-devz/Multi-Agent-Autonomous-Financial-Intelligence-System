// src/components/market/PriceChart.tsx
import React from 'react';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Bar,
  Area,
  ComposedChart
} from 'recharts';
import { mockHistoricalPriceData } from '../../mocks/fixtureData';
import { LineChart } from 'lucide-react';

interface PriceChartProps {
  ticker: string;
}

export const PriceChart: React.FC<PriceChartProps> = ({ ticker }) => {
  return (
    <div className="panel-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <LineChart className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--fg-primary)]">
            {ticker} Technical Price & Indicator Chart (Intraday)
          </h3>
        </div>
        <div className="flex items-center space-x-2 text-[10px] text-[var(--fg-tertiary)]">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-0.5 bg-cyan-400"></span>
            <span>Price (INR)</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-0.5 bg-purple-400"></span>
            <span>MA-20</span>
          </span>
        </div>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={mockHistoricalPriceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
            <XAxis
              dataKey="time"
              stroke="#6b7280"
              fontSize={10}
              tickLine={false}
            />
            <YAxis
              domain={['auto', 'auto']}
              stroke="#6b7280"
              fontSize={10}
              tickLine={false}
              tickFormatter={(v) => `₹${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111726',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                fontSize: '11px',
                color: '#f3f4f6'
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#38bdf8"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#priceGradient)"
            />
            <Bar dataKey="volume" yAxisId={0} fill="#34d399" opacity={0.25} barSize={12} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
