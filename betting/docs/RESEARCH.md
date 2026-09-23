# Ресерч: на чём основана система

Документ фиксирует, откуда взято каждое числовое правило в движке. Если
правило здесь не обосновано — его в движке быть не должно.

Дата сбора источников: 17.09.2026. Всё, что помечено «эмпирика движка», —
результат прогона кода из этого репозитория, воспроизводится командой,
указанной рядом.

---

## 1. Главный вывод: единственная метрика, которой можно верить рано

Win rate бесполезен как метрика качества: он механически зависит от
коэффициентов, по которым вы ставите. 70% захода на 1.30 и 40% на 3.00 — это
может быть один и тот же edge или его отсутствие.

Закрывающая линия (closing line) — лучший из общедоступных прогнозов, потому
что в неё вложены все деньги и вся информация рынка к моменту старта.
Отсюда CLV (closing line value): систематически брать цену лучше закрывающей —
это и есть проверяемое доказательство наличия edge.

По обзорам практики, игроки со стабильно положительным CLV почти всегда
прибыльны на дистанции, а с отрицательным — почти всегда убыточны, независимо
от текущей серии ([VSiN](https://vsin.com/how-to-bet/the-importance-of-closing-line-value/),
[GamblersAlmanac](https://gamblersalmanac.com/guides/closing-line-value-guide),
[Pikkit](https://pikkit.com/blog/how-to-track-closing-line-value-clv-in-sports-betting)).
Ориентиры по объёму выборки из тех же обзоров: 300–500 ставок с положительным
CLV — уже серьёзный аргумент, 1000+ — почти исключает, что вы в минусе на
дистанции.

**Что из этого следует для системы.** CLV пишется в журнал по каждой ставке
(`sbr/journal.py`, поле `closing_odds`), считается в `metrics.clv_pct` и
выводится в отчёте раньше, чем ROI. Оценивать модель по прибыли на выборке
меньше 100 ставок — значит оценивать шум.

Оговорка, которую важно не потерять: эти обзоры — отраслевые и не являются
рецензируемым исследованием. Академическая работа
[The Performance of Betting Lines for Predicting the Outcome of NFL Games](https://arxiv.org/pdf/1211.4000)
подтверждает более узкое: линия — сильный прогноз, обыграть закрывающую
тяжело. Прямой причинной связи «CLV → прибыль» ни одна из этих ссылок строго
не доказывает.

---

## 2. Размер ставки: дробный Kelly, а не полный

Полный критерий Келли максимизирует темп роста банка, но ценой просадок,
которые невозможно пережить психологически и опасно переживать финансово: на
полном Келли просадка 50% — рядовое событие.

Практические ориентиры из обзоров и симуляций
([Matthew Downey, симуляции](https://matthewdowney.github.io/uncertainty-kelly-criterion-optimal-bet-size.html),
[RebelBetting](https://www.rebelbetting.com/faq/kelly-criterion-for-stake-sizing),
[bettingexpert](https://www.bettingexpert.com/academy/advanced-betting-theory/kelly-criterion-explained)):

| Доля Келли | Темп роста | Просадка | Устойчивость к ошибке в оценке p |
|---|---|---|---|
| Полный | 100% | максимальная (≈50% обычна) | нулевая |
| Половинный | ≈75% | примерно вдвое меньше | средняя |
| Четверть | >50% | управляемая | выдерживает ошибку ≈3 пп |

Серия из 15 проигрышей подряд: около −18% банка на четвертном Келли против
около −55% на полном.

Академическая постановка задачи с явным ограничением на просадку —
[Risk-Constrained Kelly Gambling (arXiv:1603.06183)](https://arxiv.org/pdf/1603.06183);
обзор практических стратегий — [Optimal sports betting strategies in practice
(arXiv:2107.08827)](https://arxiv.org/pdf/2107.08827).

**Что из этого следует.** В движке зашита четверть Келли
(`value.size_bet`, `kelly_fraction_used=0.25`). Ключевой аргумент именно за
четверть, а не за половину: наша оценка вероятности берётся из модели с
ошибкой в несколько процентных пунктов, а четвертной Келли как раз и покрывает
ошибку около 3 пп без разорения.

Поверх Келли стоит второй тормоз: оценка модели сдвигается к рыночной
пропорционально неуверенности (`value.shrink_toward_market`). Edge, в котором
вы не уверены, — это меньший edge, и он должен давать меньшую ставку.

---

## 3. Снятие маржи: метод имеет значение, и тем больше, чем хуже контора

Коэффициент — это не вероятность. Чтобы получить вероятность рынка, надо снять
маржу, и способ снятия меняет ответ.

Реализованы пять методов (`sbr/odds.py`): мультипликативный, аддитивный,
степенной (power), odds-ratio (Cheung) и Shin. Обзоры и сравнения:
[penaltyblog](https://pena.lt/y/2025/09/14/from-biased-odds-to-fair-probabilities/),
[пакет `implied` (CRAN)](https://cran.r-project.org/web/packages/implied/vignettes/introduction.html),
[Clarke, Adjusting Bookmaker's Odds](https://outlier.bet/wp-content/uploads/2023/08/2017-clarke-adjusting_bookmakers_odds.pdf),
[octosport](https://medium.com/geekculture/how-to-compute-football-implied-probabilities-from-bookmakers-odds-bbb33ccf7c1d).

Единого победителя нет, и это важно. На очень эффективном рынке (АПЛ, низкая
маржа) простой мультипликативный метод показывает лучший RPS и практически не
отличается от odds-ratio и логарифмического. На менее эффективных рынках
эмпирика чаще указывает на Shin и power. Существует и критика Shin
([Maurice Berk](https://algorithmicsportsbetting.substack.com/p/its-time-to-retire-shins-method)).

Почему методы вообще расходятся: маржа распределяется по исходам неравномерно.
Fav-longshot bias — устойчиво наблюдаемое явление: на аутсайдера маржи
грузят больше, чем на фаворита
([Pinnacle](https://www.pinnacle.com/betting-resources/en/betting-strategy/what-is-the-favourite-longshot-bias/vun2u32r85ppf4yp),
[Sestovic, SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3035848)).
Отдельно отмечается, что в хоккее и бейсболе на мани-лайн наблюдали
**обратный** перекос, то есть переносить футбольную интуицию на хоккей нельзя.

### Эмпирика движка: цена вопроса в процентных пунктах

```
python3 -m sbr devig --odds 1.95,3.60,4.20     # маржа 2.87%
python3 -m sbr devig --odds 1.70,3.20,4.00     # маржа 15.07%
```

| Маржа книги | Разброс между методами по одному исходу |
|---|---|
| 2.87% | **0.48 пп** |
| 15.07% | **2.92 пп** |

Это и есть практический вывод, ради которого стоило считать: **на марже около
15% неопределённость самого способа снятия маржи (2.9 пп) сопоставима со всем
порогом edge, который мы ищем (4 пп).** Значит, на рынках с высокой маржой
«найденный edge» может целиком состоять из артефакта метода девига.

**Что из этого следует.** Движок считает все методы сразу
(`odds.devig_all`), берёт медиану и отдельно возвращает `spread_pp`. Этот
разброс вычитается из очков «согласия с рынком» в Confidence
(`scan.run_scan`), то есть чем хуже определена справедливая цена, тем ниже
уверенность и меньше ставка. Правило для работы: **на рынках с маржой выше
7–8% требуемый edge поднимается, а лучше просто искать более узкую линию.**

---

## 4. Футбол: xG как база, последние пять матчей — как поправка

Голы — самое редкое событие в футболе (2.5–3 за матч), поэтому результат
сильно зашумлён. Ударов в 10 раз больше, и модель ожидаемых голов использует
этот больший объём данных.

Ключевой эмпирический факт: **xG предсказывает будущие голы лучше, чем сами
голы**, и лучше, чем разница мячей или доля ударов (TSR)
([StatsPerform](https://www.statsperform.com/insights/expected-goals-xg-the-football-metric-changing-analysis-betting-and-fan-engagement/),
[PLOS One: Expected goals in football](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0282295),
[Hudl](https://www.hudl.com/blog/expected-goals-xg-explained)).

**Что из этого следует.** Базой рейтингов команды служит xG/xGA, а не голы;
`football.fit_dixon_coles` принимает xG на вход наравне с голами именно для
этого. Последние 5 матчей — поправка, а не основание: на выборке в 5 игр
разброс по голам таков, что почти любая «форма» укладывается в случайность.

### Почему Dixon-Coles, а не чистый Пуассон

Независимый Пуассон систематически занижает ничьи и врёт на четырёх самых
частых счетах. Dixon & Coles (1997) вводят один параметр rho, который правит
ровно четыре ячейки — 0:0, 1:0, 0:1, 1:1 — и не трогает остальное
([dashee87](https://dashee87.github.io/football/python/predicting-football-results-with-statistical-modelling-dixon-coles-and-time-weighting/),
[penaltyblog](https://pena.lt/y/2021/06/24/predicting-football-results-using-python-and-dixon-and-coles/),
[Wikipedia: Statistical association football predictions](https://en.wikipedia.org/wiki/Statistical_association_football_predictions)).

Проверено тестом `test_negative_rho_raises_the_draw`: при rho < 0 вероятность
ничьей растёт по сравнению с чистым Пуассоном, как и должно быть.

Затухание веса старых матчей — экспоненциальное, из той же работы. В движке
период полураспада 120 дней по умолчанию (`fit_dixon_coles(half_life_days=120)`).

---

## 5. Хоккей: вратарь и овертайм

**Вратарь — крупнейшая одиночная переменная.** GSAx (goals saved above
expected) считается основной метрикой, потому что учитывает качество бросков,
а не только их количество
([Action Network](https://www.actionnetwork.com/nhl/nhl-expected-goals-models-betting-how-to-bet-on-nhl),
[Evolving-Hockey](https://evolving-hockey.com/blog/a-new-expected-goals-model-for-predicting-goals-in-the-nhl/),
[arXiv:2511.07703 — skill-adjusted xG](https://arxiv.org/pdf/2511.07703)).

**Что из этого следует.** Неподтверждённый стартовый вратарь на
вратарезависимом рынке — жёсткий шлагбаум: `classify(...)` возвращает WAIT
независимо от размера edge и уровня уверенности
(тест `test_unconfirmed_goalie_forces_wait`). Влияние вратаря на λ считается
через `hockey.adjust_lambda_for_goalie`.

**Овертайм — отдельный рынок, а не оттенок основного.** В движке эти рынки
физически разделены:

- `hockey.regulation_1x2` — только 60 минут, три исхода;
- `hockey.moneyline` — победитель с учётом OT/SO, два исхода.

Эмпирика движка (λ 3.2 : 2.7): победа хозяина в основное время — 46.5%,
победа с учётом OT/SO — 54.9%. **Разрыв 8.4 пп.** Ставка, поставленная не на
тот из этих рынков, проигрывает не из-за модели, а из-за чтения линии.

Два следствия правил, которые в модели закодированы явно:

1. Овертайм ближе к монетке, чем основное время: формат 3-на-3 и буллиты
   сжимают разницу в классе. Поэтому рейтинговая оценка сдвигается к 0.5
   (`OT_SHRINK = 0.35`, тест `test_ot_probability_is_shrunk_toward_a_coin_flip`).
2. Победа в OT/SO добавляет ровно один гол. Ничьи — всегда чётный тотал,
   поэтому дополнительный гол может перевести тотал только через линию,
   стоящую над чётным числом: тотал 6.5 меняется на 5.0 пп, а тотал 5.5 — не
   меняется вообще (тест `test_ot_goal_lifts_totals_above_an_even_number_only`).

---

## 6. Как оценивать качество вероятностей

Brier score — средний квадрат ошибки вероятностного прогноза. Он раскладывается
на три части: reliability (калибровка), resolution (разрешающая способность) и
uncertainty (собственная сложность задачи)
([разбор декомпозиции](https://www.emergentmind.com/topics/brier-score-term),
[Ferro & Fricker, упрощение декомпозиции Мёрфи](https://rmets.onlinelibrary.wiley.com/doi/10.1002/qj.2985),
[Evaluating probabilistic classifiers, arXiv:2008.03033](https://arxiv.org/pdf/2008.03033)).

Практический смысл: цель — максимум resolution при сохранении калибровки.
Модель, которая всегда говорит «50%», идеально калибрована и бесполезна.
Модель, которая уверенно говорит «70%» и попадает в 55% случаев, — вредна,
потому что на её числах считается размер ставки.

**Что из этого следует.** `metrics.brier` и `metrics.calibration_table`
разбивают прогнозы на полосы 50–55 / 55–60 / 60–65 / 65–70 / 70+ и сравнивают
заявленную вероятность с фактической частотой. CLI отдельно предупреждает, что
при менее чем 30 закрытых ставках калибровка не доказывает ничего.

---

## 7. Движение линии: сигнал к перепроверке, а не основание для ставки

Резкое движение против вашей позиции означает, что в рынок вошли деньги,
знающие больше вас — состав, травма, вратарь. Это повод перепроверить
исходную гипотезу, а не повод её усилить.

Правило в системе: если модель говорит «брать A», а линия агрессивно уходит
против A, кандидат проходит дополнительный adversarial-проход и по умолчанию
понижается до WAIT. «Линия двинулась» само по себе не Reason Code для ставки.

---

## 8. Сколько нужно ставок, чтобы что-то менять в модели

Ориентиры, которые зашиты в регламент самоаудита:

| Объём | Что можно сказать |
|---|---|
| < 30 закрытых | ничего; это шум |
| 30–50 | предварительные наблюдения, гипотезы |
| 50–100 | можно искать слабые сегменты |
| 100+ | можно менять веса факторов |
| 300–500 с CLV+ | серьёзный аргумент, что edge реален |

Запрет, который следует отсюда напрямую: **не менять модель после 2–3
проигрышей.** Изменение весов на короткой серии — это подгонка под шум, и она
ухудшает модель, а не улучшает.

---

## 9. Чего система принципиально не делает

- Не гарантирует прибыль. Положительное EV — это утверждение о среднем на
  большой дистанции при условии, что оценка вероятности верна. Она может быть
  неверна.
- Не догоняет. Размер ставки зависит только от банка, edge и уверенности —
  и никогда от результата предыдущей ставки.
- Не выдумывает данные. Нет состава — Data Quality падает, и ставка
  запрещается механически, а не «на усмотрение».
- Не выполняет квоту. VALUE: 0 при 15 REJECTED — штатный результат скана.

---

## Источники

Ставки, банкролл, Келли:
[Risk-Constrained Kelly Gambling](https://arxiv.org/pdf/1603.06183) ·
[Optimal sports betting strategies in practice](https://arxiv.org/pdf/2107.08827) ·
[Downey: симуляции дробного Келли](https://matthewdowney.github.io/uncertainty-kelly-criterion-optimal-bet-size.html) ·
[bettingexpert](https://www.bettingexpert.com/academy/advanced-betting-theory/kelly-criterion-explained) ·
[RebelBetting](https://www.rebelbetting.com/faq/kelly-criterion-for-stake-sizing)

CLV:
[VSiN](https://vsin.com/how-to-bet/the-importance-of-closing-line-value/) ·
[GamblersAlmanac](https://gamblersalmanac.com/guides/closing-line-value-guide) ·
[Pikkit](https://pikkit.com/blog/how-to-track-closing-line-value-clv-in-sports-betting) ·
[NFL betting lines, arXiv](https://arxiv.org/pdf/1211.4000)

Маржа и девиг:
[penaltyblog](https://pena.lt/y/2025/09/14/from-biased-odds-to-fair-probabilities/) ·
[пакет implied, CRAN](https://cran.r-project.org/web/packages/implied/vignettes/introduction.html) ·
[Clarke 2017](https://outlier.bet/wp-content/uploads/2023/08/2017-clarke-adjusting_bookmakers_odds.pdf) ·
[octosport](https://medium.com/geekculture/how-to-compute-football-implied-probabilities-from-bookmakers-odds-bbb33ccf7c1d) ·
[критика Shin](https://algorithmicsportsbetting.substack.com/p/its-time-to-retire-shins-method) ·
[Pinnacle: fav-longshot bias](https://www.pinnacle.com/betting-resources/en/betting-strategy/what-is-the-favourite-longshot-bias/vun2u32r85ppf4yp) ·
[Sestovic, SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3035848)

Футбол:
[PLOS One: Expected goals in football](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0282295) ·
[StatsPerform](https://www.statsperform.com/insights/expected-goals-xg-the-football-metric-changing-analysis-betting-and-fan-engagement/) ·
[Hudl](https://www.hudl.com/blog/expected-goals-xg-explained) ·
[dashee87: Dixon-Coles](https://dashee87.github.io/football/python/predicting-football-results-with-statistical-modelling-dixon-coles-and-time-weighting/) ·
[penaltyblog: Dixon-Coles в Python](https://pena.lt/y/2021/06/24/predicting-football-results-using-python-and-dixon-and-coles/) ·
[Wikipedia](https://en.wikipedia.org/wiki/Statistical_association_football_predictions)

Хоккей:
[Action Network: xG-модели в NHL](https://www.actionnetwork.com/nhl/nhl-expected-goals-models-betting-how-to-bet-on-nhl) ·
[Evolving-Hockey](https://evolving-hockey.com/blog/a-new-expected-goals-model-for-predicting-goals-in-the-nhl/) ·
[Skill-adjusted xG, arXiv:2511.07703](https://arxiv.org/pdf/2511.07703)

Оценка прогнозов:
[Brier: декомпозиция](https://www.emergentmind.com/topics/brier-score-term) ·
[Ferro & Fricker](https://rmets.onlinelibrary.wiley.com/doi/10.1002/qj.2985) ·
[Evaluating probabilistic classifiers](https://arxiv.org/pdf/2008.03033)
