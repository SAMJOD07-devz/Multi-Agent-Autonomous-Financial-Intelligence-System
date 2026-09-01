from abc import ABC, abstractmethod
from app.schemas import FinancialContext

class FinancialDataProvider(ABC):
    @abstractmethod
    async def get_context(self, context: FinancialContext) -> FinancialContext: raise NotImplementedError
    async def get_market_context(self, symbol: str) -> FinancialContext: return await self.get_context(FinancialContext(symbol=symbol))

class MockFinancialDataProvider(FinancialDataProvider):
    async def get_context(self, context: FinancialContext) -> FinancialContext:
        if context.symbol.upper() == 'DEMO':
            return context.model_copy(update={'company_name': context.company_name or 'Demo Company', 'current_price': context.current_price or 150.25, 'revenue_growth': context.revenue_growth if context.revenue_growth is not None else .18, 'earnings': context.earnings if context.earnings is not None else 31.55, 'debt': context.debt if context.debt is not None else 32.0, 'cash': context.cash if context.cash is not None else 100.0, 'volatility': context.volatility if context.volatility is not None else .28, 'recent_news': context.recent_news or ['Demo company reports strong growth and positive demand'], 'filing_summary': context.filing_summary or 'Demo filing reports improved operating performance', 'market_context': context.market_context or 'Demo market context is moderately positive'})
        return context
