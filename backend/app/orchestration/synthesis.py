from typing import List, Tuple, Dict, Any
from app.models.schemas import (
    AnalysisRequest,
    AgentOutputSchema,
    RecommendationSchema,
    CitationSchema
)
from app.services.degradation_handler import DegradationPolicyHandler


class SynthesisEngine:
    """
    Synthesizes outputs from fundamental, technical, and sentiment agents into a personalized,
    cited investment recommendation tailored to the user's risk profile (Conservative vs. Aggressive).
    """

    @staticmethod
    def synthesize(
        request: AnalysisRequest,
        agent_outputs: List[AgentOutputSchema],
        portfolio_context: Dict[str, Any]
    ) -> Tuple[RecommendationSchema, List[CitationSchema]]:
        """
        Synthesizes final recommendation and aggregates citations.
        Enforces zero uncited actionable recommendation rules.
        """
        ticker = request.ticker
        profile = request.behavioral_profile.capitalize()
        hhi_score = portfolio_context.get("hhi_score", 0.0)

        # 1. Enforce citation presence check first
        DegradationPolicyHandler.enforce_zero_uncited_safety(
            recommendation=RecommendationSchema(
                label="DRAFT", summary="Draft", rationale="Draft", confidence=0.5
            ),
            agent_outputs=agent_outputs,
            ticker=ticker
        )

        # 2. Check for conflicting agent signals
        DegradationPolicyHandler.detect_conflicting_signals(agent_outputs, ticker)

        # 3. Gather agent classifications
        agent_map = {a.agent_name.lower(): a for a in agent_outputs if a.status in ["completed", "SUCCESS"]}
        f_agent = agent_map.get("fundamental")
        t_agent = agent_map.get("technical") or agent_map.get("risk")
        s_agent = agent_map.get("sentiment")

        all_citations: List[CitationSchema] = []
        for agent in agent_outputs:
            if agent.status in ["completed", "SUCCESS"]:
                all_citations.extend(agent.citations)

        f_class = f_agent.classification if f_agent else "NEUTRAL"
        t_class = t_agent.classification if t_agent else "NEUTRAL"
        s_class = s_agent.classification if s_agent else "NEUTRAL"

        f_conf = f_agent.confidence if f_agent else 0.5
        t_conf = t_agent.confidence if t_agent else 0.5

        # 4. Profile-differentiated decision rules
        if profile == "Conservative":
            if f_class == "BULLISH" and t_class in ["NEUTRAL", "BULLISH"]:
                if t_agent and "overbought" in t_agent.reasoning.lower():
                    label = "WATCH"
                    summary = f"Fundamental health for {ticker} is solid, but technical overbought levels indicate patience is prudent for conservative capital preservation."
                    rationale = f"Fundamental agent rates {ticker} valuation strong (conf: {f_conf:.2f}). Technical agent flags overbought conditions (conf: {t_conf:.2f}). Given portfolio concentration HHI of {hhi_score:.2f}, a WATCH recommendation minimizes short-term drawdown risk."
                    confidence = round((f_conf * 0.6 + t_conf * 0.4), 2)
                else:
                    label = "ACCUMULATE"
                    summary = f"Steady long-term value in {ticker} aligns with capital preservation goals."
                    rationale = f"Strong fundamental foundation backed by positive SEBI filings (conf: {f_conf:.2f}). Moderate position sizing recommended for Conservative risk profile."
                    confidence = round((f_conf * 0.7 + t_conf * 0.3), 2)
            elif f_class == "BEARISH" or t_class == "BEARISH":
                label = "REDUCE"
                summary = f"Risk factors identified for {ticker}; prudent for conservative investors to limit exposure."
                rationale = f"Agent signals indicate downside risk (Fundamental: {f_class}, Technical: {t_class}). Conservative profile prioritizes principal protection."
                confidence = round((f_conf + t_conf) / 2.0, 2)
            else:
                label = "HOLD"
                summary = f"Neutral market signals for {ticker}; recommend maintaining current allocation."
                rationale = f"Mixed agent classifications suggest holding existing exposure until directional clarity emerges."
                confidence = 0.65

        else:
            if f_class == "BULLISH" or t_class == "BULLISH":
                label = "BUY"
                summary = f"Strong bullish momentum and growth catalysts identify {ticker} as a high-conviction opportunity."
                rationale = f"Aggressive profile leverages technical momentum ({t_class}, conf: {t_conf:.2f}) and earnings expansion ({f_class}, conf: {f_conf:.2f}). High growth potential outweighs short-term volatility."
                confidence = round((t_conf * 0.55 + f_conf * 0.45), 2)
            elif f_class == "BEARISH" and t_class == "BEARISH":
                label = "SELL"
                summary = f"Negative technical momentum and weakening fundamentals suggest exiting {ticker} position."
                rationale = f"Both fundamental and technical indicators confirm downward momentum (conf: {round((f_conf+t_conf)/2, 2)})."
                confidence = round((f_conf + t_conf) / 2.0, 2)
            else:
                label = "ACCUMULATE"
                summary = f"Opportunistic accumulation strategy for {ticker} during consolidation phase."
                rationale = f"Aggressive risk preference captures tactical dips in growth stocks."
                confidence = 0.70

        recommendation = RecommendationSchema(
            label=label,
            summary=summary,
            rationale=rationale,
            confidence=confidence
        )

        return recommendation, all_citations
