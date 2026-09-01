import pytest
from app.db.session import init_db, SessionLocal
from app.db.seed import seed_database


@pytest.fixture(autouse=True, scope="session")
def setup_test_database():
    """Ensure database tables and initial seed data exist for all tests."""
    init_db()
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
