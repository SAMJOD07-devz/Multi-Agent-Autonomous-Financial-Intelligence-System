import pytest
from app.models import DataQuality, Recommendation, RiskLevel, TraceType
from app.schemas import UserProfile
from app.services.data_provider import MockFinancialDataProvider
from app.services.evidence_provider import MockEvidenceProvider
from app.services.intelligence_pipeline import IntelligencePipeline

PROFILE = UserProfile(risk_tolerance='CONSERVATIVE', investment_horizon='LONG_TERM', volatility_tolerance='LOW')
AGGRESSIVE = UserProfile(risk_tolerance='AGGRESSIVE', investment_horizon='SHORT_TERM', volatility_tolerance='HIGH')

@pytest.mark.asyncio
async def test_mock_providers_return_demo_data():
    context = await MockFinancialDataProvider().get_market_context('DEMO')
    evidence = await MockEvidenceProvider().get_evidence('DEMO')
    assert context.symbol == 'DEMO' and context.current_price == 150.25 and context.revenue_growth == .18
    assert evidence and evidence[0].source_id == 'mock-demo'

@pytest.mark.asyncio
async def test_pipeline_unique_ids_and_completed_state():
    pipeline = IntelligencePipeline()
    first = await pipeline.run('DEMO', PROFILE)
    second = await pipeline.run('DEMO', PROFILE)
    assert first.run_id != second.run_id
    assert first.status == 'COMPLETED' and str(first.run_id) in pipeline.states

@pytest.mark.asyncio
async def test_pipeline_end_to_end_preserves_evidence_and_trace():
    result = await IntelligencePipeline().run('DEMO', PROFILE)
    assert result.evidence and result.data_quality.evidence == DataQuality.GOOD
    trace_types = {step.type for step in result.decision_trace}
    assert TraceType.SYNTHESIS in trace_types and TraceType.FINAL in trace_types
    assert 0 <= result.score <= 100 and 0 <= result.confidence <= 1

@pytest.mark.asyncio
async def test_identical_market_data_personalizes_end_to_end():
    pipeline = IntelligencePipeline()
    conservative = await pipeline.run('DEMO', PROFILE)
    aggressive = await pipeline.run('DEMO', AGGRESSIVE)
    assert conservative.score != aggressive.score or conservative.recommendation != aggressive.recommendation or conservative.risk_level != aggressive.risk_level

class BrokenEvidenceProvider:
    async def get_evidence(self, symbol):
        raise RuntimeError('provider unavailable')

@pytest.mark.asyncio
async def test_evidence_failure_degrades_without_crashing():
    result = await IntelligencePipeline(evidence_provider=BrokenEvidenceProvider()).run('DEMO', PROFILE)
    assert result.status == 'DEGRADED' and result.confidence < 1 and result.data_quality.evidence == DataQuality.DEGRADED

class BrokenMarketProvider:
    async def get_context(self, context):
        raise RuntimeError('market unavailable')

@pytest.mark.asyncio
async def test_market_failure_returns_safe_structured_result():
    result = await IntelligencePipeline(data_provider=BrokenMarketProvider()).run('DEMO', PROFILE)
    assert result.status == 'DEGRADED' and result.recommendation == Recommendation.INSUFFICIENT_DATA and result.risk_level == RiskLevel.HIGH
