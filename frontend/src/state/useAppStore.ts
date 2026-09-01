// src/state/useAppStore.ts
import { create } from 'zustand';
import type {
  RiskProfile,
  AnalysisResponse,
  WSEvent,
  Citation,
  SessionRecord
} from '../types';
import { mockCleanAnalysisResponse } from '../mocks/fixtureData';

interface AppState {
  // Active User Context & Controls
  activeTicker: string;
  activeProfile: RiskProfile;
  activeScenario: string;
  isMockMode: boolean;
  
  // Current Active Analysis State
  isLoading: boolean;
  isAnalyzingWS: boolean;
  analysisResult: AnalysisResponse | null;
  prevAnalysisResult: AnalysisResponse | null;
  wsEvents: WSEvent[];
  wsConnectionState: 'disconnected' | 'connecting' | 'live' | 'reconnecting' | 'error';
  
  // UI Panels & Drawer States
  selectedCitation: Citation | null;
  isCitationDrawerOpen: boolean;
  activeTab: 'overview' | 'analyze' | 'portfolio' | 'evidence' | 'sessions' | 'settings';
  
  // Session History
  sessionsHistory: SessionRecord[];
  
  // Actions
  setActiveTicker: (ticker: string) => void;
  setActiveProfile: (profile: RiskProfile) => void;
  setActiveScenario: (scenario: string) => void;
  setMockMode: (enabled: boolean) => void;
  setAnalysisResult: (result: AnalysisResponse) => void;
  setLoading: (loading: boolean) => void;
  setWsConnectionState: (state: 'disconnected' | 'connecting' | 'live' | 'reconnecting' | 'error') => void;
  addWsEvent: (event: WSEvent) => void;
  clearWsEvents: () => void;
  setSelectedCitation: (citation: Citation | null) => void;
  setCitationDrawerOpen: (open: boolean) => void;
  setActiveTab: (tab: AppState['activeTab']) => void;
  addSessionRecord: (record: SessionRecord) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTicker: 'RELIANCE',
  activeProfile: 'Conservative',
  activeScenario: '',
  isMockMode: false,

  isLoading: false,
  isAnalyzingWS: false,
  analysisResult: mockCleanAnalysisResponse('RELIANCE', 'Conservative'),
  prevAnalysisResult: null,
  wsEvents: [],
  wsConnectionState: 'disconnected',

  selectedCitation: null,
  isCitationDrawerOpen: false,
  activeTab: 'overview',

  sessionsHistory: [
    {
      session_id: 'sess_default_01',
      ticker: 'RELIANCE',
      profile: 'Conservative',
      created_at: new Date().toISOString(),
      status_label: 'WATCH',
      confidence: 0.79,
      degraded_state: false
    },
    {
      session_id: 'sess_default_02',
      ticker: 'TCS',
      profile: 'Aggressive',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      status_label: 'BUY',
      confidence: 0.88,
      degraded_state: false
    }
  ],

  setActiveTicker: (ticker) => set({ activeTicker: ticker.toUpperCase() }),
  setActiveProfile: (profile) => set((state) => ({
    activeProfile: profile,
    prevAnalysisResult: state.analysisResult
  })),
  setActiveScenario: (scenario) => set({ activeScenario: scenario }),
  setMockMode: (enabled) => set({ isMockMode: enabled }),
  setAnalysisResult: (result) => set({ analysisResult: result, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  setWsConnectionState: (connectionState) => set({ wsConnectionState: connectionState }),
  addWsEvent: (event) => set((state) => ({
    wsEvents: [...state.wsEvents.slice(-200), event]
  })),
  clearWsEvents: () => set({ wsEvents: [] }),
  setSelectedCitation: (citation) => set({ selectedCitation: citation, isCitationDrawerOpen: !!citation }),
  setCitationDrawerOpen: (open) => set({ isCitationDrawerOpen: open }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  addSessionRecord: (record) => set((state) => ({
    sessionsHistory: [record, ...state.sessionsHistory.filter(s => s.session_id !== record.session_id)]
  }))
}));
