"""The scan pipeline: line in, betting card out.

Order of operations is fixed and every stage is recorded, so a bet on the card
can always be traced back through sizing, classification, the edge, the model
probability and the de-vigged market probability to the price that was pasted.

    parse -> de-vig -> model -> edge -> gates -> confidence -> size -> card
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from . import football, hockey
from .odds import devig_all
from .portfolio import BankrollConfig, Candidate, build_card
from .report import RejectRow, ScanReport, ValueRow, WaitRow
from .scoring import (Confidence, DataQuality, Decision, Tier, Verdict,
                      classify, market_class_of)
from .value import MIN_EDGE_PP, expected_value, min_acceptable_odds, size_bet

__all__ = ["run_scan", "load_scan_input", "MODEL_VERSION"]

MODEL_VERSION = "V5.0"

# Which side of a market a price sits on, for grouping correlated bets.
_DIRECTION = {
    "home": "home", "away": "away", "draw": "draw",
    "over": "over", "under": "under", "yes": "over", "no": "under",
}


def load_scan_input(path: str | Path) -> dict:
    with Path(path).open(encoding="utf-8") as fh:
        return json.load(fh)


# --------------------------------------------------------------------------
# model probabilities per market
# --------------------------------------------------------------------------

def _football_probs(cfg: dict, market: dict) -> dict[str, float] | None:
    m = football.score_matrix(cfg["lambda_home"], cfg["lambda_away"],
                              cfg.get("rho", -0.05))
    key, line = market["key"], market.get("line")
    if key == "moneyline":
        return football.match_odds(m)
    if key == "dnb":
        d = football.draw_no_bet(m)
        return {"home": d["home"], "away": d["away"]}
    if key == "double_chance":
        return football.double_chance(m)
    if key == "total":
        t = football.total_probs(m, line)
        return {"over": t["over"], "under": t["under"]} if not t["push"] else None
    if key == "btts":
        return football.btts(m)
    if key in ("team_total_home", "team_total_away"):
        side = "home" if key.endswith("home") else "away"
        t = football.team_total(m, side, line)
        return {"over": t["over"], "under": t["under"]} if not t["push"] else None
    return None


def _hockey_probs(cfg: dict, market: dict) -> dict[str, float] | None:
    hm = hockey.price_all(cfg["lambda_home"], cfg["lambda_away"],
                          cfg.get("ot_shrink", hockey.OT_SHRINK))
    m, p_ot = hm.matrix, hm.p_home_ot
    key, line = market["key"], market.get("line")
    if key == "moneyline":
        # In hockey a three-way price is a REGULATION market; a two-way price
        # is the moneyline including OT/SO. Confusing them is the classic
        # hockey mistake, so we branch on how many outcomes were priced.
        if len(market["odds"]) == 3:
            return hockey.regulation_1x2(m)
        return hockey.moneyline(m, p_ot)
    if key == "regulation_winner":
        r = hockey.regulation_1x2(m)
        return {"home": r["home"], "away": r["away"], "tie": r["tie"]}
    if key == "total":
        t = hockey.total_probs_incl_ot(m, line)
        return {"over": t["over"], "under": t["under"]} if not t["push"] else None
    if key == "total_regulation":
        t = hockey.total_probs_regulation(m, line)
        return {"over": t["over"], "under": t["under"]} if not t["push"] else None
    if key == "btts":
        return hockey.both_teams_to_score(m)
    if key in ("team_total_home", "team_total_away"):
        side = "home" if key.endswith("home") else "away"
        t = hockey.team_total_incl_ot(m, p_ot, side, line)
        return {"over": t["over"], "under": t["under"]} if not t["push"] else None
    return None


def _model_probs(sport: str, cfg: dict, market: dict) -> dict[str, float] | None:
    if sport == "football":
        return _football_probs(cfg, market)
    if sport == "hockey":
        return _hockey_probs(cfg, market)
    # Any other sport is priced from explicit probabilities supplied in the
    # input; the engine will not invent a scoring model it does not have.
    return market.get("model_probs")


# --------------------------------------------------------------------------
# main
# --------------------------------------------------------------------------

def run_scan(data: dict) -> tuple[ScanReport, list[dict]]:
    """Run the full pipeline. Returns the report and every graded candidate."""
    bank = BankrollConfig(
        bankroll=data.get("bankroll", 100_000.0),
        unit=data.get("unit", 1_000.0),
        max_session_units=data.get("max_session_units", 5.0),
        max_cluster_units=data.get("max_cluster_units", 2.0),
        max_single_units=data.get("max_single_units", 1.5),
        reserve_units=data.get("reserve_units", 1.5),
    )

    graded: list[dict] = []
    candidates: list[Candidate] = []
    waits: list[WaitRow] = []
    rejects: list[RejectRow] = []
    n_markets = 0

    for ev in data.get("events", []):
        sport = ev.get("sport", "football")
        model_cfg = ev.get("model", {})
        uncertainty = model_cfg.get("uncertainty", 0.25)
        dq = DataQuality(**ev.get("data_quality", {}))
        parts = ev.get("confidence_parts", {})
        flags = ev.get("flags", {})
        is_live = ev.get("is_live", False)

        for market in ev.get("markets", []):
            odds_map: dict[str, float] = market["odds"]
            if len(odds_map) < 2:
                rejects.append(RejectRow(
                    ev["match"], market["key"], list(odds_map.values())[0],
                    "цена есть", "рынок неполный — снять маржу невозможно"))
                continue

            n_markets += 1
            sides = list(odds_map)
            cons = devig_all([odds_map[s] for s in sides])
            p_market = dict(zip(sides, cons.consensus))

            p_model_all = _model_probs(sport, model_cfg, market)
            if not p_model_all:
                rejects.append(RejectRow(
                    ev["match"], f"{market['key']} {market.get('line','')}".strip(),
                    min(odds_map.values()),
                    "рынок в линии есть",
                    "модель не покрывает этот рынок или линия целая (возможен возврат)"))
                continue

            for side, odds in odds_map.items():
                if side not in p_model_all or side not in p_market:
                    continue
                p_mod = p_model_all[side]
                p_mkt = p_market[side]
                if not (0.0 < p_mod < 1.0):
                    continue

                mkey = market["key"]
                volatile = bool(market.get("volatile")) or mkey in (
                    "correct_score", "regulation_winner")
                if mkey == "btts" and side == "no":
                    volatile = True
                mclass = "volatile" if volatile else market_class_of(
                    mkey, is_live=is_live)
                required = MIN_EDGE_PP[mclass]

                advice = size_bet(
                    p_mod, p_mkt, odds,
                    bankroll=bank.bankroll, unit=bank.unit,
                    uncertainty=uncertainty,
                    kelly_fraction_used=data.get("kelly_fraction", 0.25),
                    max_units=bank.max_single_units,
                    market_class=mclass)

                # A wide disagreement between de-vig methods is itself a reason
                # to trust the market number less; it costs confidence points.
                spread_penalty = min(cons.spread_pp, 4.0)
                conf = Confidence(
                    edge_strength=Confidence.edge_points(advice.edge_pp, required),
                    data_quality=Confidence.dq_points(dq.total),
                    model_agreement=parts.get("model_agreement", 0.0),
                    lineup_goalie_certainty=parts.get(
                        "lineup_goalie_certainty", 0.0),
                    market_agreement=max(
                        parts.get("market_agreement", 0.0) - spread_penalty, 0.0),
                    source_reliability=parts.get("source_reliability", 0.0),
                    volatility_penalty=(-12.0 if volatile
                                        else parts.get("volatility_penalty", 0.0)),
                )

                decision = classify(
                    edge_pp=advice.edge_pp,
                    required_edge_pp=required,
                    confidence=conf,
                    data_quality=dq,
                    is_conditional=flags.get("is_conditional", False),
                    goalie_sensitive_unconfirmed=flags.get(
                        "goalie_sensitive_unconfirmed", False),
                    models_disagree=flags.get("models_disagree", False),
                )

                label = f"{mkey} {side}"
                if market.get("line") is not None:
                    label += f" {market['line']:g}"

                record = {
                    "match": ev["match"], "sport": sport,
                    "competition": ev.get("competition"),
                    "kickoff": ev.get("kickoff"),
                    "market": label, "market_key": mkey, "side": side,
                    "line": market.get("line"),
                    "odds": odds, "p_market": p_mkt,
                    "p_model_raw": p_mod, "p_model": advice.p_model_used,
                    "edge_pp": advice.edge_pp, "ev": advice.ev,
                    "required_edge_pp": required,
                    "devig_spread_pp": round(cons.spread_pp, 2),
                    "margin_pct": round(cons.margin_pct, 2),
                    "min_odds": advice.min_odds,
                    "decision": decision.to_dict(),
                    "requested_units": advice.units,
                    "reason_codes": ev.get("reason_codes", []),
                }
                graded.append(record)

                if decision.verdict is Verdict.VALUE and advice.units > 0:
                    candidates.append(Candidate(
                        ref="", match=ev["match"], market=label, odds=odds,
                        p_model=advice.p_model_used, p_market=p_mkt,
                        edge_pp=advice.edge_pp, ev=advice.ev,
                        tier=decision.tier.value, confidence=decision.confidence,
                        data_quality=decision.data_quality,
                        requested_units=advice.units,
                        cluster=f"{ev['match']}|{_DIRECTION.get(side, side)}",
                        volatile=volatile,
                        reason_codes=ev.get("reason_codes", []),
                        min_odds=advice.min_odds,
                    ))
                elif decision.verdict is Verdict.WAIT:
                    waits.append(WaitRow(
                        match=ev["match"],
                        why="; ".join(decision.reasons),
                        trigger=ev.get("wait_trigger",
                                       "ЗАДАТЬ ИЗМЕРИМЫЙ ТРИГГЕР "
                                       "(состав / вратарь / кэф / игровой показатель)"),
                        target_market=label,
                        min_odds=advice.min_odds,
                        cancel_if=ev.get("cancel_if",
                                         "цена ушла ниже минимальной"),
                    ))
                else:
                    rejects.append(RejectRow(
                        match=ev["match"], market=label, odds=odds,
                        looked_attractive=(
                            f"edge по модели {advice.edge_pp:+.1f} пп, "
                            f"EV {advice.ev*100:+.1f}%"),
                        why_rejected="; ".join(decision.reasons),
                    ))

    allocations, summary = build_card(candidates, bank)
    values: list[ValueRow] = []
    for i, a in enumerate(allocations, 1):
        c = a.candidate
        rank = f"{'A' if c.tier == 'A-TIER' else 'B'}{i}"
        values.append(ValueRow(
            rank=rank, match=c.match, market=c.market, odds=c.odds,
            p_market=c.p_market, p_model=c.p_model, edge_pp=c.edge_pp,
            ev=c.ev, data_quality=c.data_quality, confidence=c.confidence,
            units=a.units, stake=a.stake, min_odds=c.min_odds, tier=c.tier,
            key_factors=[], main_argument_against="", cancel_if="",
            reason_codes=c.reason_codes,
        ))

    report = ScanReport(
        scan_date=data.get("scan_date", ""),
        model_version=MODEL_VERSION,
        bankroll=bank.bankroll, unit=bank.unit,
        values=values,
        waits=waits[:7],
        rejects=sorted(rejects, key=lambda r: -r.odds)[:10],
        summary=summary,
        data_notes=data.get("data_notes", []),
        events_scanned=len(data.get("events", [])),
        markets_scanned=n_markets,
    )
    return report, graded
