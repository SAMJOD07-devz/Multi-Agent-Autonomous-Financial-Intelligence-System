from fastapi import APIRouter
from app.orchestration.orchestrator import FinancialOrchestrator
from app.schemas import FinancialContext, IntelligenceResponse

router = APIRouter(prefix="/api/intelligence", tags=["intelligence"])

@router.post("/analyze", response_model=IntelligenceResponse)
async def analyze(context: FinancialContext) -> IntelligenceResponse:
    state = await FinancialOrchestrator().analyze(context)
    return IntelligenceResponse(request_id=state.request_id, status=state.pipeline_status, agents=state.agent_outputs)
