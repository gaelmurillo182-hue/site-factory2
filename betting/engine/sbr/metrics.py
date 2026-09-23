"""Performance metrics on the journal.

The headline number is not win rate. Win rate is a function of the odds you
bet, so a 70% strike rate at 1.30 and a 40% strike rate at 3.00 can be the same
edge. What matters is whether the probabilities were right (Brier, calibration)
and whether the price beat the close (CLV).
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Sequence

__all__ = [
    "clv_pct",
    "summarise",
    "calibration_table",
    "brier",
    "max_drawdown",
    "segment",
    "Summary",
]

# Probability buckets used for the calibration table.
BUCKETS = [(0.0, 0.50), (0.50, 0.55), (0.55, 0.60),
           (0.60, 0.65), (0.65, 0.70), (0.70, 1.01)]

WIN_VALUE = {"won": 1.0, "half_won": 1.0, "lost": 0.0, "half_lost": 0.0}


def clv_pct(odds_taken: float, closing_odds: float) -> float:
    """Closing line value in percent.

    Positive means the price shortened after the bet was struck, i.e. the
    market moved toward the opinion. Over a few hundred bets this tracks real
    edge far more closely than the win/loss column does.
    """
    if odds_taken <= 1.0 or closing_odds <= 1.0:
        raise ValueError("both prices must be > 1.0")
    return (odds_taken / closing_odds - 1.0) * 100.0


def max_drawdown(profits: Sequence[float]) -> tuple[float, int, int]:
    """Largest peak-to-trough fall of the cumulative P&L curve.

    Returns (drawdown, peak_index, trough_index). Drawdown is a negative
    number in the same currency as the profits.
    """
    if not profits:
        return 0.0, 0, 0
    cum = 0.0
    peak = 0.0
    peak_i = trough_i = 0
    best_peak_i = 0
    worst = 0.0
    out = (0, 0)
    for i, p in enumerate(profits):
        cum += p
        if cum > peak:
            peak, peak_i = cum, i
        dd = cum - peak
        if dd < worst:
            worst, out = dd, (peak_i, i)
    return round(worst, 2), out[0], out[1]


def brier(pairs: Sequence[tuple[float, float]]) -> float | None:
    """Mean squared error of the probability forecasts. Lower is better.

    `pairs` is (forecast_probability, outcome in {0,1}).
    """
    pairs = [(p, o) for p, o in pairs if p is not None]
    if not pairs:
        return None
    return round(sum((p - o) ** 2 for p, o in pairs) / len(pairs), 4)


def calibration_table(pairs: Sequence[tuple[float, float]]) -> list[dict]:
    """Predicted probability against the rate that actually happened.

    A well-calibrated model puts roughly 60 winners in every 100 bets it
    graded at 60%. The `n` column matters: a bucket with eight bets in it says
    nothing at all.
    """
    out = []
    for lo, hi in BUCKETS:
        sel = [(p, o) for p, o in pairs if p is not None and lo <= p < hi]
        if not sel:
            out.append({"bucket": f"{lo:.0%}-{hi:.0%}", "n": 0,
                        "predicted": None, "actual": None, "gap_pp": None})
            continue
        pred = sum(p for p, _ in sel) / len(sel)
        act = sum(o for _, o in sel) / len(sel)
        out.append({
            "bucket": f"{lo:.0%}-{hi:.0%}",
            "n": len(sel),
            "predicted": round(pred, 4),
            "actual": round(act, 4),
            "gap_pp": round((act - pred) * 100, 2),
        })
    return out


@dataclass
class Summary:
    bets: int = 0
    wins: int = 0
    losses: int = 0
    pushes: int = 0
    turnover: float = 0.0
    profit: float = 0.0
    roi_pct: float | None = None
    win_rate_pct: float | None = None
    avg_odds: float | None = None
    clv_measured: int = 0
    avg_clv_pct: float | None = None
    positive_clv_pct: float | None = None
    brier: float | None = None
    max_drawdown: float = 0.0
    open_bets: int = 0

    def to_dict(self) -> dict:
        return {k: v for k, v in self.__dict__.items()}


def _is_settled(row) -> bool:
    return row["status"] not in (None, "open")


def summarise(rows: Sequence) -> Summary:
    """Aggregate a set of journal rows (sqlite3.Row or dicts)."""
    def g(r, k):
        try:
            return r[k]
        except (KeyError, IndexError):
            return None

    s = Summary()
    settled = [r for r in rows if _is_settled(r)]
    s.open_bets = len(rows) - len(settled)
    if not settled:
        return s

    s.bets = len(settled)
    s.wins = sum(1 for r in settled if g(r, "status") in ("won", "half_won"))
    s.losses = sum(1 for r in settled if g(r, "status") in ("lost", "half_lost"))
    s.pushes = sum(1 for r in settled if g(r, "status") in ("push", "void"))
    s.turnover = round(sum(g(r, "stake") or 0.0 for r in settled), 2)
    s.profit = round(sum(g(r, "profit") or 0.0 for r in settled), 2)
    if s.turnover > 0:
        s.roi_pct = round(s.profit / s.turnover * 100, 2)

    decided = s.wins + s.losses
    if decided:
        s.win_rate_pct = round(s.wins / decided * 100, 2)
    odds = [g(r, "odds_taken") for r in settled if g(r, "odds_taken")]
    if odds:
        s.avg_odds = round(sum(odds) / len(odds), 3)

    clvs = [clv_pct(g(r, "odds_taken"), g(r, "closing_odds"))
            for r in settled
            if g(r, "odds_taken") and g(r, "closing_odds")]
    s.clv_measured = len(clvs)
    if clvs:
        s.avg_clv_pct = round(sum(clvs) / len(clvs), 2)
        s.positive_clv_pct = round(
            sum(1 for c in clvs if c > 0) / len(clvs) * 100, 1)

    pairs = [(g(r, "p_model"), WIN_VALUE[g(r, "status")])
             for r in settled
             if g(r, "p_model") is not None and g(r, "status") in WIN_VALUE]
    s.brier = brier(pairs)
    s.max_drawdown = max_drawdown([g(r, "profit") or 0.0 for r in settled])[0]
    return s


def segment(rows: Sequence, key: str) -> dict[str, Summary]:
    """Break performance down by any journal column: sport, market, tier,
    reason code, odds band. Segments with a handful of bets are noise and are
    labelled as such by their `bets` count, not hidden."""
    def g(r, k):
        try:
            return r[k]
        except (KeyError, IndexError):
            return None

    groups: dict[str, list] = {}
    for r in rows:
        if key == "odds_band":
            o = g(r, "odds_taken") or 0
            label = ("1.30-1.60" if o <= 1.60 else
                     "1.61-1.90" if o <= 1.90 else
                     "1.91-2.20" if o <= 2.20 else "2.21+")
        else:
            label = str(g(r, key))
        groups.setdefault(label, []).append(r)
    return {k: summarise(v) for k, v in sorted(groups.items())}
