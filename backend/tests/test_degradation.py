import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_degradation_market_feed_timeout():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {"ticker": "RELIANCE", "behavioral_profile": "Conservative"}
        response = await ac.post("/api/v1/analyze?scenario=timeout", json=payload)
        assert response.status_code == 200
        data = response.json()

        assert data["degraded_state"] is True
        assert data["recommendation"] is None
        assert "timed out" in data["degradation_reason"].lower()
        assert "live_market_feed" in data["unavailable_data"]
        assert data["safe_next_step"] is not None
        assert data["telemetry"]["combined_confidence"] == 0.0


@pytest.mark.asyncio
async def test_degradation_missing_filing():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {"ticker": "TCS", "behavioral_profile": "Conservative"}
        response = await ac.post("/api/v1/analyze?scenario=missing_filing", json=payload)
        assert response.status_code == 200
        data = response.json()

        assert data["degraded_state"] is True
        assert data["recommendation"] is None
        assert "regulatory disclosure" in data["degradation_reason"].lower()
        assert "regulatory_filings" in data["unavailable_data"]


@pytest.mark.asyncio
async def test_degradation_conflicting_signals():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {"ticker": "INFY", "behavioral_profile": "Aggressive"}
        response = await ac.post("/api/v1/analyze?scenario=conflicting", json=payload)
        assert response.status_code == 200
        data = response.json()

        assert data["degraded_state"] is True
        assert data["recommendation"] is None
        assert "conflicting directional signals" in data["degradation_reason"].lower()


@pytest.mark.asyncio
async def test_zero_uncited_recommendation_enforcement():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {"ticker": "TATAMOTORS", "behavioral_profile": "Aggressive"}
        response = await ac.post("/api/v1/analyze?scenario=uncited", json=payload)
        assert response.status_code == 200
        data = response.json()

        assert data["degraded_state"] is True
        assert data["recommendation"] is None
        assert "ungrounded recommendation" in data["degradation_reason"].lower()
        assert "verifiable_source_citations" in data["unavailable_data"]
