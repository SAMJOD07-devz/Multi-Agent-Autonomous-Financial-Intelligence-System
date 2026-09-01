// src/components/common/MetricCounter.tsx
import React from 'react';

interface MetricCounterProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  alert?: boolean;
}

export const MetricCounter: React.FC<MetricCounterProps> = ({
  label,
  value,
  unit,
  trend,
  alert
}) => {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wider text-[var(--fg-tertiary)] font-medium">
        {label}
      </span>
      <div className="flex items-baseline space-x-1 mt-0.5">
        <span
          className={`tabular-nums text-sm font-semibold ${
            alert ? 'text-[var(--degraded)] font-bold' : 'text-[var(--fg-primary)]'
          }`}
        >
          {value}
        </span>
        {unit && <span className="text-[11px] text-[var(--fg-secondary)]">{unit}</span>}
        {trend && (
          <span
            className={`text-xs ${
              trend === 'up' ? 'text-[var(--positive)]' : trend === 'down' ? 'text-[var(--degraded)]' : 'text-[var(--fg-tertiary)]'
            }`}
          >
            {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '▬'}
          </span>
        )}
      </div>
    </div>
  );
};
