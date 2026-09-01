// src/components/layout/RightContextRail.tsx
// Single source of truth for risk + holdings. This is the ONLY place these render.
import React from 'react';
import { useAppStore } from '../../state/useAppStore';
import { PortfolioRiskMeter } from '../portfolio/PortfolioRiskMeter';
import { mockUserHoldings } from '../../mocks/fixtureData';

export const RightContextRail: React.FC = () => {
  const { activeTicker, analysisResult } = useAppStore();
  const hhiScore = analysisResult?.telemetry?.risk_concentration_score ?? 0.28;

  return (
    <aside
      style={{
        width: 272,
        flexShrink: 0,
        display: 'none',
      }}
      className="right-rail"
    >
      <div
        style={{
          position: 'sticky',
          top: 68,
          padding: '0 0 24px 0',
        }}
      >
        <PortfolioRiskMeter
          hhiScore={hhiScore}
          holdings={mockUserHoldings}
          activeTicker={activeTicker}
        />
      </div>

      {/* CSS to show rail on wider screens */}
      <style>{`
        @media (min-width: 1100px) {
          .right-rail { display: block !important; }
        }
      `}</style>
    </aside>
  );
};
