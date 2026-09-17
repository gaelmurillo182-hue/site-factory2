"""Data quality, confidence and the VALUE / WAIT / REJECT decision.

Nothing here is a matter of taste. Both scores are sums of named components
with fixed weights, so two runs on the same inputs give the same answer and a
losing bet can be traced back to which component was wrong.
"""

from __future__ import annotations

from dataclasses import dataclass, asdict, field
from enum import Enum

__all__ = [
    "DataQuality",
    "Confidence",
    "Verdict",
    "Tier",
    "Decision",
    "classify",
    "VOLATILE_MARKETS",
    "market_class_of",
]

# Markets whose outcome hangs on one rare event, or where the model's own
# error is largest. They are allowed, but they must clear a wider edge and
# they carry a confidence penalty.
VOLATILE_MARKETS = {
    "correct_score",
    "btts_no",
    "handicap_big",        # -2.5 and beyond
    "regulation_winner",   # hockey, in an evenly matched game
    "pp_goals",
    "player_prop_rare",
    "first_goalscorer",
}


def market_class_of(market_key: str, *, is_live: bool = False) -> str:
    """Map a market to the edge requirement class used in value.MIN_EDGE_PP."""
    if is_live:
        return "live"
    if market_key in VOLATILE_MARKETS:
        return "volatile"
    if market_key.startswith("prop_") or "player" in market_key:
        return "prop"
    return "core"


# --------------------------------------------------------------------------
# data quality
# --------------------------------------------------------------------------

@dataclass
class DataQuality:
    """0-100. Below 60 no bet may be graded VALUE, whatever the edge says."""
    lineup_goalie_certainty: float = 0.0   # max 25
    source_quality: float = 0.0            # max 20
    freshness: float = 0.0                 # max 15
    advanced_stats: float = 0.0            # max 15
    market_data: float = 0.0               # max 15
    schedule_context: float = 0.0          # max 10

    MAXIMA = {
        "lineup_goalie_certainty": 25.0,
        "source_quality": 20.0,
        "freshness": 15.0,
        "advanced_stats": 15.0,
        "market_data": 15.0,
        "schedule_context": 10.0,
    }

    def __post_init__(self) -> None:
        for name, cap in self.MAXIMA.items():
            v = getattr(self, name)
            if v < 0 or v > cap:
                raise ValueError(f"{name} must be within 0..{cap}, got {v}")

    @property
    def total(self) -> float:
        return sum(getattr(self, n) for n in self.MAXIMA)

    @property
    def label(self) -> str:
        t = self.total
        if t >= 85:
            return "Excellent"
        if t >= 70:
            return "Good"
        if t >= 60:
            return "Acceptable"
        return "Poor"

    @property
    def allows_value(self) -> bool:
        return self.total >= 60.0

    @property
    def allows_a_tier(self) -> bool:
        return self.total >= 75.0

    def missing(self) -> dict[str, float]:
        """What is costing the most points, worst first. Tells you what to fetch."""
        gaps = {n: cap - getattr(self, n) for n, cap in self.MAXIMA.items()}
        return dict(sorted(gaps.items(), key=lambda kv: kv[1], reverse=True))

    def to_dict(self) -> dict:
        d = asdict(self)
        d["total"] = round(self.total, 1)
        d["label"] = self.label
        return d


# --------------------------------------------------------------------------
# confidence
# --------------------------------------------------------------------------

@dataclass
class Confidence:
    """0-100, built from named components. Volatility subtracts."""
    edge_strength: float = 0.0             # max 25
    data_quality: float = 0.0              # max 20
    model_agreement: float = 0.0           # max 15
    lineup_goalie_certainty: float = 0.0   # max 15
    market_agreement: float = 0.0          # max 10
    source_reliability: float = 0.0        # max 10
    volatility_penalty: float = 0.0        # 0 .. -15

    MAXIMA = {
        "edge_strength": 25.0,
        "data_quality": 20.0,
        "model_agreement": 15.0,
        "lineup_goalie_certainty": 15.0,
        "market_agreement": 10.0,
        "source_reliability": 10.0,
    }

    def __post_init__(self) -> None:
        for name, cap in self.MAXIMA.items():
            v = getattr(self, name)
            if v < 0 or v > cap:
                raise ValueError(f"{name} must be within 0..{cap}, got {v}")
        if not -15.0 <= self.volatility_penalty <= 0.0:
            raise ValueError("volatility_penalty must be within -15..0")

    @property
    def total(self) -> float:
        return sum(getattr(self, n) for n in self.MAXIMA) + self.volatility_penalty

    def to_dict(self) -> dict:
        d = asdict(self)
        d["total"] = round(self.total, 1)
        return d

    @staticmethod
    def edge_points(edge_pp: float, required_pp: float) -> float:
        """Scale the edge into 0..25. Full marks at twice the requirement."""
        if edge_pp <= 0 or required_pp <= 0:
            return 0.0
        ratio = edge_pp / (2.0 * required_pp)
        return min(max(ratio, 0.0), 1.0) * 25.0

    @staticmethod
    def dq_points(data_quality_total: float) -> float:
        return min(max(data_quality_total, 0.0), 100.0) / 100.0 * 20.0


class Verdict(str, Enum):
    VALUE = "VALUE"
    WAIT = "WAIT"
    REJECTED = "REJECTED"


class Tier(str, Enum):
    A = "A-TIER"
    B = "B-TIER"
    NONE = "-"


@dataclass
class Decision:
    verdict: Verdict
    tier: Tier
    confidence: float
    data_quality: float
    reasons: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "verdict": self.verdict.value,
            "tier": self.tier.value,
            "confidence": round(self.confidence, 1),
            "data_quality": round(self.data_quality, 1),
            "reasons": list(self.reasons),
        }


def classify(*,
             edge_pp: float,
             required_edge_pp: float,
             confidence: Confidence,
             data_quality: DataQuality,
             is_conditional: bool = False,
             goalie_sensitive_unconfirmed: bool = False,
             models_disagree: bool = False) -> Decision:
    """Apply every hard gate, in order, and return one of three verdicts.

    The gates are checked before the score, because a hard gate is not
    something a high confidence number is allowed to override.
    """
    reasons: list[str] = []
    conf = confidence.total
    dq = data_quality.total

    # --- hard gates: these end the decision regardless of score ---
    if edge_pp < required_edge_pp:
        reasons.append(
            f"edge {edge_pp:+.2f} пп ниже требуемых {required_edge_pp:.1f} пп "
            f"для этого класса рынка"
        )
        return Decision(Verdict.REJECTED, Tier.NONE, conf, dq, reasons)

    if not data_quality.allows_value:
        reasons.append(f"качество данных {dq:.0f} < 60 — VALUE запрещён")
        return Decision(Verdict.REJECTED, Tier.NONE, conf, dq, reasons)

    if is_conditional:
        reasons.append("вывод зависит от невыполненного условия → WAIT")
        return Decision(Verdict.WAIT, Tier.NONE, conf, dq, reasons)

    if goalie_sensitive_unconfirmed:
        reasons.append("рынок зависит от стартового вратаря, а он не подтверждён")
        return Decision(Verdict.WAIT, Tier.NONE, conf, dq, reasons)

    # --- score-based grading ---
    if conf < 60:
        reasons.append(f"уверенность {conf:.0f} < 60")
        return Decision(Verdict.REJECTED, Tier.NONE, conf, dq, reasons)
    if conf < 70:
        reasons.append(f"уверенность {conf:.0f} в полосе 60-69")
        return Decision(Verdict.WAIT, Tier.NONE, conf, dq, reasons)

    if conf >= 80 and data_quality.allows_a_tier and not models_disagree:
        reasons.append(f"уверенность {conf:.0f}, качество данных {dq:.0f}")
        return Decision(Verdict.VALUE, Tier.A, conf, dq, reasons)

    if models_disagree:
        reasons.append("слои модели смотрят в разные стороны → потолок B-TIER")
    if not data_quality.allows_a_tier:
        reasons.append(f"качество данных {dq:.0f} < 75 → потолок B-TIER")
    reasons.append(f"уверенность {conf:.0f}")
    return Decision(Verdict.VALUE, Tier.B, conf, dq, reasons)
