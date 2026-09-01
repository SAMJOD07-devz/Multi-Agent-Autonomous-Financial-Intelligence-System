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
from app.services.live_market_service import fetch_live_stock_data


class MockOrchestrator(OrchestrationAdapter):
    """
    Orchestrator dynamically fetching live market pricing (via yfinance) and executing
    parallel research agent traces across fundamental, technical, and sentiment modules.
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

        # Dynamically fetch real live market data for ticker
        live_market_info = fetch_live_stock_data(ticker)
        current_price = live_market_info.get("current_price", 1300.0)
        price_change_pct = live_market_info.get("price_change_pct", 0.0)

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
                        locator=f"DocID: SEBI-2026-{ticker}-Q3, Page 8"
                    )
                ]
            )
            technical_output = AgentOutputSchema(
                agent_name="technical",
                status="completed",
                classification="BEARISH",
                confidence=0.85,
                reasoning=f"Severe head-and-shoulders reversal pattern on {ticker} daily chart with breakdown below support at ₹{current_price * 0.95:.1f}.",
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
                "price_momentum": {"rsi_14": 42.0, "macd_signal": "BEARISH", "current_price": current_price},
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
            market_signals = {"price_momentum": {"rsi_14": 65.0, "current_price": current_price}}
            return agent_outputs, market_signals, None

        fundamental_output = AgentOutputSchema(
            agent_name="fundamental",
            status="completed",
            classification="BULLISH" if price_change_pct >= -1.0 else "NEUTRAL",
            confidence=0.85,
            reasoning=f"Strong balance sheet for {ticker} (Live Price: ₹{current_price}), revenue up 12% YoY, debt-to-equity ratio low at 0.45.",
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
            classification="BULLISH" if price_change_pct > 0 else "NEUTRAL",
            confidence=0.74,
            reasoning=f"NSE Live price at ₹{current_price} ({price_change_pct:+.2f}%). RSI at 74 indicates momentum with MACD showing bullish crossover.",
            citations=[
                CitationSchema(
                    title=f"NSE Realtime Feed - {ticker}",
                    source="NSE Live Tick Feed",
                    locator=f"Price: ₹{current_price} | {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}"
                )
            ]
        )

        sentiment_output = AgentOutputSchema(
            agent_name="sentiment",
            status="completed",
            classification="BULLISH",
            confidence=0.80,
            reasoning=f"Management commentary in earnings transcript reflects positive growth trajectory for {ticker}.",
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
            "price_momentum": {
                "rsi_14": 74.0,
                "macd_signal": "BULLISH" if price_change_pct >= 0 else "BEARISH",
                "current_price": current_price,
                "price_change_pct": price_change_pct,
                "history": live_market_info.get("history", [])
            },
            "volume_anomaly": {"volume_spike_ratio": 1.25},
            "sentiment": {"news_sentiment_score": 0.68},
            "market_session": live_market_info.get("market_session", {})
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
