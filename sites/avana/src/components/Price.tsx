import { useId, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Reveal, RevealItem } from './motion/Reveal'
import { MotionLink, MotionButtonEl } from './motion/Interactive'

const DIKIDI_URL = 'https://dikidi.net/970292'

type TierKey = 'master' | 'top' | 'owner'
type BadgeKey = 'hit' | 'sale' | 'first' | 'free'

const TIER_ORDER: TierKey[] = ['master', 'top', 'owner']
const TIER_LABEL: Record<TierKey, string> = {
  master: 'Мастер',
  top: 'Топ-мастер',
  owner: 'Владелица',
}
const TIER_GENITIVE: Record<TierKey, string> = {
  master: 'мастера',
  top: 'топ-мастера',
  owner: 'владелицы',
}
const TIER_TOKEN: Record<TierKey, { line: string; text: string; surface: string }> = {
  master: { line: '--tier-base-line', text: '--tier-base-text', surface: '--tier-base-surface' },
  top: { line: '--tier-top-line', text: '--tier-top-text', surface: '--tier-top-surface' },
  owner: { line: '--tier-owner-line', text: '--tier-owner-text', surface: '--tier-owner-surface' },
}

const BADGE_TOKEN: Record<BadgeKey, { bg: string; text: string; border: string; label: string }> = {
  hit: { bg: '--badge-hit-bg', text: '--badge-hit-text', border: '--badge-hit-border', label: 'ХИТ' },
  sale: { bg: '--badge-sale-bg', text: '--badge-sale-text', border: '--badge-sale-border', label: 'АКЦИЯ' },
  first: { bg: '--badge-first-bg', text: '--badge-first-text', border: '--badge-first-border', label: '−10%' },
  free: { bg: '--badge-free-bg', text: '--badge-free-text', border: '--badge-free-border', label: 'Бесплатно' },
}

interface TierRow {
  name: string
  badges?: BadgeKey[]
  prices: Partial<Record<TierKey, string>>
  tierNote?: Partial<Record<TierKey, string>>
}

interface FlatRow {
  name: string
  price: string
  time?: string
  badges?: BadgeKey[]
}

interface SubGroup {
  title: string
  description: string
  rows: TierRow[]
}

interface Category {
  id: string
  title: string
  description?: string
  kind: 'tiered' | 'flat'
  subgroups?: SubGroup[]
  rows?: FlatRow[]
}

const NARASHIVANIE_SUBGROUPS: SubGroup[] = [
  {
    title: 'Объёмы',
    description:
      'От классики до мега-объёма 6–8D. Чем больше объём, тем плотнее ряд и заметнее работа. LED-наращивание входит в цену на любом уровне',
    rows: [
      { name: '1 объём (классика)', prices: { master: '2 500 ₽', top: '2 800 ₽', owner: '3 500 ₽' } },
      { name: '1,5 объём', prices: { master: '2 600 ₽', top: '2 900 ₽', owner: '3 600 ₽' } },
      { name: '1,5 объём + мокрый эффект', prices: { master: '2 650 ₽', top: '3 000 ₽', owner: '3 700 ₽' } },
      { name: '2 объём', prices: { master: '2 700 ₽', top: '3 100 ₽', owner: '3 800 ₽' } },
      { name: '2–3 объём (смешанный)', prices: { master: '2 800 ₽', top: '3 200 ₽', owner: '3 900 ₽' } },
      { name: '3 объём', prices: { master: '3 000 ₽', top: '3 300 ₽', owner: '4 000 ₽' } },
      { name: '3–4 объём (смешанный)', prices: { master: '3 300 ₽', top: '3 500 ₽', owner: '4 200 ₽' } },
      { name: '4 объём', prices: { master: '3 500 ₽', top: '3 700 ₽', owner: '4 400 ₽' } },
      {
        name: '4–6 объём',
        prices: { master: '4 000 ₽', top: '3 900 ₽', owner: '5 100 ₽' },
        tierNote: { owner: 'Голливуд' },
      },
      { name: '6–8 объём (мега)', prices: { master: '4 300 ₽', top: '5 000 ₽', owner: '6 000 ₽' } },
    ],
  },
  {
    title: 'Хиты и эффекты',
    description:
      'Позиции, которые заказывают чаще остальных: норка, экспресс, мокрый эффект. Часть эффектов доступна не на всех уровнях мастера',
    rows: [
      {
        name: 'Норка',
        badges: ['hit'],
        prices: { master: '3 000 ₽', top: '3 500 ₽', owner: '4 000 ₽' },
        tierNote: { owner: 'натуральная норка' },
      },
      { name: 'Экспресс-наращивание', badges: ['hit'], prices: { master: '2 500 ₽', top: '2 700 ₽', owner: '3 500 ₽' } },
      { name: 'Эффект мокрых ресниц (2 объём)', prices: { master: '2 700 ₽', top: '3 100 ₽', owner: '3 800 ₽' } },
      {
        name: 'Эффект мокрых ресниц (2–3 объём)',
        badges: ['hit'],
        prices: { master: '2 800 ₽', top: '3 200 ₽', owner: '3 900 ₽' },
      },
      { name: 'Эффект мокрых ресниц (3 объём)', prices: { master: '2 900 ₽', top: '3 300 ₽', owner: '4 000 ₽' } },
      { name: 'Эффект мокрых ресниц (3–4 объём)', prices: { master: '3 000 ₽', top: '3 400 ₽', owner: '4 100 ₽' } },
      { name: 'Эффект мокрых ресниц (4–5 объём)', prices: { master: '3 100 ₽', top: '3 500 ₽', owner: '4 200 ₽' } },
      { name: 'Эффект ламинирования ресниц', prices: { master: '2 900 ₽', top: '3 200 ₽' } },
      { name: '«Анимэ» эффект', prices: { top: '4 000 ₽', owner: '4 700 ₽' } },
      { name: 'Эффект «TIFFANY»', prices: { top: '3 500 ₽' } },
      { name: 'Эффект «Американка»', prices: { top: '3 800 ₽' } },
      { name: '«Хочу довериться мастеру»', prices: { master: '3 000 ₽', top: '3 000 ₽', owner: '4 200 ₽' } },
      { name: 'Первый раз у Дарьи', prices: { owner: '5 000 ₽' } },
    ],
  },
  {
    title: 'Дополнения к объёму',
    description:
      'Добавляются к любой базовой работе: цвет, блеск, лучики, стрелка, гипер-длина от 16 мм. Сумма считается поверх цены объёма',
    rows: [
      { name: 'LED-наращивание', prices: { master: 'Бесплатно', top: 'Бесплатно', owner: 'Бесплатно' } },
      { name: 'Цветные реснички', prices: { master: '300 ₽', top: '300 ₽', owner: '300 ₽' } },
      { name: 'Коричневые реснички', prices: { master: '200 ₽', top: '200 ₽', owner: '200 ₽' } },
      { name: 'Блестящие реснички', prices: { master: '500 ₽', top: '500 ₽', owner: '500 ₽' } },
      { name: 'Полное цветное / омбре', prices: { master: '500 ₽', top: '500 ₽', owner: '500 ₽' } },
      { name: 'Лучики', prices: { master: '300 ₽', top: '500 ₽', owner: '500 ₽' } },
      { name: 'Лучики-пёрышки', prices: { master: '500 ₽', top: '700 ₽', owner: '700 ₽' } },
      { name: 'Эффект стрелки', prices: { master: '300 ₽', top: '500 ₽', owner: '500 ₽' } },
      { name: 'Гипер-длина (от 16 мм)', prices: { master: '300 ₽', top: '300 ₽', owner: '300 ₽' } },
      { name: 'Доплата за густоту/сложность', prices: { owner: '500 ₽' } },
    ],
  },
  {
    title: 'Коррекция и снятие',
    description:
      'Коррекция считается до трёх недель носки. Снятие ресниц AVANA бесплатно, если сразу делаете новое наращивание. Снятие после другой студии — 400 ₽, у владелицы 500 ₽',
    rows: [
      { name: 'Коррекция 1–2D (до 3 недель)', prices: { master: '1 600 ₽', top: '1 800 ₽', owner: '2 600 ₽' } },
      {
        name: 'Коррекция 2–3D и более (до 3 недель)',
        prices: { master: '2 100 ₽', top: '2 300 ₽', owner: '3 100 ₽' },
      },
      { name: 'Коррекция (норка)', prices: { owner: '2 800 ₽' } },
      { name: 'Уголки (неполное наращивание)', prices: { master: '2 000 ₽', top: '2 200 ₽', owner: '3 100 ₽' } },
      { name: 'Наращивание нижних ресниц', prices: { master: 'от 1 200 ₽', top: '1 200 ₽', owner: '1 700 ₽' } },
      { name: 'Цветное наращивание нижних', prices: { master: '1 500 ₽', top: '1 500 ₽', owner: '2 300 ₽' } },
      {
        name: 'Снятие AVANA (с новым наращиванием)',
        prices: { master: 'Бесплатно', top: 'Бесплатно', owner: 'Бесплатно' },
      },
      { name: 'Снятие других студий', prices: { master: '400 ₽', top: '400 ₽', owner: '500 ₽' } },
      { name: 'Снятие без наращивания', prices: { master: '400 ₽', top: '400 ₽', owner: '500 ₽' } },
      { name: 'Сложное снятие', prices: { master: '500 ₽', top: '500 ₽', owner: '600 ₽' } },
    ],
  },
]

const CATEGORIES: Category[] = [
  {
    id: 'narashivanie',
    title: 'Наращивание ресниц',
    kind: 'tiered',
    subgroups: NARASHIVANIE_SUBGROUPS,
  },
  {
    id: 'lamination',
    title: 'Ламинирование ресниц',
    description: 'Верхние и нижние, с окрашиванием и без. Комплекс с бровями дешевле, чем две процедуры по отдельности',
    kind: 'flat',
    rows: [
      { name: 'Ламинирование верхних (без окрашивания)', price: '2 200 ₽', time: '1 ч' },
      { name: 'Ламинирование верхних (с окрашиванием)', price: '2 500 ₽', time: '1 ч' },
      { name: 'Ламинирование нижних (без окрашивания)', price: '1 000 ₽', time: '20 м' },
      { name: 'Ламинирование нижних (с окрашиванием)', price: '1 200 ₽', time: '30 м' },
      {
        name: 'АКЦИЯ: верхние + нижние с окрашиванием',
        price: '3 500 ₽',
        time: '1 ч 20 м',
        badges: ['sale'],
      },
      {
        name: 'АКЦИЯ: комплекс (ресницы + брови)',
        price: 'от 4 200 ₽',
        time: '1 ч 30 м',
        badges: ['sale'],
      },
      {
        name: '−10% первый визит: комплекс (ресницы + брови)',
        price: 'от 3 700 ₽',
        time: '1 ч 30 м',
        badges: ['first'],
      },
      { name: 'Ботокс (доп. к ламинированию)', price: '300 ₽', time: '10 м' },
    ],
  },
  {
    id: 'brows',
    title: 'Оформление бровей',
    description: 'Коррекция, окрашивание краской или хной, ламинирование, долговременная укладка. Есть мужская коррекция',
    kind: 'flat',
    rows: [
      { name: 'Коррекция женская (воск/пинцет)', price: 'от 800 ₽', time: '15 м' },
      { name: 'Лёгкая коррекция женская', price: '600 ₽', time: '10 м' },
      { name: 'Коррекция мужская', price: '800 ₽', time: '45 м' },
      { name: 'Коррекция с прореживанием', price: '1 000 ₽', time: '20 м' },
      { name: 'Окрашивание краской', price: 'от 800 ₽', time: '20 м' },
      { name: 'Окрашивание хной (без коррекции)', price: '900 ₽', time: '30 м' },
      { name: 'Осветление бровей', price: '700 ₽', time: '15 м' },
      { name: 'Коррекция + окрашивание краской', price: 'от 1 500 ₽', time: '30 м' },
      { name: 'Коррекция + окрашивание хной', price: '1 700 ₽', time: '45 м' },
      { name: 'Окрашивание + прореживание и коррекция', price: 'от 1 700 ₽', time: '40 м' },
      { name: 'Ламинирование бровей (без окраш. и коррекции)', price: 'от 1 500 ₽', time: '20 м' },
      { name: 'Ламинирование комплекс (коррекция + окрашивание)', price: 'от 2 500 ₽', time: '45 м' },
      { name: 'Долговременная укладка (без коррекции)', price: 'от 1 500 ₽', time: '20 м' },
      { name: 'Долговременная укладка комплекс', price: 'от 2 500 ₽', time: '45 м' },
      {
        name: 'АКЦИЯ: ламинирование комплекс (брови + ресницы)',
        price: '4 500 ₽',
        time: '1 ч 30 м',
        badges: ['sale'],
      },
      {
        name: '−10% первый визит: комплекс',
        price: '4 000 ₽',
        time: '1 ч 30 м',
        badges: ['first'],
      },
      { name: 'Веснушки', price: '600 ₽', time: '20 м', badges: ['hit'] },
    ],
  },
  {
    id: 'lash-tint',
    title: 'Окрашивание ресниц',
    description: 'Отдельная услуга для тех, кто не наращивает: верхние 500 ₽, нижние 300 ₽, вместе 600 ₽',
    kind: 'flat',
    rows: [
      { name: 'Окрашивание верхних краской', price: '500 ₽' },
      { name: 'Окрашивание нижних краской', price: '300 ₽' },
      { name: 'Окрашивание верхних и нижних', price: '600 ₽' },
    ],
  },
  {
    id: 'pmu',
    title: 'Перманентный макияж',
    description:
      'Первичная процедура, коррекция, перекрытие чужой работы и удаление ремувером. Коррекция после нашего мастера всегда дешевле перекрытия',
    kind: 'flat',
    rows: [
      { name: 'Перманент бровей (первичная)', price: '8 500 ₽', time: '1 ч 30 м' },
      { name: 'Перманент губ (первичная)', price: '8 500 ₽', time: '2 ч' },
      { name: 'Межресничка', price: '6 500 ₽', time: '1 ч 30 м' },
      { name: 'Коррекция бровей (после базовой)', price: '4 500 ₽', time: '1 ч' },
      { name: 'Коррекция бровей (после перекрытия)', price: '4 700 ₽', time: '1 ч' },
      { name: 'Коррекция губ (после базовой)', price: '4 500 ₽', time: '1 ч 30 м' },
      { name: 'Коррекция губ (после перекрытия)', price: '4 700 ₽', time: '1 ч 30 м' },
      { name: 'Коррекция межреснички', price: '3 500 ₽', time: '30 м' },
      { name: 'Перекрытие бровей (после другого мастера)', price: '8 900 ₽', time: '1 ч 30 м' },
      { name: 'Перекрытие губ (после другого мастера)', price: '8 900 ₽', time: '2 ч' },
      { name: 'Рефреш (после нашего мастера)', price: '6 500 ₽', time: '1 ч' },
      { name: 'Удаление перманента ремувером (1 сеанс)', price: '3 900 ₽', time: '30 м' },
    ],
  },
  {
    id: 'makeup',
    title: 'Макияж и укладка',
    description: 'Дневной и вечерний макияж, лёгкая укладка. Записывайтесь заранее, если готовитесь к событию',
    kind: 'flat',
    rows: [
      { name: 'Дневной макияж', price: '3 500 ₽', time: '1 ч 30 м' },
      { name: 'Вечерний макияж «всё включено»', price: '4 000 ₽', time: '2 ч' },
      { name: 'Лёгкая укладка (волосы до плеч)', price: '1 000 ₽', time: '20 м' },
      { name: 'Лёгкая укладка (длинные волосы)', price: '1 500 ₽', time: '40 м' },
    ],
  },
  {
    id: 'depilation',
    title: 'Депиляция лица',
    description: 'Одна зона, комплекс из трёх зон, full face с коррекцией бровей',
    kind: 'flat',
    rows: [
      { name: '1 зона', price: 'от 350 ₽', time: '10 м' },
      { name: 'АКЦИЯ: комплекс 3 зоны', price: 'от 900 ₽', time: '30 м', badges: ['sale'] },
      { name: 'Full face (всё лицо + коррекция бровей)', price: 'от 1 500 ₽', time: '45 м' },
    ],
  },
  {
    id: 'tattoo',
    title: 'Тату',
    description: 'Мини и средний размер. Эскиз разрабатывается отдельной услугой',
    kind: 'flat',
    rows: [
      { name: 'Разработка индивидуального эскиза', price: '600 ₽', time: '40 м' },
      { name: 'Мини-тату', price: '3 500 ₽', time: '1 ч' },
      { name: 'Тату среднего размера', price: 'от 4 500 ₽', time: '2 ч' },
    ],
  },
  {
    id: 'training',
    title: 'Обучение',
    kind: 'flat',
    rows: [
      { name: 'Индивидуальное обучение наращиванию ресниц', price: '59 900 ₽', time: '9 ч' },
      { name: 'Обучение перманентному макияжу, 1 зона', price: 'от 35 000 ₽', time: '9 ч' },
      { name: 'Обучение перманентному макияжу, 3 зоны', price: '75 000 ₽', time: '9 ч' },
    ],
  },
]

function availabilityLabel(available: TierKey[]): string {
  return 'только у ' + available.map((t) => TIER_GENITIVE[t]).join(' и ')
}

function Badge({ type }: { type: BadgeKey }) {
  const t = BADGE_TOKEN[type]
  return (
    <span
      style={
        {
          display: 'inline-block',
          marginLeft: 'var(--space-1)',
          background: `var(${t.bg})`,
          color: `var(${t.text})`,
          border: `1px solid var(${t.border})`,
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--badge-padding-y) var(--badge-padding-x)',
          fontFamily: 'var(--font-text)',
          fontWeight: 'var(--weight-semibold)',
          fontSize: 'var(--text-caption)',
          letterSpacing: 'var(--tracking-caps)',
          textTransform: 'uppercase',
          verticalAlign: 'middle',
        } as React.CSSProperties
      }
    >
      {t.label}
    </span>
  )
}

function PriceRow({
  name,
  badges,
  price,
  priceIsFree,
  time,
  note,
  alt,
}: {
  name: string
  badges?: BadgeKey[]
  price: string
  priceIsFree?: boolean
  time?: string
  note?: string
  alt: boolean
}) {
  const [hover, setHover] = useState(false)
  const reduced = useReducedMotion()
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-[1fr_auto] sm:items-center"
      style={
        {
          gap: 'var(--space-0-5) var(--space-3)',
          minHeight: 'var(--row-min-height)',
          padding: 'var(--row-padding-y) var(--row-padding-x)',
          background: hover ? 'var(--table-row-bg-hover)' : alt ? 'var(--table-row-bg-alt)' : 'var(--table-row-bg)',
          borderBottom: '1px solid var(--table-divider)',
          transition: `background var(--transition-base)`,
        } as React.CSSProperties
      }
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{ minWidth: 0 }}>
        <span
          style={
            {
              fontFamily: 'var(--font-text)',
              fontSize: 'var(--text-body)',
              color: 'var(--text-primary)',
              lineHeight: 'var(--leading-table)',
            } as React.CSSProperties
          }
        >
          {name}
        </span>
        {badges?.map((b) => (
          <Badge key={b} type={b} />
        ))}
      </div>
      <div className="flex items-baseline justify-between sm:justify-end" style={{ gap: 'var(--space-2)', minWidth: 0 }}>
        {time && (
          <span
            style={
              {
                fontFamily: 'var(--font-numeric)',
                fontSize: 'var(--text-small)',
                color: 'var(--table-duration-text)',
                whiteSpace: 'nowrap',
              } as React.CSSProperties
            }
          >
            {time}
          </span>
        )}
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 0 }}>
          {/* Смена уровня мастера пересчитывает цену — короткое проявление
              подтверждает, что цифры действительно обновились. */}
          <motion.span
            key={priceIsFree ? 'free' : price}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduced ? 0 : 0.15 }}
            style={{ display: 'inline-flex' }}
          >
            {priceIsFree ? (
              <Badge type="free" />
            ) : (
              <span
                style={
                  {
                    fontFamily: 'var(--font-numeric)',
                    fontWeight: 'var(--weight-extrabold)',
                    fontSize: 'var(--text-body)',
                    color: 'var(--table-price-text)',
                    letterSpacing: 'var(--tracking-numeric)',
                    whiteSpace: 'nowrap',
                  } as React.CSSProperties
                }
              >
                {price}
              </span>
            )}
          </motion.span>
          {note && (
            <span
              style={
                {
                  fontFamily: 'var(--font-text)',
                  fontSize: 'var(--text-caption)',
                  color: 'var(--table-duration-text)',
                  whiteSpace: 'nowrap',
                } as React.CSSProperties
              }
            >
              {note}
            </span>
          )}
        </span>
      </div>
    </div>
  )
}

function TierRowView({ row, tier, index }: { row: TierRow; tier: TierKey; index: number }) {
  const price = row.prices[tier]
  const available = TIER_ORDER.filter((t) => row.prices[t])
  if (!price) {
    return (
      <PriceRow
        name={row.name}
        badges={row.badges}
        price=""
        note={availabilityLabel(available)}
        alt={index % 2 === 1}
      />
    )
  }
  return (
    <PriceRow
      name={row.name}
      badges={row.badges}
      price={price}
      priceIsFree={price === 'Бесплатно'}
      note={row.tierNote?.[tier]}
      alt={index % 2 === 1}
    />
  )
}

function FlatRowView({ row, index }: { row: FlatRow; index: number }) {
  return (
    <PriceRow
      name={row.name}
      badges={row.badges}
      price={row.price}
      priceIsFree={row.price === 'Бесплатно'}
      time={row.time}
      alt={index % 2 === 1}
    />
  )
}

function CategoryAccordion({
  category,
  tier,
  isOpen,
  onToggle,
}: {
  category: Category
  tier: TierKey
  isOpen: boolean
  onToggle: () => void
}) {
  const panelId = `price-panel-${category.id}`
  const buttonId = `price-button-${category.id}`

  return (
    <div style={{ borderBottom: '1px solid var(--table-divider-strong)' }}>
      <h3 style={{ margin: 0 }}>
        <button
          type="button"
          id={buttonId}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="w-full"
          style={
            {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-2)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              padding: 'var(--space-3) var(--row-padding-x)',
              color: 'var(--text-primary)',
            } as React.CSSProperties
          }
        >
          <span
            style={
              {
                fontFamily: 'var(--font-display)',
                fontWeight: 400,
                fontSize: 'var(--text-h4)',
                letterSpacing: 'var(--tracking-heading)',
                color: 'var(--text-primary)',
              } as React.CSSProperties
            }
          >
            {category.title}
          </span>
          <span
            aria-hidden="true"
            style={
              {
                display: 'inline-block',
                flexShrink: 0,
                width: '1.25rem',
                height: '1.25rem',
                color: 'var(--text-accent)',
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: `transform var(--transition-base)`,
              } as React.CSSProperties
            }
          >
            <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </button>
      </h3>

      {isOpen && (
        <div id={panelId} role="region" aria-labelledby={buttonId} style={{ paddingBottom: 'var(--space-4)' }}>
          {category.description && (
            <p
              style={
                {
                  fontFamily: 'var(--font-text)',
                  fontSize: 'var(--text-small)',
                  color: 'var(--text-secondary)',
                  lineHeight: 'var(--leading-body)',
                  maxWidth: 'var(--measure-base)',
                  padding: '0 var(--row-padding-x)',
                  marginBottom: 'var(--space-3)',
                } as React.CSSProperties
              }
            >
              {category.description}
            </p>
          )}

          {category.kind === 'tiered' &&
            category.subgroups?.map((sub) => (
              <div key={sub.title} style={{ marginBottom: 'var(--space-5)' }}>
                <h4
                  style={
                    {
                      fontFamily: 'var(--font-text)',
                      fontWeight: 'var(--weight-bold)',
                      fontSize: 'var(--text-small)',
                      textTransform: 'uppercase',
                      letterSpacing: 'var(--tracking-caps)',
                      color: 'var(--text-accent)',
                      padding: '0 var(--row-padding-x)',
                      marginBottom: 'var(--space-1)',
                    } as React.CSSProperties
                  }
                >
                  {sub.title}
                </h4>
                <p
                  style={
                    {
                      fontFamily: 'var(--font-text)',
                      fontSize: 'var(--text-caption)',
                      color: 'var(--text-secondary)',
                      lineHeight: 'var(--leading-body)',
                      maxWidth: 'var(--measure-base)',
                      padding: '0 var(--row-padding-x)',
                      marginBottom: 'var(--space-2)',
                    } as React.CSSProperties
                  }
                >
                  {sub.description}
                </p>
                <div>
                  {sub.rows.map((row, i) => (
                    <TierRowView key={row.name} row={row} tier={tier} index={i} />
                  ))}
                </div>
              </div>
            ))}

          {category.kind === 'flat' && category.rows && (
            <div>
              {category.rows.map((row, i) => (
                <FlatRowView key={row.name} row={row} index={i} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Price() {
  const [tier, setTier] = useState<TierKey>('top')
  const [openId, setOpenId] = useState<string>('narashivanie')
  const groupId = useId()

  return (
    <section
      id="price"
      aria-labelledby="price-title"
      style={{ background: 'var(--bg-page)', paddingTop: 'var(--section-y)', paddingBottom: 'var(--section-y)' }}
    >
      <div
        style={{
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          paddingLeft: 'var(--gutter)',
          paddingRight: 'var(--gutter)',
        }}
      >
        {/* Шапка секции */}
        <Reveal style={{ marginBottom: 'var(--space-6)', maxWidth: 'var(--measure-wide)' }}>
          <RevealItem
            as="h2"
            id="price-title"
            style={
              {
                fontFamily: 'var(--font-display)',
                fontWeight: 400,
                fontSize: 'var(--text-h2)',
                color: 'var(--text-primary)',
                letterSpacing: 'var(--tracking-heading)',
                lineHeight: 'var(--leading-heading)',
                marginBottom: 'var(--space-2)',
              } as React.CSSProperties
            }
          >
            Прайс
          </RevealItem>
          <RevealItem
            as="p"
            style={
              {
                fontFamily: 'var(--font-text)',
                fontSize: 'var(--text-body-lg)',
                color: 'var(--text-secondary)',
                lineHeight: 'var(--leading-body)',
                maxWidth: 'var(--measure-base)',
              } as React.CSSProperties
            }
          >
            В прайсе около 180 позиций. Чтобы не листать всё подряд: сначала
            выберите направление, затем уровень мастера — таблица пересчитается
            под него. Цены на сайте совпадают с ценами в онлайн-записи.
          </RevealItem>
        </Reveal>

        {/* Переключатель уровня */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <span
            id={groupId}
            style={
              {
                display: 'block',
                fontFamily: 'var(--font-text)',
                fontSize: 'var(--text-caption)',
                letterSpacing: 'var(--tracking-caps)',
                textTransform: 'uppercase',
                color: 'var(--text-quiet)',
                marginBottom: 'var(--space-2)',
              } as React.CSSProperties
            }
          >
            Уровень мастера (для наращивания ресниц)
          </span>
          <div role="group" aria-labelledby={groupId} className="flex flex-wrap" style={{ gap: 'var(--space-2)' }}>
            {TIER_ORDER.map((t) => {
              const active = t === tier
              const tokens = TIER_TOKEN[t]
              return (
                <MotionButtonEl
                  key={t}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setTier(t)}
                  style={
                    {
                      padding: 'var(--space-2) var(--space-3)',
                      borderRadius: 'var(--radius-sm)',
                      background: active ? `var(${tokens.surface})` : 'transparent',
                      border: `${active && t === 'owner' ? 'var(--tier-owner-line-width)' : '1px'} solid ${
                        active ? `var(${tokens.line})` : 'var(--border-color)'
                      }`,
                      color: active ? `var(${tokens.text})` : 'var(--text-secondary)',
                      fontFamily: 'var(--font-text)',
                      fontWeight: 'var(--weight-semibold)',
                      fontSize: 'var(--text-body)',
                      cursor: 'pointer',
                      transition: `border-color var(--transition-base), color var(--transition-base), background var(--transition-base)`,
                    } as React.CSSProperties
                  }
                >
                  {TIER_LABEL[t]}
                </MotionButtonEl>
              )
            })}
          </div>
        </div>

        {/* Аккордеоны */}
        <div style={{ borderTop: '1px solid var(--table-divider-strong)' }}>
          {CATEGORIES.map((category) => (
            <CategoryAccordion
              key={category.id}
              category={category}
              tier={tier}
              isOpen={openId === category.id}
              onToggle={() => setOpenId(openId === category.id ? '' : category.id)}
            />
          ))}
        </div>

        {/* Примечание и CTA */}
        <div style={{ marginTop: 'var(--space-6)' }}>
          <p
            style={
              {
                fontFamily: 'var(--font-text)',
                fontSize: 'var(--text-small)',
                color: 'var(--text-quiet)',
                lineHeight: 'var(--leading-body)',
                maxWidth: 'var(--measure-base)',
                marginBottom: 'var(--space-4)',
              } as React.CSSProperties
            }
          >
            Акции и скидка 10% на первый визит действуют на комплексы — они
            отмечены в таблице отдельно.
          </p>
          <MotionLink
            href={DIKIDI_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={
              {
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-2) var(--space-4)',
                background: 'var(--bg-accent)',
                color: 'var(--text-on-accent)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-text)',
                fontWeight: 'var(--weight-semibold)',
                fontSize: 'var(--text-body)',
                boxShadow: 'var(--shadow-accent)',
                transition: 'opacity var(--transition-base)',
              } as React.CSSProperties
            }
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Записаться онлайн
          </MotionLink>
        </div>
      </div>
    </section>
  )
}
