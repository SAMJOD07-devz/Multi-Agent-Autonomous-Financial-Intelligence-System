import asyncio
from datetime import datetime, timezone
from typing import AsyncGenerator, Dict, Any, List, Optional, Tuple
from app.models.schemas import (
    AnalysisRequest,
    AgentOutputSchema,
    CitationSchema,
    WSEvent
)
from app.orchestration.adapter import OrchestrationAdapter
from app.services.degradation_handler import (
    DegradationException,
    MarketFeedTimeoutException,
    MissingFilingRetrievalException,
    ConflictingSignalsException
)


class MockOrchestrator(OrchestrationAdapter):
    """
    Deterministic mock orchestrator simulating parallel execution of fundamental, technical,
    and sentiment research agents with live trace streaming.
    """

    async def run_analysis(
        self,
        request: AnalysisRequest,
        portfolio_context: Dict[str, Any],
        simulated_scenario: Optional[str] = None
    ) -> Tuple[List[AgentOutputSchema], Dict[str, Any], Optional[DegradationException]]:
        ticker = request.ticker

        if simulated_scenario == "timeout":
            return [], {}, MarketFeedTimeoutException(ticker)
        elif simulated_scenario == "missing_filing":
            return [], {}, MissingFilingRetrievalException(ticker)

        if simulated_scenario == "conflicting":
            fundamental_output = AgentOutputSchema(
                agent_name="fundamental",
                status="completed",
                classification="BULLISH",
                confidence=0.88,
                reasoning=f"Strong balance sheet for {ticker}, revenue +15% YoY, robust cash flows.",
                citations=[
                    CitationSchema(
                        title="SEBI Q3 Corporate Filing",
                        source="SEBI Disclosures",
                        locator="DocID: SEBI-2026-REL-Q3, Page 8"
                    )
                ]
            )
            technical_output = AgentOutputSchema(
                agent_name="technical",
                status="completed",
                classification="BEARISH",
                confidence=0.85,
                reasoning=f"Severe head-and-shoulders reversal pattern on {ticker} daily chart with breakdown below 200 SMA.",
                citations=[
                    CitationSchema(
                        title="NSE Technical Feed",
                        source="NSE Market Feed",
                        locator="Technical Indicator Engine"
                    )
                ]
            )
            sentiment_output = AgentOutputSchema(
                agent_name="sentiment",
                status="completed",
                classification="NEUTRAL",
                confidence=0.60,
                reasoning=f"Neutral news coverage for {ticker}.",
                citations=[
                    CitationSchema(
                        title="Financial Express Commentary",
                        source="Media Analytics",
                        locator="Article ID 92817"
                    )
                ]
            )
            agent_outputs = [fundamental_output, technical_output, sentiment_output]
            market_signals = {
                "price_momentum": {"rsi_14": 42.0, "macd_signal": "BEARISH"},
                "volume_anomaly": {"volume_spike_ratio": 1.10},
                "sentiment": {"news_sentiment_score": 0.50}
            }
            return agent_outputs, market_signals, ConflictingSignalsException(ticker, "Fundamental BULLISH (0.88) vs Technical BEARISH (0.85)")

        elif simulated_scenario == "uncited":
            fundamental_output = AgentOutputSchema(
                agent_name="fundamental",
                status="completed",
                classification="BULLISH",
                confidence=0.80,
                reasoning=f"Uncited reasoning for {ticker}.",
                citations=[]
            )
            technical_output = AgentOutputSchema(
                agent_name="technical",
                status="completed",
                classification="BULLISH",
                confidence=0.75,
                reasoning=f"Uncited technical reasoning for {ticker}.",
                citations=[]
            )
            sentiment_output = AgentOutputSchema(
                agent_name="sentiment",
                status="completed",
                classification="NEUTRAL",
                confidence=0.60,
                reasoning=f"Uncited sentiment for {ticker}.",
                citations=[]
            )
            agent_outputs = [fundamental_output, technical_output, sentiment_output]
            market_signals = {"price_momentum": {"rsi_14": 65.0}}
            return agent_outputs, market_signals, None

        fundamental_output = AgentOutputSchema(
            agent_name="fundamental",
            status="completed",
            classification="BULLISH",
            confidence=0.85,
            reasoning=f"Strong balance sheet for {ticker}, revenue up 12% YoY, debt-to-equity ratio low at 0.45.",
            citations=[
                CitationSchema(
                    title=f"Q3 Financial Disclosures - {ticker}",
                    source="SEBI Filings 2026",
                    locator=f"DocID: SEBI-2026-{ticker}-Q3, Page 14"
                )
            ]
        )

        technical_output = AgentOutputSchema(
            agent_name="technical",
            status="completed",
            classification="NEUTRAL",
            confidence=0.70,
            reasoning=f"RSI at 74 indicates overbought conditions for {ticker}, MACD showing bullish crossover.",
            citations=[
                CitationSchema(
                    title=f"NSE Realtime Feed - {ticker}",
                    source="NSE Tick Feed",
                    locator=f"Timestamp {datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')}"
                )
            ]
        )

        sentiment_output = AgentOutputSchema(
            agent_name="sentiment",
            status="completed",
            classification="BULLISH",
            confidence=0.80,
            reasoning=f"Management commentary in earnings transcript reflects positive growth trajectory in clean energy.",
            citations=[
                CitationSchema(
                    title=f"Earnings Call Transcript Q3 - {ticker}",
                    source="Corporate Filings",
                    locator="Section: Outlook & Capex"
                )
            ]
        )

        agent_outputs = [fundamental_output, technical_output, sentiment_output]
        market_signals = {
            "price_momentum": {"rsi_14": 74.0, "macd_signal": "BULLISH"},
            "volume_anomaly": {"volume_spike_ratio": 1.25},
            "sentiment": {"news_sentiment_score": 0.68}
        }

        return agent_outputs, market_signals, None

    async def stream_trace(
        self,
        session_id: str,
        request: AnalysisRequest,
        portfolio_context: Dict[str, Any],
        simulated_scenario: Optional[str] = None
    ) -> AsyncGenerator[WSEvent, None]:
        seq = 1

        yield WSEvent(
            session_id=session_id,
            sequence_number=seq,
            event_type="connected",
            payload={"ticker": request.ticker, "profile": request.behavioral_profile}
        )

        if simulated_scenario == "timeout":
            seq += 1
            yield WSEvent(
                session_id=session_id,
                sequence_number=seq,
                event_type="degraded",
                payload={
                    "degradation_reason": f"Live market feed timed out for ticker '{request.ticker}'",
                    "unavailable_data": ["live_market_feed", "current_price"],
                    "safe_next_step": "Retry when market feed is restored."
                }
            )
            return

        agents = ["fundamental", "technical", "sentiment"]
        for agent_name in agents:
            seq += 1
            yield WSEvent(
                session_id=session_id,
                sequence_number=seq,
                event_type="agent_started",
                payload={"agent_name": agent_name}
            )

        await asyncio.sleep(0.01)

        for agent_name in agents:
            seq += 1
            yield WSEvent(
                session_id=session_id,
                sequence_number=seq,
                event_type="agent_progress",
                payload={"agent_name": agent_name, "progress_percent": 100, "message": f"{agent_name} research completed."}
            )

            seq += 1
            yield WSEvent(
                session_id=session_id,
                sequence_number=seq,
                event_type="agent_completed",
                payload={
                    "agent_name": agent_name,
                    "status": "completed",
                    "classification": "BULLISH" if agent_name != "technical" else "NEUTRAL",
                    "confidence": 0.85 if agent_name == "fundamental" else 0.70,
                    "reasoning_snippet": f"{agent_name} evaluation finished cleanly for {request.ticker}.",
                    "citations": [{"title": f"{agent_name} Source", "source": "Internal DB", "locator": "L12"}]
                }
            )

        seq += 1
        yield WSEvent(
            session_id=session_id,
            sequence_number=seq,
            event_type="synthesis_started",
            payload={"message": "Synthesizing multi-agent outputs against user risk profile."}
        )

        seq += 1
        yield WSEvent(
            session_id=session_id,
            sequence_number=seq,
            event_type="synthesis_completed",
            payload={"recommendation": "WATCH" if request.behavioral_profile == "Conservative" else "BUY"}
        )

        seq += 1
        yield WSEvent(
            session_id=session_id,
            sequence_number=seq,
            event_type="completed",
            payload={"status": "success", "session_id": session_id}
        )
