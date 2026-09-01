from app.models import ConflictResult, ConflictSeverity
from app.schemas import AgentName, AgentOutput, AgentStatus, Signal

class ConflictDetector:
    def detect(self, outputs: list[AgentOutput]) -> ConflictResult:
        available = [o for o in outputs if o.status == AgentStatus.SUCCESS]
        bullish = [o for o in available if o.signal == Signal.BULLISH]
        bearish = [o for o in available if o.signal == Signal.BEARISH]
        if not bullish or not bearish:
            return ConflictResult(detected=False)
        names = [o.agent for o in bullish + bearish]
        severity = ConflictSeverity.HIGH if len(bullish) == len(bearish) else ConflictSeverity.MODERATE
        return ConflictResult(detected=True, agents_in_conflict=names, severity=severity, description='Bullish and bearish specialist signals conflict.')
