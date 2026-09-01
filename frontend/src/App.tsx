// src/App.tsx
import { useState, useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAppStore } from './state/useAppStore';
import { fetchAnalysis } from './api/client';
import { AgentTraceWebSocketClient } from './realtime/websocket';

// Core Layout Components
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { RightContextRail } from './components/layout/RightContextRail';

// Product Tour Component
import { ProductTour } from './components/tour/ProductTour';

// Dedicated Page Views
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
    setAnalysisResult,
    setLoading,
    setWsConnectionState,
    addWsEvent,
    clearWsEvents,
    addSessionRecord
  } = useAppStore();

  const wsClientRef = useRef<AgentTraceWebSocketClient | null>(null);

  // Check if tour should auto-start on first visit
  useEffect(() => {
    const tourCompleted = localStorage.getItem('astravest_tour_completed');
    if (!tourCompleted) {
      setIsTourOpen(true);
    }
  }, []);

  const handleRunAnalysis = async () => {
    setLoading(true);
    clearWsEvents();

    const requestPayload = {
      ticker: activeTicker,
      behavioral_profile: activeProfile,
      scenario: activeScenario
    };

    if (wsClientRef.current) {
      wsClientRef.current.disconnect();
    }

    wsClientRef.current = new AgentTraceWebSocketClient(
      (event) => addWsEvent(event),
      (state) => setWsConnectionState(state)
    );
    wsClientRef.current.connect(requestPayload);

    try {
      const result = await fetchAnalysis(requestPayload, undefined, isMockMode);
      setAnalysisResult(result);

      addSessionRecord({
        session_id: result.session_id,
        ticker: result.ticker,
        profile: result.profile,
        created_at: result.created_at,
        status_label: result.recommendation?.label || 'DEGRADED',
        confidence: result.telemetry?.combined_confidence || 0.0,
        degraded_state: result.degraded_state
      });
    } catch (err) {
      console.error('Analysis request error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRunAnalysis();
    return () => {
      if (wsClientRef.current) wsClientRef.current.disconnect();
    };
  }, [activeTicker, activeProfile, activeScenario, isMockMode]);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--fg-secondary)] flex flex-col font-sans">
      {/* Navbar with Tour Trigger */}
      <Navbar
        onRunAnalysis={handleRunAnalysis}
        onOpenTour={() => setIsTourOpen(true)}
      />

      {/* Main Multipage Workstation Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Rail */}
        <Sidebar />

        {/* Primary Route Outlet Container */}
        <main className="flex-1 overflow-y-auto p-4 max-w-6xl mx-auto space-y-4">
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/analyze" element={<AnalyzePage onRunAnalysis={handleRunAnalysis} />} />
            <Route path="/analysis/:sessionId" element={<AnalysisDetailPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/evidence" element={<EvidencePage />} />
            <Route path="/sessions" element={<SessionsPage />} />
            <Route
              path="/settings"
              element={<SettingsPage onOpenTour={() => setIsTourOpen(true)} />}
            />
          </Routes>
        </main>

        {/* Right Portfolio Context & Concentration Rail */}
        <RightContextRail />
      </div>

      {/* Interactive 11-Step Product Tour Modal */}
      <ProductTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
      />
    </div>
  );
}

export default App;
