# Phase 2: Personalized Synthesis

The Phase 2 internal layer consumes the existing parallel Phase 1 outputs and applies five deterministic steps: conflict detection, profile weighting, weighted score calculation, risk-aware interpretation, and concise decision tracing. It does not modify the API layer or the Phase 1 agents.

```mermaid
flowchart LR
  A[Phase 1 AgentOutput[]] --> B[ConflictDetector]
  P[UserProfile] --> W[ProfileWeighting]
  B --> S[SynthesisEngine]
  W --> S
  S --> O[SynthesisOutput]
  S --> T[DecisionTrace + Evidence]
```

## Profile and weighting

Conservative profiles use weights of 0.30 fundamental, 0.50 risk, and 0.20 sentiment. Moderate profiles use 0.40, 0.35, and 0.25. Aggressive profiles use 0.40, 0.20, and 0.40. Weights are centralized and renormalized when an agent is unavailable.

## Conflict and degradation

A conflict exists when at least one available specialist is bullish and another is bearish. Degraded or failed outputs are excluded from scoring, never fabricated, and recorded in the decision trace. If all outputs are unavailable, the engine returns `INSUFFICIENT_DATA`, a neutral score of 50, zero confidence, and high risk rather than producing a directional recommendation.

## Score and confidence

The score is the weighted average of available agent scores, clamped to 0–100. Scores of 70 or higher are bullish, scores from 40 through 69.99 are neutral, and scores below 40 are bearish. Confidence starts as the weighted average of available agent confidence. It is multiplied by the availability fraction, then penalized by 15% for conflict, 15% for missing agents, and 10% if an available agent has no evidence; the result is clamped to 0–1.

## Personalization example

The same demo outputs—fundamental 82, risk 48, sentiment 75—produce a more risk-sensitive conservative result because the risk weight is 0.50, while an aggressive profile gives more influence to fundamental and sentiment signals. The output is decision support, not a guarantee or a trade instruction.

> The synthesis layer consumes independent specialist analyses, detects conflicting signals, and applies investor-specific risk preferences through deterministic weighting. It preserves evidence and a concise decision trace so users can understand how the final intelligence was produced.
