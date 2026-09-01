// src/components/tour/ProductTour.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, ArrowRight, ArrowLeft, X, Sparkles, CheckCircle2 } from 'lucide-react';

interface TourStep {
  stepNumber: number;
  title: string;
  targetRoute: string;
  description: string;
  keyTakeaway: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    stepNumber: 1,
    title: 'Welcome to AstraVest Intelligence',
    targetRoute: '/',
    description: 'AstraVest Intelligence turns market data, SEBI regulatory filings, technical momentum, and behavioral risk profiles into explainable investment intelligence.',
    keyTakeaway: 'Institutional-grade research designed for retail investors. The system never pressuring you into a trade.'
  },
  {
    stepNumber: 2,
    title: 'Multipage Navigation Model',
    targetRoute: '/',
    description: 'Information is organized across 7 dedicated routes: Overview, Analyze, Analysis Detail, Portfolio, Evidence Library, Session History, and Settings.',
    keyTakeaway: 'The Overview summarizes executive metrics, while dedicated pages provide full research depth.'
  },
  {
    stepNumber: 3,
    title: 'Choose a Behavioral Risk Profile',
    targetRoute: '/analyze',
    description: 'Select between Conservative (capital preservation focus with overbought penalties) and Aggressive (growth & technical momentum focus).',
    keyTakeaway: 'Identical market inputs visibly alter interpretation and decision policy states based on your profile.'
  },
  {
    stepNumber: 4,
    title: 'Analyze a Stock Ticker',
    targetRoute: '/analyze',
    description: 'Enter any valid exchange ticker (e.g., RELIANCE, TCS, INFY) and click Analyze to trigger the multi-agent reasoning chain.',
    keyTakeaway: 'Generates a unique session ID and streams live execution trace events.'
  },
  {
    stepNumber: 5,
    title: 'Watch Three Parallel Agents Work',
    targetRoute: '/analyze',
    description: 'Three specialized agents execute simultaneously: Fundamental RAG (SEBI disclosures), Technical Momentum (RSI/MACD), and Media Sentiment.',
    keyTakeaway: 'Visible step-by-step logic transparency rather than an opaque black-box AI.'
  },
  {
    stepNumber: 6,
    title: 'Read the Synthesized Intelligence Output',
    targetRoute: '/analyze',
    description: 'Synthesizes agent signals into a non-authoritative status (WATCH, BUY, ACCUMULATE, HOLD) with a confidence score and decision rationale.',
    keyTakeaway: 'All recommendations are non-authoritative and explain why the view was reached.'
  },
  {
    stepNumber: 7,
    title: 'Inspect Grounded SEBI Citations',
    targetRoute: '/evidence',
    description: 'Every fundamental recommendation is anchored in official SEBI corporate filings and earnings call transcripts.',
    keyTakeaway: 'Click any citation tag to open the slide-over viewer and read the verbatim excerpt, filing date, and locator.'
  },
  {
    stepNumber: 8,
    title: 'Understand Portfolio Risk & Concentration',
    targetRoute: '/portfolio',
    description: 'Track your holdings breakdown and monitor portfolio concentration via the Herfindahl-Hirschman Index (HHI).',
    keyTakeaway: 'Automated amber/red alerts trigger whenever HHI > 0.25 to prevent over-concentration.'
  },
  {
    stepNumber: 9,
    title: 'Review & Replay Session History',
    targetRoute: '/sessions',
    description: 'Past analysis sessions are recorded with ticker, profile, timestamp, recommendation label, confidence score, and degraded state flags.',
    keyTakeaway: 'Click Replay on any historical session to re-inspect its reasoning trace.'
  },
  {
    stepNumber: 10,
    title: 'Degraded Data Safety Enforcement',
    targetRoute: '/settings',
    description: 'When market feeds time out, filings are missing, or agent signals conflict, the UI surfacing a prominent Degraded Data Banner.',
    keyTakeaway: 'Blocks uncited actionable recommendations to protect investor safety.'
  },
  {
    stepNumber: 11,
    title: 'Tour Complete — You Are Ready!',
    targetRoute: '/',
    description: 'You are ready to explore AstraVest Intelligence. You can replay this tour anytime from the Settings page or Top Bar.',
    keyTakeaway: 'Start by selecting a stock ticker on the Overview or Analyze page.'
  }
];

interface ProductTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProductTour: React.FC<ProductTourProps> = ({ isOpen, onClose }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const step = TOUR_STEPS[currentStepIdx];

  useEffect(() => {
    if (isOpen && step && location.pathname !== step.targetRoute) {
      navigate(step.targetRoute);
    }
  }, [currentStepIdx, isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStepIdx < TOUR_STEPS.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    } else {
      localStorage.setItem('astravest_tour_completed', 'true');
      onClose();
    }
  };

  const handleBack = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('astravest_tour_completed', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 font-mono">
                Guided Product Tour • Step {step.stepNumber} of {TOUR_STEPS.length}
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                {step.title}
              </h3>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="w-full h-1.5 bg-slate-100 rounded-full my-4 overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${(step.stepNumber / TOUR_STEPS.length) * 100}%` }}
          />
        </div>

        <div className="space-y-3 my-4">
          <p className="text-sm text-slate-700 leading-relaxed">
            {step.description}
          </p>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start space-x-2 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-slate-800">
              <strong className="text-slate-900">Key Takeaway:</strong> {step.keyTakeaway}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            Skip Tour
          </button>

          <div className="flex items-center space-x-2">
            {currentStepIdx > 0 && (
              <button
                onClick={handleBack}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center space-x-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm shadow-blue-500/20"
            >
              <span>{currentStepIdx === TOUR_STEPS.length - 1 ? 'Finish & Explore' : 'Next Step'}</span>
              {currentStepIdx === TOUR_STEPS.length - 1 ? <CheckCircle2 className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
