"""Football scoring model: Dixon-Coles over a Poisson base.

Plain independent Poisson underrates draws and misprices the four lowest
scorelines. Dixon and Coles (1997) corrects exactly those four cells with a
single parameter rho and leaves the rest of the distribution alone, which is
why it remains the standard base model.

Team strengths are fitted by weighted maximum likelihood with exponential time
decay, so a match from eight months ago counts for less than one from last
week without being thrown away entirely.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Sequence

import numpy as np

__all__ = [
    "dc_tau",
    "score_matrix",
    "match_odds",
    "double_chance",
    "draw_no_bet",
    "total_probs",
    "asian_total",
    "asian_handicap",
    "btts",
    "team_total",
    "correct_score_top",
    "lambdas_from_ratings",
    "MatchResult",
    "DixonColesFit",
    "fit_dixon_coles",
]

MAX_GOALS = 12


# --------------------------------------------------------------------------
# core distribution
# --------------------------------------------------------------------------

def dc_tau(h: int, a: int, lh: float, la: float, rho: float) -> float:
    """Dixon-Coles low-score correction. Touches only 0-0, 0-1, 1-0, 1-1."""
    if h == 0 and a == 0:
        return 1.0 - lh * la * rho
    if h == 0 and a == 1:
        return 1.0 + lh * rho
    if h == 1 and a == 0:
        return 1.0 + la * rho
    if h == 1 and a == 1:
        return 1.0 - rho
    return 1.0


def score_matrix(lambda_home: float, lambda_away: float, rho: float = -0.05,
                 max_goals: int = MAX_GOALS) -> np.ndarray:
    """Joint distribution over scorelines. matrix[h, a] = P(home h, away a)."""
    if lambda_home <= 0 or lambda_away <= 0:
        raise ValueError("lambdas must be positive")
    h_idx = np.arange(max_goals + 1)
    # Poisson pmf without scipy, so the module stays importable anywhere.
    log_fact = np.cumsum(np.concatenate([[0.0], np.log(np.arange(1, max_goals + 1))]))
    ph = np.exp(-lambda_home + h_idx * math.log(lambda_home) - log_fact)
    pa = np.exp(-lambda_away + h_idx * math.log(lambda_away) - log_fact)
    m = np.outer(ph, pa)
    for h in range(min(2, max_goals + 1)):
        for a in range(min(2, max_goals + 1)):
            m[h, a] *= dc_tau(h, a, lambda_home, lambda_away, rho)
    total = m.sum()
    if total <= 0:
        raise ValueError("degenerate score matrix")
    return m / total


# --------------------------------------------------------------------------
# markets derived from the matrix
# --------------------------------------------------------------------------

def match_odds(m: np.ndarray) -> dict[str, float]:
    """1 / X / 2 in regulation (90 minutes)."""
    home = float(np.tril(m, -1).sum())
    draw = float(np.trace(m))
    away = float(np.triu(m, 1).sum())
    return {"home": home, "draw": draw, "away": away}


def double_chance(m: np.ndarray) -> dict[str, float]:
    o = match_odds(m)
    return {
        "1X": o["home"] + o["draw"],
        "12": o["home"] + o["away"],
        "X2": o["draw"] + o["away"],
    }


def draw_no_bet(m: np.ndarray) -> dict[str, float]:
    """DNB / handicap 0: the draw is refunded, so renormalise over it."""
    o = match_odds(m)
    live = o["home"] + o["away"]
    if live <= 0:
        raise ValueError("degenerate market")
    return {"home": o["home"] / live, "away": o["away"] / live,
            "push": o["draw"]}


def _totals_grid(m: np.ndarray) -> np.ndarray:
    """P(total goals == k) for k = 0 .. 2*max_goals."""
    n = m.shape[0]
    out = np.zeros(2 * (n - 1) + 1)
    for h in range(n):
        for a in range(n):
            out[h + a] += m[h, a]
    return out


def total_probs(m: np.ndarray, line: float) -> dict[str, float]:
    """Over / under / push for a whole or half line (2.5, 3.0, ...)."""
    grid = _totals_grid(m)
    ks = np.arange(len(grid))
    over = float(grid[ks > line].sum())
    under = float(grid[ks < line].sum())
    push = float(grid[ks == line].sum()) if float(line).is_integer() else 0.0
    return {"over": over, "under": under, "push": push}


def _quarter_split(line: float) -> tuple[float, float] | None:
    """A .25 or .75 line is two half-stakes on the neighbouring lines."""
    frac = round(line - math.floor(line), 2)
    if frac in (0.25, 0.75):
        return (line - 0.25, line + 0.25)
    return None


def asian_total(m: np.ndarray, line: float, side: str,
                odds: float) -> dict[str, float]:
    """EV and effective probability of an asian total, quarter lines included.

    Returns `ev` per unit staked and `p_eff`, the probability that would give
    the same EV at this price if the bet had no push or half-loss branches.
    """
    side = side.lower()
    if side not in ("over", "under"):
        raise ValueError("side must be 'over' or 'under'")

    parts = _quarter_split(line)
    if parts is not None:
        a = asian_total(m, parts[0], side, odds)
        b = asian_total(m, parts[1], side, odds)
        ev = 0.5 * (a["ev"] + b["ev"])
        return {"ev": ev, "p_eff": (ev + 1.0) / odds}

    p = total_probs(m, line)
    win, lose, push = p[side], p["under" if side == "over" else "over"], p["push"]
    ev = win * (odds - 1.0) - lose * 1.0 + push * 0.0
    return {"ev": ev, "p_eff": (ev + 1.0) / odds, "win": win,
            "push": push, "lose": lose}


def asian_handicap(m: np.ndarray, line: float, side: str,
                   odds: float) -> dict[str, float]:
    """EV of an asian handicap on `side` ('home' or 'away').

    `line` is stated from the perspective of `side`: -0.5 means that side gives
    half a goal. Quarter lines split into two half-stakes.
    """
    side = side.lower()
    if side not in ("home", "away"):
        raise ValueError("side must be 'home' or 'away'")

    parts = _quarter_split(line)
    if parts is not None:
        a = asian_handicap(m, parts[0], side, odds)
        b = asian_handicap(m, parts[1], side, odds)
        ev = 0.5 * (a["ev"] + b["ev"])
        return {"ev": ev, "p_eff": (ev + 1.0) / odds}

    n = m.shape[0]
    win = lose = push = 0.0
    for h in range(n):
        for a in range(n):
            diff = (h - a) if side == "home" else (a - h)
            adj = diff + line
            if adj > 0:
                win += m[h, a]
            elif adj < 0:
                lose += m[h, a]
            else:
                push += m[h, a]
    ev = win * (odds - 1.0) - lose
    return {"ev": float(ev), "p_eff": float((ev + 1.0) / odds),
            "win": float(win), "push": float(push), "lose": float(lose)}


def btts(m: np.ndarray) -> dict[str, float]:
    yes = float(m[1:, 1:].sum())
    return {"yes": yes, "no": 1.0 - yes}


def team_total(m: np.ndarray, team: str, line: float) -> dict[str, float]:
    """Individual total for 'home' or 'away'."""
    team = team.lower()
    axis = 1 if team == "home" else 0
    marg = m.sum(axis=axis)
    ks = np.arange(len(marg))
    over = float(marg[ks > line].sum())
    under = float(marg[ks < line].sum())
    push = float(marg[ks == line].sum()) if float(line).is_integer() else 0.0
    return {"over": over, "under": under, "push": push}


def correct_score_top(m: np.ndarray, n: int = 8) -> list[tuple[str, float]]:
    flat = [(f"{h}:{a}", float(m[h, a]))
            for h in range(m.shape[0]) for a in range(m.shape[1])]
    flat.sort(key=lambda kv: kv[1], reverse=True)
    return flat[:n]


# --------------------------------------------------------------------------
# strengths
# --------------------------------------------------------------------------

def lambdas_from_ratings(att_home: float, def_home: float,
                         att_away: float, def_away: float,
                         home_advantage: float,
                         league_avg_goals: float) -> tuple[float, float]:
    """Expected goals for each side from log-scale attack/defence ratings."""
    base = league_avg_goals / 2.0
    lh = base * math.exp(att_home + def_away + home_advantage)
    la = base * math.exp(att_away + def_home)
    return lh, la


@dataclass(frozen=True)
class MatchResult:
    """One historical match. `home_goals`/`away_goals` may be xG instead of
    goals; the likelihood treats them the same, and xG is the better input
    because it is a larger effective sample per match."""
    home: str
    away: str
    home_goals: float
    away_goals: float
    days_ago: float = 0.0


@dataclass
class DixonColesFit:
    teams: list[str]
    attack: dict[str, float]
    defence: dict[str, float]
    home_advantage: float
    rho: float
    league_avg_goals: float
    n_matches: int
    converged: bool
    log_likelihood: float

    def lambdas(self, home: str, away: str) -> tuple[float, float]:
        if home not in self.attack or away not in self.attack:
            raise KeyError(f"unknown team: {home!r} or {away!r}")
        return lambdas_from_ratings(
            self.attack[home], self.defence[home],
            self.attack[away], self.defence[away],
            self.home_advantage, self.league_avg_goals,
        )

    def matrix(self, home: str, away: str, max_goals: int = MAX_GOALS) -> np.ndarray:
        lh, la = self.lambdas(home, away)
        return score_matrix(lh, la, self.rho, max_goals)


def _time_weight(days_ago: float, half_life_days: float) -> float:
    if half_life_days <= 0:
        return 1.0
    return 0.5 ** (days_ago / half_life_days)


def fit_dixon_coles(matches: Sequence[MatchResult],
                    half_life_days: float = 120.0,
                    max_iter: int = 400) -> DixonColesFit:
    """Fit attack/defence/home-advantage/rho by weighted maximum likelihood.

    Needs scipy. Ratings are identified by constraining mean attack to 0.
    """
    from scipy.optimize import minimize
    from scipy.stats import poisson

    if not matches:
        raise ValueError("no matches to fit")

    teams = sorted({m.home for m in matches} | {m.away for m in matches})
    idx = {t: i for i, t in enumerate(teams)}
    n = len(teams)

    weights = np.array([_time_weight(m.days_ago, half_life_days) for m in matches])
    hg = np.array([m.home_goals for m in matches], dtype=float)
    ag = np.array([m.away_goals for m in matches], dtype=float)
    hi = np.array([idx[m.home] for m in matches])
    ai = np.array([idx[m.away] for m in matches])
    league_avg = float((hg.sum() + ag.sum()) / len(matches))

    # params: attack[0..n-1], defence[0..n-1], home_adv, rho
    x0 = np.concatenate([np.zeros(n), np.zeros(n), [0.25], [-0.05]])

    # Only whole-goal cells get the tau correction; with xG inputs the counts
    # are not integers, so we apply tau on the rounded cell.
    def neg_ll(x: np.ndarray) -> float:
        att = x[:n] - x[:n].mean()
        dfn = x[n:2 * n]
        hadv, rho = x[2 * n], x[2 * n + 1]
        base = league_avg / 2.0
        lh = base * np.exp(att[hi] + dfn[ai] + hadv)
        la = base * np.exp(att[ai] + dfn[hi])
        lh = np.clip(lh, 1e-6, 20.0)
        la = np.clip(la, 1e-6, 20.0)
        ll = poisson.logpmf(np.round(hg), lh) + poisson.logpmf(np.round(ag), la)
        tau = np.ones_like(ll)
        low = (hg < 2) & (ag < 2)
        for k in np.flatnonzero(low):
            tau[k] = dc_tau(int(round(hg[k])), int(round(ag[k])),
                            float(lh[k]), float(la[k]), float(rho))
        tau = np.clip(tau, 1e-9, None)
        ll = ll + np.log(tau)
        return -float((weights * ll).sum())

    bounds = [(-3.0, 3.0)] * (2 * n) + [(-1.0, 1.5), (-0.4, 0.4)]
    res = minimize(neg_ll, x0, method="L-BFGS-B", bounds=bounds,
                   options={"maxiter": max_iter})

    att = res.x[:n] - res.x[:n].mean()
    dfn = res.x[n:2 * n]
    return DixonColesFit(
        teams=teams,
        attack={t: float(att[idx[t]]) for t in teams},
        defence={t: float(dfn[idx[t]]) for t in teams},
        home_advantage=float(res.x[2 * n]),
        rho=float(res.x[2 * n + 1]),
        league_avg_goals=league_avg,
        n_matches=len(matches),
        converged=bool(res.success),
        log_likelihood=-float(res.fun),
    )


# --------------------------------------------------------------------------
# calibration to a bookmaker's own prices
# --------------------------------------------------------------------------

@dataclass(frozen=True)
class MarketFit:
    """Lambdas implied by a book's own 1X2 and total, plus how well they fit.

    `converged` is the part that matters. When a single Dixon-Coles pair cannot
    reproduce the prices the book actually posted, every further number derived
    from this fit is meaningless — and the residual will masquerade as an edge
    on whatever market you check next. Refusing to return a verdict is the
    correct behaviour, not a limitation.
    """
    lambda_home: float
    lambda_away: float
    rho: float
    rms_error: float
    converged: bool

    def matrix(self, max_goals: int = MAX_GOALS) -> np.ndarray:
        if not self.converged:
            raise ValueError(
                f"fit did not converge (rms {self.rms_error:.5f}); "
                "any market derived from it would be noise, not an edge"
            )
        return score_matrix(self.lambda_home, self.lambda_away, self.rho, max_goals)


# A fit worse than this cannot reproduce the book's own prices, so anything
# derived from it is the model's error rather than the book's.
FIT_TOLERANCE = 0.004


def calibrate_to_market(p_home: float, p_draw: float, p_away: float,
                        p_over: float, total_line: float,
                        tolerance: float = FIT_TOLERANCE) -> MarketFit:
    """Solve for the lambdas that reproduce a book's de-vigged 1X2 and total.

    Use this to ask whether a book's *other* markets agree with its main ones.
    Always check `converged` before trusting the answer: on 2026-09-18 the three
    largest apparent BTTS mispricings in a 21-match Fonbet sample were all
    matches where this fit failed, and none of them were real.
    """
    from scipy.optimize import minimize

    target = np.array([p_home, p_draw, p_away, p_over])

    def loss(x: np.ndarray) -> float:
        lh, la = math.exp(x[0]), math.exp(x[1])
        rho = math.tanh(x[2]) * 0.2
        m = score_matrix(lh, la, rho)
        o = match_odds(m)
        t = total_probs(m, total_line)
        got = np.array([o["home"], o["draw"], o["away"], t["over"]])
        return float(((got - target) ** 2).sum())

    res = minimize(loss, [0.2, 0.0, -0.25], method="Nelder-Mead",
                   options={"maxiter": 4000, "xatol": 1e-9, "fatol": 1e-12})
    rms = math.sqrt(max(res.fun, 0.0) / len(target))
    return MarketFit(
        lambda_home=math.exp(res.x[0]),
        lambda_away=math.exp(res.x[1]),
        rho=math.tanh(res.x[2]) * 0.2,
        rms_error=rms,
        converged=rms <= tolerance,
    )
