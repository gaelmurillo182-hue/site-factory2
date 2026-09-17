"""Tests for the betting engine.

These check the properties that, if broken, would silently produce wrong
stakes: that de-vigged books sum to one, that Kelly matches its closed form,
that hockey keeps regulation and OT apart, and that the hard gates cannot be
argued past by a high score.
"""

import math
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sbr import football, hockey
from sbr.journal import Bet, Journal
from sbr.metrics import brier, clv_pct, max_drawdown, summarise
from sbr.odds import (american_to_decimal, decimal_to_american, decimal_to_prob,
                      devig, devig_all, margin_pct)
from sbr.parser import parse_line
from sbr.portfolio import BankrollConfig, Candidate, build_card
from sbr.scan import run_scan
from sbr.scoring import Confidence, DataQuality, Tier, Verdict, classify
from sbr.value import (expected_value, kelly_fraction, min_acceptable_odds,
                       size_bet)

METHODS = ["multiplicative", "additive", "power", "odds_ratio", "shin"]
BOOKS = [
    [1.95, 3.60, 4.20],          # low margin 3-way
    [1.70, 3.20, 4.00],          # high margin 3-way
    [1.90, 1.90],                # flat 2-way
    [1.25, 4.50],                # heavy favourite
    [1.05, 12.0],                # extreme favourite
    [2.10, 3.40, 3.50, 9.0],     # 4-outcome market
]


# -- odds -----------------------------------------------------------------

@pytest.mark.parametrize("odds", BOOKS)
@pytest.mark.parametrize("method", METHODS)
def test_devig_sums_to_one(odds, method):
    r = devig(odds, method)
    assert math.isclose(sum(r.fair_probs), 1.0, abs_tol=1e-9)


@pytest.mark.parametrize("odds", BOOKS)
@pytest.mark.parametrize("method", METHODS)
def test_devig_probs_are_valid(odds, method):
    r = devig(odds, method)
    assert all(0.0 < p < 1.0 for p in r.fair_probs)


@pytest.mark.parametrize("odds", BOOKS)
@pytest.mark.parametrize("method", METHODS)
def test_devig_lowers_every_probability(odds, method):
    """Removing margin can only reduce each gross implied probability."""
    r = devig(odds, method)
    for raw, fair in zip(r.raw_probs, r.fair_probs):
        assert fair <= raw + 1e-9


@pytest.mark.parametrize("odds", BOOKS)
@pytest.mark.parametrize("method", METHODS)
def test_devig_preserves_favourite_order(odds, method):
    r = devig(odds, method)
    assert list(r.fair_probs) == sorted(r.fair_probs,
                                        key=lambda p: -p) or True
    ranking_in = sorted(range(len(odds)), key=lambda i: odds[i])
    ranking_out = sorted(range(len(odds)), key=lambda i: -r.fair_probs[i])
    assert ranking_in == ranking_out


def test_devig_rejects_incomplete_market():
    with pytest.raises(ValueError, match="complete market"):
        devig([1.90])


def test_margin_of_a_fair_book_is_zero():
    assert margin_pct([2.0, 2.0]) == pytest.approx(0.0, abs=1e-9)


def test_margin_matches_hand_calculation():
    # 1/1.90 + 1/1.90 = 1.052631... -> 5.26%
    assert margin_pct([1.90, 1.90]) == pytest.approx(5.263157, abs=1e-4)


def test_devig_spread_grows_with_margin():
    """The methods agree on a sharp book and disagree on a soft one. That
    disagreement is the honest uncertainty in the fair price."""
    low = devig_all([1.95, 3.60, 4.20]).spread_pp
    high = devig_all([1.70, 3.20, 4.00]).spread_pp
    assert high > low


def test_american_conversion_roundtrip():
    for a in (-250, -150, -101, 105, 130, 400):
        assert decimal_to_american(american_to_decimal(a)) == pytest.approx(a, abs=0.5)


def test_decimal_to_prob_rejects_impossible_price():
    with pytest.raises(ValueError):
        decimal_to_prob(0.95)


# -- value ----------------------------------------------------------------

def test_kelly_closed_form():
    # p=0.56 at 2.00 -> (0.56*2 - 1) / 1 = 0.12
    assert kelly_fraction(0.56, 2.00) == pytest.approx(0.12)


def test_kelly_is_zero_at_break_even():
    assert kelly_fraction(0.5, 2.00) == pytest.approx(0.0)


def test_kelly_negative_when_no_edge():
    assert kelly_fraction(0.45, 2.00) < 0


def test_ev_matches_hand_calculation():
    assert expected_value(0.56, 2.00) == pytest.approx(0.12)


def test_uncertainty_shrinks_the_stake():
    """Same edge, more doubt, smaller bet. This is the brake that keeps a
    thinly-evidenced opinion from being sized like a well-evidenced one."""
    sure = size_bet(0.60, 0.50, 2.00, bankroll=100_000, unit=1000,
                    uncertainty=0.0)
    unsure = size_bet(0.60, 0.50, 2.00, bankroll=100_000, unit=1000,
                      uncertainty=0.8)
    assert unsure.units < sure.units


def test_stake_never_exceeds_cap():
    a = size_bet(0.95, 0.30, 5.00, bankroll=100_000, unit=1000,
                 uncertainty=0.0, max_units=1.5)
    assert a.units <= 1.5


def test_min_acceptable_odds_removes_the_edge_exactly():
    p = 0.58
    o = min_acceptable_odds(p, 4.0)
    assert 1.0 / o == pytest.approx(p - 0.04, abs=1e-9)


# -- football -------------------------------------------------------------

def test_score_matrix_is_a_distribution():
    m = football.score_matrix(1.5, 1.2)
    assert m.sum() == pytest.approx(1.0)
    assert (m >= 0).all()


def test_dixon_coles_rho_zero_is_independent_poisson():
    m = football.score_matrix(1.5, 1.2, rho=0.0)
    assert m[0, 0] == pytest.approx(math.exp(-1.5) * math.exp(-1.2), abs=1e-6)


def test_negative_rho_raises_the_draw():
    """The whole point of the correction: plain Poisson underrates draws."""
    plain = football.match_odds(football.score_matrix(1.3, 1.3, rho=0.0))
    corrected = football.match_odds(football.score_matrix(1.3, 1.3, rho=-0.08))
    assert corrected["draw"] > plain["draw"]


def test_1x2_sums_to_one():
    o = football.match_odds(football.score_matrix(1.6, 1.1))
    assert sum(o.values()) == pytest.approx(1.0)


def test_dnb_renormalises_over_the_draw():
    m = football.score_matrix(1.6, 1.1)
    d = football.draw_no_bet(m)
    assert d["home"] + d["away"] == pytest.approx(1.0)


def test_totals_partition_the_space():
    m = football.score_matrix(1.6, 1.1)
    t = football.total_probs(m, 3.0)
    assert t["over"] + t["under"] + t["push"] == pytest.approx(1.0)


def test_whole_line_has_a_push_and_half_line_does_not():
    m = football.score_matrix(1.6, 1.1)
    assert football.total_probs(m, 3.0)["push"] > 0
    assert football.total_probs(m, 2.5)["push"] == 0


def test_quarter_handicap_sits_between_its_neighbours():
    m = football.score_matrix(1.7, 1.0)
    lo = football.asian_handicap(m, -0.5, "home", 1.90)["ev"]
    mid = football.asian_handicap(m, -0.25, "home", 1.90)["ev"]
    hi = football.asian_handicap(m, 0.0, "home", 1.90)["ev"]
    assert min(lo, hi) <= mid <= max(lo, hi)


def test_handicap_outcomes_partition_the_space():
    m = football.score_matrix(1.7, 1.0)
    r = football.asian_handicap(m, -1.0, "home", 1.90)
    assert r["win"] + r["push"] + r["lose"] == pytest.approx(1.0)


def test_asian_ev_is_consistent_with_effective_probability():
    m = football.score_matrix(1.7, 1.0)
    odds = 1.95
    r = football.asian_total(m, 2.75, "over", odds)
    assert r["p_eff"] * odds - 1.0 == pytest.approx(r["ev"], abs=1e-9)


def test_btts_complements():
    m = football.score_matrix(1.4, 1.3)
    b = football.btts(m)
    assert b["yes"] + b["no"] == pytest.approx(1.0)


# -- hockey ---------------------------------------------------------------

def test_moneyline_beats_regulation_for_the_favourite():
    """A favourite wins more often once overtime is included, because part of
    the regulation-tie mass converts. Confusing the two markets is the most
    expensive mistake on a hockey card."""
    m = hockey.reg_score_matrix(3.2, 2.7)
    p_ot = hockey.ot_win_probability(3.2, 2.7)
    reg = hockey.regulation_1x2(m)["home"]
    ml = hockey.moneyline(m, p_ot)["home"]
    assert ml > reg


def test_regulation_three_way_sums_to_one():
    m = hockey.reg_score_matrix(3.0, 3.0)
    assert sum(hockey.regulation_1x2(m).values()) == pytest.approx(1.0)


def test_moneyline_is_two_way():
    m = hockey.reg_score_matrix(3.0, 2.8)
    ml = hockey.moneyline(m, hockey.ot_win_probability(3.0, 2.8))
    assert ml["home"] + ml["away"] == pytest.approx(1.0)


def test_ot_probability_is_shrunk_toward_a_coin_flip():
    """Three-on-three and a shootout compress skill gaps; a model that lets a
    big favourite carry its full edge into OT is overconfident."""
    p = hockey.ot_win_probability(4.0, 2.0)
    raw = 4.0 / 6.0
    assert 0.5 < p < raw


def test_ot_goal_lifts_totals_above_an_even_number_only():
    """Ties are even totals, so the decider can only push a total across a
    line that sits above an even number."""
    m = hockey.reg_score_matrix(3.15, 2.85)
    over_65_reg = hockey.total_probs_regulation(m, 6.5)["over"]
    over_65_ot = hockey.total_probs_incl_ot(m, 6.5)["over"]
    over_55_reg = hockey.total_probs_regulation(m, 5.5)["over"]
    over_55_ot = hockey.total_probs_incl_ot(m, 5.5)["over"]
    assert over_65_ot > over_65_reg
    assert over_55_ot == pytest.approx(over_55_reg)


def test_puckline_partitions_the_space():
    m = hockey.reg_score_matrix(3.1, 2.9)
    r = hockey.puckline(m, 0.51, -1.5, "home")
    assert r["win"] + r["push"] + r["lose"] == pytest.approx(1.0)


def test_goalie_adjustment_lowers_goals_against_but_not_below_zero():
    assert hockey.adjust_lambda_for_goalie(3.0, 0.4) == pytest.approx(2.6)
    assert hockey.adjust_lambda_for_goalie(0.2, 5.0) > 0


# -- scoring gates --------------------------------------------------------

def _good_confidence():
    return Confidence(edge_strength=25, data_quality=20, model_agreement=15,
                      lineup_goalie_certainty=15, market_agreement=10,
                      source_reliability=10)


def _good_dq():
    return DataQuality(lineup_goalie_certainty=25, source_quality=20,
                       freshness=15, advanced_stats=15, market_data=15,
                       schedule_context=10)


def test_a_tier_is_reachable():
    d = classify(edge_pp=8.0, required_edge_pp=4.0,
                 confidence=_good_confidence(), data_quality=_good_dq())
    assert d.verdict is Verdict.VALUE and d.tier is Tier.A


def test_thin_edge_is_rejected_however_confident():
    d = classify(edge_pp=3.9, required_edge_pp=4.0,
                 confidence=_good_confidence(), data_quality=_good_dq())
    assert d.verdict is Verdict.REJECTED


def test_poor_data_blocks_value_however_big_the_edge():
    poor = DataQuality(lineup_goalie_certainty=5, source_quality=5,
                       freshness=5, advanced_stats=5, market_data=5,
                       schedule_context=5)
    d = classify(edge_pp=20.0, required_edge_pp=4.0,
                 confidence=_good_confidence(), data_quality=poor)
    assert d.verdict is Verdict.REJECTED


def test_conditional_idea_can_never_be_value():
    d = classify(edge_pp=20.0, required_edge_pp=4.0,
                 confidence=_good_confidence(), data_quality=_good_dq(),
                 is_conditional=True)
    assert d.verdict is Verdict.WAIT


def test_unconfirmed_goalie_forces_wait():
    d = classify(edge_pp=20.0, required_edge_pp=4.0,
                 confidence=_good_confidence(), data_quality=_good_dq(),
                 goalie_sensitive_unconfirmed=True)
    assert d.verdict is Verdict.WAIT


def test_model_disagreement_caps_at_b_tier():
    d = classify(edge_pp=20.0, required_edge_pp=4.0,
                 confidence=_good_confidence(), data_quality=_good_dq(),
                 models_disagree=True)
    assert d.tier is Tier.B


def test_data_quality_rejects_impossible_component():
    with pytest.raises(ValueError):
        DataQuality(lineup_goalie_certainty=99)


# -- portfolio ------------------------------------------------------------

def _cand(ref, cluster, units=1.5, tier="A-TIER", conf=85):
    return Candidate(ref=ref, match="M", market=ref, odds=2.0, p_model=0.56,
                     p_market=0.50, edge_pp=6.0, ev=0.12, tier=tier,
                     confidence=conf, data_quality=80, requested_units=units,
                     cluster=cluster)


def test_session_cap_is_never_exceeded():
    cfg = BankrollConfig()
    cands = [_cand(f"c{i}", f"cluster{i}") for i in range(10)]
    allocs, summary = build_card(cands, cfg)
    assert summary["total_units"] <= cfg.deployable_units + 1e-9


def test_cluster_cap_binds_correlated_bets():
    cfg = BankrollConfig()
    cands = [_cand("a", "same"), _cand("b", "same"), _cand("c", "same")]
    allocs, summary = build_card(cands, cfg)
    assert summary["per_cluster_units"]["same"] <= cfg.max_cluster_units + 1e-9


def test_best_candidate_keeps_its_size_when_caps_bind():
    cfg = BankrollConfig()
    strong = _cand("strong", "c1", units=1.5, conf=95)
    weak = _cand("weak", "c2", units=1.5, tier="B-TIER", conf=71)
    allocs, _ = build_card([weak, strong], cfg)
    by_ref = {a.candidate.ref: a.units for a in allocs}
    assert by_ref["strong"] >= by_ref.get("weak", 0.0)


def test_volatile_market_is_capped_at_half_a_unit():
    cfg = BankrollConfig()
    c = _cand("cs", "c1", units=1.5)
    c.volatile = True
    allocs, _ = build_card([c], cfg)
    assert allocs[0].units <= 0.5


def test_reserve_is_held_back():
    cfg = BankrollConfig()
    cands = [_cand(f"c{i}", f"cl{i}") for i in range(10)]
    _, summary = build_card(cands, cfg)
    assert summary["total_units"] <= cfg.max_session_units - cfg.reserve_units + 1e-9


def test_reserve_cannot_swallow_the_budget():
    with pytest.raises(ValueError):
        BankrollConfig(max_session_units=2.0, reserve_units=2.0)


# -- parser ---------------------------------------------------------------

SAMPLE = """КХЛ
18.09 19:30 Ак Барс - Авангард
П1 2.10 X 4.20 П2 2.90
Ф1(-1.5) 3.60 Ф2(+1.5) 1.32
ТБ 5.5 1.95 ТМ 5.5 1.90
Победа Ак Барс в основное время 2.55
"""


def test_parser_finds_the_event_despite_a_date_that_looks_like_a_price():
    rep = parse_line(SAMPLE)
    assert len(rep.events) == 1
    assert rep.events[0].home == "Ак Барс"
    assert rep.events[0].away == "Авангард"


def test_parser_detects_sport_from_the_competition_header():
    assert parse_line(SAMPLE).events[0].sport == "hockey"


def test_parser_keeps_regulation_separate_from_moneyline():
    sels = parse_line(SAMPLE).events[0].selections
    reg = [s for s in sels if s.market == "regulation_winner"]
    ml = [s for s in sels if s.market == "moneyline"]
    assert reg and ml
    assert reg[0].qualifier == "regulation"
    assert all(s.qualifier == "full_time" for s in ml)


def test_parser_reports_rather_than_guesses():
    rep = parse_line("совершенно непонятная строка 999999")
    assert rep.unparsed and not rep.events


def test_parser_reads_handicap_sign():
    sels = parse_line(SAMPLE).events[0].selections
    h = {s.side: s.line for s in sels if s.market == "handicap"}
    assert h["home"] == -1.5 and h["away"] == 1.5


# -- journal and metrics --------------------------------------------------

def test_journal_settles_and_computes_profit(tmp_path):
    j = Journal(tmp_path / "t.db")
    b = Bet(scan_date="2026-09-18", match="A - B", market="total",
            selection="over", odds_taken=2.00, verdict="VALUE", stake=1000)
    i = j.add(b)
    assert j.settle(i, "won") == pytest.approx(1000.0)
    j.close()


def test_journal_loss_costs_the_stake(tmp_path):
    j = Journal(tmp_path / "t.db")
    i = j.add(Bet(scan_date="d", match="A - B", market="m", selection="s",
                  odds_taken=2.0, verdict="VALUE", stake=750))
    assert j.settle(i, "lost") == pytest.approx(-750.0)
    j.close()


def test_journal_push_returns_the_stake(tmp_path):
    j = Journal(tmp_path / "t.db")
    i = j.add(Bet(scan_date="d", match="A - B", market="m", selection="s",
                  odds_taken=2.0, verdict="VALUE", stake=500))
    assert j.settle(i, "push") == pytest.approx(0.0)
    j.close()


def test_journal_refuses_a_nonsense_price(tmp_path):
    with pytest.raises(ValueError):
        Bet(scan_date="d", match="m", market="m", selection="s",
            odds_taken=0.8, verdict="VALUE")


def test_journal_keeps_shadow_bets_out_of_the_real_record(tmp_path):
    j = Journal(tmp_path / "t.db")
    j.add(Bet(scan_date="d", match="A - B", market="m", selection="s",
              odds_taken=2.0, verdict="VALUE", stake=1000))
    j.add(Bet(scan_date="d", match="C - D", market="m", selection="s",
              odds_taken=2.0, verdict="REJECTED", stake=0, is_shadow=True))
    assert len(j.rows(only_real=True)) == 1
    assert len(j.rows(only_real=False)) == 2
    j.close()


def test_clv_is_positive_when_the_price_shortens():
    assert clv_pct(2.00, 1.90) > 0


def test_clv_is_negative_when_the_price_drifts():
    assert clv_pct(1.90, 2.00) < 0


def test_brier_is_zero_for_a_perfect_forecast():
    assert brier([(1.0, 1.0), (0.0, 0.0)]) == pytest.approx(0.0)


def test_brier_is_quarter_for_a_coin_flip():
    assert brier([(0.5, 1.0), (0.5, 0.0)]) == pytest.approx(0.25)


def test_max_drawdown_finds_the_worst_stretch():
    dd, _, _ = max_drawdown([100, -50, -80, 200])
    assert dd == pytest.approx(-130.0)


def test_summary_roi_matches_hand_calculation():
    rows = [
        {"status": "won", "stake": 1000, "profit": 920, "odds_taken": 1.92,
         "p_model": 0.56, "closing_odds": 1.85},
        {"status": "lost", "stake": 1000, "profit": -1000, "odds_taken": 2.0,
         "p_model": 0.52, "closing_odds": 2.1},
    ]
    s = summarise(rows)
    assert s.turnover == pytest.approx(2000)
    assert s.profit == pytest.approx(-80)
    assert s.roi_pct == pytest.approx(-4.0)


# -- end to end -----------------------------------------------------------

def _scan_input(lambda_home, odds_home):
    return {
        "scan_date": "test", "bankroll": 100_000, "unit": 1000,
        "events": [{
            "match": "A - B", "sport": "football",
            "model": {"lambda_home": lambda_home, "lambda_away": 1.0,
                      "uncertainty": 0.2},
            "data_quality": {"lineup_goalie_certainty": 25,
                             "source_quality": 20, "freshness": 15,
                             "advanced_stats": 15, "market_data": 15,
                             "schedule_context": 10},
            "confidence_parts": {"model_agreement": 15,
                                 "lineup_goalie_certainty": 15,
                                 "market_agreement": 10,
                                 "source_reliability": 10},
            "markets": [{"key": "moneyline",
                         "odds": {"home": odds_home, "draw": 3.5, "away": 3.6}}],
        }],
    }


def test_scan_produces_no_bets_on_an_efficient_line():
    report, graded = run_scan(_scan_input(1.45, 1.95))
    assert report.values == []
    assert report.summary["total_stake"] == 0


def test_scan_finds_a_bet_on_a_badly_wrong_line():
    report, graded = run_scan(_scan_input(2.20, 2.30))
    assert report.values
    assert report.summary["total_stake"] > 0


def test_scan_never_exceeds_the_session_budget():
    data = _scan_input(2.20, 2.30)
    data["events"] = [dict(data["events"][0], match=f"M{i} - X") for i in range(12)]
    report, _ = run_scan(data)
    assert report.summary["total_units"] <= 3.5 + 1e-9


def test_scan_grades_every_priced_outcome():
    _, graded = run_scan(_scan_input(1.45, 1.95))
    assert len(graded) == 3   # home, draw, away all get a verdict
    assert all(g["decision"]["verdict"] in ("VALUE", "WAIT", "REJECTED")
               for g in graded)
