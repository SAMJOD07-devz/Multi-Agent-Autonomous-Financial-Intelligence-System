import json
import uuid
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.models.schemas import AnalysisRequest, WSEvent
from app.orchestration.mock_orchestrator import MockOrchestrator

router = APIRouter()
orchestrator = MockOrchestrator()


@router.websocket("/ws/agent-trace")
@router.websocket("/api/v1/ws/agent-trace")
async def websocket_agent_trace(websocket: WebSocket):
    await websocket.accept()
    try:
        raw_data = await websocket.receive_text()
        try:
            data = json.loads(raw_data)
        except Exception:
            err_event = WSEvent(
                session_id=str(uuid.uuid4()),
                sequence_number=1,
                event_type="error",
                payload={"error_code": "INVALID_JSON", "message": "Input payload must be valid JSON."}
            )
            await websocket.send_text(err_event.model_dump_json())
            await websocket.close(code=1003)
            return

        ticker = data.get("ticker", "RELIANCE")
        profile = data.get("behavioral_profile", "Conservative")
        session_id = data.get("session_id", str(uuid.uuid4()))
        scenario = data.get("scenario")

        try:
            request = AnalysisRequest(
                ticker=ticker,
                behavioral_profile=profile
            )
        except Exception as exc:
            err_event = WSEvent(
                session_id=session_id,
                sequence_number=1,
                event_type="error",
                payload={"error_code": "VALIDATION_ERROR", "message": str(exc)}
            )
            await websocket.send_text(err_event.model_dump_json())
            await websocket.close(code=1008)
            return

        async for event in orchestrator.stream_trace(
            session_id=session_id,
            request=request,
            portfolio_context={"portfolio_id": "ws_default", "holdings": []},
            simulated_scenario=scenario
        ):
            await websocket.send_text(event.model_dump_json())

        await websocket.close(code=1000)

    except WebSocketDisconnect:
        pass
    except Exception as exc:
        try:
            err_event = WSEvent(
                session_id=str(uuid.uuid4()),
                sequence_number=99,
                event_type="error",
                payload={"error_code": "SERVER_ERROR", "message": str(exc)}
            )
            await websocket.send_text(err_event.model_dump_json())
            await websocket.close(code=1011)
        except Exception:
            pass
