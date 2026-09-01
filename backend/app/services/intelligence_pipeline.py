from datetime import datetime, timezone
from uuid import uuid4
from app.agents import FundamentalAgent, RiskAgent, SentimentAgent
from app.decision import ConflictDetector, SynthesisEngine
from app.models import DataQuality, DataQualityReport, FinalIntelligenceOutput, TraceType
from app.schemas import FinancialContext, PipelineState, PipelineStatus, UserProfile
from app.services.data_provider import FinancialDataProvider, MockFinancialDataProvider
from app.services.evidence_provider import EvidenceProvider, MockEvidenceProvider
from app.services.evidence_validator import EvidenceValidator

class IntelligencePipeline:
    def __init__(self, data_provider=None, evidence_provider=None, agents=None, orchestrator=None):
        self.data_provider=data_provider or MockFinancialDataProvider(); self.evidence_provider=evidence_provider or MockEvidenceProvider(); self.agents=agents or [FundamentalAgent(),RiskAgent(),SentimentAgent()]; self.validator=EvidenceValidator(); self.orchestrator=orchestrator
        self.states: dict[str, PipelineState] = {}
    async def run(self, symbol: str, user_profile: UserProfile, context: FinancialContext | None = None) -> FinalIntelligenceOutput:
        run_id=uuid4(); base=context or FinancialContext(symbol=symbol); state=PipelineState(request_id=run_id, run_id=run_id, symbol=symbol, financial_context=base, user_profile=user_profile, pipeline_status=PipelineStatus.INGESTED, timestamps={'ingested_at':datetime.now(timezone.utc)})
        try: enriched=await self.data_provider.get_context(base)
        except Exception as exc:
            state.pipeline_status=PipelineStatus.DEGRADED; state.errors.append('Financial data provider failed.'); self.states[str(run_id)]=state
            return FinalIntelligenceOutput(run_id=run_id,symbol=symbol,status='DEGRADED',recommendation='INSUFFICIENT_DATA',signal='NEUTRAL',score=50,confidence=0,risk_level='HIGH',profile=user_profile,reasoning_summary='Market data was unavailable; no directional assessment was produced.',evidence=[],decision_trace=[],data_quality=DataQualityReport(market_data='UNAVAILABLE',agent_coverage='UNAVAILABLE',evidence='UNAVAILABLE'))
        state.financial_context=enriched; state.pipeline_status=PipelineStatus.ANALYZING
        from app.orchestration.orchestrator import FinancialOrchestrator
        outputs=await FinancialOrchestrator(agents=self.agents, data_provider=self.data_provider).analyze(enriched)
        state.agent_outputs=outputs.agent_outputs; state.pipeline_status=PipelineStatus.SYNTHESIZING
        evidence_provider_failed = False
        try: ext=await self.evidence_provider.get_evidence(symbol)
        except Exception: ext=[]; evidence_provider_failed = True; state.errors.append('Evidence provider failed.')
        conflict=ConflictDetector().detect(state.agent_outputs); synthesis=SynthesisEngine().synthesize(state.agent_outputs,user_profile,conflict); state.conflict_result=conflict; state.synthesis_result=synthesis; state.weights={k.value if hasattr(k,'value') else str(k):v for k,v in synthesis.weights.items()}; state.pipeline_status=PipelineStatus.VALIDATING
        validation=self.validator.validate(state.agent_outputs,ext); evidence=validation.valid; trace=list(synthesis.decision_trace)
        if validation.missing_agents or validation.errors or evidence_provider_failed or not ext: synthesis.confidence=max(0,synthesis.confidence*.85); trace.append({'step':len(trace)+1,'type':TraceType.DATA_QUALITY,'summary':'Evidence was missing, malformed, or unavailable; confidence was reduced.'})
        state.evidence=evidence; state.decision_trace=trace; state.pipeline_status=PipelineStatus.COMPLETED if not state.errors else PipelineStatus.DEGRADED; state.timestamps['completed_at']=datetime.now(timezone.utc); self.states[str(run_id)]=state
        return FinalIntelligenceOutput(run_id=run_id,symbol=symbol,status=state.pipeline_status.value,recommendation=synthesis.recommendation,signal=synthesis.signal,score=synthesis.score,confidence=synthesis.confidence,risk_level=synthesis.risk_level,profile=user_profile,reasoning_summary=synthesis.reasoning_summary,evidence=evidence,decision_trace=trace,data_quality=DataQualityReport(market_data=DataQuality.GOOD if enriched.current_price is not None else DataQuality.PARTIAL,agent_coverage=DataQuality.GOOD if all(x.status.value=='SUCCESS' for x in state.agent_outputs) else DataQuality.PARTIAL,evidence=DataQuality.GOOD if not validation.errors and not evidence_provider_failed and evidence else DataQuality.DEGRADED))
