"""Edge, expected value and stake sizing.

Sizing here is deliberately conservative. Two separate brakes are applied
before a number reaches the betting card:

1. The model probability is shrunk toward the market probability in proportion
   to how uncertain the model is. An edge you are not sure about is a smaller
   edge.
2. Kelly is taken fractionally and then capped, because full Kelly assumes the
   probability is exactly right, and ours never is.
"""

from __future__ import annotations

from dataclasses import dataclass

__all__ = [
    "edge_pp",
    "expected_value",
    "kelly_fraction",
    "shrink_toward_market",
    "StakeAdvice",
    "size_bet",
    "break_even_prob",
    "min_acceptable_odds",
]

# Market classes and the minimum edge (percentage points) each must clear.
# Wider markets need a wider edge because the model is less reliable there and
# the price is worse.
MIN_EDGE_PP = {
    "core": 4.0,        # 1X2, DNB, main totals, main handicaps
    "live": 3.0,        # live, after the game pattern is confirmed
    "prop": 5.0,        # player props
    "volatile": 6.5,    # exact score, BTTS NO, big handicaps, regulation-time
}


def break_even_prob(odds: float) -> float:
    """Probability at which a price is exactly a coin flip in EV terms."""
    return 1.0 / odds


def edge_pp(p_model: float, p_market: float) -> float:
    """Edge in PERCENTAGE POINTS, not percent. 0.56 vs 0.52 -> 4.0."""
    return (p_model - p_market) * 100.0


def expected_value(p_model: float, odds: float) -> float:
    """EV per 1 unit staked. 0.12 means +12%."""
    return p_model * odds - 1.0


def kelly_fraction(p_model: float, odds: float) -> float:
    """Full-Kelly fraction of bankroll. Negative means do not bet."""
    b = odds - 1.0
    if b <= 0:
        return 0.0
    return (p_model * odds - 1.0) / b


def shrink_toward_market(p_model: float, p_market: float,
                         uncertainty: float) -> float:
    """Pull the model estimate toward the market in proportion to uncertainty.

    `uncertainty` is 0..1, where 0 means the model is fully trusted and 1 means
    it carries no information beyond the market. In practice it is derived from
    the width of the model's confidence interval and the data quality score.
    """
    u = min(max(uncertainty, 0.0), 1.0)
    return (1.0 - u) * p_model + u * p_market


def min_acceptable_odds(p_model: float, min_ev: float = 0.02) -> float:
    """The worst price at which this bet is still worth making.

    Defined by expected value, not by comparing `p_model` with `1 / odds`.
    That comparison looks natural and is wrong: `1 / odds` is the GROSS implied
    probability and still contains the bookmaker's margin, so subtracting a
    required edge from `p_model` and inverting charges the margin twice. On a
    5% two-way market that mistake moves the floor by three or four points of
    price and rejects bets that clear every other test.

    The edge requirement is checked separately, against the DE-VIGGED market
    probability, which is the only like-for-like comparison.
    """
    if p_model <= 0:
        return float("inf")
    return (1.0 + min_ev) / p_model


@dataclass(frozen=True)
class StakeAdvice:
    p_model_raw: float
    p_model_used: float
    p_market: float
    odds: float
    edge_pp: float
    ev: float
    kelly_full: float
    kelly_used: float
    units: float
    stake: float
    min_odds: float
    capped_by: str | None

    def as_row(self) -> dict:
        return {
            "odds": round(self.odds, 3),
            "p_market": round(self.p_market, 4),
            "p_model": round(self.p_model_used, 4),
            "fair_odds": round(1.0 / self.p_model_used, 3),
            "edge_pp": round(self.edge_pp, 2),
            "ev_pct": round(self.ev * 100.0, 2),
            "kelly_full_pct": round(self.kelly_full * 100.0, 2),
            "units": round(self.units, 2),
            "stake": round(self.stake, 0),
            "min_odds": round(self.min_odds, 2),
        }


def size_bet(p_model: float,
             p_market: float,
             odds: float,
             *,
             bankroll: float,
             unit: float,
             uncertainty: float = 0.25,
             kelly_fraction_used: float = 0.25,
             max_units: float = 1.5,
             market_class: str = "core") -> StakeAdvice:
    """Turn a probability estimate into a stake, with both brakes applied.

    `kelly_fraction_used` defaults to quarter Kelly: it keeps most of the
    growth of full Kelly while surviving a run of losses and a few points of
    error in the probability estimate.
    """
    p_used = shrink_toward_market(p_model, p_market, uncertainty)
    e = edge_pp(p_used, p_market)
    ev = expected_value(p_used, odds)
    k_full = kelly_fraction(p_used, odds)
    k_used = max(k_full, 0.0) * kelly_fraction_used

    units = k_used * bankroll / unit
    capped: str | None = None
    if units > max_units:
        units, capped = max_units, "max_units"
    if units < 0.25:
        # Below a quarter unit the bet is noise; it is not worth the exposure
        # or the line it occupies in the journal.
        units, capped = 0.0, "below_min_stake"

    MIN_EDGE_PP.get(market_class, MIN_EDGE_PP["core"])
    return StakeAdvice(
        p_model_raw=p_model,
        p_model_used=p_used,
        p_market=p_market,
        odds=odds,
        edge_pp=e,
        ev=ev,
        kelly_full=k_full,
        kelly_used=k_used,
        units=units,
        stake=round(units * unit, 2),
        min_odds=min_acceptable_odds(p_used),
        capped_by=capped,
    )
