import asyncio
import time
import pytest
from app.orchestration.orchestrator import FinancialOrchestrator
from app.schemas import FinancialContext, AgentName, AgentOutput, AgentStatus, Signal
from app.agents.base import BaseFinancialAgent
class SlowAgent(BaseFinancialAgent):
    def __init__(self, name): self.name = name
    async def analyze(self, context):
        await asyncio.sleep(.05)
        return AgentOutput(agent=self.name, signal=Signal.NEUTRAL, confidence=.5, score=50, reasoning_summary="test", status=AgentStatus.SUCCESS)
@pytest.mark.asyncio
async def test_three_agents_concurrent():
    start=time.perf_counter(); state=await FinancialOrchestrator([SlowAgent(AgentName.FUNDAMENTAL),SlowAgent(AgentName.RISK),SlowAgent(AgentName.SENTIMENT)]).analyze(FinancialContext(symbol="X")); elapsed=time.perf_counter()-start
    assert len(state.agent_outputs)==3 and elapsed < .12
