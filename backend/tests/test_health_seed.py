import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.session import SessionLocal
from app.db.seed import seed_database
from app.models.database import User, Portfolio


@pytest.mark.asyncio
async def test_health_check_endpoints():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

        v1_response = await ac.get("/api/v1/health")
        assert v1_response.status_code == 200
        v1_data = v1_response.json()
        assert v1_data["status"] == "healthy"


def test_idempotent_seeding():
    db = SessionLocal()
    try:
        seed_database(db)
        user_count_1 = db.query(User).count()
        port_count_1 = db.query(Portfolio).count()

        seed_database(db)
        user_count_2 = db.query(User).count()
        port_count_2 = db.query(Portfolio).count()

        assert user_count_1 == user_count_2
        assert port_count_1 == port_count_2
        assert user_count_1 >= 2
    finally:
        db.close()
