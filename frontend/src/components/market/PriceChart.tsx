// src/components/market/PriceChart.tsx
// Full-width chart with proper ₹ Y-axis labels and time X-axis.
// Light-theme tooltip. Price in accent blue, volume in neutral gray.
import React from 'react';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Bar,
  Area,
  ComposedChart,
} from 'recharts';
import { mockHistoricalPriceData } from '../../mocks/fixtureData';

import type { HistoricalPoint } from '../../types';

interface PriceChartProps {
  ticker: string;
  currentPrice?: number;
  history?: HistoricalPoint[];
  ma20Data?: { time: string; ma20: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 14px',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-data)',
          fontSize: 11,
          color: 'var(--color-ink-muted)',
          margin: 0,
          marginBottom: 6,
        }}
      >
        {label}
      </p>
      {payload.map((entry: any, i: number) => (
        entry.value !== undefined && entry.dataKey !== 'volume' && (
          <div
            key={i}
            style={{
              fontFamily: 'var(--font-data)',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--color-ink)',
              display: 'flex',
              justifyContent: 'space-between',
              gap: 16,
            }}
          >
            <span style={{ color: 'var(--color-ink-muted)', fontWeight: 400, textTransform: 'capitalize' }}>
              {entry.dataKey}
            </span>
            <span>₹{Number(entry.value).toFixed(1)}</span>
          </div>
        )
      ))}
    </div>
  );
};

export const PriceChart: React.FC<PriceChartProps> = ({ ticker, currentPrice, history }) => {
  const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  let data: any[] = [];
  if (history && history.length > 0) {
    data = history;
  } else {
    const baseData = mockHistoricalPriceData;
    const basePrice = baseData[baseData.length - 1].price;
    const scaleRatio = currentPrice && currentPrice > 0 ? currentPrice / basePrice : 1;

    data = baseData.map((pt, idx) => ({
      ...pt,
      time: idx === baseData.length - 1 ? nowTime : pt.time,
      price: Math.round(pt.price * scaleRatio * 10) / 10,
      ma20: Math.round(pt.ma20 * scaleRatio * 10) / 10,
    }));
  }

  return (
    <div>
      {/* Chart header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <div>
          <h3
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--color-ink)',
              margin: 0,
            }}
          >
            {ticker} — Intraday Price
          </h3>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              color: 'var(--color-ink-faint)',
              margin: 0,
              marginTop: 2,
            }}
          >
            NSE · Prices in ₹ INR · Volume bars normalized
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div
              style={{
                width: 20,
                height: 2,
                background: '#1B4FD8',
                borderRadius: 1,
              }}
            />
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-muted)' }}>
              Price (₹)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div
              style={{
                width: 12,
                height: 10,
                background: '#CBD5E1',
                borderRadius: 2,
              }}
            />
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-muted)' }}>
              Volume
            </span>
          </div>
        </div>
      </div>

      <div style={{ height: 240, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="priceArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1B4FD8" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#1B4FD8" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              vertical={false}
            />

            <XAxis
              dataKey="time"
              stroke="var(--color-border)"
              tick={{
                fontFamily: 'var(--font-data)',
                fontSize: 11,
                fill: 'var(--color-ink-faint)',
              }}
              tickLine={false}
              axisLine={{ stroke: 'var(--color-border)' }}
              label={{
                value: 'Time (IST)',
                position: 'insideBottomRight',
                offset: -8,
                fontFamily: 'var(--font-ui)',
                fontSize: 10,
                fill: 'var(--color-ink-faint)',
              }}
            />

            <YAxis
              domain={['auto', 'auto']}
              stroke="var(--color-border)"
              tick={{
                fontFamily: 'var(--font-data)',
                fontSize: 11,
                fill: 'var(--color-ink-faint)',
              }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `₹${v}`}
              width={64}
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="price"
              stroke="#1B4FD8"
              strokeWidth={2}
              fill="url(#priceArea)"
              dot={false}
              activeDot={{ r: 4, fill: '#1B4FD8', stroke: 'white', strokeWidth: 2 }}
            />

            <Bar
              dataKey="volume"
              fill="#CBD5E1"
              opacity={0.6}
              barSize={14}
              radius={[2, 2, 0, 0]}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
