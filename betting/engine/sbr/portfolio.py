"""Turning a list of graded candidates into an actual betting card.

Two constraints do the work:

  - a session cap, so one night can never cost more than a fixed slice of the
    bank however many good bets appear;
  - a per-cluster cap, because bets that win and lose together are one bet
    wearing several names. Team ML, team -1.5, team individual total over and
    match over all cash on the same script.

When the caps bind, exposure is cut from the weakest candidate upward, so the
best bet keeps its size.
"""

from __future__ import annotations

from dataclasses import dataclass, field

__all__ = ["BankrollConfig", "Candidate", "Allocation", "build_card"]


@dataclass(frozen=True)
class BankrollConfig:
    bankroll: float = 100_000.0
    unit: float = 1_000.0             # 1% of bank
    max_session_units: float = 5.0    # total risk for one day/night, ALL bets
    max_cluster_units: float = 2.0    # correlated group cap
    max_single_units: float = 1.5     # A-tier ceiling
    reserve_units: float = 1.5        # held back for live / confirmed lineups

    def __post_init__(self) -> None:
        if self.unit <= 0 or self.bankroll <= 0:
            raise ValueError("bankroll and unit must be positive")
        if self.reserve_units >= self.max_session_units:
            raise ValueError("reserve cannot swallow the whole session budget")

    @property
    def deployable_units(self) -> float:
        """What pre-match may actually use once the reserve is set aside."""
        return self.max_session_units - self.reserve_units

    def money(self, units: float) -> float:
        return round(units * self.unit, 2)

    @property
    def unit_pct(self) -> float:
        return self.unit / self.bankroll * 100.0


@dataclass
class Candidate:
    """One graded selection ready for sizing."""
    ref: str                 # e.g. "A1" or a match+market key
    match: str
    market: str
    odds: float
    p_model: float
    p_market: float
    edge_pp: float
    ev: float
    tier: str                # "A-TIER" / "B-TIER"
    confidence: float
    data_quality: float
    requested_units: float
    cluster: str             # bets sharing a cluster share a fate
    volatile: bool = False
    reason_codes: list[str] = field(default_factory=list)
    min_odds: float = 0.0

    def sort_key(self) -> tuple:
        # Best first: A before B, then confidence, then edge.
        return (0 if self.tier == "A-TIER" else 1, -self.confidence, -self.edge_pp)


@dataclass
class Allocation:
    candidate: Candidate
    units: float
    stake: float
    trimmed_by: list[str] = field(default_factory=list)

    def to_row(self) -> dict:
        return {
            "ref": self.candidate.ref,
            "match": self.candidate.match,
            "market": self.candidate.market,
            "odds": self.candidate.odds,
            "min_odds": round(self.candidate.min_odds, 2),
            "tier": self.candidate.tier,
            "units": round(self.units, 2),
            "stake": round(self.stake, 0),
            "edge_pp": round(self.candidate.edge_pp, 2),
            "ev_pct": round(self.candidate.ev * 100, 2),
            "trimmed_by": ",".join(self.trimmed_by) or "-",
        }


def _tier_ceiling(c: Candidate, cfg: BankrollConfig) -> tuple[float, str | None]:
    if c.volatile:
        return 0.5, "volatile_market"
    if c.tier == "A-TIER":
        return cfg.max_single_units, "max_single"
    return 1.0, "b_tier_cap"


def build_card(candidates: list[Candidate],
               cfg: BankrollConfig | None = None) -> tuple[list[Allocation], dict]:
    """Size every candidate under the session and cluster caps.

    Returns the allocations (zero-unit ones dropped) and a summary dict.
    """
    cfg = cfg or BankrollConfig()
    ordered = sorted(candidates, key=Candidate.sort_key)

    used_total = 0.0
    used_cluster: dict[str, float] = {}
    out: list[Allocation] = []

    for c in ordered:
        trimmed: list[str] = []
        units = max(c.requested_units, 0.0)

        ceiling, ceiling_name = _tier_ceiling(c, cfg)
        if units > ceiling:
            units = ceiling
            trimmed.append(ceiling_name or "tier_cap")

        room_cluster = cfg.max_cluster_units - used_cluster.get(c.cluster, 0.0)
        if units > room_cluster:
            units = max(room_cluster, 0.0)
            trimmed.append("cluster_cap")

        room_session = cfg.deployable_units - used_total
        if units > room_session:
            units = max(room_session, 0.0)
            trimmed.append("session_cap")

        # Round to quarter units: the book takes whole roubles and a stake of
        # 0.37U is false precision.
        units = round(units * 4) / 4
        if units < 0.25:
            continue

        used_total += units
        used_cluster[c.cluster] = used_cluster.get(c.cluster, 0.0) + units
        out.append(Allocation(c, units, cfg.money(units), trimmed))

    summary = {
        "bets": len(out),
        "total_units": round(used_total, 2),
        "total_stake": cfg.money(used_total),
        "bank_exposure_pct": round(used_total * cfg.unit / cfg.bankroll * 100, 2),
        "session_cap_units": cfg.max_session_units,
        "deployable_units": cfg.deployable_units,
        "reserve_units": cfg.reserve_units,
        "reserve_stake": cfg.money(cfg.reserve_units),
        "unused_units": round(cfg.deployable_units - used_total, 2),
        "per_cluster_units": {k: round(v, 2) for k, v in used_cluster.items()},
        "expected_profit": round(
            sum(a.stake * a.candidate.ev for a in out), 2),
    }
    return out, summary
