"""sbr — sports betting research engine.

A calculator and a bookkeeper, not an oracle. It converts prices into
probabilities, compares them with a model, applies fixed gates, sizes what
survives and records everything so the record can be audited later.

Nothing in this package predicts results. It estimates probabilities and
prices, both of which are wrong some of the time by construction.
"""

from .odds import devig, devig_all, margin_pct, decimal_to_prob, prob_to_decimal
from .value import size_bet, kelly_fraction, expected_value, edge_pp
from .scoring import DataQuality, Confidence, classify, Verdict, Tier
from .portfolio import BankrollConfig, Candidate, build_card
from .parser import parse_line
from .journal import Journal, Bet, MODEL_VERSION
from .scan import run_scan, load_scan_input

__version__ = "5.0.0"

__all__ = [
    "devig", "devig_all", "margin_pct", "decimal_to_prob", "prob_to_decimal",
    "size_bet", "kelly_fraction", "expected_value", "edge_pp",
    "DataQuality", "Confidence", "classify", "Verdict", "Tier",
    "BankrollConfig", "Candidate", "build_card",
    "parse_line", "Journal", "Bet", "MODEL_VERSION",
    "run_scan", "load_scan_input", "__version__",
]
