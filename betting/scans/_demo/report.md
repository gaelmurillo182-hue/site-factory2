# СКАН ЛИНИИ — ДЕМО (вымышленные данные, не для ставок)

Модель: **V5.0** · Банк: **100 000 ₽** · 1U = **1 000 ₽** (1.0% банка)

Просканировано: 2 событий, 7 рынков → VALUE 0 / WAIT 2 / REJECTED 10


## ⚠️ Состояние данных

- ЭТО ДЕМО-ПРОГОН НА ВЫМЫШЛЕННЫХ ЦИФРАХ. Ни один коэффициент и ни один xG здесь не взят из реального источника.


## 1. VALUE

**VALUE: 0.** Ни один кандидат не прошёл фильтры. Это допустимый и нормальный результат скана — квоты на количество ставок нет.


## 2. WAIT

| Матч | Почему ждём | Триггер (измеримый) | Целевой рынок | Мин. кэф | Отмена если |
|---|---|---|---|---|---|
| Клуб C - Клуб D | market turns on the starting goalie and he is unconfirmed | вратарь подтверждён официальным источником клуба за 30-60 мин до старта | moneyline home | 1.86 | стартует backup ИЛИ кэф упал ниже минимального |
| Клуб C - Клуб D | market turns on the starting goalie and he is unconfirmed | вратарь подтверждён официальным источником клуба за 30-60 мин до старта | regulation_winner home | 2.38 | стартует backup ИЛИ кэф упал ниже минимального |


## 3. REJECTED

| Матч | Рынок | Кэф | Почему выглядел интересно | Почему модель отказалась |
|---|---|---|---|---|
| Команда A - Команда B | moneyline away | 4.20 | edge по модели +0.8 пп, EV -0.3% | edge 0.78pp below the 4.0pp required for this market |
| Клуб C - Клуб D | regulation_winner tie | 4.10 | edge по модели -4.7 пп, EV -25.2% | edge -4.72pp below the 6.5pp required for this market |
| Команда A - Команда B | moneyline draw | 3.60 | edge по модели -0.7 пп, EV -5.8% | edge -0.69pp below the 4.0pp required for this market |
| Клуб C - Клуб D | regulation_winner away | 2.70 | edge по модели -2.0 пп, EV -10.1% | edge -2.05pp below the 6.5pp required for this market |
| Команда A - Команда B | dnb away | 2.55 | edge по модели -2.9 пп, EV -14.9% | edge -2.87pp below the 4.0pp required for this market |
| Клуб C - Клуб D | moneyline away | 2.05 | edge по модели -5.0 пп, EV -13.1% | edge -4.99pp below the 4.0pp required for this market |
| Команда A - Команда B | btts no | 1.98 | edge по модели -0.2 пп, EV -6.3% | edge -0.15pp below the 6.5pp required for this market |
| Команда A - Команда B | moneyline home | 1.95 | edge по модели -0.1 пп, EV -2.3% | edge -0.09pp below the 4.0pp required for this market |
| Клуб C - Клуб D | total under 5.5 | 1.95 | edge по модели -3.3 пп, EV -10.3% | edge -3.33pp below the 4.0pp required for this market |
| Команда A - Команда B | total over 2.5 | 1.92 | edge по модели +0.3 пп, EV -4.4% | edge 0.34pp below the 4.0pp required for this market |


## 4. BETTING CARD

**Ставок нет.** Риск сегодня: 0 ₽.

**TOTAL RISK:** 0 ₽ / 0.00U
**BANK EXPOSURE:** 0.00%
**RESERVE FOR WAIT/LIVE:** 1500 ₽ (1.50U)
**Ожидаемая прибыль модели:** +0 ₽ (это матожидание, а не прогноз результата)
