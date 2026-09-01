import time
from typing import List, Dict, Any
from app.models.schemas import AgentOutputSchema


def calculate_latency_ms(start_counter: float) -> float:
    """Calculate elapsed wall-clock latency in milliseconds."""
    elapsed = time.perf_counter() - start_counter
    return round(elapsed * 1000.0, 2)


def calculate_hhi(holdings: List[Dict[str, Any]]) -> float:
    """
    Calculate normalized Herfindahl–Hirschman Index (HHI) for portfolio risk concentration.
    HHI = sum(w_i^2) where w_i is normalized portfolio weight.
    Returns 0.0 if portfolio is empty or total value is zero.
    Range: 0.0 (completely diversified) to 1.0 (single asset 100% concentrated).
    """
    if not holdings:
        return 0.0

    weights = []
    total_val = 0.0

    declared_weights = [h.get("weight", 0.0) for h in holdings]
    sum_declared = sum(declared_weights)

    if sum_declared > 0.0:
        norm_weights = [w / sum_declared for w in declared_weights]
        hhi_val = sum(w ** 2 for w in norm_weights)
        return round(hhi_val, 4)

    for h in holdings:
        val = float(h.get("quantity", 0.0)) * float(h.get("current_price", 0.0))
        weights.append(val)
        total_val += val

    if total_val <= 0.0:
        return 0.0

    norm_weights = [w / total_val for w in weights]
    hhi_val = sum(w ** 2 for w in norm_weights)
    return round(hhi_val, 4)


def calculate_combined_confidence(
    agent_outputs: List[AgentOutputSchema],
    behavioral_profile: str = "Conservative"
) -> float:
    """
    Calculate deterministic aggregated signal confidence based on available agent outputs
    and user risk profile weighting.
    """
    if not agent_outputs:
        return 0.0

    profile_weights = {
        "Conservative": {"fundamental": 0.50, "technical": 0.25, "sentiment": 0.25, "risk": 0.25},
        "Aggressive": {"technical": 0.45, "fundamental": 0.30, "sentiment": 0.25, "risk": 0.25}
    }
    
    weights_map = profile_weights.get(
        behavioral_profile.capitalize(),
        profile_weights["Conservative"]
    )

    total_weight = 0.0
    weighted_confidence = 0.0

    for agent in agent_outputs:
        if agent.status not in ["completed", "SUCCESS"]:
            continue

        agent_key = agent.agent_name.lower()
        w = weights_map.get(agent_key, 0.25)
        
        conf = agent.confidence
        if not agent.citations:
            conf *= 0.5

        weighted_confidence += w * conf
        total_weight += w

    if total_weight <= 0.0:
        return 0.0

    return round(weighted_confidence / total_weight, 4)
