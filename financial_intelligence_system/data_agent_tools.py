"""
data_agent_tools.py
===================
Production-ready Agent Tool Interface for Phase 3 Integration.

Provides standardized, fault-tolerant tools for:
1. Quantitative Market Data Extraction (`fetch_market_metrics`)
2. Vector-based Regulatory Retrieval & Context Formatting (`retrieve_regulatory_context`)
"""

import logging
from typing import Any, Dict, List, Optional
from market_feed import get_market_snapshot
from rag_pipeline import query_vector_db

# Configure module logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s"
)
logger = logging.getLogger("DataAgentTools")


def fetch_market_metrics(ticker: str) -> Dict[str, Any]:
    """
    Agent tool to fetch current quantitative market indicators for a given ticker.

    Calculates current price, daily change %, 20-day SMA, 14-day RSI, MACD, 
    and volume anomalies without raising uncaught exceptions.

    Args:
        ticker (str): Equity ticker symbol (e.g., 'RELIANCE.NS', 'TATAMOTORS').

    Returns:
        Dict[str, Any]: Standardized market metrics payload or DATA_UNAVAILABLE state.
    """
    clean_ticker = ticker.strip().upper()
    logger.info(f"Tool Invocation: fetch_market_metrics for '{clean_ticker}'")

    if not clean_ticker:
        return {
            "status": "DATA_UNAVAILABLE",
            "ticker": ticker,
            "reason": "Invalid or empty ticker provided."
        }

    try:
        snapshot = get_market_snapshot(clean_ticker)
        
        # Verify internal module status
        if snapshot.get("status") != "SUCCESS":
            return {
                "status": "DATA_UNAVAILABLE",
                "ticker": clean_ticker,
                "reason": snapshot.get("message", "Market data feed returned empty/invalid payload.")
            }
        
        return {
            "status": "SUCCESS",
            "ticker": clean_ticker,
            "date": snapshot.get("date"),
            "current_price": snapshot.get("current_price"),
            "daily_pct_change": snapshot.get("daily_pct_change"),
            "sma_20": snapshot.get("sma_20"),
            "rsi_14": snapshot.get("rsi_14"),
            "macd": snapshot.get("macd"),
            "volume_anomaly": snapshot.get("volume_anomaly")
        }

    except Exception as exc:
        logger.error(f"Unhandled exception in fetch_market_metrics for {clean_ticker}: {exc}", exc_info=True)
        return {
            "status": "DATA_UNAVAILABLE",
            "ticker": clean_ticker,
            "reason": f"Market feed pipeline error: {str(exc)}"
        }


def retrieve_regulatory_context(
    query: str, 
    ticker: str, 
    top_k: int = 3
) -> Dict[str, Any]:
    """
    Agent tool to perform semantic retrieval over indexed regulatory filings.

    Formats matching chunks into an attribution-rich, LLM-ready context block
    to prevent hallucinations and provide precise source tracking.

    Args:
        query (str): Natural language financial/regulatory query.
        ticker (str): Company ticker used to filter documents.
        top_k (int, optional): Maximum number of context chunks. Defaults to 3.

    Returns:
        Dict[str, Any]: LLM-ready context block with citations or MISSING_FILING fallback.
    """
    clean_ticker = ticker.strip().upper()
    clean_query = query.strip()
    logger.info(f"Tool Invocation: retrieve_regulatory_context | Ticker: '{clean_ticker}' | Query: '{clean_query}'")

    if not clean_ticker or not clean_query:
        return {
            "status": "MISSING_FILING",
            "ticker": clean_ticker,
            "context": "",
            "citation_count": 0,
            "message": "Invalid query or ticker parameter provided."
        }

    try:
        raw_results = query_vector_db(query=clean_query, ticker=clean_ticker, top_k=top_k)

        # Check for empty response or explicit missing filing signal
        if not raw_results or (len(raw_results) == 1 and raw_results[0].get("status") == "MISSING_FILING"):
            logger.warning(f"No regulatory filings found for ticker: {clean_ticker}")
            return {
                "status": "MISSING_FILING",
                "ticker": clean_ticker,
                "context": "",
                "citation_count": 0,
                "message": "No verified regulatory filings available for this ticker."
            }

        # Check for DB execution errors
        if len(raw_results) == 1 and "status" in raw_results[0] and raw_results[0]["status"] != "SUCCESS":
            return {
                "status": "RETRIEVAL_ERROR",
                "ticker": clean_ticker,
                "context": "",
                "citation_count": 0,
                "message": raw_results[0].get("message", "Unknown database retrieval error.")
            }

        # Construct structured citations and LLM context block
        formatted_blocks: List[str] = []
        structured_citations: List[Dict[str, Any]] = []

        for idx, item in enumerate(raw_results, start=1):
            text = item.get("text", "").strip()
            meta = item.get("metadata", {})
            doc_title = meta.get("document_title", "Unknown Filing")
            page_num = meta.get("page_number", "N/A")
            filing_date = meta.get("date", "N/A")

            structured_citations.append({
                "source_id": idx,
                "document_title": doc_title,
                "page_number": page_num,
                "date": filing_date,
                "snippet": text[:150] + ("..." if len(text) > 150 else "")
            })

            formatted_blocks.append(
                f"[Source {idx}] Document: {doc_title} | Date: {filing_date} | Page: {page_num}\n"
                f"Content: {text}"
            )

        context_string = "\n\n".join(formatted_blocks)

        return {
            "status": "SUCCESS",
            "ticker": clean_ticker,
            "context": context_string,
            "citation_count": len(structured_citations),
            "citations": structured_citations
        }

    except Exception as exc:
        logger.error(f"Retrieval failure for '{clean_ticker}': {exc}", exc_info=True)
        return {
            "status": "RETRIEVAL_ERROR",
            "ticker": clean_ticker,
            "context": "",
            "citation_count": 0,
            "message": f"Unexpected retrieval exception: {str(exc)}"
        }


# =====================================================================
# OpenAI / LangChain Compatible Function Tool Schemas
# =====================================================================

AGENT_TOOL_SCHEMAS: List[Dict[str, Any]] = [
    {
        "type": "function",
        "function": {
            "name": "fetch_market_metrics",
            "description": "Fetches current quantitative technical metrics (Price, Daily %, SMA-20, RSI-14, MACD, Volume Anomaly) for a specified equity ticker.",
            "parameters": {
                "type": "object",
                "properties": {
                    "ticker": {
                        "type": "string",
                        "description": "Stock ticker symbol, e.g., 'RELIANCE.NS', 'TATAMOTORS.NS', 'AAPL'."
                    }
                },
                "required": ["ticker"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "retrieve_regulatory_context",
            "description": "Performs semantic vector search over quarterly filings, annual reports, and regulatory disclosures for a specific company ticker.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Natural language query regarding financial results, risk factors, margins, or CAPEX."
                    },
                    "ticker": {
                        "type": "string",
                        "description": "Stock ticker to filter documents by, e.g., 'TATAMOTORS'."
                    },
                    "top_k": {
                        "type": "integer",
                        "description": "Number of relevant chunks to retrieve (default: 3).",
                        "default": 3
                    }
                },
                "required": ["query", "ticker"]
            }
        }
    }
]