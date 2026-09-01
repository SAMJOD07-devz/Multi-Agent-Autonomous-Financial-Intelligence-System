from abc import ABC, abstractmethod
from app.schemas import FinancialContext

class FinancialDataProvider(ABC):
    @abstractmethod
    async def get_context(self, context: FinancialContext) -> FinancialContext:
        raise NotImplementedError

class MockFinancialDataProvider(FinancialDataProvider):
    async def get_context(self, context: FinancialContext) -> FinancialContext:
        return context
