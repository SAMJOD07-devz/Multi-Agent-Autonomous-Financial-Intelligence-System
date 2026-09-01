// src/components/layout/Sidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Activity, PieChart, FileText, History, Settings, ShieldCheck } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { path: '/', label: 'Overview', icon: LayoutDashboard },
    { path: '/analyze', label: 'Analyze Workflow', icon: Activity },
    { path: '/portfolio', label: 'Portfolio State', icon: PieChart },
    { path: '/evidence', label: 'Evidence Library', icon: FileText },
    { path: '/sessions', label: 'Session History', icon: History },
    { path: '/settings', label: 'Settings & QA', icon: Settings },
  ];

  return (
    <aside className="w-16 md:w-56 bg-white border-r border-slate-200 flex flex-col justify-between py-4 shrink-0 shadow-xs">
      <div className="space-y-1 px-2">
        <div className="hidden md:block text-[10px] uppercase font-bold tracking-wider text-slate-400 px-3 mb-2 font-mono">
          Intelligence Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0 text-current" />
              <span className="hidden md:inline truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Safety Standard Footer Badge */}
      <div className="hidden md:block px-4 py-3 border-t border-slate-100 text-[10px] text-slate-500">
        <div className="flex items-center space-x-1.5 text-emerald-700 font-semibold mb-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>SEBI Filings Verified</span>
        </div>
        <p className="leading-tight text-slate-400">
          Zero uncited recommendations policy.
        </p>
      </div>
    </aside>
  );
};
