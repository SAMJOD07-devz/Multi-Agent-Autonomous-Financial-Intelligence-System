"""
benchmark_latency.py
====================
Latency Profiling and Stress Benchmark Suite for Phase 3.

Measures:
1. Market snapshot retrieval latency (SLA: < 2500ms)
2. Vector search context retrieval latency (SLA: < 500ms)
3. Simulated concurrent execution
"""

import concurrent.futures
import logging
import statistics
import time
from typing import Any, Callable, Dict, List, Tuple
from data_agent_tools import fetch_market_metrics, retrieve_regulatory_context

# Suppress debug logs during benchmarking
logging.getLogger().setLevel(logging.WARNING)

BENCHMARK_ITERATIONS = 5
SAMPLE_TICKER = "RELIANCE.NS"
SAMPLE_QUERY = "What are the key capital expenditures and revenue growth drivers?"


def profile_execution(func: Callable[..., Any], *args: Any, iterations: int = BENCHMARK_ITERATIONS) -> List[float]:
    """Profiles execution time of a function across specified iterations in milliseconds."""
    latencies: List[float] = []
    for _ in range(iterations):
        start_time = time.perf_counter()
        _ = func(*args)
        elapsed_ms = (time.perf_counter() - start_time) * 1000.0
        latencies.append(elapsed_ms)
    return latencies


def run_concurrent_workload(ticker: str, query: str) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """Simulates parallel execution of market data fetching and vector retrieval."""
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
        future_market = executor.submit(fetch_market_metrics, ticker)
        future_rag = executor.submit(retrieve_regulatory_context, query, ticker)
        
        market_res = future_market.result()
        rag_res = future_rag.result()
        
    return market_res, rag_res


def calculate_p95(data: List[float]) -> float:
    """Calculates the 95th percentile latency."""
    if not data:
        return 0.0
    sorted_data = sorted(data)
    idx = int(len(sorted_data) * 0.95)
    return sorted_data[min(idx, len(sorted_data) - 1)]


def main():
    print("\n==================================================================")
    print("      MULTI-AGENT FINANCIAL SYSTEM: DATA LAYER BENCHMARK          ")
    print(f"      Iterations: {BENCHMARK_ITERATIONS} | Ticker: {SAMPLE_TICKER}")
    print("==================================================================\n")

    benchmarks = [
        {
            "name": "Market Metrics (yfinance + TA)",
            "func": fetch_market_metrics,
            "args": (SAMPLE_TICKER,),
            "sla_ms": 2500.0
        },
        {
            "name": "RAG Retrieval (ChromaDB + MiniLM)",
            "func": retrieve_regulatory_context,
            "args": (SAMPLE_QUERY, "RELIANCE"),
            "sla_ms": 500.0
        },
        {
            "name": "Concurrent Fetch (Market + RAG)",
            "func": run_concurrent_workload,
            "args": (SAMPLE_TICKER, SAMPLE_QUERY),
            "sla_ms": 2600.0
        }
    ]

    results_table = []

    for b in benchmarks:
        print(f"Running profile for: {b['name']}...")
        latencies = profile_execution(b["func"], *b["args"], iterations=BENCHMARK_ITERATIONS)
        
        avg_lat = statistics.mean(latencies)
        p95_lat = calculate_p95(latencies)
        min_lat = min(latencies)
        max_lat = max(latencies)
        passed = p95_lat <= b["sla_ms"]

        results_table.append({
            "operation": b["name"],
            "avg_ms": avg_lat,
            "p95_ms": p95_lat,
            "min_ms": min_lat,
            "max_ms": max_lat,
            "sla_target": b["sla_ms"],
            "status": "PASS" if passed else "FAIL"
        })

    # Print Summary Table
    print("\n" + "-" * 95)
    print(f"{'Operation':<35} | {'Avg (ms)':<10} | {'P95 (ms)':<10} | {'SLA Target':<10} | {'Status':<8}")
    print("-" * 95)
    
    total_sequential_p95 = 0.0
    for res in results_table:
        print(
            f"{res['operation']:<35} | "
            f"{res['avg_ms']:<10.2f} | "
            f"{res['p95_ms']:<10.2f} | "
            f"< {res['sla_target']:<8.0f} | "
            f"[{res['status']}]"
        )
        if "Concurrent" not in res["operation"]:
            total_sequential_p95 += res["p95_ms"]

    print("-" * 95)

    # Validate overall SLA budget (Data Layer budget: < 5000ms out of 60s total)
    print(f"\nOverall Sequential P95 Latency: {total_sequential_p95:.2f} ms")
    if total_sequential_p95 < 5000.0:
        print("Data Layer SLA Budget Check: PASSED (< 5000ms allotted budget)\n")
    else:
        print("Data Layer SLA Budget Check: FAILED (Exceeded 5000ms allotted budget)\n")


if __name__ == "__main__":
    main()