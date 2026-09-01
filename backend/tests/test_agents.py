import pytest
from app.agents import FundamentalAgent, RiskAgent, SentimentAgent
from app.schemas import FinancialContext, AgentStatus
@pytest.mark.asyncio
async def test_agents_return_schema():
    context = FinancialContext(symbol="AAPL", revenue_growth=.08, earnings=10, volatility=.2, recent_news=["strong growth"])
    outputs = await __import__('asyncio').gather(FundamentalAgent().analyze(context), RiskAgent().analyze(context), SentimentAgent().analyze(context))
    assert len(outputs) == 3 and all(output.agent for output in outputs)
@pytest.mark.asyncio
async def test_missing_data_degrades_without_crashing():
    output = await SentimentAgent().analyze(FinancialContext(symbol="EMPTY"))
    assert output.status == AgentStatus.DEGRADED
