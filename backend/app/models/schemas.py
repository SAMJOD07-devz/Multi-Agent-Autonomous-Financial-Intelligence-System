from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator


class AnalysisRequest(BaseModel):
    ticker: str = Field(..., description="Stock ticker symbol e.g. RELIANCE, TCS, INFY")
    behavioral_profile: str = Field(..., description="User risk preference: Conservative or Aggressive")
    user_id: Optional[str] = Field(None, description="Optional user ID")
    portfolio_id: Optional[str] = Field(None, description="Optional portfolio ID")
    request_id: Optional[str] = Field(None, description="Optional client request ID")

    @field_validator("ticker")
    @classmethod
    def normalize_ticker(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Ticker cannot be empty.")
        normalized = v.strip().upper()
        if not any(c.isalnum() for c in normalized):
            raise ValueError("Invalid ticker format.")
        return normalized

    @field_validator("behavioral_profile")
    @classmethod
    def validate_profile(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Behavioral profile cannot be empty.")
        val = v.strip().capitalize()
        if val not in ["Conservative", "Aggressive"]:
            raise ValueError("Behavioral profile must be 'Conservative' or 'Aggressive'.")
        return val


class CitationSchema(BaseModel):
    title: str
    source: str
    locator: str


class AgentOutputSchema(BaseModel):
    agent_name: str
    status: str  # "completed", "failed", "unavailable", "SUCCESS"
    classification: str  # "BULLISH", "BEARISH", "NEUTRAL"
    confidence: float = Field(..., ge=0.0, le=1.0)
    reasoning: str
    citations: List[CitationSchema] = Field(default_factory=list)


class RecommendationSchema(BaseModel):
    label: str  # "BUY", "ACCUMULATE", "WATCH", "HOLD", "REDUCE", "SELL"
    summary: str
    rationale: str
    confidence: float = Field(..., ge=0.0, le=1.0)


class TelemetrySchema(BaseModel):
    latency_ms: float = Field(..., ge=0.0, description="Response latency in milliseconds")
    risk_concentration_score: Optional[float] = Field(None, description="Herfindahl-Hirschman Index score")
    combined_confidence: float = Field(0.0, ge=0.0, le=1.0, description="Combined agent signal confidence")


class AnalysisResponse(BaseModel):
    session_id: str
    ticker: str
    profile: str
    degraded_state: bool = False
    degradation_reason: Optional[str] = None
    unavailable_data: List[str] = Field(default_factory=list)
    recommendation: Optional[RecommendationSchema] = None
    agent_outputs: List[AgentOutputSchema] = Field(default_factory=list)
    market_signals: Dict[str, Any] = Field(default_factory=dict)
    portfolio_context: Dict[str, Any] = Field(default_factory=dict)
    citations: List[CitationSchema] = Field(default_factory=list)
    safe_next_step: Optional[str] = None
    telemetry: TelemetrySchema
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class WSEvent(BaseModel):
    session_id: str
    sequence_number: int
    event_type: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    payload: Dict[str, Any] = Field(default_factory=dict)


class HoldingSchema(BaseModel):
    holding_id: str
    portfolio_id: str
    ticker: str
    quantity: float
    avg_buy_price: float
    current_price: float
    asset_class: str = "Equity"
    weight: float = 0.0


class PortfolioSchema(BaseModel):
    portfolio_id: str
    user_id: str
    name: str
    holdings: List[HoldingSchema] = Field(default_factory=list)
    hhi_score: float = 0.0


class UserSchema(BaseModel):
    user_id: str
    name: str
    email: str
    risk_preference: str
    created_at: str


class UserDecisionCreate(BaseModel):
    session_id: str
    user_id: str
    action: str
    notes: Optional[str] = None


class UserDecisionSchema(BaseModel):
    decision_id: str
    session_id: str
    user_id: str
    action: str
    notes: Optional[str] = None
    created_at: str
