// src/components/tour/GettingStartedChecklist.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, X, Sparkles } from 'lucide-react';

export const GettingStartedChecklist: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const [completedItems, setCompletedItems] = useState<string[]>(['profile']);
  const navigate = useNavigate();

  if (dismissed) return null;

  const tasks = [
    {
      id: 'profile',
      label: 'Select Behavioral Risk Profile',
      desc: 'Set Conservative or Aggressive mode',
      action: () => navigate('/analyze')
    },
    {
      id: 'analyze',
      label: 'Run Multi-Agent Stock Analysis',
      desc: 'Analyze RELIANCE, TCS, or INFY',
      action: () => navigate('/analyze')
    },
    {
      id: 'citations',
      label: 'Inspect Grounded SEBI Citations',
      desc: 'Verify regulatory document sources',
      action: () => navigate('/evidence')
    },
    {
      id: 'portfolio',
      label: 'Review Portfolio Risk Concentration',
      desc: 'Check Herfindahl Index (HHI) score',
      action: () => navigate('/portfolio')
    }
  ];

  const progressPct = Math.round((completedItems.length / tasks.length) * 100);

  return (
    <div className="panel-card p-4 my-4 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-white border-blue-200">
      <div className="flex items-center justify-between pb-3 border-b border-blue-100">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-md bg-blue-100 text-blue-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">
              Getting Started Checklist ({progressPct}% Complete)
            </h3>
            <p className="text-[10px] text-slate-500">
              Explore key workflows to get the most from AstraVest Intelligence.
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-3">
        {tasks.map((task) => {
          const isDone = completedItems.includes(task.id);

          return (
            <button
              key={task.id}
              onClick={() => {
                if (!isDone) setCompletedItems([...completedItems, task.id]);
                task.action();
              }}
              className={`p-2.5 rounded-lg border text-left transition flex items-start space-x-2 ${
                isDone
                  ? 'bg-white border-emerald-200 text-slate-700'
                  : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-xs'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate flex items-center space-x-1">
                  <span>{task.label}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">{task.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
