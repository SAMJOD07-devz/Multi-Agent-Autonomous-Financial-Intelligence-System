from math import isclose
from app.schemas import AgentName, RiskTolerance, UserProfile

PROFILE_WEIGHTS = {
    RiskTolerance.CONSERVATIVE: {AgentName.FUNDAMENTAL: .30, AgentName.RISK: .50, AgentName.SENTIMENT: .20},
    RiskTolerance.MODERATE: {AgentName.FUNDAMENTAL: .40, AgentName.RISK: .35, AgentName.SENTIMENT: .25},
    RiskTolerance.AGGRESSIVE: {AgentName.FUNDAMENTAL: .40, AgentName.RISK: .20, AgentName.SENTIMENT: .40},
}

class ProfileWeighting:
    def weights_for(self, profile: UserProfile) -> dict[AgentName, float]:
        weights = dict(PROFILE_WEIGHTS[profile.risk_tolerance])
        if not isclose(sum(weights.values()), 1.0, abs_tol=1e-9):
            raise ValueError('Profile weights must sum to 1.0')
        return weights
