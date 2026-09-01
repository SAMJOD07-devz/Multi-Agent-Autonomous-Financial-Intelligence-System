import json
import time
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, Header
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.schemas import (
    AnalysisRequest,
    AnalysisResponse,
    TelemetrySchema
)
from app.models.database import AnalysisSession, AgentOutputDB, Portfolio
from app.orchestration.mock_orchestrator import MockOrchestrator
from app.orchestration.synthesis import SynthesisEngine
from app.metrics.telemetry import (
    calculate_latency_ms,
    calculate_hhi,
    calculate_combined_confidence
)
from app.services.degradation_handler import (
    DegradationPolicyHandler,
    DegradationException
)

router = APIRouter()
orchestrator = MockOrchestrator()


from app.services.live_market_service import fetch_live_stock_data

def _get_portfolio_context(db: Session, user_id: Optional[str], portfolio_id: Optional[str], target_ticker: str = "RELIANCE") -> dict:
    portfolio = None
    if portfolio_id:
        portfolio = db.query(Portfolio).filter(Portfolio.portfolio_id == portfolio_id).first()
    elif user_id:
        portfolio = db.query(Portfolio).filter(Portfolio.user_id == user_id).first()

    default_holdings_meta = {
        "RELIANCE": {"qty": 300, "buy": 1180.0},
        "TCS": {"qty": 80, "buy": 2400.0},
        "INFY": {"qty": 200, "buy": 1100.0},
        "HDFCBANK": {"qty": 120, "buy": 680.0},
    }

    if portfolio and portfolio.holdings:
        tickers_list = [(h.ticker, h.quantity, h.avg_buy_price if hasattr(h, 'avg_buy_price') and h.avg_buy_price else (h.current_price * 0.9)) for h in portfolio.holdings]
    else:
        tickers_list = [(t, m["qty"], m["buy"]) for t, m in default_holdings_meta.items()]

    raw_holdings = []
    total_portfolio_value = 0.0

    for t_sym, qty, buy_p in tickers_list:
        clean_t = t_sym.strip().upper()
        live_info = fetch_live_stock_data(clean_t)
        curr_p = live_info.get("current_price") or 1000.0
        val = qty * curr_p
        total_portfolio_value += val
        raw_holdings.append({
            "holding_id": f"h_{clean_t.lower()}",
            "ticker": clean_t,
            "quantity": qty,
            "avg_buy_price": buy_p,
            "current_price": curr_p,
            "val": val,
            "asset_class": "Equity"
        })

    holdings_data = []
    for rh in raw_holdings:
        w = round(rh["val"] / total_portfolio_value, 4) if total_portfolio_value > 0 else 0.25
        holdings_data.append({
            "holding_id": rh["holding_id"],
            "ticker": rh["ticker"],
            "quantity": rh["quantity"],
            "avg_buy_price": rh["avg_buy_price"],
            "current_price": rh["current_price"],
            "weight": w,
            "asset_class": rh["asset_class"]
        })

    hhi = calculate_hhi(holdings_data)
    clean_target = target_ticker.strip().upper()
    target_weight = next((h["weight"] for h in holdings_data if h["ticker"] == clean_target), 0.0)

    return {
        "portfolio_id": portfolio.portfolio_id if portfolio else (portfolio_id or "port_cons_01"),
        "holdings": holdings_data,
        "hhi_score": hhi,
        "ticker_weight": target_weight
    }


def _persist_session(
    db: Session,
    response: AnalysisResponse,
    user_id: Optional[str],
    portfolio_id: Optional[str],
    request_id: Optional[str]
):
    try:
        db_session = AnalysisSession(
            session_id=response.session_id,
            user_id=user_id,
            portfolio_id=portfolio_id,
            request_id=request_id,
            ticker=response.ticker,
            behavioral_profile=response.profile,
            degraded_state=response.degraded_state,
            degradation_reason=response.degradation_reason,
            unavailable_data_json=json.dumps(response.unavailable_data),
            recommendation_json=json.dumps(response.recommendation.model_dump()) if response.recommendation else None,
            market_signals_json=json.dumps(response.market_signals),
            portfolio_context_json=json.dumps(response.portfolio_context),
            telemetry_json=json.dumps(response.telemetry.model_dump()),
            created_at=response.created_at
        )
        db.add(db_session)
        db.flush()

        for agent in response.agent_outputs:
            db_output = AgentOutputDB(
                output_id=f"out_{uuid.uuid4().hex[:12]}",
                session_id=response.session_id,
                agent_name=agent.agent_name,
                status=agent.status,
                classification=agent.classification,
                confidence=agent.confidence,
                reasoning=agent.reasoning,
                citations_json=json.dumps([c.model_dump() for c in agent.citations])
            )
            db.add(db_output)

        db.commit()
    except Exception as exc:
        db.rollback()
        print(f"Warning: Failed to persist session data: {exc}")


@router.post("/analyze", response_model=AnalysisResponse, tags=["Analysis"])
async def analyze_investment(
    request: AnalysisRequest,
    scenario: Optional[str] = Query(None, description="QA simulation scenario: timeout, missing_filing, conflicting, uncited"),
    x_scenario: Optional[str] = Header(None, alias="X-Scenario"),
    db: Session = Depends(get_db)
):
    start_counter = time.perf_counter()
    session_id = str(uuid.uuid4())
    active_scenario = scenario or x_scenario

    portfolio_ctx = _get_portfolio_context(db, request.user_id, request.portfolio_id, target_ticker=request.ticker)

    try:
        agent_outputs, market_signals, scenario_exc = await orchestrator.run_analysis(
            request=request,
            portfolio_context=portfolio_ctx,
            simulated_scenario=active_scenario
        )

        if scenario_exc:
            raise scenario_exc

        recommendation, citations = SynthesisEngine.synthesize(
            request=request,
            agent_outputs=agent_outputs,
            portfolio_context=portfolio_ctx
        )

        latency_ms = calculate_latency_ms(start_counter)
        combined_conf = calculate_combined_confidence(agent_outputs, request.behavioral_profile)

        response = AnalysisResponse(
            session_id=session_id,
            ticker=request.ticker,
            profile=request.behavioral_profile.capitalize(),
            degraded_state=False,
            degradation_reason=None,
            unavailable_data=[],
            recommendation=recommendation,
            agent_outputs=agent_outputs,
            market_signals=market_signals,
            portfolio_context={
                "portfolio_id": portfolio_ctx.get("portfolio_id"),
                "hhi_score": portfolio_ctx.get("hhi_score", 0.0),
                "total_holdings_count": len(portfolio_ctx.get("holdings", [])),
                "holdings": portfolio_ctx.get("holdings", []),
                "ticker_weight": portfolio_ctx.get("ticker_weight", 0.0)
            },
            citations=citations,
            safe_next_step=None,
            telemetry=TelemetrySchema(
                latency_ms=latency_ms,
                risk_concentration_score=portfolio_ctx.get("hhi_score", 0.0),
                combined_confidence=combined_conf
            )
        )

    except DegradationException as deg_exc:
        latency_ms = calculate_latency_ms(start_counter)
        response = DegradationPolicyHandler.build_degraded_response(
            session_id=session_id,
            ticker=request.ticker,
            profile=request.behavioral_profile.capitalize(),
            reason=deg_exc.reason,
            unavailable_data=deg_exc.unavailable_data,
            safe_next_step=deg_exc.safe_next_step,
            latency_ms=latency_ms,
            agent_outputs=agent_outputs if 'agent_outputs' in locals() else [],
            market_signals=market_signals if 'market_signals' in locals() else {},
            portfolio_context={"portfolio_id": portfolio_ctx.get("portfolio_id"), "hhi_score": portfolio_ctx.get("hhi_score")}
        )

    except Exception as exc:
        latency_ms = calculate_latency_ms(start_counter)
        response = DegradationPolicyHandler.build_degraded_response(
            session_id=session_id,
            ticker=request.ticker,
            profile=request.behavioral_profile.capitalize(),
            reason=f"Unexpected internal processing degradation: {str(exc)}",
            unavailable_data=["internal_synthesis_engine"],
            safe_next_step="System error logged. Retry request or contact system administrator.",
            latency_ms=latency_ms
        )

    _persist_session(db, response, request.user_id, request.portfolio_id, request.request_id)

    return response
