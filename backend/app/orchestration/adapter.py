from abc import ABC, abstractmethod
from typing import AsyncGenerator, Dict, Any, List, Optional, Tuple
from app.models.schemas import AnalysisRequest, AgentOutputSchema, WSEvent
from app.services.degradation_handler import DegradationException


class OrchestrationAdapter(ABC):
    """
    Abstract Orchestration Adapter binding backend API endpoints to multi-agent reasoning layers.
    """

    @abstractmethod
    async def run_analysis(
        self,
        request: AnalysisRequest,
        portfolio_context: Dict[str, Any],
        simulated_scenario: Optional[str] = None
    ) -> Tuple[List[AgentOutputSchema], Dict[str, Any], Optional[DegradationException]]:
        """
        Execute multi-agent reasoning pipeline.
        Returns (agent_outputs, market_signals, optional_degradation_exception).
        """
        pass

    @abstractmethod
    async def stream_trace(
        self,
        session_id: str,
        request: AnalysisRequest,
        portfolio_context: Dict[str, Any],
        simulated_scenario: Optional[str] = None
    ) -> AsyncGenerator[WSEvent, None]:
        """
        Stream structured real-time execution trace events for WebSocket subscribers.
        """
        pass
