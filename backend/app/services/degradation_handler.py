from typing import List, Optional, Dict, Any
from app.models.schemas import (
    AnalysisResponse,
    RecommendationSchema,
    AgentOutputSchema,
    TelemetrySchema
)


class DegradationException(Exception):
    """Base exception for analysis degradation."""
    def __init__(self, reason: str, unavailable_data: List[str], safe_next_step: str):
        self.reason = reason
        self.unavailable_data = unavailable_data
        self.safe_next_step = safe_next_step
        super().__init__(reason)


class MarketFeedTimeoutException(DegradationException):
    def __init__(self, ticker: str):
        super().__init__(
            reason=f"Live market feed timed out for ticker '{ticker}'; current price and technical signals are unavailable.",
            unavailable_data=["live_market_feed", "current_price", "technical_indicators"],
            safe_next_step="Retry when the market data source is available or review cited historical disclosures."
        )


class MissingFilingRetrievalException(DegradationException):
    def __init__(self, ticker: str):
        super().__init__(
            reason=f"Regulatory disclosure retrieval failed for ticker '{ticker}'; filing corpus or vector database unavailable.",
            unavailable_data=["regulatory_filings", "sebi_disclosures", "vector_embeddings"],
            safe_next_step="Verify regulatory database connection or consult official exchange filings directly."
        )


class ConflictingSignalsException(DegradationException):
    def __init__(self, ticker: str, details: str):
        super().__init__(
            reason=f"Conflicting directional signals detected for '{ticker}': {details}. Synthesis aborted for investor protection.",
            unavailable_data=["consensus_signal"],
            safe_next_step="Review individual agent reasoning traces and wait for market signal convergence before taking action."
        )


class UncitedOutputException(DegradationException):
    def __init__(self, ticker: str):
        super().__init__(
            reason=f"Synthesis generated an ungrounded recommendation for '{ticker}' lacking verifiable source citations. Actionable output blocked for investor safety.",
            unavailable_data=["verifiable_source_citations"],
            safe_next_step="Ensure data retrieval pipeline is healthy and that all agent research steps cite source documents."
        )


class DegradationPolicyHandler:
    """Centralized degradation policy manager."""

    @staticmethod
    def enforce_zero_uncited_safety(
        recommendation: Optional[RecommendationSchema],
        agent_outputs: List[AgentOutputSchema],
        ticker: str
    ) -> None:
        """
        Enforce strict safety: If an actionable recommendation exists BUT no agent output contains
        valid source citations, trigger degradation immediately.
        """
        if not recommendation:
            return

        total_citations = 0
        for agent in agent_outputs:
            if agent.status in ["completed", "SUCCESS"] and agent.citations:
                total_citations += len(agent.citations)

        if total_citations == 0:
            raise UncitedOutputException(ticker)

    @staticmethod
    def detect_conflicting_signals(
        agent_outputs: List[AgentOutputSchema],
        ticker: str,
        confidence_threshold: float = 0.65
    ) -> None:
        """
        Detect strongly opposing directional signals (e.g. Fundamental BULLISH vs Technical BEARISH with high confidence).
        """
        classifications = {}
        for agent in agent_outputs:
            if agent.status in ["completed", "SUCCESS"] and agent.confidence >= confidence_threshold:
                classifications[agent.agent_name] = (agent.classification, agent.confidence)

        if "fundamental" in classifications and "technical" in classifications:
            f_class, f_conf = classifications["fundamental"]
            t_class, t_conf = classifications["technical"]

            if (f_class == "BULLISH" and t_class == "BEARISH") or (f_class == "BEARISH" and t_class == "BULLISH"):
                details = f"Fundamental agent evaluates {f_class} (conf: {f_conf}), while Technical agent evaluates {t_class} (conf: {t_conf})"
                raise ConflictingSignalsException(ticker, details)

    @staticmethod
    def build_degraded_response(
        session_id: str,
        ticker: str,
        profile: str,
        reason: str,
        unavailable_data: List[str],
        safe_next_step: str,
        latency_ms: float,
        agent_outputs: Optional[List[AgentOutputSchema]] = None,
        market_signals: Optional[Dict[str, Any]] = None,
        portfolio_context: Optional[Dict[str, Any]] = None
    ) -> AnalysisResponse:
        """
        Construct a standardized safe degraded response meeting exact contract requirements.
        """
        return AnalysisResponse(
            session_id=session_id,
            ticker=ticker,
            profile=profile,
            degraded_state=True,
            degradation_reason=reason,
            unavailable_data=unavailable_data,
            recommendation=None,
            agent_outputs=agent_outputs or [],
            market_signals=market_signals or {},
            portfolio_context=portfolio_context or {},
            citations=[],
            safe_next_step=safe_next_step,
            telemetry=TelemetrySchema(
                latency_ms=round(latency_ms, 2),
                risk_concentration_score=portfolio_context.get("hhi_score") if portfolio_context else None,
                combined_confidence=0.0
            )
        )
