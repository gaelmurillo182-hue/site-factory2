"""Odds arithmetic and margin removal (de-vigging).

All probabilities are floats in (0, 1). All odds are DECIMAL unless the
function name says otherwise, because that is the format Fonbet and every
other European book quotes.

Four de-vig methods are implemented. They disagree, and the disagreement is
information: when the methods spread widely, the fair price is uncertain and
the candidate should be sized down. See docs/RESEARCH.md for the evidence on
which method to prefer where.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Iterable, Sequence

__all__ = [
    "decimal_to_prob",
    "prob_to_decimal",
    "american_to_decimal",
    "decimal_to_american",
    "booksum",
    "margin_pct",
    "devig",
    "DevigResult",
    "devig_all",
    "DevigConsensus",
]

_EPS = 1e-12


# --------------------------------------------------------------------------
# conversions
# --------------------------------------------------------------------------

def decimal_to_prob(odds: float) -> float:
    """Implied (gross, margin-inclusive) probability of a decimal price."""
    if odds <= 1.0:
        raise ValueError(f"decimal odds must be > 1.0, got {odds}")
    return 1.0 / odds


def prob_to_decimal(prob: float) -> float:
    """Fair decimal price of a probability."""
    if not 0.0 < prob < 1.0:
        raise ValueError(f"probability must be in (0,1), got {prob}")
    return 1.0 / prob


def american_to_decimal(odds: float) -> float:
    """US moneyline -> decimal. -150 -> 1.6667, +130 -> 2.30."""
    if odds == 0:
        raise ValueError("american odds cannot be 0")
    if odds > 0:
        return 1.0 + odds / 100.0
    return 1.0 + 100.0 / abs(odds)


def decimal_to_american(odds: float) -> float:
    """decimal -> US moneyline."""
    if odds <= 1.0:
        raise ValueError(f"decimal odds must be > 1.0, got {odds}")
    if odds >= 2.0:
        return round((odds - 1.0) * 100.0, 2)
    return round(-100.0 / (odds - 1.0), 2)


# --------------------------------------------------------------------------
# margin
# --------------------------------------------------------------------------

def booksum(odds: Sequence[float]) -> float:
    """Sum of implied probabilities across a complete market. 1.0 = no margin."""
    if not odds:
        raise ValueError("empty market")
    return sum(decimal_to_prob(o) for o in odds)


def margin_pct(odds: Sequence[float]) -> float:
    """Bookmaker margin in percent. booksum 1.05 -> 5.0."""
    return (booksum(odds) - 1.0) * 100.0


# --------------------------------------------------------------------------
# de-vig methods
# --------------------------------------------------------------------------

def _multiplicative(raw: list[float]) -> list[float]:
    """Proportional scaling: p_i = pi_i / B. Removes margin evenly in relative
    terms, so it preserves the odds ratios the book quoted."""
    b = sum(raw)
    return [p / b for p in raw]


def _additive(raw: list[float]) -> list[float]:
    """Equal absolute share: p_i = pi_i - (B-1)/n. Can go negative on heavy
    favourites in a high-margin book; we clamp and renormalise if so."""
    n = len(raw)
    excess = (sum(raw) - 1.0) / n
    out = [p - excess for p in raw]
    if min(out) <= _EPS:
        out = [max(p, _EPS) for p in out]
        s = sum(out)
        out = [p / s for p in out]
    return out


def _solve_monotone(f, lo: float, hi: float, tol: float = 1e-12,
                    max_iter: int = 200) -> float:
    """Bisection on a function known to change sign on [lo, hi]."""
    f_lo, f_hi = f(lo), f(hi)
    if f_lo == 0:
        return lo
    if f_hi == 0:
        return hi
    if f_lo * f_hi > 0:
        # no sign change in the bracket; return the closer endpoint
        return lo if abs(f_lo) < abs(f_hi) else hi
    for _ in range(max_iter):
        mid = 0.5 * (lo + hi)
        f_mid = f(mid)
        if abs(f_mid) < tol or (hi - lo) < tol:
            return mid
        if f_lo * f_mid < 0:
            hi, f_hi = mid, f_mid
        else:
            lo, f_lo = mid, f_mid
    return 0.5 * (lo + hi)


def _power(raw: list[float]) -> list[float]:
    """Power method: p_i = pi_i ** k, k solved so the book sums to 1.

    k > 1 shrinks longshots harder than favourites, which is the direction the
    favourite-longshot literature says books actually load margin.
    """
    def excess(k: float) -> float:
        return sum(p ** k for p in raw) - 1.0

    k = _solve_monotone(excess, 0.2, 8.0)
    out = [p ** k for p in raw]
    s = sum(out)
    return [p / s for p in out]


def _odds_ratio(raw: list[float]) -> list[float]:
    """Cheung's odds-ratio method: the book's odds ratio is a constant multiple
    c of the true one, i.e. pi/(1-pi) = c * p/(1-p)."""
    def p_of(pi: float, c: float) -> float:
        return pi / (c + pi - c * pi)

    def excess(c: float) -> float:
        return sum(p_of(p, c) for p in raw) - 1.0

    c = _solve_monotone(excess, 1e-6, 100.0)
    out = [p_of(p, c) for p in raw]
    s = sum(out)
    return [p / s for p in out]


def _shin(raw: list[float]) -> list[float]:
    """Shin's method. Models the book as protecting itself against a fraction z
    of insider money; z is solved so the de-vigged book sums to 1.

    p_i = ( sqrt(z^2 + 4(1-z) * pi_i^2 / B) - z ) / (2(1-z))
    """
    b = sum(raw)

    def p_of(pi: float, z: float) -> float:
        inner = z * z + 4.0 * (1.0 - z) * (pi * pi) / b
        return (math.sqrt(max(inner, 0.0)) - z) / (2.0 * (1.0 - z))

    def excess(z: float) -> float:
        return sum(p_of(p, z) for p in raw) - 1.0

    z = _solve_monotone(excess, 1e-9, 0.9)
    out = [p_of(p, z) for p in raw]
    s = sum(out)
    return [p / s for p in out]


_METHODS = {
    "multiplicative": _multiplicative,
    "additive": _additive,
    "power": _power,
    "odds_ratio": _odds_ratio,
    "shin": _shin,
}


@dataclass(frozen=True)
class DevigResult:
    method: str
    odds: tuple[float, ...]
    raw_probs: tuple[float, ...]
    fair_probs: tuple[float, ...]
    booksum: float

    @property
    def margin_pct(self) -> float:
        return (self.booksum - 1.0) * 100.0

    @property
    def fair_odds(self) -> tuple[float, ...]:
        return tuple(prob_to_decimal(p) for p in self.fair_probs)


def devig(odds: Sequence[float], method: str = "power") -> DevigResult:
    """Strip the bookmaker margin from a COMPLETE market.

    `odds` must be every outcome of one market (1/X/2, or over/under, ...).
    Passing an incomplete market silently produces nonsense, so we refuse
    anything shorter than two outcomes.
    """
    if len(odds) < 2:
        raise ValueError(
            "de-vigging needs the complete market (>=2 outcomes); "
            f"got {len(odds)}"
        )
    if method not in _METHODS:
        raise ValueError(f"unknown method {method!r}; have {sorted(_METHODS)}")
    raw = [decimal_to_prob(o) for o in odds]
    b = sum(raw)
    if b <= 1.0:
        # No margin, or an arbitrage across books. Nothing to strip; normalise.
        fair = [p / b for p in raw]
    else:
        fair = _METHODS[method](raw)
    return DevigResult(
        method=method,
        odds=tuple(odds),
        raw_probs=tuple(raw),
        fair_probs=tuple(fair),
        booksum=b,
    )


@dataclass(frozen=True)
class DevigConsensus:
    """All methods at once, plus the spread between them.

    `spread_pp` is the largest disagreement, in percentage points, on any single
    outcome. A wide spread means the fair price genuinely is not knowable from
    this book's prices alone and the stake should shrink accordingly.
    """
    per_method: dict[str, tuple[float, ...]]
    consensus: tuple[float, ...]
    spread_pp: float
    booksum: float

    @property
    def margin_pct(self) -> float:
        return (self.booksum - 1.0) * 100.0


def devig_all(odds: Sequence[float],
              methods: Iterable[str] = ("multiplicative", "power",
                                        "odds_ratio", "shin")) -> DevigConsensus:
    """Run several de-vig methods and report the median plus the disagreement."""
    methods = list(methods)
    per = {m: devig(odds, m).fair_probs for m in methods}
    n = len(odds)
    consensus = []
    spread = 0.0
    for i in range(n):
        vals = sorted(per[m][i] for m in methods)
        mid = len(vals) // 2
        med = vals[mid] if len(vals) % 2 else 0.5 * (vals[mid - 1] + vals[mid])
        consensus.append(med)
        spread = max(spread, (vals[-1] - vals[0]) * 100.0)
    s = sum(consensus)
    consensus = [p / s for p in consensus]
    return DevigConsensus(
        per_method=per,
        consensus=tuple(consensus),
        spread_pp=spread,
        booksum=sum(decimal_to_prob(o) for o in odds),
    )
