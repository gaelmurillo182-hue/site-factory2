"""Parser for a raw bookmaker line pasted as text (Fonbet-style, Russian).

Design rule: this parser never guesses. A line it cannot read with confidence
goes into `unparsed` and is reported back, because a silently mis-read market
is worse than an obviously missing one — especially the two that get confused
most often in hockey, "победа в основное время" and "победа (вкл. ОТ)".
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass, field, asdict

__all__ = [
    "Selection",
    "Event",
    "ParseReport",
    "parse_line",
    "normalise",
]

_DASHES = "‐‑‒–—―−"

SPORT_HINTS = {
    "football": ["апл", "рпл", "премьер-лиг", "ла лига", "серия а", "бундеслиг",
                 "лига чемпионов", "лига европы", "футбол", "мls", "лига конференций"],
    "hockey": ["нхл", "кхл", "хоккей", "nhl", "khl", "мхл", "ahl"],
    "basketball": ["нба", "евролига", "баскетбол", "nba"],
    "tennis": ["теннис", "atp", "wta", "итф"],
}


def normalise(text: str) -> str:
    """Unify dashes, spaces and decimal separators without touching content."""
    t = unicodedata.normalize("NFKC", text)
    for d in _DASHES:
        t = t.replace(d, "-")
    t = t.replace(" ", " ")
    return t


# --------------------------------------------------------------------------
# patterns
# --------------------------------------------------------------------------

_ODDS = r"(\d{1,3}[.,]\d{1,3})"

# An event header: optional date, optional time, two team names around a dash.
_EVENT_RE = re.compile(
    r"^\s*(?:(?P<date>\d{1,2}[./]\d{1,2}(?:[./]\d{2,4})?)\s+)?"
    r"(?:(?P<time>\d{1,2}:\d{2})\s+)?"
    r"(?P<home>[^-|]{2,60}?)\s+-\s+(?P<away>[^-|]{2,60}?)\s*$"
)

# Period / time qualifiers that change what a market actually settles on.
_QUALIFIERS = [
    (r"(вкл\.?\s*от|включая\s+овертайм|с\s+от\b|вкл\.?\s*овертайм|incl\.?\s*ot)",
     "incl_ot"),
    (r"(осн(?:овн)?\.?\s*врем|в\s+основное\s+время|60\s*мин|regulation)",
     "regulation"),
    (r"(1[-\s]?(?:й|ый)?\s*тайм|1st\s*half|первый\s+тайм)", "h1"),
    (r"(2[-\s]?(?:й|ый)?\s*тайм|2nd\s*half|второй\s+тайм)", "h2"),
    (r"(1[-\s]?(?:й|ый)?\s*period|1[-\s]?(?:й|ый)?\s*период)", "p1"),
    (r"(2[-\s]?(?:й|ый)?\s*период)", "p2"),
    (r"(3[-\s]?(?:й|ый)?\s*период)", "p3"),
]

# Each market pattern yields (market_key, side, line-or-None).
_MARKET_PATTERNS: list[tuple[str, str, str | None]] = [
    (r"(?:^|\s)(?:п1|w1|win1)\s*[-:]?\s*" + _ODDS, "moneyline", "home"),
    (r"(?:^|\s)(?:п2|w2|win2)\s*[-:]?\s*" + _ODDS, "moneyline", "away"),
    (r"(?:^|\s)(?:х|x|ничья|draw)\s*[-:]?\s*" + _ODDS, "moneyline", "draw"),
    (r"^\s*1\s+" + _ODDS, "moneyline", "home"),
    (r"^\s*2\s+" + _ODDS, "moneyline", "away"),
    (r"(?:^|\s)1\s*х\s*[-:]?\s*" + _ODDS, "double_chance", "1X"),
    (r"(?:^|\s)х\s*2\s*[-:]?\s*" + _ODDS, "double_chance", "X2"),
    (r"(?:^|\s)12\s*[-:]?\s*" + _ODDS, "double_chance", "12"),
]

_LETTERS = re.compile(r"[A-Za-z\u0400-\u04FF]")


def _looks_like_team(name: str) -> bool:
    """A team name carries letters. "2.10" does not, and that is how we keep a
    price line from being read as an event header."""
    return len(_LETTERS.findall(name)) >= 2


@dataclass
class Selection:
    """One priced outcome."""
    market: str                 # moneyline | total | handicap | btts | ...
    side: str                   # home / away / draw / over / under / yes / no
    odds: float
    line: float | None = None   # handicap or total line
    qualifier: str = "full_time"  # incl_ot / regulation / h1 / p1 ...
    raw: str = ""

    def key(self) -> str:
        parts = [self.market, self.side]
        if self.line is not None:
            parts.append(f"{self.line:+g}" if self.market == "handicap"
                         else f"{self.line:g}")
        if self.qualifier != "full_time":
            parts.append(self.qualifier)
        return "/".join(parts)

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class Event:
    home: str
    away: str
    date: str | None = None
    time: str | None = None
    sport: str | None = None
    competition: str | None = None
    selections: list[Selection] = field(default_factory=list)

    @property
    def name(self) -> str:
        return f"{self.home} - {self.away}"

    def market_group(self, market: str, qualifier: str = "full_time",
                     line: float | None = None) -> list[Selection]:
        """Every priced outcome of one market, which is what de-vigging needs."""
        return [s for s in self.selections
                if s.market == market and s.qualifier == qualifier
                and (line is None or s.line == line)]

    def to_dict(self) -> dict:
        return {
            "home": self.home, "away": self.away, "date": self.date,
            "time": self.time, "sport": self.sport,
            "competition": self.competition,
            "selections": [s.to_dict() for s in self.selections],
        }


@dataclass
class ParseReport:
    events: list[Event]
    unparsed: list[str]

    @property
    def n_selections(self) -> int:
        return sum(len(e.selections) for e in self.events)

    def summary(self) -> str:
        return (f"{len(self.events)} events, {self.n_selections} selections, "
                f"{len(self.unparsed)} lines not understood")


def _to_float(s: str) -> float:
    return float(s.replace(",", "."))


def _detect_qualifier(text: str) -> str:
    low = text.lower()
    for pattern, name in _QUALIFIERS:
        if re.search(pattern, low):
            return name
    return "full_time"


def _detect_sport(text: str) -> str | None:
    low = text.lower()
    for sport, hints in SPORT_HINTS.items():
        if any(h in low for h in hints):
            return sport
    return None


def _regulation_winner(line: str, event: "Event | None") -> list[Selection]:
    """"Победа X в основное время" — a 60-minute result, not the moneyline.

    Needs the event to know which side the named team is, so it is resolved
    here rather than in the generic market pass.
    """
    out: list[Selection] = []
    for m in re.finditer(
            r"победа\s+(.+?)\s+в\s+основное\s+время\s*[-:]?\s*" + _ODDS, line):
        team = m.group(1).strip()
        side: str | None = None
        if event is not None:
            if team and team in event.home.lower():
                side = "home"
            elif team and team in event.away.lower():
                side = "away"
        if side is None:
            continue   # ambiguous: refuse rather than guess which team it is
        out.append(Selection("regulation_winner", side, _to_float(m.group(2)),
                             None, "regulation", m.group(0)))
    return out


def _parse_markets(line: str, event: "Event | None" = None) -> list[Selection]:
    """Pull every (market, odds) pair out of one text line."""
    low = line.lower()
    qual = _detect_qualifier(low)
    found: list[Selection] = _regulation_winner(low, event)

    # totals: "тб 2.5 1.95", "тотал больше 2.5 - 1.95", "over 2.5 1.95"
    for m in re.finditer(
            r"(?:тб|тотал\s*(?:больше|б)|over|бол(?:ьше)?)\s*\(?\s*"
            r"(-?\d+(?:[.,]\d+)?)\s*\)?\s*[-–:]?\s*" + _ODDS, low):
        found.append(Selection("total", "over", _to_float(m.group(2)),
                               _to_float(m.group(1)), qual, m.group(0)))
    for m in re.finditer(
            r"(?:тм|тотал\s*(?:меньше|м)|under|мен(?:ьше)?)\s*\(?\s*"
            r"(-?\d+(?:[.,]\d+)?)\s*\)?\s*[-–:]?\s*" + _ODDS, low):
        found.append(Selection("total", "under", _to_float(m.group(2)),
                               _to_float(m.group(1)), qual, m.group(0)))

    # individual totals: "ИТ1Б 1.5 2.00"
    for m in re.finditer(
            r"ит\s*([12])\s*(?:б|больше|over)\s*\(?\s*(\d+(?:[.,]\d+)?)\s*\)?"
            r"\s*[-–:]?\s*" + _ODDS, low):
        side = "home" if m.group(1) == "1" else "away"
        found.append(Selection(f"team_total_{side}", "over",
                               _to_float(m.group(3)), _to_float(m.group(2)),
                               qual, m.group(0)))
    for m in re.finditer(
            r"ит\s*([12])\s*(?:м|меньше|under)\s*\(?\s*(\d+(?:[.,]\d+)?)\s*\)?"
            r"\s*[-–:]?\s*" + _ODDS, low):
        side = "home" if m.group(1) == "1" else "away"
        found.append(Selection(f"team_total_{side}", "under",
                               _to_float(m.group(3)), _to_float(m.group(2)),
                               qual, m.group(0)))

    # handicaps: "Ф1(-0.5) 2.10", "фора2 +1.5 1.75"
    for m in re.finditer(
            r"(?:ф|фора|handicap|ah)\s*([12])\s*\(?\s*([+-]?\d+(?:[.,]\d+)?)"
            r"\s*\)?\s*[-–:]?\s*" + _ODDS, low):
        side = "home" if m.group(1) == "1" else "away"
        found.append(Selection("handicap", side, _to_float(m.group(3)),
                               _to_float(m.group(2)), qual, m.group(0)))

    # both teams to score
    for m in re.finditer(r"(?:оз|обе\s+забьют|btts)\s*(?:-\s*)?"
                         r"(да|нет|yes|no)\s*[-–:]?\s*" + _ODDS, low):
        side = "yes" if m.group(1) in ("да", "yes") else "no"
        found.append(Selection("btts", side, _to_float(m.group(2)),
                               None, qual, m.group(0)))

    # draw no bet
    for m in re.finditer(r"(?:без\s+ничьей|dnb|ф0)\s*([12])?\s*[-–:]?\s*" + _ODDS, low):
        side = "home" if (m.group(1) or "1") == "1" else "away"
        found.append(Selection("dnb", side, _to_float(m.group(2)),
                               None, qual, m.group(0)))

    if found:
        return found

    # Only if nothing more specific matched do we try bare 1 / X / 2, because
    # a lone "2" next to a price is ambiguous inside a totals line.
    for pattern, market, side in _MARKET_PATTERNS:
        for m in re.finditer(pattern, low):
            found.append(Selection(market, side, _to_float(m.group(1)),
                                   None, qual, m.group(0)))
    return found


def parse_line(text: str) -> ParseReport:
    """Parse a pasted block of bookmaker text into events and selections."""
    text = normalise(text)
    events: list[Event] = []
    unparsed: list[str] = []
    current: Event | None = None
    competition: str | None = None

    for raw in text.splitlines():
        line = raw.strip()
        if not line:
            continue

        # A line with no digits and no dash-separated pair is a section header
        # (competition name), which we carry forward.
        header = _EVENT_RE.match(line)
        if (header
                and _looks_like_team(header.group("home"))
                and _looks_like_team(header.group("away"))):
            current = Event(
                home=header.group("home").strip(),
                away=header.group("away").strip(),
                date=header.group("date"),
                time=header.group("time"),
                sport=_detect_sport(line) or _detect_sport(competition or ""),
                competition=competition,
            )
            events.append(current)
            continue

        if not re.search(r"\d", line) and len(line) < 80:
            competition = line
            continue

        sels = _parse_markets(line, current)
        if sels and current is not None:
            for s in sels:
                s.raw = line
            current.selections.extend(sels)
        elif sels and current is None:
            unparsed.append(line)   # prices with no event to attach them to
        else:
            unparsed.append(line)

    return ParseReport(events=events, unparsed=unparsed)
