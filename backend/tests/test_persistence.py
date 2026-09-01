import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.session import SessionLocal
from app.models.database import AnalysisSession, AgentOutputDB, UserDecisionDB


@pytest.mark.asyncio
async def test_session_and_agent_output_persistence():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {
            "ticker": "TCS",
            "behavioral_profile": "Conservative",
            "user_id": "user_cons_01",
            "portfolio_id": "port_cons_01"
        }
        response = await ac.post("/api/v1/analyze", json=payload)
        assert response.status_code == 200
        data = response.json()
        session_id = data["session_id"]

        db = SessionLocal()
        try:
            db_session = db.query(AnalysisSession).filter(AnalysisSession.session_id == session_id).first()
            assert db_session is not None
            assert db_session.ticker == "TCS"
            assert db_session.behavioral_profile == "Conservative"
            assert db_session.degraded_state is False

            outputs = db.query(AgentOutputDB).filter(AgentOutputDB.session_id == session_id).all()
            assert len(outputs) == 3
            agent_names = [o.agent_name for o in outputs]
            assert "fundamental" in agent_names
            assert "technical" in agent_names
            assert "sentiment" in agent_names
        finally:
            db.close()


@pytest.mark.asyncio
async def test_user_decision_persistence():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        decision_payload = {
            "session_id": "sess_test_123",
            "user_id": "user_cons_01",
            "action": "BUY",
            "notes": "Followed AI recommendation"
        }
        response = await ac.post("/api/v1/decisions", json=decision_payload)
        assert response.status_code == 200
        data = response.json()
        assert data["decision_id"] is not None

        db = SessionLocal()
        try:
            db_dec = db.query(UserDecisionDB).filter(UserDecisionDB.decision_id == data["decision_id"]).first()
            assert db_dec is not None
            assert db_dec.action == "BUY"
            assert db_dec.notes == "Followed AI recommendation"
        finally:
            db.close()
