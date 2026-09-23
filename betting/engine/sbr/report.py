"""Markdown rendering of a scan: VALUE, WAIT, REJECTED and the betting card.

The REJECTED section is not decoration. Writing down why an attractive-looking
idea was turned away is the only defence against quietly lowering the bar on a
night when nothing qualifies.
"""

from __future__ import annotations

from dataclasses import dataclass, field

__all__ = ["ValueRow", "WaitRow", "RejectRow", "ScanReport"]


def _table(headers: list[str], rows: list[list[str]]) -> str:
    if not rows:
        return "_(пусто)_\n"
    out = ["| " + " | ".join(headers) + " |",
           "|" + "|".join("---" for _ in headers) + "|"]
    for r in rows:
        out.append("| " + " | ".join(str(c) for c in r) + " |")
    return "\n".join(out) + "\n"


@dataclass
class ValueRow:
    rank: str
    match: str
    market: str
    odds: float
    p_market: float
    p_model: float
    edge_pp: float
    ev: float
    data_quality: float
    confidence: float
    units: float
    stake: float
    min_odds: float
    tier: str
    key_factors: list[str] = field(default_factory=list)
    main_argument_against: str = ""
    cancel_if: str = ""
    reason_codes: list[str] = field(default_factory=list)

    def cells(self) -> list[str]:
        return [
            self.rank, self.match, self.market, f"{self.odds:.2f}",
            f"{self.p_market:.1%}", f"{self.p_model:.1%}",
            f"{1/self.p_model:.2f}", f"{self.edge_pp:+.1f} пп",
            f"{self.ev*100:+.1f}%", f"{self.data_quality:.0f}",
            f"{self.confidence:.0f}", f"{self.units:.2f}U / {self.stake:.0f}₽",
        ]


@dataclass
class WaitRow:
    match: str
    why: str
    trigger: str
    target_market: str
    min_odds: float
    cancel_if: str

    def cells(self) -> list[str]:
        return [self.match, self.why, self.trigger, self.target_market,
                f"{self.min_odds:.2f}", self.cancel_if]


@dataclass
class RejectRow:
    match: str
    market: str
    odds: float
    looked_attractive: str
    why_rejected: str

    def cells(self) -> list[str]:
        return [self.match, self.market, f"{self.odds:.2f}",
                self.looked_attractive, self.why_rejected]


@dataclass
class ScanReport:
    scan_date: str
    model_version: str
    bankroll: float
    unit: float
    values: list[ValueRow] = field(default_factory=list)
    waits: list[WaitRow] = field(default_factory=list)
    rejects: list[RejectRow] = field(default_factory=list)
    summary: dict = field(default_factory=dict)
    data_notes: list[str] = field(default_factory=list)
    events_scanned: int = 0
    markets_scanned: int = 0

    def render(self) -> str:
        p: list[str] = []
        p.append(f"# СКАН ЛИНИИ — {self.scan_date}\n")
        p.append(f"Модель: **{self.model_version}** · "
                 f"Банк: **{self.bankroll:,.0f} ₽** · "
                 f"1U = **{self.unit:,.0f} ₽** "
                 f"({self.unit/self.bankroll:.1%} банка)\n".replace(",", " "))
        p.append(f"Просканировано: {self.events_scanned} событий, "
                 f"{self.markets_scanned} рынков → "
                 f"VALUE {len(self.values)} / WAIT {len(self.waits)} / "
                 f"REJECTED {len(self.rejects)}\n")

        if self.data_notes:
            p.append("\n## ⚠️ Состояние данных\n")
            for n in self.data_notes:
                p.append(f"- {n}")
            p.append("")

        p.append("\n## 1. VALUE\n")
        if not self.values:
            p.append("**VALUE: 0.** Ни один кандидат не прошёл фильтры. "
                     "Это допустимый и нормальный результат скана — "
                     "квоты на количество ставок нет.\n")
        else:
            p.append(_table(
                ["#", "Матч", "Рынок", "Кэф", "P_market", "P_model",
                 "Fair", "Edge", "EV", "DQ", "Conf", "Ставка"],
                [v.cells() for v in self.values]))
            for v in self.values:
                p.append(f"\n### {v.rank} · {v.match} — {v.market} "
                         f"@ {v.odds:.2f} ({v.tier})\n")
                p.append(f"**Ставить только по цене ≥ {v.min_odds:.2f}.** "
                         f"Ниже — ставка отменяется.\n")
                if v.key_factors:
                    p.append("Ключевые факторы:\n")
                    for i, f in enumerate(v.key_factors, 1):
                        p.append(f"{i}. {f}")
                    p.append("")
                if v.main_argument_against:
                    p.append(f"**Главный аргумент ПРОТИВ:** "
                             f"{v.main_argument_against}\n")
                if v.cancel_if:
                    p.append(f"**NO BET IF:** {v.cancel_if}\n")
                if v.reason_codes:
                    p.append(f"`{' '.join(v.reason_codes)}`\n")

        p.append("\n## 2. WAIT\n")
        p.append(_table(
            ["Матч", "Почему ждём", "Триггер (измеримый)", "Целевой рынок",
             "Мин. кэф", "Отмена если"],
            [w.cells() for w in self.waits]))

        p.append("\n## 3. REJECTED\n")
        p.append(_table(
            ["Матч", "Рынок", "Кэф", "Почему выглядел интересно",
             "Почему модель отказалась"],
            [r.cells() for r in self.rejects]))

        p.append("\n## 4. BETTING CARD\n")
        if not self.values:
            p.append("**Ставок нет.** Риск сегодня: 0 ₽.\n")
        else:
            for v in self.values:
                p.append(f"- **{v.rank}** {v.match} — {v.market} "
                         f"@ {v.odds:.2f} (не ниже {v.min_odds:.2f}) → "
                         f"**{v.units:.2f}U = {v.stake:.0f} ₽**")
            p.append("")
        s = self.summary
        if s:
            p.append(f"**TOTAL RISK:** {s.get('total_stake', 0):.0f} ₽ / "
                     f"{s.get('total_units', 0):.2f}U")
            p.append(f"**BANK EXPOSURE:** {s.get('bank_exposure_pct', 0):.2f}%")
            p.append(f"**RESERVE FOR WAIT/LIVE:** "
                     f"{s.get('reserve_stake', 0):.0f} ₽ "
                     f"({s.get('reserve_units', 0):.2f}U)")
            p.append(f"**Ожидаемая прибыль модели:** "
                     f"{s.get('expected_profit', 0):+.0f} ₽ "
                     f"(это матожидание, а не прогноз результата)")
        return "\n".join(p) + "\n"
