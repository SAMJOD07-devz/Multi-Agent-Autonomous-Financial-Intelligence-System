"""
test_resilience_integration.py
==============================
Resilience, Integration, and Fault-Injection Test Suite.
Run with: pytest -v test_resilience_integration.py
"""

from typing import Any, Dict, List
from unittest.mock import MagicMock, patch
import pytest

from data_agent_tools import (
    fetch_market_metrics,
    retrieve_regulatory_context,
    AGENT_TOOL_SCHEMAS
)


# =====================================================================
# Test 1: Normal Flow Integration
# =====================================================================

def test_fetch_market_metrics_normal_flow():
    """Verify market metrics return valid structure when market data is available."""
    mock_snapshot = {
        "status": "SUCCESS",
        "ticker": "TATAMOTORS.NS",
        "date": "2024-03-29",
        "current_price": 992.50,
        "daily_pct_change": 1.45,
        "sma_20": 975.30,
        "rsi_14": 58.20,
        "macd": 4.12,
        "volume_anomaly": False
    }

    with patch("data_agent_tools.get_market_snapshot", return_value=mock_snapshot):
        response = fetch_market_metrics("TATAMOTORS.NS")

        assert response["status"] == "SUCCESS"
        assert response["ticker"] == "TATAMOTORS.NS"
        assert response["current_price"] == 992.50
        assert "rsi_14" in response
        assert "volume_anomaly" in response


def test_retrieve_regulatory_context_normal_flow():
    """Verify retrieval returns properly formatted context and citation metadata."""
    mock_chunks = [
        {
            "text": "Tata Motors Commercial Vehicle EBITDA margin expanded to 11.1%.",
            "metadata": {
                "document_title": "TATAMOTORS_Q3_FY24_Report.pdf",
                "page_number": 14,
                "date": "2024-01-30"
            }
        },
        {
            "text": "Passenger EV business recorded positive free cash flows.",
            "metadata": {
                "document_title": "TATAMOTORS_Q3_FY24_Report.pdf",
                "page_number": 18,
                "date": "2024-01-30"
            }
        }
    ]

    with patch("data_agent_tools.query_vector_db", return_value=mock_chunks):
        response = retrieve_regulatory_context(
            query="What are the commercial vehicle margins?",
            ticker="TATAMOTORS",
            top_k=2
        )

        assert response["status"] == "SUCCESS"
        assert response["ticker"] == "TATAMOTORS"
        assert response["citation_count"] == 2
        assert "[Source 1]" in response["context"]
        assert "TATAMOTORS_Q3_FY24_Report.pdf" in response["context"]
        assert response["citations"][0]["page_number"] == 14


# =====================================================================
# Test 2: Market API Timeout Fault Injection
# =====================================================================

def test_market_feed_timeout_fault_injection():
    """Simulate a network timeout exception inside yfinance and verify graceful fallback."""
    # Simulate an uncaught timeout exception from requests/yfinance
    with patch("data_agent_tools.get_market_snapshot", side_effect=TimeoutError("Request timed out after 10000ms")):
        response = fetch_market_metrics("RELIANCE.NS")

        assert response is not None
        assert response["status"] == "DATA_UNAVAILABLE"
        assert response["ticker"] == "RELIANCE.NS"
        assert "timed out" in response["reason"]


def test_market_feed_empty_data_fallback():
    """Verify fallback response when the market feed returns an empty payload."""
    with patch("data_agent_tools.get_market_snapshot", return_value={"status": "DATA_UNAVAILABLE", "message": "API returned empty DataFrame."}):
        response = fetch_market_metrics("INVALID_TICKER_XYZ")

        assert response["status"] == "DATA_UNAVAILABLE"
        assert response["ticker"] == "INVALID_TICKER_XYZ"
        assert "API returned empty" in response["reason"]


# =====================================================================
# Test 3: Missing Filing Query Handling
# =====================================================================

def test_retrieve_regulatory_context_missing_filings():
    """Verify that querying an unindexed ticker returns MISSING_FILING state without hallucination."""
    mock_missing_response = [{
        "status": "MISSING_FILING",
        "message": "No regulatory documents found for this ticker."
    }]

    with patch("data_agent_tools.query_vector_db", return_value=mock_missing_response):
        response = retrieve_regulatory_context(
            query="What is the net profit?",
            ticker="UNKNOWN_CORP"
        )

        assert response["status"] == "MISSING_FILING"
        assert response["context"] == ""
        assert response["citation_count"] == 0
        assert "No verified regulatory filings" in response["message"]


def test_retrieve_regulatory_context_db_exception():
    """Verify that low-level ChromaDB exceptions degrade gracefully."""
    with patch("data_agent_tools.query_vector_db", side_effect=RuntimeError("ChromaDB connection refused")):
        response = retrieve_regulatory_context(
            query="Risk analysis",
            ticker="TATAMOTORS"
        )

        assert response["status"] == "RETRIEVAL_ERROR"
        assert response["context"] == ""
        assert "ChromaDB connection refused" in response["message"]


# =====================================================================
# Test 4: Edge Cases and Schema Validation
# =====================================================================

@pytest.mark.parametrize("invalid_ticker", ["", "   ", None])
def test_edge_case_empty_tickers(invalid_ticker: Any):
    """Verify edge-case handling for empty or malformed tickers."""
    if invalid_ticker is None:
        return

    market_res = fetch_market_metrics(invalid_ticker)
    assert market_res["status"] == "DATA_UNAVAILABLE"

    rag_res = retrieve_regulatory_context(query="Revenue?", ticker=invalid_ticker)
    assert rag_res["status"] == "MISSING_FILING"


def test_agent_tool_schemas_validity():
    """Verify all tool definitions conform to the expected agent schema format."""
    assert len(AGENT_TOOL_SCHEMAS) == 2
    for schema in AGENT_TOOL_SCHEMAS:
        assert schema["type"] == "function"
        assert "name" in schema["function"]
        assert "description" in schema["function"]
        assert "parameters" in schema["function"]
        assert "required" in schema["function"]["parameters"]