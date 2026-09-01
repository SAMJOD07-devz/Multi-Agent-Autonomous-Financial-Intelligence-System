from enum import Enum
from app.schemas import AgentName, AgentOutput, Evidence, UserProfile
from pydantic import BaseModel, Field

class ConflictSeverity(str, Enum):
    NONE = 'NONE'
    MODERATE = 'MODERATE'
    HIGH = 'HIGH'

class ConflictResult(BaseModel):
    detected: bool
    agents_in_conflict: list[AgentName] = Field(default_factory=list)
    severity: ConflictSeverity = ConflictSeverity.NONE
    description: str | None = None

class RiskLevel(str, Enum):
    LOW = 'LOW'
    MODERATE = 'MODERATE'
    HIGH = 'HIGH'

class Recommendation(str, Enum):
    BUY = 'BUY'
    HOLD = 'HOLD'
    AVOID = 'AVOID'
    INSUFFICIENT_DATA = 'INSUFFICIENT_DATA'

class TraceType(str, Enum):
    AGENT_SIGNAL = 'AGENT_SIGNAL'
    CONFLICT = 'CONFLICT'
    PROFILE = 'PROFILE'
    WEIGHTING = 'WEIGHTING'
    SYNTHESIS = 'SYNTHESIS'
    FINAL = 'FINAL'
    DATA_QUALITY = 'DATA_QUALITY'

class DecisionTraceStep(BaseModel):
    step: int = Field(ge=1)
    type: TraceType
    agent: AgentName | None = None
    summary: str = Field(min_length=1)

class SynthesisOutput(BaseModel):
    recommendation: Recommendation
    signal: str
    score: float = Field(ge=0, le=100)
    confidence: float = Field(ge=0, le=1)
    risk_level: RiskLevel
    user_profile: UserProfile
    weights: dict[AgentName, float]
    conflict: ConflictResult
    reasoning_summary: str
    evidence: list[Evidence] = Field(default_factory=list)
    decision_trace: list[DecisionTraceStep] = Field(default_factory=list)
