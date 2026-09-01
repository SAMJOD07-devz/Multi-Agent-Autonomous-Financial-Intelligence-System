import time
import pytest
from app.metrics.telemetry import (
    calculate_latency_ms,
    calculate_hhi,
    calculate_combined_confidence
)
from app.models.schemas import AgentOutputSchema, CitationSchema


def test_calculate_latency_ms():
    start = time.perf_counter()
    time.sleep(0.01)
    latency = calculate_latency_ms(start)
    assert latency >= 5.0


def test_calculate_hhi_risk_concentration():
    equal_holdings = [
        {"ticker": f"STOCK_{i}", "weight": 0.20, "quantity": 10, "current_price": 100}
        for i in range(5)
    ]
    hhi_equal = calculate_hhi(equal_holdings)
    assert abs(hhi_equal - 0.20) < 0.001

    single_holding = [{"ticker": "RELIANCE", "weight": 1.0, "quantity": 10, "current_price": 100}]
    hhi_single = calculate_hhi(single_holding)
    assert hhi_single == 1.0

    assert calculate_hhi([]) == 0.0


def test_calculate_combined_confidence():
    agents = [
        AgentOutputSchema(
            agent_name="fundamental",
            status="completed",
            classification="BULLISH",
            confidence=0.90,
            reasoning="Strong financial results",
            citations=[CitationSchema(title="Filing", source="SEBI", locator="L1")]
        ),
        AgentOutputSchema(
            agent_name="technical",
            status="completed",
            classification="NEUTRAL",
            confidence=0.70,
            reasoning="Overbought RSI",
            citations=[CitationSchema(title="Feed", source="NSE", locator="L2")]
        ),
        AgentOutputSchema(
            agent_name="sentiment",
            status="completed",
            classification="BULLISH",
            confidence=0.80,
            reasoning="Positive news",
            citations=[CitationSchema(title="News", source="FE", locator="L3")]
        )
    ]

    conf_cons = calculate_combined_confidence(agents, "Conservative")
    conf_aggr = calculate_combined_confidence(agents, "Aggressive")

    assert 0.0 <= conf_cons <= 1.0
    assert 0.0 <= conf_aggr <= 1.0
    assert conf_cons != conf_aggr
