import pytest
from pydantic import ValidationError
from app.schemas import AgentOutput, AgentStatus, AgentName, Evidence, Signal, SourceType

def valid():
    return AgentOutput(agent=AgentName.FUNDAMENTAL, signal=Signal.BULLISH, confidence=.8, score=80, reasoning_summary="summary", status=AgentStatus.SUCCESS)

def test_valid_output(): assert valid().score == 80
@pytest.mark.parametrize("field,value", [("confidence", 1.1), ("score", 101)])
def test_bounds(field, value):
    with pytest.raises(ValidationError): valid().model_copy(update={field: value}).model_validate(valid().model_dump() | {field: value})
def test_evidence_validation():
    with pytest.raises(ValidationError): Evidence(source_id="", source_type=SourceType.NEWS, title="x", claim="y")
