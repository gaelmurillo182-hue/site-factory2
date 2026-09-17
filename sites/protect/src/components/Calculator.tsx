import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check } from '@phosphor-icons/react'
import { motion, useReducedMotion } from 'motion/react'
import { FIRE_ALARM_ON_SITE } from '../data/site'

/* =============================================================================
   Калькулятор-ориентир.

   Клиент попросил калькулятор (бриф, раздел 8), но комплектов с фиксированной
   ценой у компании нет (раздел 4). Поэтому калькулятор не считает деньги:
   он собирает состав будущей системы и список того, что уточняется на замере.
   Выдуманная сумма выросла бы в смете, и разговор начался бы с недоверия.
   ============================================================================= */

type Step = {
  id: string
  legend: string
  hint?: string
  multi?: boolean
  options: { value: string; label: string; note?: string }[]
}

const STEPS: Step[] = [
  {
    id: 'object',
    legend: 'Какой объект',
    options: [
      { value: 'Квартира', label: 'Квартира' },
      { value: 'Частный дом и участок', label: 'Частный дом и участок' },
      { value: 'СНТ или дача', label: 'СНТ или дача' },
      { value: 'Офис', label: 'Офис' },
      { value: 'Магазин', label: 'Магазин' },
      { value: 'Кафе', label: 'Кафе' },
      { value: 'Склад', label: 'Склад' },
      { value: 'Производство', label: 'Производство' },
      { value: 'Автосервис', label: 'Автосервис' },
      { value: 'Стройплощадка', label: 'Стройплощадка' },
      { value: 'МКД, ТСЖ, УК', label: 'МКД, ТСЖ, УК' },
      { value: 'Школа или детский сад', label: 'Школа или детский сад' },
      { value: 'Ферма', label: 'Ферма' },
      { value: 'Другое', label: 'Другое' },
    ],
  },
  {
    id: 'zones',
    legend: 'Сколько входов и зон нужно держать под контролем',
    hint: 'Считайте не камеры, а места: дверь, ворота, касса, проезд. Сколько на них нужно камер, посчитаем мы.',
    options: [
      { value: '1 или 2', label: '1 или 2' },
      { value: '3 или 4', label: '3 или 4' },
      { value: 'от 5 до 8', label: 'от 5 до 8' },
      { value: 'больше 8', label: 'больше 8' },
      { value: 'пока не считал', label: 'Пока не считал' },
    ],
  },
  {
    id: 'where',
    legend: 'Где смотрим',
    options: [
      { value: 'только в помещении', label: 'Только в помещении' },
      { value: 'только на улице', label: 'Только на улице' },
      { value: 'в помещении и на улице', label: 'И в помещении, и на улице' },
    ],
  },
  {
    id: 'night',
    legend: 'Ночью картинка нужна',
    hint: 'Уличный фонарь рядом с камерой чаще мешает, чем помогает. Ночной режим подбирается под фактический свет на объекте.',
    options: [
      { value: 'да', label: 'Да, ночь — основное время' },
      { value: 'нет', label: 'Нет, ночью там никого не бывает' },
      { value: 'круглосуточное освещение', label: 'На объекте круглосуточное освещение' },
    ],
  },
  {
    id: 'storage',
    legend: 'Где хранить архив',
    options: [
      {
        value: 'регистратор на объекте',
        label: 'Регистратор на объекте',
        note: 'Записи остаются у вас, платить ежемесячно не нужно, но железо стоит на объекте и его можно унести вместе с ним.',
      },
      {
        value: 'облако',
        label: 'Облако',
        note: 'Записи не пропадут вместе с регистратором, но нужен стабильный интернет и абонентская плата.',
      },
      {
        value: 'гибрид: локально плюс копия в облаке',
        label: 'Гибрид: локально плюс копия в облаке',
        note: 'И то и другое: локальная запись плюс копия ключевых камер в облаке.',
      },
      { value: 'нужен совет', label: 'Не знаю, нужен совет' },
    ],
  },
  {
    id: 'remote',
    legend: 'Удалённый просмотр',
    hint: 'Настройка одного устройства входит в пусконаладку. Остальные настроим на том же выезде.',
    options: [
      { value: 'с телефона', label: 'Да, с телефона' },
      { value: 'с телефона и с компьютера', label: 'Да, с телефона и с компьютера' },
      { value: 'не нужен', label: 'Нет, смотреть буду на месте' },
    ],
  },
  {
    id: 'extra',
    legend: 'Что ещё нужно на объекте',
    hint: 'Можно выбрать несколько.',
    multi: true,
    options: [
      { value: 'Контроль доступа (СКУД)', label: 'Контроль доступа (СКУД)' },
      { value: 'Домофония', label: 'Домофония' },
      { value: 'Шлагбаум', label: 'Шлагбаум' },
      { value: 'Охранная сигнализация', label: 'Охранная сигнализация' },
      { value: 'Локальная сеть, СКС', label: 'Локальная сеть, СКС' },
      { value: 'Wi-Fi', label: 'Wi-Fi' },
      { value: 'Электрика', label: 'Электрика' },
      { value: 'Только видеонаблюдение', label: 'Только видеонаблюдение' },
    ],
  },
]

/* Пожарная сигнализация добавляется в список, только если клиент решил
   оставить направление на сайте: см. FIRE_ALARM_ON_SITE в data/site.ts. */
if (FIRE_ALARM_ON_SITE) {
  const extra = STEPS.find((s) => s.id === 'extra')
  extra?.options.splice(4, 0, {
    value: 'Пожарная сигнализация',
    label: 'Пожарная сигнализация',
  })
}

const CHECKS = [
  'Длину трасс и способ прокладки: материал стен, чердак, фасад, подвесной потолок',
  'Точки подключения питания и свободные автоматы в щите',
  'Место под регистратор: доступ, охлаждение, защита от того, что его унесут вместе с записями',
  'Фактическую освещённость ночью и источники засветки',
  'Тип интернет-подключения и адрес: серый или белый IP, роутер провайдера',
  'Высоту монтажа и нужен ли подъём на фасад',
  'Конкретные модели камер под каждый сектор обзора',
]

type Answers = Record<string, string | string[]>

export default function Calculator() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [done, setDone] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  /* Отложенный переход к следующему вопросу. Держим таймер, чтобы
     несколько быстрых кликов подряд не пролистали калькулятор насквозь. */
  const advanceRef = useRef<number | null>(null)
  const reduce = useReducedMotion()

  useEffect(
    () => () => {
      if (advanceRef.current !== null) window.clearTimeout(advanceRef.current)
    },
    [],
  )

  const current = STEPS[Math.min(step, STEPS.length - 1)]
  const chosen = answers[current?.id]
  const canGo = current?.multi
    ? Array.isArray(chosen) && chosen.length > 0
    : typeof chosen === 'string' && chosen.length > 0

  function pick(value: string) {
    if (current.multi) {
      const prev = Array.isArray(chosen) ? chosen : []
      const exclusive = 'Только видеонаблюдение'
      let next: string[]
      if (value === exclusive) next = prev.includes(exclusive) ? [] : [exclusive]
      else
        next = prev.includes(value)
          ? prev.filter((v) => v !== value)
          : [...prev.filter((v) => v !== exclusive), value]
      setAnswers((a) => ({ ...a, [current.id]: next }))
      return
    }

    setAnswers((a) => ({ ...a, [current.id]: value }))

    // Один вариант — сразу следующий вопрос: меньше кликов, шаг очевиден.
    // Пауза нужна, чтобы человек увидел, что именно он выбрал.
    if (advanceRef.current !== null) window.clearTimeout(advanceRef.current)
    advanceRef.current = window.setTimeout(() => {
      advanceRef.current = null
      setStep((s) => Math.min(s + 1, STEPS.length - 1))
    }, 160)
  }

  function isPicked(value: string) {
    if (Array.isArray(chosen)) return chosen.includes(value)
    return chosen === value
  }

  function reset() {
    setAnswers({})
    setStep(0)
    setDone(false)
    panelRef.current?.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' })
  }

  const composition = useMemo(() => {
    const a = answers
    const zones = (a.zones as string) || 'нужное число'
    const where = (a.where as string) || 'по объекту'
    const night = a.night === 'нет' ? 'не требуется' : 'настраиваем под фактический свет'
    const storage = a.storage === 'нужен совет' ? 'подберём на замере' : (a.storage as string)
    const extras = Array.isArray(a.extra) ? a.extra.filter((e) => e !== 'Только видеонаблюдение') : []
    const remote = a.remote === 'не нужен' ? null : (a.remote as string)

    const rows: { k: string; v: string }[] = [
      { k: 'Камеры под ваши зоны', v: `зон под контролем — ${zones}, ${where}` },
      { k: 'Тип оборудования', v: 'IP или аналог AHD, подбирается по существующим линиям на объекте' },
      { k: 'Ночной режим', v: night },
      { k: 'Хранение архива', v: `${storage}, диск под нужную глубину записи` },
      { k: 'Питание и коммутация', v: 'коммутатор с расчётом PoE-бюджета, блоки питания, отдельная линия в щите' },
      { k: 'Кабельная трасса', v: 'гофра, кабель-канал или штроба, проходы через стены с герметизацией' },
      {
        k: 'Пусконаладка',
        v: remote
          ? `настройка записи, детекции, ночного режима и удалённого просмотра (${remote})`
          : 'настройка записи, детекции и ночного режима',
      },
    ]
    if (extras.length) rows.push({ k: 'Дополнительно', v: extras.join(', ').toLowerCase() })
    return rows
  }, [answers])

  return (
    <div className="calc" ref={panelRef}>
      <div className="calc__rail" aria-hidden="true">
        {STEPS.map((s, i) => (
          <span
            key={s.id}
            className={`calc__tick${i === step && !done ? ' calc__tick--now' : ''}${
              answers[s.id] ? ' calc__tick--filled' : ''
            }`}
          />
        ))}
      </div>

      {/* Без AnimatePresence намеренно: при быстрых кликах подряд она
          зависала на анимации выхода и переставала показывать новый шаг.
          Смена key меняет узел, вход отрабатывает, выход не нужен. */}
      {!done ? (
        <motion.div
          key={current.id}
          className="calc__panel"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <fieldset className="calc__fieldset">
            <legend className="calc__legend">
              <span className="calc__step num">
                Шаг {step + 1} из {STEPS.length}
              </span>
              <span className="calc__question">{current.legend}</span>
            </legend>

            {current.hint && <p className="note calc__hint">{current.hint}</p>}

            <div className={`calc__options${current.multi ? ' calc__options--multi' : ''}`}>
              {current.options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className={`calc__option${isPicked(o.value) ? ' calc__option--on' : ''}`}
                  data-calc-option
                  aria-pressed={isPicked(o.value)}
                  onClick={() => pick(o.value)}
                >
                  <span className="calc__option-mark" aria-hidden="true">
                    {isPicked(o.value) && <Check size={14} weight="bold" />}
                  </span>
                  <span className="calc__option-body">
                    <span className="calc__option-label">{o.label}</span>
                    {o.note && <span className="calc__option-note">{o.note}</span>}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="calc__nav">
            <button
              type="button"
              className="btn btn--ghost btn--small"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
            >
              <ArrowLeft size={16} weight="bold" aria-hidden="true" />
              Назад
            </button>

            {step === STEPS.length - 1 ? (
              <button
                type="button"
                className="btn btn--primary btn--small"
                data-calc-finish
                onClick={() => setDone(true)}
                disabled={!canGo}
              >
                Показать состав системы
                <ArrowRight size={16} weight="bold" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn--ghost btn--small"
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                disabled={!canGo}
              >
                Дальше
                <ArrowRight size={16} weight="bold" aria-hidden="true" />
              </button>
            )}
          </div>

          {!canGo && step > 0 && (
            <p className="tiny calc__empty">Выберите вариант, чтобы перейти дальше.</p>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="result"
          className="calc__panel calc__panel--result"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <h3 className="h3 calc__result-title">Вот из чего будет состоять ваша система</h3>
          <p className="text calc__result-lead">
            Это предварительный состав по вашим ответам. Точные модели, количество и
            объём работ инженер определит на объекте.
          </p>

          <div className="calc__result-cols">
            <div>
              <p className="label">В работу входит</p>
              <dl className="calc__spec">
                {composition.map((row) => (
                  <div className="calc__spec-row" key={row.k}>
                    <dt className="calc__spec-key">{row.k}</dt>
                    <dd className="calc__spec-val">{row.v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div>
              <p className="label">Что уточняем на замере</p>
              <ul className="calc__checks">
                {CHECKS.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="calc__why">
            <h4 className="h4">Почему здесь нет суммы</h4>
            <p className="text">
              Мы могли бы поставить сюда цифру, но она была бы выдуманной. Значительная
              часть стоимости системы — это не камеры, а то, что видно только на
              объекте: длина и способ прокладки трасс, материал стен, наличие свободной
              линии в щите, высота фасада, состояние существующей проводки. Калькулятор
              этого не знает. Названная им сумма выросла бы в смете, и разговор начался
              бы с недоверия. Поэтому цену называем после замера — одну и окончательную.
            </p>
          </div>

          <div className="calc__result-actions">
            <a className="btn btn--primary" href="#lead">
              Вызвать инженера на замер
            </a>
            <button type="button" className="btn btn--ghost" onClick={reset}>
              Пройти заново
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
