import pytest
from pydantic import ValidationError
from app.schemas import AgentName, AgentOutput, AgentStatus, Evidence, RiskTolerance, UserProfile, InvestmentHorizon, VolatilityTolerance, Signal, SourceType
from app.decision import ConflictDetector, ProfileWeighting, SynthesisEngine
from app.models import ConflictSeverity, Recommendation, RiskLevel, TraceType

def profile(risk):
    return UserProfile(risk_tolerance=risk, investment_horizon='LONG_TERM', volatility_tolerance='LOW')

def output(agent, score, signal, evidence=True, status=AgentStatus.SUCCESS):
    ev = [Evidence(source_id=agent.value, source_type=SourceType.OTHER, title='Demo', claim='Demo evidence')] if evidence else []
    return AgentOutput(agent=agent, signal=signal, confidence=.8, score=score, reasoning_summary='Demo output', evidence=ev, status=status)

def demo_outputs():
    return [output(AgentName.FUNDAMENTAL, 82, Signal.BULLISH), output(AgentName.RISK, 48, Signal.BEARISH), output(AgentName.SENTIMENT, 75, Signal.BULLISH)]

def test_profile_validation():
    assert profile(RiskTolerance.CONSERVATIVE).risk_tolerance == RiskTolerance.CONSERVATIVE
    with pytest.raises(ValidationError): UserProfile(risk_tolerance='INVALID', investment_horizon='LONG_TERM', volatility_tolerance='LOW')

def test_profile_weights():
    conservative = ProfileWeighting().weights_for(profile(RiskTolerance.CONSERVATIVE))
    aggressive = ProfileWeighting().weights_for(profile(RiskTolerance.AGGRESSIVE))
    assert sum(conservative.values()) == pytest.approx(1)
    assert conservative[AgentName.RISK] > aggressive[AgentName.RISK]
    assert aggressive[AgentName.SENTIMENT] > conservative[AgentName.SENTIMENT]

def test_conflicts():
    assert not ConflictDetector().detect([output(a, 80, Signal.BULLISH) for a in AgentName]).detected
    result = ConflictDetector().detect(demo_outputs())
    assert result.detected and AgentName.RISK in result.agents_in_conflict

def test_weighted_synthesis_math():
    result = SynthesisEngine().synthesize(demo_outputs(), profile(RiskTolerance.MODERATE))
    assert result.score == pytest.approx(82*.4 + 48*.35 + 75*.25)
    assert result.conflict.detected
    assert len(result.evidence) == 3

def test_personalization():
    conservative = SynthesisEngine().synthesize(demo_outputs(), profile(RiskTolerance.CONSERVATIVE))
    aggressive = SynthesisEngine().synthesize(demo_outputs(), profile(RiskTolerance.AGGRESSIVE))
    assert conservative.score != aggressive.score or conservative.recommendation != aggressive.recommendation

def test_missing_agent_is_renormalized():
    outputs = demo_outputs(); outputs[-1] = output(AgentName.SENTIMENT, 50, Signal.NEUTRAL, status=AgentStatus.FAILED)
    result = SynthesisEngine().synthesize(outputs, profile(RiskTolerance.MODERATE))
    assert result.recommendation != Recommendation.INSUFFICIENT_DATA
    assert sum(result.weights.values()) == pytest.approx(1)
    assert any(step.type == TraceType.DATA_QUALITY for step in result.decision_trace)

def test_all_degraded_is_safe():
    result = SynthesisEngine().synthesize([output(a, 90, Signal.BULLISH, status=AgentStatus.DEGRADED) for a in AgentName], profile(RiskTolerance.MODERATE))
    assert result.recommendation == Recommendation.INSUFFICIENT_DATA and result.confidence == 0

def test_score_confidence_bounds_and_trace():
    result = SynthesisEngine().synthesize(demo_outputs(), profile(RiskTolerance.CONSERVATIVE))
    assert 0 <= result.score <= 100 and 0 <= result.confidence <= 1
    assert {TraceType.PROFILE, TraceType.WEIGHTING, TraceType.SYNTHESIS, TraceType.FINAL}.issubset({x.type for x in result.decision_trace})
