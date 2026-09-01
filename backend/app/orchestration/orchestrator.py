import asyncio
from datetime import datetime, timezone
from uuid import uuid4
from app.agents import FundamentalAgent, RiskAgent, SentimentAgent
from app.schemas import AgentOutput, AgentStatus, FinancialContext, PipelineState, PipelineStatus
from app.services.data_provider import FinancialDataProvider, MockFinancialDataProvider

class FinancialOrchestrator:
    def __init__(self, agents=None, data_provider: FinancialDataProvider | None = None):
        self.agents = agents or [FundamentalAgent(), RiskAgent(), SentimentAgent()]
        self.data_provider = data_provider or MockFinancialDataProvider()

    async def _run_agent(self, agent, context):
        try:
            return await agent.analyze(context)
        except Exception as exc:
            return AgentOutput(agent=agent.name, signal="NEUTRAL", confidence=0, score=50, risks=["Agent failed to analyze the supplied context."], reasoning_summary="The agent returned a structured failure without exposing internal details.", status=AgentStatus.FAILED)

    async def analyze(self, context: FinancialContext) -> PipelineState:
        request_id = uuid4(); started = datetime.now(timezone.utc)
        state = PipelineState(request_id=request_id, financial_context=context, timestamps={"started_at": started})
        enriched = await self.data_provider.get_context(context)
        outputs = await asyncio.gather(*(self._run_agent(agent, enriched) for agent in self.agents))
        state.agent_outputs = list(outputs)
        state.pipeline_status = PipelineStatus.SUCCESS if all(o.status == AgentStatus.SUCCESS for o in outputs) else PipelineStatus.DEGRADED
        state.timestamps["completed_at"] = datetime.now(timezone.utc)
        return state
