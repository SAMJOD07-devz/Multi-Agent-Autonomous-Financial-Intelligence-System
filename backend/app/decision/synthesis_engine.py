from app.decision.conflict_detector import ConflictDetector
from app.decision.profile_weighting import ProfileWeighting
from app.models import ConflictResult, DecisionTraceStep, Recommendation, RiskLevel, SynthesisOutput, TraceType
from app.schemas import AgentName, AgentOutput, AgentStatus, Signal, UserProfile

SIGNAL_THRESHOLDS = {'bullish': 70, 'bearish': 40}

class SynthesisEngine:
    def __init__(self, weighting=None, conflict_detector=None):
        self.weighting = weighting or ProfileWeighting()
        self.conflict_detector = conflict_detector or ConflictDetector()

    def synthesize(self, agent_outputs: list[AgentOutput], user_profile: UserProfile, conflict: ConflictResult | None = None) -> SynthesisOutput:
        conflict = conflict or self.conflict_detector.detect(agent_outputs)
        base_weights = self.weighting.weights_for(user_profile)
        available = [o for o in agent_outputs if o.status == AgentStatus.SUCCESS and o.agent in base_weights]
        trace = [DecisionTraceStep(step=i, type=TraceType.AGENT_SIGNAL, agent=o.agent, summary=f'{o.agent.value} agent produced {o.signal.value.lower()} signal with a score of {o.score:.1f}.') for i, o in enumerate(available, 1)]
        if not available:
            trace.append(DecisionTraceStep(step=len(trace)+1, type=TraceType.DATA_QUALITY, summary='All specialist outputs were unavailable or degraded; no directional synthesis was produced.'))
            return SynthesisOutput(recommendation=Recommendation.INSUFFICIENT_DATA, signal=Signal.NEUTRAL.value, score=50, confidence=0, risk_level=RiskLevel.HIGH, user_profile=user_profile, weights={}, conflict=conflict, reasoning_summary='Insufficient valid specialist outputs for a reliable personalized assessment.', evidence=[], decision_trace=trace)
        total = sum(base_weights[o.agent] for o in available)
        weights = {o.agent: base_weights[o.agent] / total for o in available}
        score = max(0, min(100, sum(o.score * weights[o.agent] for o in available)))
        weighted_confidence = sum(o.confidence * weights[o.agent] for o in available)
        confidence = weighted_confidence * (len(available) / 3)
        if conflict.detected: confidence *= .85
        if len(available) < len(agent_outputs): confidence *= .85
        if any(not o.evidence for o in available): confidence *= .9
        confidence = max(0, min(1, confidence))
        signal = Signal.BULLISH if score >= SIGNAL_THRESHOLDS['bullish'] else Signal.BEARISH if score < SIGNAL_THRESHOLDS['bearish'] else Signal.NEUTRAL
        risk_output = next((o for o in available if o.agent == AgentName.RISK), None)
        risk = RiskLevel.HIGH if risk_output and risk_output.signal == Signal.BEARISH else RiskLevel.LOW if risk_output and risk_output.signal == Signal.BULLISH else RiskLevel.MODERATE
        if conflict.detected and risk == RiskLevel.LOW: risk = RiskLevel.MODERATE
        if user_profile.risk_tolerance.value == 'CONSERVATIVE' and risk == RiskLevel.MODERATE: risk = RiskLevel.HIGH
        recommendation = Recommendation.BUY if signal == Signal.BULLISH and risk != RiskLevel.HIGH else Recommendation.AVOID if signal == Signal.BEARISH else Recommendation.HOLD
        trace.append(DecisionTraceStep(step=len(trace)+1, type=TraceType.CONFLICT, summary='Specialist signals conflict.' if conflict.detected else 'No bullish/bearish specialist conflict detected.'))
        trace.append(DecisionTraceStep(step=len(trace)+1, type=TraceType.PROFILE, summary=f"Investor profile is {user_profile.risk_tolerance.value.lower()} with {user_profile.volatility_tolerance.value.lower()} volatility tolerance."))
        trace.append(DecisionTraceStep(step=len(trace)+1, type=TraceType.WEIGHTING, summary='Weights were selected from the centralized profile weighting table and renormalized across available agents.'))
        if len(available) < len(agent_outputs): trace.append(DecisionTraceStep(step=len(trace)+1, type=TraceType.DATA_QUALITY, summary='One or more specialist outputs were unavailable or degraded and excluded from the weighted score.'))
        trace.append(DecisionTraceStep(step=len(trace)+1, type=TraceType.SYNTHESIS, summary=f'Weighted specialist scores produced an overall score of {score:.1f}.'))
        trace.append(DecisionTraceStep(step=len(trace)+1, type=TraceType.FINAL, summary=f'Final decision-support assessment is {signal.value.lower()} with {risk.value.lower()} risk.'))
        evidence = [e for o in available for e in o.evidence]
        return SynthesisOutput(recommendation=recommendation, signal=signal.value, score=score, confidence=confidence, risk_level=risk, user_profile=user_profile, weights=weights, conflict=conflict, reasoning_summary='The synthesis combines available specialist scores using investor-specific deterministic weights; risk, uncertainty, and missing data remain visible.', evidence=evidence, decision_trace=trace)
