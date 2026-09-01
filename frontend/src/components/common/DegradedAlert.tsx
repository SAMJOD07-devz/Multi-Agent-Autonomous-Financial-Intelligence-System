// src/components/common/DegradedAlert.tsx
import React from 'react';
import { AlertTriangle, ShieldAlert, RefreshCw } from 'lucide-react';

interface DegradedAlertProps {
  reason: string;
  unavailableData: string[];
  safeNextStep?: string | null;
  onRetry?: () => void;
}

export const DegradedAlert: React.FC<DegradedAlertProps> = ({
  reason,
  unavailableData,
  safeNextStep,
  onRetry
}) => {
  return (
    <div className="panel-card bg-red-50/80 border-red-200 p-4 my-4 relative overflow-hidden">
      <div className="flex items-start space-x-3">
        <div className="p-2 rounded-lg bg-red-100 text-red-700 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
              DEGRADED DATA MODE (SAFETY ENFORCED)
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              [ACTIONABLE RECOMMENDATION SUPPRESSED]
            </span>
          </div>

          <p className="text-sm font-semibold text-slate-900 mt-2 leading-relaxed">
            {reason}
          </p>

          {unavailableData.length > 0 && (
            <div className="mt-2.5 flex items-center space-x-2 text-xs">
              <span className="text-slate-600 font-medium">Suppressed Data Feeds:</span>
              <div className="flex flex-wrap gap-1.5">
                {unavailableData.map((feed) => (
                  <span
                    key={feed}
                    className="px-2 py-0.5 rounded bg-white text-slate-700 font-mono text-[11px] border border-slate-200"
                  >
                    {feed}
                  </span>
                ))}
              </div>
            </div>
          )}

          {safeNextStep && (
            <div className="mt-3 p-3 rounded-lg bg-white border border-slate-200 flex items-center space-x-2 text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-slate-700 flex-1">
                <strong className="text-slate-900">Recommended Next Step:</strong> {safeNextStep}
              </span>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition flex items-center space-x-1 shrink-0 shadow-xs"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry Feed</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
