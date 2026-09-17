# Рабочий процесс и формат входа движка

## Быстрый старт

```bash
pip3 install numpy scipy sports-skills            # один раз
cd betting/engine
python3 -m pytest tests/ -q                       # 184 теста должны пройти
python3 -m sbr devig --odds 1.95,3.60,4.20        # проверка, что всё живо
```

## Схема `input.json`

```jsonc
{
  "scan_date": "2026-09-18",
  "bankroll": 100000,
  "unit": 1000,             // 1U = 1% банка
  "max_session_units": 5.0, // лимит на ВСЕ ставки сессии
  "reserve_units": 1.5,     // резерв под WAIT/live
  "kelly_fraction": 0.25,   // четвертной Келли
  "data_notes": ["любые честные оговорки о данных — попадут в шапку отчёта"],

  "events": [{
    "match": "Команда A - Команда B",
    "sport": "football",              // football | hockey | <другое>
    "competition": "РПЛ",
    "kickoff": "2026-09-18T21:00",
    "is_live": false,

    // Футбол/хоккей: ожидаемые голы. Всё остальное считается из них.
    "model": {
      "lambda_home": 1.62,
      "lambda_away": 1.05,
      "rho": -0.05,        // только футбол, поправка Dixon-Coles
      "ot_shrink": 0.35,   // только хоккей, сжатие к монетке в OT
      "uncertainty": 0.25  // 0 = полная вера модели, 1 = веры нет
    },

    // Честно: что реально нашли, а не что хотелось бы
    "data_quality": {
      "lineup_goalie_certainty": 21,  // макс 25
      "source_quality": 17,           // макс 20
      "freshness": 13,                // макс 15
      "advanced_stats": 13,           // макс 15
      "market_data": 12,              // макс 15
      "schedule_context": 8           // макс 10
    },

    "confidence_parts": {
      "model_agreement": 13,          // макс 15
      "lineup_goalie_certainty": 13,  // макс 15
      "market_agreement": 9,          // макс 10
      "source_reliability": 8         // макс 10
    },

    "flags": {
      "is_conditional": false,               // «если подтвердят…» → WAIT
      "goalie_sensitive_unconfirmed": false, // вратарь не подтверждён → WAIT
      "models_disagree": false               // слои врозь → потолок B-TIER
    },

    "wait_trigger": "вратарь подтверждён клубом за 30-60 мин до старта",
    "cancel_if": "стартует backup ИЛИ кэф ниже минимального",
    "reason_codes": ["XG_EDGE", "GOALIE_EDGE"],

    // ВАЖНО: в каждом рынке должны быть ВСЕ исходы, иначе маржу снять нельзя
    "markets": [
      {"key": "moneyline", "odds": {"home": 1.95, "draw": 3.60, "away": 4.20}},
      {"key": "total", "line": 2.5, "odds": {"over": 1.92, "under": 1.88}},
      {"key": "btts", "odds": {"yes": 1.80, "no": 1.98}},
      {"key": "dnb", "odds": {"home": 1.50, "away": 2.55}}
    ]
  }]
}
```

### Поддерживаемые `key`

Футбол: `moneyline` (1/X/2), `dnb`, `double_chance`, `total`, `btts`,
`team_total_home`, `team_total_away`.

Хоккей: `moneyline`, `regulation_winner`, `total` (с OT), `total_regulation`,
`btts`, `team_total_home`, `team_total_away`.

**Хоккейный `moneyline` различается по числу исходов:** три цены (home/draw/away)
движок трактует как рынок основного времени, две (home/away) — как ML с учётом
OT/SO. Это осознанно: именно здесь чаще всего теряют деньги.

Другие виды спорта: своей модели голов нет, поэтому передавайте
`"model_probs": {"home": 0.62, "away": 0.38}` прямо внутри рынка. Движок не
станет придумывать модель, которой у него нет.

### Целые линии

Тотал 3.0 или фора 0 дают возврат части ставки. Движок такие рынки в
классификацию не берёт и отправляет в REJECTED с честной причиной, вместо того
чтобы приписать им вероятность, которой у них нет.

## Цикл одного дня

```bash
# 1. скан
python3 -m sbr scan ../scans/2026-09-18/input.json \
  --out ../scans/2026-09-18/report.md --journal --db ../journal/bets.db

# 2. что открыто
python3 -m sbr journal open --db ../journal/bets.db

# 3. после матчей — результат И закрывающий кэф
python3 -m sbr journal settle 7 won --closing 1.85 --detail "2:1" --db ../journal/bets.db

# 4. метрики
python3 -m sbr journal report --db ../journal/bets.db
python3 -m sbr journal report --segment odds_band --db ../journal/bets.db
```
