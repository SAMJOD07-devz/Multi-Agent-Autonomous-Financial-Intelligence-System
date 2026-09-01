// src/components/layout/Navbar.tsx
// Stripped to three zones: logo | ticker search + Analyze | live status
// All diagnostics (latency, HHI, persona) removed — they live in the status strip
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../state/useAppStore';
import { Search, Loader2 } from 'lucide-react';

interface NavbarProps {
  onRunAnalysis: () => void;
  onOpenTour: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onRunAnalysis }) => {
  const navigate = useNavigate();
  const { activeTicker, setActiveTicker, isLoading, wsConnectionState } = useAppStore();
  const [inputTicker, setInputTicker] = useState(activeTicker);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = inputTicker.trim().toUpperCase();
    if (!t) return;
    setActiveTicker(t);
    onRunAnalysis();
    navigate('/analyze');
  };

  const isStreaming = wsConnectionState === 'live' || isLoading;
  const isConnecting = wsConnectionState === 'connecting' || wsConnectionState === 'reconnecting';
  const statusLabel = isStreaming ? 'Streaming' : isConnecting ? 'Connecting…' : 'Live Feed';
  const statusDotClass = isStreaming ? 'status-dot-live' : isConnecting ? 'status-dot-warn' : 'status-dot-live';

  return (
    <header
      style={{
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '0 24px',
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
        }}
      >
        {/* Zone 1: Logo */}
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            flexShrink: 0,
          }}
        >
          {/* Logomark — simple geometric mark */}
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="6" fill="var(--color-accent)" />
            <path d="M7 20L14 8l7 12" stroke="white" strokeWidth="2" strokeLinejoin="round" fill="none"/>
            <circle cx="14" cy="8" r="2" fill="white"/>
          </svg>
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 700,
              fontSize: 15,
              color: 'var(--color-ink)',
              letterSpacing: '-0.01em',
            }}
          >
            AstraVest
          </span>
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 400,
              fontSize: 15,
              color: 'var(--color-ink-muted)',
            }}
          >
            Intelligence
          </span>
        </button>

        {/* Zone 2: Ticker search + Analyze */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flex: 1,
            maxWidth: 480,
          }}
        >
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={14}
              style={{
                position: 'absolute',
                left: 11,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-ink-faint)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              value={inputTicker}
              onChange={e => setInputTicker(e.target.value.toUpperCase())}
              placeholder="Search ticker — RELIANCE, TCS, INFY…"
              style={{
                width: '100%',
                paddingLeft: 32,
                paddingRight: 12,
                paddingTop: 7,
                paddingBottom: 7,
                fontFamily: 'var(--font-data)',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--color-ink)',
                background: 'var(--color-canvas)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                transition: 'border-color 150ms',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-accent)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !inputTicker.trim()}
            className="btn-primary"
            style={{ flexShrink: 0 }}
          >
            {isLoading ? (
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
            ) : null}
            {isLoading ? 'Running…' : 'Analyze'}
          </button>
        </form>

        {/* Zone 3: Live status — dot + label only */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            flexShrink: 0,
          }}
        >
          <span
            className={statusDotClass}
            style={isStreaming ? { animation: 'pulse 2s ease-in-out infinite' } : undefined}
          />
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--color-ink-muted)',
            }}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </header>
  );
};
