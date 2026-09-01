// src/App.tsx
// Clean shell: sticky navbar | sidebar rail | route content | quiet status strip at bottom.
// RightContextRail removed from global layout — it's rendered inside AnalyzePage directly.
// Getting-started checklist removed from global layout entirely (moved to Settings).
import { useState, useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAppStore } from './state/useAppStore';
import { fetchAnalysis } from './api/client';
import { AgentTraceWebSocketClient } from './realtime/websocket';

import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ProductTour } from './components/tour/ProductTour';

import { OverviewPage } from './pages/OverviewPage';
import { AnalyzePage } from './pages/AnalyzePage';
import { AnalysisDetailPage } from './pages/AnalysisDetailPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { EvidencePage } from './pages/EvidencePage';
import { SessionsPage } from './pages/SessionsPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  const [isTourOpen, setIsTourOpen] = useState(false);

  const {
    activeTicker,
    activeProfile,
    activeScenario,
    isMockMode,
    analysisResult,
    setAnalysisResult,
    setLoading,
    setWsConnectionState,
    addWsEvent,
    clearWsEvents,
    addSessionRecord,
  } = useAppStore();

  const wsClientRef = useRef<AgentTraceWebSocketClient | null>(null);

  useEffect(() => {
    const done = localStorage.getItem('astravest_tour_completed');
    if (!done) setIsTourOpen(true);
  }, []);

  const handleRunAnalysis = async () => {
    setLoading(true);
    clearWsEvents();

    const payload = { ticker: activeTicker, behavioral_profile: activeProfile, scenario: activeScenario };

    if (wsClientRef.current) wsClientRef.current.disconnect();
    wsClientRef.current = new AgentTraceWebSocketClient(
      event => addWsEvent(event),
      state => setWsConnectionState(state),
    );
    wsClientRef.current.connect(payload);

    try {
      const result = await fetchAnalysis(payload, undefined, isMockMode);
      setAnalysisResult(result);
      addSessionRecord({
        session_id: result.session_id,
        ticker: result.ticker,
        profile: result.profile,
        created_at: result.created_at,
        status_label: result.recommendation?.label || 'DEGRADED',
        confidence: result.telemetry?.combined_confidence || 0,
        degraded_state: result.degraded_state,
      });
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Only clean up WebSocket on unmount — do NOT auto-run analysis on mount.
  // Analysis is initiated only by: Navbar form submit, ticker chip click, or profile toggle.
  useEffect(() => {
    return () => { if (wsClientRef.current) wsClientRef.current.disconnect(); };
  }, []);

  const latency = analysisResult?.telemetry?.latency_ms;
  const session = analysisResult?.session_id;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-canvas)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'var(--font-ui)',
      }}
    >
      <Navbar onRunAnalysis={handleRunAnalysis} onOpenTour={() => setIsTourOpen(true)} />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar />

        <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
          <Routes>
            <Route path="/"                   element={<OverviewPage />} />
            <Route path="/analyze"            element={<AnalyzePage onRunAnalysis={handleRunAnalysis} />} />
            <Route path="/analysis/:sessionId" element={<AnalysisDetailPage />} />
            <Route path="/portfolio"           element={<PortfolioPage />} />
            <Route path="/evidence"            element={<EvidencePage />} />
            <Route path="/sessions"            element={<SessionsPage />} />
            <Route path="/settings"            element={<SettingsPage onOpenTour={() => setIsTourOpen(true)} />} />
          </Routes>

          {/* Quiet status strip — diagnostics live here, not in the header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              padding: '10px 24px',
              borderTop: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
            }}
          >
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-faint)' }}>
              Profile: <span style={{ fontFamily: 'var(--font-data)', fontWeight: 600 }}>{activeProfile}</span>
            </span>
            {latency !== undefined && (
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-faint)' }}>
                Latency: <span style={{ fontFamily: 'var(--font-data)', fontWeight: 600 }}>{latency.toFixed(0)} ms</span>
              </span>
            )}
            {session && (
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-faint)' }}>
                Session: <span style={{ fontFamily: 'var(--font-data)', fontWeight: 600, fontSize: 10 }}>{session.slice(0, 20)}…</span>
              </span>
            )}
            <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--color-ink-faint)' }}>
              AstraVest Intelligence · Non-authoritative research
            </span>
          </div>
        </main>
      </div>

      <ProductTour isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />
    </div>
  );
}

export default App;
