from enum import Enum
from uuid import UUID
from pydantic import BaseModel, Field
from app.models.phase2 import DecisionTraceStep, Recommendation, RiskLevel
from app.schemas import Evidence, UserProfile
class DataQuality(str, Enum): GOOD='GOOD'; PARTIAL='PARTIAL'; DEGRADED='DEGRADED'; UNAVAILABLE='UNAVAILABLE'
class DataQualityReport(BaseModel):
    market_data: DataQuality
    agent_coverage: DataQuality
    evidence: DataQuality
class FinalIntelligenceOutput(BaseModel):
    run_id: UUID
    symbol: str
    status: str
    recommendation: Recommendation
    signal: str
    score: float = Field(ge=0, le=100)
    confidence: float = Field(ge=0, le=1)
    risk_level: RiskLevel
    profile: UserProfile
    reasoning_summary: str
    evidence: list[Evidence]
    decision_trace: list[DecisionTraceStep]
    data_quality: DataQualityReport
