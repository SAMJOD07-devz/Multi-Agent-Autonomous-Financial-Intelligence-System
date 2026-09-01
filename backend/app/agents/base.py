from abc import ABC, abstractmethod

from app.schemas import AgentOutput, FinancialContext


class BaseFinancialAgent(ABC):
    name: str

    @abstractmethod
    async def analyze(self, context: FinancialContext) -> AgentOutput:
        """Analyze context and return a validated, evidence-backed output."""
        raise NotImplementedError
