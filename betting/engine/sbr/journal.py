"""The bet journal: an append-only record of every graded selection.

Shadow bets — the ones the filters rejected — are stored alongside the real
ones. Without them there is no way to tell a filter that saves money from a
filter that only costs it, and after fifty bets that is the single most useful
thing the journal can answer.
"""

from __future__ import annotations

import csv
import json
import sqlite3
from dataclasses import dataclass, asdict, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable, Sequence

__all__ = ["Bet", "Journal", "MODEL_VERSION"]

MODEL_VERSION = "V5.0"

_SCHEMA = """
CREATE TABLE IF NOT EXISTS bets (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at      TEXT NOT NULL,
    scan_date       TEXT NOT NULL,
    kickoff         TEXT,
    sport           TEXT,
    competition     TEXT,
    match           TEXT NOT NULL,
    market          TEXT NOT NULL,
    selection       TEXT NOT NULL,
    line            REAL,
    qualifier       TEXT DEFAULT 'full_time',
    odds_taken      REAL NOT NULL,
    closing_odds    REAL,
    p_market        REAL,
    p_model         REAL,
    edge_pp         REAL,
    ev              REAL,
    units           REAL NOT NULL DEFAULT 0,
    stake           REAL NOT NULL DEFAULT 0,
    tier            TEXT,
    verdict         TEXT NOT NULL,
    confidence      REAL,
    data_quality    REAL,
    cluster         TEXT,
    reason_codes    TEXT,
    model_version   TEXT NOT NULL,
    is_shadow       INTEGER NOT NULL DEFAULT 0,
    status          TEXT NOT NULL DEFAULT 'open',
    result_detail   TEXT,
    profit          REAL,
    settled_at      TEXT,
    notes           TEXT
);
CREATE INDEX IF NOT EXISTS idx_bets_status ON bets(status);
CREATE INDEX IF NOT EXISTS idx_bets_scan   ON bets(scan_date);

CREATE TABLE IF NOT EXISTS bankroll (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    ts          TEXT NOT NULL,
    balance     REAL NOT NULL,
    note        TEXT
);
"""

# How a settled bet pays, per 1 unit staked.
_PAYOUT = {
    "won": lambda odds: odds - 1.0,
    "lost": lambda odds: -1.0,
    "push": lambda odds: 0.0,
    "void": lambda odds: 0.0,
    "half_won": lambda odds: (odds - 1.0) / 2.0,
    "half_lost": lambda odds: -0.5,
}
VALID_STATUS = {"open", *_PAYOUT}


@dataclass
class Bet:
    scan_date: str
    match: str
    market: str
    selection: str
    odds_taken: float
    verdict: str                      # VALUE / WAIT / REJECTED
    sport: str | None = None
    competition: str | None = None
    kickoff: str | None = None
    line: float | None = None
    qualifier: str = "full_time"
    closing_odds: float | None = None
    p_market: float | None = None
    p_model: float | None = None
    edge_pp: float | None = None
    ev: float | None = None
    units: float = 0.0
    stake: float = 0.0
    tier: str | None = None
    confidence: float | None = None
    data_quality: float | None = None
    cluster: str | None = None
    reason_codes: list[str] = field(default_factory=list)
    model_version: str = MODEL_VERSION
    is_shadow: bool = False
    status: str = "open"
    result_detail: str | None = None
    profit: float | None = None
    notes: str | None = None

    def __post_init__(self) -> None:
        if self.odds_taken <= 1.0:
            raise ValueError(f"odds_taken must be > 1.0, got {self.odds_taken}")
        if self.status not in VALID_STATUS:
            raise ValueError(f"bad status {self.status!r}")
        if self.verdict not in ("VALUE", "WAIT", "REJECTED"):
            raise ValueError(f"bad verdict {self.verdict!r}")


class Journal:
    """SQLite-backed. Small enough to read with any tool, durable enough to
    survive the laptop."""

    def __init__(self, path: str | Path = "journal/bets.db"):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self.conn = sqlite3.connect(self.path)
        self.conn.row_factory = sqlite3.Row
        self.conn.executescript(_SCHEMA)
        self.conn.commit()

    # -- writing ----------------------------------------------------------
    def add(self, bet: Bet) -> int:
        d = asdict(bet)
        d["reason_codes"] = json.dumps(bet.reason_codes, ensure_ascii=False)
        d["is_shadow"] = int(bet.is_shadow)
        d["created_at"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
        cols = ", ".join(d)
        marks = ", ".join(f":{k}" for k in d)
        cur = self.conn.execute(f"INSERT INTO bets ({cols}) VALUES ({marks})", d)
        self.conn.commit()
        return int(cur.lastrowid)

    def add_many(self, bets: Iterable[Bet]) -> list[int]:
        return [self.add(b) for b in bets]

    def settle(self, bet_id: int, status: str,
               result_detail: str | None = None,
               closing_odds: float | None = None) -> float:
        """Mark a bet as decided and compute its profit from the stake."""
        if status not in _PAYOUT:
            raise ValueError(f"cannot settle to {status!r}; "
                             f"use one of {sorted(_PAYOUT)}")
        row = self.conn.execute("SELECT * FROM bets WHERE id = ?",
                                (bet_id,)).fetchone()
        if row is None:
            raise KeyError(f"no bet with id {bet_id}")
        profit = round(_PAYOUT[status](row["odds_taken"]) * row["stake"], 2)
        self.conn.execute(
            "UPDATE bets SET status=?, result_detail=?, profit=?, settled_at=?, "
            "closing_odds=COALESCE(?, closing_odds) WHERE id=?",
            (status, result_detail, profit,
             datetime.now(timezone.utc).isoformat(timespec="seconds"),
             closing_odds, bet_id))
        self.conn.commit()
        return profit

    def set_closing_odds(self, bet_id: int, closing_odds: float) -> None:
        if closing_odds <= 1.0:
            raise ValueError("closing odds must be > 1.0")
        self.conn.execute("UPDATE bets SET closing_odds=? WHERE id=?",
                          (closing_odds, bet_id))
        self.conn.commit()

    def record_balance(self, balance: float, note: str = "") -> None:
        self.conn.execute(
            "INSERT INTO bankroll (ts, balance, note) VALUES (?, ?, ?)",
            (datetime.now(timezone.utc).isoformat(timespec="seconds"),
             balance, note))
        self.conn.commit()

    # -- reading ----------------------------------------------------------
    def rows(self, *, only_real: bool = True, settled_only: bool = False,
             verdict: str | None = None) -> list[sqlite3.Row]:
        sql = "SELECT * FROM bets WHERE 1=1"
        args: list = []
        if only_real:
            sql += " AND is_shadow = 0"
        if settled_only:
            sql += " AND status != 'open'"
        if verdict:
            sql += " AND verdict = ?"
            args.append(verdict)
        sql += " ORDER BY id"
        return self.conn.execute(sql, args).fetchall()

    def open_bets(self) -> list[sqlite3.Row]:
        return self.conn.execute(
            "SELECT * FROM bets WHERE status='open' AND verdict='VALUE' "
            "ORDER BY kickoff, id").fetchall()

    def export_csv(self, path: str | Path) -> Path:
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        rows = self.conn.execute("SELECT * FROM bets ORDER BY id").fetchall()
        with path.open("w", newline="", encoding="utf-8") as fh:
            if not rows:
                fh.write("")
                return path
            w = csv.DictWriter(fh, fieldnames=rows[0].keys())
            w.writeheader()
            for r in rows:
                w.writerow(dict(r))
        return path

    def close(self) -> None:
        self.conn.close()
