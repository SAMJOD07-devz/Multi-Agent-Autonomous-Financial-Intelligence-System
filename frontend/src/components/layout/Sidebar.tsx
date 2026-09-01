// src/components/layout/Sidebar.tsx
// Quiet left nav rail. Active state: accent left border, no colored backgrounds.
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  PieChart,
  FileText,
  History,
  Settings,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/',          label: 'Overview',  icon: LayoutDashboard, end: true },
  { path: '/analyze',   label: 'Analyze',   icon: Activity,         end: false },
  { path: '/portfolio', label: 'Portfolio', icon: PieChart,         end: false },
  { path: '/evidence',  label: 'Evidence',  icon: FileText,         end: false },
  { path: '/sessions',  label: 'Sessions',  icon: History,          end: false },
  { path: '/settings',  label: 'Settings',  icon: Settings,         end: false },
];

export const Sidebar: React.FC = () => {
  return (
    <nav
      style={{
        width: 56,
        flexShrink: 0,
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 16,
        paddingBottom: 16,
        gap: 4,
      }}
      className="sidebar-nav"
    >
      {NAV_ITEMS.map(({ path, label, icon: Icon, end }) => (
        <NavLink
          key={path}
          to={path}
          end={end}
          title={label}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-md)',
            color: isActive ? 'var(--color-accent)' : 'var(--color-ink-faint)',
            background: isActive ? 'var(--color-accent-light)' : 'transparent',
            transition: 'color 150ms, background 150ms',
            textDecoration: 'none',
          })}
        >
          {({ isActive }) => (
            <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
          )}
        </NavLink>
      ))}

      {/* Expanded labels on wider viewports */}
      <style>{`
        @media (min-width: 1200px) {
          .sidebar-nav {
            width: 192px !important;
            align-items: stretch !important;
            padding-left: 10px !important;
            padding-right: 10px !important;
          }
          .sidebar-nav a {
            width: auto !important;
            height: auto !important;
            padding: 9px 12px !important;
            justify-content: flex-start !important;
            gap: 10px !important;
          }
          .sidebar-nav a::after {
            content: attr(title);
            font-family: var(--font-ui);
            font-size: 13px;
            font-weight: 500;
          }
        }
      `}</style>
    </nav>
  );
};
