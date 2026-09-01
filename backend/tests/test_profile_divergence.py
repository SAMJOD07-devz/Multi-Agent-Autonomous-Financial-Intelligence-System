import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_conservative_vs_aggressive_profile_divergence():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        cons_payload = {
            "ticker": "RELIANCE",
            "behavioral_profile": "Conservative",
            "portfolio_id": "port_cons_01"
        }
        aggr_payload = {
            "ticker": "RELIANCE",
            "behavioral_profile": "Aggressive",
            "portfolio_id": "port_aggr_01"
        }

        cons_resp = await ac.post("/api/v1/analyze", json=cons_payload)
        aggr_resp = await ac.post("/api/v1/analyze", json=aggr_payload)

        assert cons_resp.status_code == 200
        assert aggr_resp.status_code == 200

        cons_data = cons_resp.json()
        aggr_data = aggr_resp.json()

        cons_rec = cons_data["recommendation"]
        aggr_rec = aggr_data["recommendation"]

        assert cons_rec["label"] != aggr_rec["label"]
        assert cons_rec["label"] in ["WATCH", "HOLD", "ACCUMULATE"]
        assert aggr_rec["label"] in ["BUY", "ACCUMULATE"]
        assert cons_rec["summary"] != aggr_rec["summary"]
        assert cons_rec["rationale"] != aggr_rec["rationale"]
