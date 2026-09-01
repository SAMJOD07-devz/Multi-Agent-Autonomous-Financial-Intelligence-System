import re

from app.schemas import (
    AgentName, AgentOutput, AgentStatus, Evidence, FinancialContext, Signal,
    SourceType,
)
from .base import BaseFinancialAgent


def _evidence(source_id: str, source_type: SourceType, title: str, claim: str) -> Evidence:
    return Evidence(source_id=source_id, source_type=source_type, title=title, claim=claim)


class FundamentalAgent(BaseFinancialAgent):
    name = AgentName.FUNDAMENTAL

    async def analyze(self, context: FinancialContext) -> AgentOutput:
        factors, risks, evidence, points = [], [], [], 50.0
        available = 0
        if context.revenue_growth is not None:
            available += 1
            if context.revenue_growth > 0.05:
                points += 15; factors.append("Revenue growth is positive and above 5%.")
            elif context.revenue_growth < 0:
                points -= 15; risks.append("Revenue growth is declining.")
            else:
                factors.append("Revenue growth is modest.")
            evidence.append(_evidence("financial-context", SourceType.MARKET_DATA, "Submitted financial context", f"Revenue growth reported as {context.revenue_growth:.2%}."))
        if context.earnings is not None:
            available += 1
            if context.earnings > 0:
                points += 15; factors.append("Reported earnings are positive.")
            else:
                points -= 20; risks.append("Reported earnings are negative.")
            evidence.append(_evidence("financial-context", SourceType.FILING, "Submitted financial context", f"Earnings reported as {context.earnings}."))
        if context.eps is not None:
            available += 1
            factors.append("EPS data is available for review.")
            evidence.append(_evidence("financial-context", SourceType.FILING, "Submitted financial context", f"EPS reported as {context.eps}."))
        if context.debt is not None and context.cash is not None:
            available += 1
            net_debt = context.debt - context.cash
            if net_debt > 0: risks.append("Debt exceeds cash, creating balance-sheet pressure.")
            else: factors.append("Cash equals or exceeds debt.")
        if not available:
            return AgentOutput(agent=self.name, signal=Signal.NEUTRAL, confidence=0.2, score=50, risks=["Insufficient fundamental data."], reasoning_summary="No fundamental metrics were provided; no directional conclusion is made.", status=AgentStatus.DEGRADED)
        score = max(0, min(100, points))
        signal = Signal.BULLISH if score >= 65 else Signal.BEARISH if score <= 35 else Signal.NEUTRAL
        return AgentOutput(agent=self.name, signal=signal, confidence=min(0.95, 0.45 + available * 0.12), score=score, key_factors=factors, risks=risks, reasoning_summary="Deterministic rules assessed the available revenue, earnings, EPS, debt, and cash fields; unavailable fields were not inferred.", evidence=evidence, status=AgentStatus.SUCCESS if available >= 2 else AgentStatus.DEGRADED)


class RiskAgent(BaseFinancialAgent):
    name = AgentName.RISK

    async def analyze(self, context: FinancialContext) -> AgentOutput:
        factors, risks, evidence, score, available = [], [], [], 50.0, 0
        if context.volatility is not None:
            available += 1
            if context.volatility >= 0.35: score -= 25; risks.append("High volatility increases price risk.")
            elif context.volatility <= 0.15: score += 15; factors.append("Volatility is relatively low.")
            else: factors.append("Volatility is moderate.")
            evidence.append(_evidence("financial-context", SourceType.MARKET_DATA, "Submitted market context", f"Volatility reported as {context.volatility:.2f}."))
        if context.debt is not None and context.cash is not None:
            available += 1
            if context.debt > context.cash * 1.5: score -= 20; risks.append("Debt is materially higher than cash.")
            elif context.debt <= context.cash: score += 10; factors.append("Cash provides meaningful debt coverage.")
            evidence.append(_evidence("financial-context", SourceType.FILING, "Submitted balance-sheet context", "Debt and cash were supplied by the request."))
        if context.price_change is not None:
            available += 1
            if abs(context.price_change) > 5: score -= 10; risks.append("Recent price movement indicates instability.")
            else: factors.append("Recent price movement is not unusually large.")
        if not available:
            return AgentOutput(agent=self.name, signal=Signal.NEUTRAL, confidence=0.2, score=50, risks=["Insufficient risk data."], reasoning_summary="No risk metrics were provided; no risk direction is inferred.", status=AgentStatus.DEGRADED)
        score = max(0, min(100, score)); signal = Signal.BULLISH if score >= 65 else Signal.BEARISH if score <= 35 else Signal.NEUTRAL
        return AgentOutput(agent=self.name, signal=signal, confidence=min(0.9, 0.45 + available * 0.13), score=score, key_factors=factors, risks=risks, reasoning_summary="Deterministic rules assessed only the supplied volatility, leverage, cash coverage, and price-change fields.", evidence=evidence, status=AgentStatus.SUCCESS if available >= 2 else AgentStatus.DEGRADED)


class SentimentAgent(BaseFinancialAgent):
    name = AgentName.SENTIMENT
    POSITIVE = {"growth", "strong", "record", "beat", "improved", "positive", "stable"}
    NEGATIVE = {"decline", "loss", "weak", "risk", "miss", "lawsuit", "negative"}

    async def analyze(self, context: FinancialContext) -> AgentOutput:
        texts = [*context.recent_news, context.filing_summary or "", context.market_context or ""]
        text = " ".join(texts).lower()
        tokens = set(re.findall(r"[a-z]+", text)); positive = tokens & self.POSITIVE; negative = tokens & self.NEGATIVE
        total = len(positive) + len(negative)
        if not texts or not text.strip():
            return AgentOutput(agent=self.name, signal=Signal.NEUTRAL, confidence=0.2, score=50, risks=["No news, filing summary, or market context was provided."], reasoning_summary="No textual sentiment evidence was available.", status=AgentStatus.DEGRADED)
        score = max(0, min(100, 50 + (len(positive) - len(negative)) * 10)); signal = Signal.BULLISH if score >= 65 else Signal.BEARISH if score <= 35 else Signal.NEUTRAL
        factors = [f"Positive indicators detected: {', '.join(sorted(positive))}."] if positive else []
        risks = [f"Negative indicators detected: {', '.join(sorted(negative))}."] if negative else []
        evidence = [_evidence("submitted-news", SourceType.NEWS, "Submitted news and context", "Sentiment was derived from user-supplied text; no internet scraping was performed.")]
        return AgentOutput(agent=self.name, signal=signal, confidence=min(0.9, 0.4 + min(total, 4) * 0.12), score=score, key_factors=factors, risks=risks, reasoning_summary="A replaceable keyword-based demo classifier compared positive and negative terms in supplied text.", evidence=evidence, status=AgentStatus.SUCCESS)
