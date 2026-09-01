from datetime import datetime
from enum import Enum
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class SourceType(str, Enum):
    MARKET_DATA = "market_data"
    FILING = "filing"
    NEWS = "news"
    ANALYST_REPORT = "analyst_report"
    OTHER = "other"


class Evidence(BaseModel):
    source_id: str = Field(min_length=1)
    source_type: SourceType
    title: str = Field(min_length=1)
    url: Optional[HttpUrl] = None
    published_at: Optional[datetime] = None
    claim: str = Field(min_length=1)


class FinancialContext(BaseModel):
    model_config = ConfigDict(extra="forbid")

    symbol: str = Field(min_length=1, max_length=20)
    company_name: Optional[str] = None
    current_price: Optional[float] = Field(default=None, ge=0)
    price_change: Optional[float] = None
    revenue: Optional[float] = Field(default=None, ge=0)
    revenue_growth: Optional[float] = None
    earnings: Optional[float] = None
    eps: Optional[float] = None
    debt: Optional[float] = Field(default=None, ge=0)
    cash: Optional[float] = Field(default=None, ge=0)
    volatility: Optional[float] = Field(default=None, ge=0)
    recent_news: list[str] = Field(default_factory=list)
    filing_summary: Optional[str] = None
    market_context: Optional[str] = None


class AgentName(str, Enum):
    FUNDAMENTAL = "fundamental"
    RISK = "risk"
    SENTIMENT = "sentiment"


class Signal(str, Enum):
    BULLISH = "BULLISH"
    NEUTRAL = "NEUTRAL"
    BEARISH = "BEARISH"


class AgentStatus(str, Enum):
    SUCCESS = "SUCCESS"
    DEGRADED = "DEGRADED"
    FAILED = "FAILED"


class AgentOutput(BaseModel):
    agent: AgentName
    signal: Signal
    confidence: float = Field(ge=0, le=1)
    score: float = Field(ge=0, le=100)
    key_factors: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)
    reasoning_summary: str = Field(min_length=1)
    evidence: list[Evidence] = Field(default_factory=list)
    status: AgentStatus


class RiskTolerance(str, Enum):
    CONSERVATIVE = "CONSERVATIVE"
    MODERATE = "MODERATE"
    AGGRESSIVE = "AGGRESSIVE"


class InvestmentHorizon(str, Enum):
    SHORT_TERM = "SHORT_TERM"
    MEDIUM_TERM = "MEDIUM_TERM"
    LONG_TERM = "LONG_TERM"


class VolatilityTolerance(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class UserProfile(BaseModel):
    risk_tolerance: RiskTolerance
    investment_horizon: InvestmentHorizon
    volatility_tolerance: VolatilityTolerance


class PipelineStatus(str, Enum):
    SUCCESS = "SUCCESS"
    DEGRADED = "DEGRADED"
    FAILED = "FAILED"
    RUNNING = "RUNNING"
    INGESTED = "INGESTED"
    ANALYZING = "ANALYZING"
    SYNTHESIZING = "SYNTHESIZING"
    VALIDATING = "VALIDATING"
    COMPLETED = "COMPLETED"


class PipelineState(BaseModel):
    request_id: UUID
    financial_context: FinancialContext
    agent_outputs: list[AgentOutput] = Field(default_factory=list)
    pipeline_status: PipelineStatus = PipelineStatus.RUNNING
    errors: list[str] = Field(default_factory=list)
    timestamps: dict[str, datetime] = Field(default_factory=dict)
    run_id: Optional[UUID] = None
    symbol: Optional[str] = None
    user_profile: Optional[UserProfile] = None
    conflict_result: Optional[Any] = None
    weights: dict[str, float] = Field(default_factory=dict)
    synthesis_result: Optional[Any] = None
    evidence: list[Evidence] = Field(default_factory=list)
    decision_trace: list[Any] = Field(default_factory=list)


class IntelligenceResponse(BaseModel):
    request_id: UUID
    status: PipelineStatus
    agents: list[AgentOutput]
