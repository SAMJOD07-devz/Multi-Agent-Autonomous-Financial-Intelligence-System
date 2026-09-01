import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_analyze_endpoint_normal_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {
            "ticker": "RELIANCE",
            "behavioral_profile": "Conservative",
            "user_id": "user_cons_01",
            "portfolio_id": "port_cons_01"
        }
        response = await ac.post("/api/v1/analyze", json=payload)
        assert response.status_code == 200
        data = response.json()

        assert data["ticker"] == "RELIANCE"
        assert data["profile"] == "Conservative"
        assert data["degraded_state"] is False
        assert data["session_id"] is not None
        assert data["recommendation"] is not None
        assert data["recommendation"]["label"] in ["WATCH", "HOLD", "ACCUMULATE"]
        assert len(data["agent_outputs"]) == 3
        assert len(data["citations"]) > 0
        assert data["telemetry"]["latency_ms"] >= 0.0
        assert data["telemetry"]["risk_concentration_score"] is not None


@pytest.mark.asyncio
async def test_analyze_request_validation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        invalid_ticker_payload = {
            "ticker": "   ",
            "behavioral_profile": "Conservative"
        }
        resp = await ac.post("/api/v1/analyze", json=invalid_ticker_payload)
        assert resp.status_code == 422

        invalid_profile_payload = {
            "ticker": "TCS",
            "behavioral_profile": "UltraGambler"
        }
        resp = await ac.post("/api/v1/analyze", json=invalid_profile_payload)
        assert resp.status_code == 422
