from pydantic import ValidationError
from app.schemas import AgentOutput, Evidence, AgentStatus
class EvidenceValidationResult:
    def __init__(self, valid: list[Evidence], missing_agents: list[str], errors: list[str]): self.valid, self.missing_agents, self.errors = valid, missing_agents, errors
class EvidenceValidator:
    def validate(self, outputs: list[AgentOutput], external: list[Evidence] | None = None) -> EvidenceValidationResult:
        valid=[]; missing=[]; errors=[]
        for output in outputs:
            if output.status != AgentStatus.SUCCESS: continue
            if not output.evidence: missing.append(output.agent.value)
            for item in output.evidence:
                try: valid.append(Evidence.model_validate(item))
                except (ValidationError, TypeError) as exc: errors.append(f'{output.agent.value}: malformed evidence')
        for item in external or []:
            try: valid.append(Evidence.model_validate(item))
            except (ValidationError, TypeError): errors.append('external: malformed evidence')
        return EvidenceValidationResult(valid, missing, errors)
