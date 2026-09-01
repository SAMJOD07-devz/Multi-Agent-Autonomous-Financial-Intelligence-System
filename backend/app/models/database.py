from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, Text, ForeignKey
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


def current_utc_iso():
    return datetime.now(timezone.utc).isoformat()


class User(Base):
    __tablename__ = "users"

    user_id = Column(String(64), primary_key=True)
    name = Column(String(128), nullable=False)
    email = Column(String(128), unique=True, nullable=False)
    risk_preference = Column(String(32), nullable=False)  # Conservative or Aggressive
    created_at = Column(String(64), default=current_utc_iso)

    portfolios = relationship("Portfolio", back_populates="user", cascade="all, delete-orphan")


class Portfolio(Base):
    __tablename__ = "portfolios"

    portfolio_id = Column(String(64), primary_key=True)
    user_id = Column(String(64), ForeignKey("users.user_id"), nullable=False)
    name = Column(String(128), nullable=False)
    created_at = Column(String(64), default=current_utc_iso)

    user = relationship("User", back_populates="portfolios")
    holdings = relationship("Holding", back_populates="portfolio", cascade="all, delete-orphan")


class Holding(Base):
    __tablename__ = "holdings"

    holding_id = Column(String(64), primary_key=True)
    portfolio_id = Column(String(64), ForeignKey("portfolios.portfolio_id"), nullable=False)
    ticker = Column(String(32), nullable=False)
    quantity = Column(Float, nullable=False, default=0.0)
    avg_buy_price = Column(Float, nullable=False, default=0.0)
    current_price = Column(Float, nullable=False, default=0.0)
    asset_class = Column(String(64), default="Equity")
    weight = Column(Float, default=0.0)

    portfolio = relationship("Portfolio", back_populates="holdings")


class AnalysisSession(Base):
    __tablename__ = "analysis_sessions"

    session_id = Column(String(64), primary_key=True)
    user_id = Column(String(64), nullable=True)
    portfolio_id = Column(String(64), nullable=True)
    request_id = Column(String(64), nullable=True)
    ticker = Column(String(32), nullable=False)
    behavioral_profile = Column(String(32), nullable=False)
    degraded_state = Column(Boolean, default=False)
    degradation_reason = Column(Text, nullable=True)
    unavailable_data_json = Column(Text, default="[]")
    recommendation_json = Column(Text, nullable=True)
    market_signals_json = Column(Text, default="{}")
    portfolio_context_json = Column(Text, default="{}")
    telemetry_json = Column(Text, default="{}")
    created_at = Column(String(64), default=current_utc_iso)

    agent_outputs = relationship("AgentOutputDB", back_populates="session", cascade="all, delete-orphan")


class AgentOutputDB(Base):
    __tablename__ = "agent_outputs"

    output_id = Column(String(64), primary_key=True)
    session_id = Column(String(64), ForeignKey("analysis_sessions.session_id"), nullable=False)
    agent_name = Column(String(64), nullable=False)
    status = Column(String(32), nullable=False)
    classification = Column(String(32), nullable=False)
    confidence = Column(Float, nullable=False)
    reasoning = Column(Text, nullable=False)
    citations_json = Column(Text, default="[]")
    created_at = Column(String(64), default=current_utc_iso)

    session = relationship("AnalysisSession", back_populates="agent_outputs")


class UserDecisionDB(Base):
    __tablename__ = "user_decisions"

    decision_id = Column(String(64), primary_key=True)
    session_id = Column(String(64), ForeignKey("analysis_sessions.session_id"), nullable=False)
    user_id = Column(String(64), ForeignKey("users.user_id"), nullable=False)
    action = Column(String(32), nullable=False)  # BUY, SELL, WATCH, IGNORE
    notes = Column(Text, nullable=True)
    created_at = Column(String(64), default=current_utc_iso)
