from abc import ABC, abstractmethod
from app.schemas import Evidence, SourceType
class EvidenceProvider(ABC):
    @abstractmethod
    async def get_evidence(self, symbol: str) -> list[Evidence]: raise NotImplementedError
class MockEvidenceProvider(EvidenceProvider):
    async def get_evidence(self, symbol: str) -> list[Evidence]:
        return [Evidence(source_id=f'mock-{symbol.lower()}', source_type=SourceType.OTHER, title=f'Demo evidence for {symbol}', claim='Mock evidence supplied for demonstration; it is not a real filing, market feed, or citation.')]
