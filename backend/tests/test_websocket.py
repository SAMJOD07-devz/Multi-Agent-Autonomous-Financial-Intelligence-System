import pytest
from starlette.testclient import TestClient
from app.main import app


def test_websocket_agent_trace_streaming():
    client = TestClient(app)
    with client.websocket_connect("/ws/agent-trace") as websocket:
        request_payload = {
            "ticker": "RELIANCE",
            "behavioral_profile": "Conservative"
        }
        websocket.send_json(request_payload)

        events = []
        while True:
            try:
                data = websocket.receive_json()
                events.append(data)
            except Exception:
                break

        assert len(events) >= 5
        event_types = [e["event_type"] for e in events]
        assert "connected" in event_types
        assert "agent_started" in event_types
        assert "agent_completed" in event_types
        assert "synthesis_started" in event_types
        assert "completed" in event_types

        seq_nums = [e["sequence_number"] for e in events]
        assert seq_nums == sorted(seq_nums)
