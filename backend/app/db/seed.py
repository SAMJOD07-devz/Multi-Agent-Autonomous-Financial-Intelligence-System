"""Idempotent database seeding script."""
import logging
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, init_db
from app.models.database import User, Portfolio, Holding

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed")


def seed_database(db: Session):
    logger.info("Initializing database tables...")
    init_db()

    # Seed Conservative User
    user_cons = db.query(User).filter(User.user_id == "user_cons_01").first()
    if not user_cons:
        user_cons = User(
            user_id="user_cons_01",
            name="Rahul Sharma (Conservative)",
            email="rahul.conservative@example.com",
            risk_preference="Conservative"
        )
        db.add(user_cons)
        db.flush()
        logger.info("Seeded conservative user: user_cons_01")

    # Seed Conservative Portfolio
    port_cons = db.query(Portfolio).filter(Portfolio.portfolio_id == "port_cons_01").first()
    if not port_cons:
        port_cons = Portfolio(
            portfolio_id="port_cons_01",
            user_id="user_cons_01",
            name="Conservative Capital Preservation Portfolio"
        )
        db.add(port_cons)
        db.flush()
        
        holdings = [
            Holding(
                holding_id="h_cons_01",
                portfolio_id="port_cons_01",
                ticker="RELIANCE",
                quantity=100.0,
                avg_buy_price=2400.0,
                current_price=2850.0,
                asset_class="Equity",
                weight=0.40
            ),
            Holding(
                holding_id="h_cons_02",
                portfolio_id="port_cons_01",
                ticker="TCS",
                quantity=50.0,
                avg_buy_price=3500.0,
                current_price=3900.0,
                asset_class="Equity",
                weight=0.30
            ),
            Holding(
                holding_id="h_cons_03",
                portfolio_id="port_cons_01",
                ticker="HDFCBANK",
                quantity=150.0,
                avg_buy_price=1500.0,
                current_price=1650.0,
                asset_class="Equity",
                weight=0.30
            ),
        ]
        db.add_all(holdings)
        logger.info("Seeded conservative portfolio & holdings: port_cons_01")

    # Seed Aggressive User
    user_aggr = db.query(User).filter(User.user_id == "user_aggr_01").first()
    if not user_aggr:
        user_aggr = User(
            user_id="user_aggr_01",
            name="Priya Patel (Aggressive)",
            email="priya.aggressive@example.com",
            risk_preference="Aggressive"
        )
        db.add(user_aggr)
        db.flush()
        logger.info("Seeded aggressive user: user_aggr_01")

    # Seed Aggressive Portfolio
    port_aggr = db.query(Portfolio).filter(Portfolio.portfolio_id == "port_aggr_01").first()
    if not port_aggr:
        port_aggr = Portfolio(
            portfolio_id="port_aggr_01",
            user_id="user_aggr_01",
            name="Aggressive Growth & Momentum Portfolio"
        )
        db.add(port_aggr)
        db.flush()
        
        holdings = [
            Holding(
                holding_id="h_aggr_01",
                portfolio_id="port_aggr_01",
                ticker="RELIANCE",
                quantity=50.0,
                avg_buy_price=2400.0,
                current_price=2850.0,
                asset_class="Equity",
                weight=0.20
            ),
            Holding(
                holding_id="h_aggr_02",
                portfolio_id="port_aggr_01",
                ticker="INFY",
                quantity=120.0,
                avg_buy_price=1400.0,
                current_price=1820.0,
                asset_class="Equity",
                weight=0.35
            ),
            Holding(
                holding_id="h_aggr_03",
                portfolio_id="port_aggr_01",
                ticker="TATAMOTORS",
                quantity=200.0,
                avg_buy_price=600.0,
                current_price=980.0,
                asset_class="Equity",
                weight=0.45
            ),
        ]
        db.add_all(holdings)
        logger.info("Seeded aggressive portfolio & holdings: port_aggr_01")

    db.commit()
    logger.info("Database seeding completed successfully.")


if __name__ == "__main__":
    session = SessionLocal()
    try:
        seed_database(session)
    finally:
        session.close()
