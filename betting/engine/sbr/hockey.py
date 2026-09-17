"""Hockey scoring model, with regulation and OT/SO kept strictly separate.

The single most common way to lose money on a hockey card is to price a
"regulation winner" bet as if it were a moneyline, or the reverse. This module
never lets the two blur: `regulation_1x2` stops at 60 minutes, and everything
that includes overtime goes through `moneyline`, which adds the extra period
explicitly.

NHL/KHL rules encoded here:
  - a game tied after 60 minutes is decided in OT or a shootout;
  - the winner of that is credited with exactly one extra goal, so a 2-2 game
    settles as 3-2 for totals and puckline purposes.
"""

from __future__ import annotations

import math
from dataclasses import dataclass

import numpy as np

__all__ = [
    "reg_score_matrix",
    "regulation_1x2",
    "moneyline",
    "puckline",
    "total_probs_incl_ot",
    "total_probs_regulation",
    "team_total_incl_ot",
    "both_teams_to_score",
    "ot_win_probability",
    "adjust_lambda_for_goalie",
    "HockeyMarkets",
    "price_all",
]

MAX_GOALS = 15
# Extra time is close to a coin flip even between mismatched teams: 3-on-3 and
# the shootout compress skill differences. We therefore shrink any rating-based
# estimate hard toward 0.5.
OT_SHRINK = 0.35


def _poisson_pmf(lam: float, n: int) -> np.ndarray:
    k = np.arange(n + 1)
    log_fact = np.cumsum(np.concatenate([[0.0], np.log(np.arange(1, n + 1))]))
    return np.exp(-lam + k * math.log(lam) - log_fact)


def reg_score_matrix(lambda_home: float, lambda_away: float,
                     max_goals: int = MAX_GOALS) -> np.ndarray:
    """Joint distribution of REGULATION-TIME goals. matrix[h, a]."""
    if lambda_home <= 0 or lambda_away <= 0:
        raise ValueError("lambdas must be positive")
    m = np.outer(_poisson_pmf(lambda_home, max_goals),
                 _poisson_pmf(lambda_away, max_goals))
    return m / m.sum()


def ot_win_probability(lambda_home: float, lambda_away: float,
                       shrink: float = OT_SHRINK) -> float:
    """P(home wins in OT or the shootout | tied after 60).

    Derived from the strength ratio, then pulled toward 0.5 by `shrink`.
    A shrink of 0.35 means only 35% of the rating-implied deviation survives.
    """
    raw = lambda_home / (lambda_home + lambda_away)
    return 0.5 + shrink * (raw - 0.5)


def adjust_lambda_for_goalie(lambda_against: float, gsax_per60: float) -> float:
    """Shift goals-against by a starter's goals-saved-above-expected per 60.

    A goalie running +0.4 GSAx/60 removes 0.4 goals from the opponent's
    expected total. Clamped so a hot streak cannot drive the rate to zero.
    """
    return max(lambda_against - gsax_per60, 0.15)


# --------------------------------------------------------------------------
# markets
# --------------------------------------------------------------------------

def regulation_1x2(m: np.ndarray) -> dict[str, float]:
    """Three-way regulation result: 60 minutes only. NOT the moneyline."""
    return {
        "home": float(np.tril(m, -1).sum()),
        "tie": float(np.trace(m)),
        "away": float(np.triu(m, 1).sum()),
    }


def moneyline(m: np.ndarray, p_home_ot: float) -> dict[str, float]:
    """Winner including OT/SO. This is what a hockey 'ML' or 'Победа' usually is."""
    r = regulation_1x2(m)
    home = r["home"] + r["tie"] * p_home_ot
    return {"home": home, "away": 1.0 - home}


def _incl_ot_totals_grid(m: np.ndarray) -> np.ndarray:
    """P(total goals == k) counting the OT/SO decider as one goal."""
    n = m.shape[0]
    grid = np.zeros(2 * (n - 1) + 2)
    for h in range(n):
        for a in range(n):
            t = h + a
            grid[t + 1 if h == a else t] += m[h, a]
    return grid


def total_probs_regulation(m: np.ndarray, line: float) -> dict[str, float]:
    n = m.shape[0]
    grid = np.zeros(2 * (n - 1) + 1)
    for h in range(n):
        for a in range(n):
            grid[h + a] += m[h, a]
    ks = np.arange(len(grid))
    return {
        "over": float(grid[ks > line].sum()),
        "under": float(grid[ks < line].sum()),
        "push": float(grid[ks == line].sum()) if float(line).is_integer() else 0.0,
    }


def total_probs_incl_ot(m: np.ndarray, line: float) -> dict[str, float]:
    grid = _incl_ot_totals_grid(m)
    ks = np.arange(len(grid))
    return {
        "over": float(grid[ks > line].sum()),
        "under": float(grid[ks < line].sum()),
        "push": float(grid[ks == line].sum()) if float(line).is_integer() else 0.0,
    }


def puckline(m: np.ndarray, p_home_ot: float, line: float = -1.5,
             side: str = "home") -> dict[str, float]:
    """Puckline including OT/SO, with the decider counted as one goal.

    `line` is from the perspective of `side`: -1.5 means that side gives 1.5.
    """
    side = side.lower()
    if side not in ("home", "away"):
        raise ValueError("side must be 'home' or 'away'")
    n = m.shape[0]
    win = lose = push = 0.0
    for h in range(n):
        for a in range(n):
            p = m[h, a]
            if h == a:
                # settle the tie both ways, weighted by who wins extra time
                for hh, aa, w in ((h + 1, a, p_home_ot), (h, a + 1, 1.0 - p_home_ot)):
                    diff = (hh - aa) if side == "home" else (aa - hh)
                    adj = diff + line
                    if adj > 0:
                        win += p * w
                    elif adj < 0:
                        lose += p * w
                    else:
                        push += p * w
            else:
                diff = (h - a) if side == "home" else (a - h)
                adj = diff + line
                if adj > 0:
                    win += p
                elif adj < 0:
                    lose += p
                else:
                    push += p
    return {"win": float(win), "push": float(push), "lose": float(lose)}


def team_total_incl_ot(m: np.ndarray, p_home_ot: float, team: str,
                       line: float) -> dict[str, float]:
    team = team.lower()
    n = m.shape[0]
    grid = np.zeros(n + 1)
    for h in range(n):
        for a in range(n):
            p = m[h, a]
            if h == a:
                gh, ga = h + p_home_ot, a + (1.0 - p_home_ot)
                # split the mass rather than the goal count
                if team == "home":
                    grid[h + 1] += p * p_home_ot
                    grid[h] += p * (1.0 - p_home_ot)
                else:
                    grid[a + 1] += p * (1.0 - p_home_ot)
                    grid[a] += p * p_home_ot
            else:
                grid[h if team == "home" else a] += p
    ks = np.arange(len(grid))
    return {
        "over": float(grid[ks > line].sum()),
        "under": float(grid[ks < line].sum()),
        "push": float(grid[ks == line].sum()) if float(line).is_integer() else 0.0,
    }


def both_teams_to_score(m: np.ndarray) -> dict[str, float]:
    yes = float(m[1:, 1:].sum())
    return {"yes": yes, "no": 1.0 - yes}


@dataclass
class HockeyMarkets:
    lambda_home: float
    lambda_away: float
    p_home_ot: float
    matrix: np.ndarray

    def as_dict(self) -> dict:
        m, p = self.matrix, self.p_home_ot
        return {
            "regulation_1x2": regulation_1x2(m),
            "moneyline_incl_ot": moneyline(m, p),
            "total_5.5_incl_ot": total_probs_incl_ot(m, 5.5),
            "total_6.5_incl_ot": total_probs_incl_ot(m, 6.5),
            "total_5.5_regulation": total_probs_regulation(m, 5.5),
            "puckline_home_-1.5": puckline(m, p, -1.5, "home"),
            "puckline_away_+1.5": puckline(m, p, 1.5, "away"),
            "btts": both_teams_to_score(m),
        }


def price_all(lambda_home: float, lambda_away: float,
              ot_shrink: float = OT_SHRINK) -> HockeyMarkets:
    m = reg_score_matrix(lambda_home, lambda_away)
    p_ot = ot_win_probability(lambda_home, lambda_away, ot_shrink)
    return HockeyMarkets(lambda_home, lambda_away, p_ot, m)
