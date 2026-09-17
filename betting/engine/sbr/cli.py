"""Command line entry point.

    python -m sbr parse line.txt
    python -m sbr devig --odds 1.95,3.60,4.20
    python -m sbr scan scans/2026-09-18/input.json --out report.md --journal
    python -m sbr journal open
    python -m sbr journal settle 3 won --closing 1.85
    python -m sbr journal report --segment market
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from .journal import Bet, Journal
from .metrics import calibration_table, segment, summarise
from .odds import devig, devig_all, margin_pct
from .parser import parse_line
from .scan import load_scan_input, run_scan


def _cmd_parse(args) -> int:
    text = Path(args.file).read_text(encoding="utf-8")
    rep = parse_line(text)
    out = {
        "summary": rep.summary(),
        "events": [e.to_dict() for e in rep.events],
        "unparsed": rep.unparsed,
    }
    print(json.dumps(out, ensure_ascii=False, indent=2))
    if rep.unparsed:
        print(f"\n[!] {len(rep.unparsed)} строк не распознано — "
              f"они НЕ угаданы и НЕ попадут в анализ.", file=sys.stderr)
    return 0


def _cmd_devig(args) -> int:
    odds = [float(x) for x in args.odds.split(",")]
    print(f"Маржа букмекера: {margin_pct(odds):.2f}%  "
          f"(booksum {sum(1/o for o in odds):.4f})\n")
    for m in ("multiplicative", "additive", "power", "odds_ratio", "shin"):
        r = devig(odds, m)
        probs = "  ".join(f"{p:.4f}" for p in r.fair_probs)
        fair = "  ".join(f"{o:.3f}" for o in r.fair_odds)
        print(f"{m:>15}:  p = {probs}   fair = {fair}")
    c = devig_all(odds)
    print(f"\n{'консенсус':>15}:  p = " +
          "  ".join(f"{p:.4f}" for p in c.consensus))
    print(f"{'разброс':>15}:  {c.spread_pp:.2f} пп между методами")
    if c.spread_pp > 2.0:
        print("\n[!] Методы расходятся сильно — справедливая цена "
              "плохо определена, ставку следует уменьшить.")
    return 0


def _cmd_scan(args) -> int:
    data = load_scan_input(args.input)
    report, graded = run_scan(data)
    md = report.render()

    if args.out:
        Path(args.out).parent.mkdir(parents=True, exist_ok=True)
        Path(args.out).write_text(md, encoding="utf-8")
        print(f"Отчёт записан: {args.out}")
    else:
        print(md)

    if args.graded:
        Path(args.graded).write_text(
            json.dumps(graded, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"Все оценённые кандидаты: {args.graded}")

    if args.journal:
        j = Journal(args.db)
        n_real = n_shadow = 0
        value_keys = {(v.match, v.market) for v in report.values}
        for g in graded:
            verdict = g["decision"]["verdict"]
            is_value = (g["match"], g["market"]) in value_keys
            row = next((v for v in report.values
                        if v.match == g["match"] and v.market == g["market"]), None)
            bet = Bet(
                scan_date=report.scan_date, match=g["match"],
                market=g["market_key"], selection=g["side"],
                line=g.get("line"), odds_taken=g["odds"],
                verdict=verdict, sport=g.get("sport"),
                competition=g.get("competition"), kickoff=g.get("kickoff"),
                p_market=g["p_market"], p_model=g["p_model"],
                edge_pp=g["edge_pp"], ev=g["ev"],
                units=row.units if (is_value and row) else 0.0,
                stake=row.stake if (is_value and row) else 0.0,
                tier=g["decision"]["tier"], confidence=g["decision"]["confidence"],
                data_quality=g["decision"]["data_quality"],
                reason_codes=g.get("reason_codes", []),
                # Everything that was not bet is kept as a shadow bet, so the
                # filters can be judged later instead of trusted forever.
                is_shadow=not (is_value and row is not None and row.units > 0),
            )
            j.add(bet)
            if bet.is_shadow:
                n_shadow += 1
            else:
                n_real += 1
        j.close()
        print(f"В журнал записано: {n_real} реальных, {n_shadow} shadow "
              f"({args.db})")
    return 0


def _cmd_journal(args) -> int:
    j = Journal(args.db)
    try:
        if args.action == "open":
            rows = j.open_bets()
            if not rows:
                print("Открытых ставок нет.")
                return 0
            for r in rows:
                print(f"#{r['id']:>4}  {r['scan_date']}  {r['match']:<34} "
                      f"{r['market']}/{r['selection']:<8} @ {r['odds_taken']:.2f} "
                      f"{r['stake']:.0f}₽")
            return 0

        if args.action == "settle":
            profit = j.settle(int(args.bet_id), args.status,
                              result_detail=args.detail,
                              closing_odds=args.closing)
            print(f"Ставка #{args.bet_id} → {args.status}, "
                  f"результат {profit:+.0f} ₽")
            return 0

        if args.action == "export":
            print(f"CSV: {j.export_csv(args.out or 'journal/bets.csv')}")
            return 0

        # report
        rows = j.rows(only_real=not args.include_shadow)
        s = summarise(rows)
        print("== СВОДКА ==")
        for k, v in s.to_dict().items():
            print(f"  {k:<20} {v}")

        pairs = [(r["p_model"], 1.0 if r["status"] in ("won", "half_won") else 0.0)
                 for r in rows
                 if r["p_model"] is not None
                 and r["status"] in ("won", "lost", "half_won", "half_lost")]
        if pairs:
            print("\n== КАЛИБРОВКА ==")
            print(f"  {'диапазон':<12}{'n':>4}{'прогноз':>10}{'факт':>9}{'разрыв':>10}")
            for row in calibration_table(pairs):
                if row["n"]:
                    print(f"  {row['bucket']:<12}{row['n']:>4}"
                          f"{row['predicted']:>10.3f}{row['actual']:>9.3f}"
                          f"{row['gap_pp']:>9.1f}пп")
            if s.bets < 30:
                print("\n  [!] Менее 30 закрытых ставок — "
                      "калибровка пока ничего не доказывает.")

        if args.segment:
            print(f"\n== СЕГМЕНТ: {args.segment} ==")
            for k, v in segment(rows, args.segment).items():
                print(f"  {k:<24} n={v.bets:<4} ROI={v.roi_pct}  "
                      f"profit={v.profit}")
        return 0
    finally:
        j.close()


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(
        prog="sbr", description="Sports betting research engine")
    sub = ap.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("parse", help="распарсить текст линии")
    p.add_argument("file")
    p.set_defaults(func=_cmd_parse)

    p = sub.add_parser("devig", help="снять маржу всеми методами")
    p.add_argument("--odds", required=True,
                   help="все исходы рынка через запятую, напр. 1.95,3.60,4.20")
    p.set_defaults(func=_cmd_devig)

    p = sub.add_parser("scan", help="полный прогон скана")
    p.add_argument("input")
    p.add_argument("--out")
    p.add_argument("--graded")
    p.add_argument("--journal", action="store_true",
                   help="записать результат в журнал")
    p.add_argument("--db", default="journal/bets.db")
    p.set_defaults(func=_cmd_scan)

    p = sub.add_parser("journal", help="журнал и метрики")
    p.add_argument("action",
                   choices=["report", "open", "settle", "export"],
                   nargs="?", default="report")
    p.add_argument("bet_id", nargs="?")
    p.add_argument("status", nargs="?",
                   choices=["won", "lost", "push", "void",
                            "half_won", "half_lost"])
    p.add_argument("--closing", type=float)
    p.add_argument("--detail")
    p.add_argument("--segment")
    p.add_argument("--include-shadow", action="store_true")
    p.add_argument("--out")
    p.add_argument("--db", default="journal/bets.db")
    p.set_defaults(func=_cmd_journal)

    args = ap.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
