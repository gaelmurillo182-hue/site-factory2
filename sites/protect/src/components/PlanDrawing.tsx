import { motion, useReducedMotion } from 'motion/react'

/**
 * Схема покрытия — главная графика первого экрана.
 *
 * Это учебный пример, а не объект ПРОТЕКТ: контур участка, дом, парковка,
 * четыре точки камер и их сектора обзора. Векторная схема, ничего документального
 * она не изображает и ничего не обещает. Подпись в углу говорит об этом прямо.
 *
 * Почему не фотография: фото реальных объектов клиент не передал, а
 * генерировать документальное запрещено (docs/06, граница честности).
 * Схема при этом сильнее фото: она показывает ровно то, чего нет в коробке
 * с маркетплейса — расчёт точек и секторов.
 */

const POINTS = [
  { id: 'К-1', x: 250, y: 470, label: 'Ворота и калитка' },
  { id: 'К-2', x: 295, y: 322, label: 'Вход в дом' },
  { id: 'К-3', x: 52, y: 68, label: 'Периметр участка' },
  { id: 'К-4', x: 532, y: 340, label: 'Парковка и проезд' },
]

const CONES = [
  'M250 470 L307.4 551.9 A100 100 0 0 1 192.6 551.9 Z',
  'M295 322 L378.6 421.6 A130 130 0 0 1 211.4 421.6 Z',
  'M52 68 L258.8 104.5 A210 210 0 0 1 88.5 274.8 Z',
  'M532 340 L496.7 506.3 A170 170 0 0 1 365.7 375.3 Z',
]

export default function PlanDrawing() {
  const reduce = useReducedMotion()

  const enter = (i: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 10 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: 0.2 },
          transition: { duration: 0.5, delay: 0.12 + i * 0.09, ease: [0.22, 1, 0.36, 1] as const },
        }

  return (
    <figure className="plan">
      <svg
        className="plan__svg"
        viewBox="0 0 640 600"
        role="img"
        aria-label="Схема покрытия участка: контур участка с домом, воротами и парковкой, четыре точки камер с секторами обзора. Пример, а не реальный объект."
      >
        {/* Координатная сетка листа */}
        <defs>
          <pattern id="plan-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" stroke="var(--c-rule)" strokeWidth="0.5" opacity="0.5" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="640" height="600" fill="url(#plan-grid)" />

        {/* Участок */}
        <motion.g {...enter(0)}>
          <path
            d="M40 56 H560 V486 H350 M250 486 H40 Z"
            fill="none"
            stroke="var(--graphic-plan)"
            strokeWidth="2"
          />
          <text className="plan__note" x="368" y="508">
            въезд
          </text>
        </motion.g>

        {/* Дом и парковка */}
        <motion.g {...enter(1)}>
          <rect
            x="170"
            y="150"
            width="250"
            height="170"
            fill="var(--bg-surface)"
            stroke="var(--graphic-plan)"
            strokeWidth="1.5"
          />
          <text className="plan__note" x="295" y="243" textAnchor="middle">
            дом
          </text>
          <rect
            x="380"
            y="350"
            width="140"
            height="100"
            fill="none"
            stroke="var(--graphic-plan)"
            strokeWidth="1.5"
            strokeDasharray="6 5"
          />
          <text className="plan__note" x="450" y="405" textAnchor="middle">
            парковка
          </text>
          {/* Проезд от ворот к парковке */}
          <path
            d="M312 486 V442 H450 V450"
            fill="none"
            stroke="var(--c-rule)"
            strokeWidth="7"
            strokeLinecap="square"
            opacity="0.75"
          />
        </motion.g>

        {/* Сектора обзора */}
        {CONES.map((d, i) => (
          <motion.path
            key={d}
            d={d}
            fill="var(--graphic-zone-fill)"
            stroke="var(--graphic-zone)"
            strokeWidth="1"
            {...enter(2 + i * 0.5)}
          />
        ))}

        {/* Точки камер */}
        {POINTS.map((p, i) => (
          <motion.g key={p.id} {...enter(3 + i * 0.4)}>
            <circle cx={p.x} cy={p.y} r="9" fill="var(--bg-page)" stroke="var(--c-petrol)" strokeWidth="2" />
            <circle cx={p.x} cy={p.y} r="3.5" fill="var(--c-petrol)" />
            <text
              className="plan__id"
              x={p.x + (p.x > 400 ? -16 : 16)}
              y={p.y + 5}
              textAnchor={p.x > 400 ? 'end' : 'start'}
            >
              {p.id}
            </text>
          </motion.g>
        ))}

        {/* Штамп листа */}
        <motion.g {...enter(5)}>
          <line x1="40" y1="540" x2="600" y2="540" stroke="var(--c-rule)" strokeWidth="1" />
          <text className="plan__stamp" x="40" y="566">
            СХЕМА ПОКРЫТИЯ · УЧЕБНЫЙ ПРИМЕР
          </text>
          <text className="plan__stamp plan__stamp--right" x="600" y="566" textAnchor="end">
            4 ТОЧКИ
          </text>
        </motion.g>
      </svg>

      <figcaption className="plan__legend">
        {POINTS.map((p) => (
          <span className="plan__legend-item" key={p.id}>
            <span className="plan__legend-id num">{p.id}</span>
            <span className="plan__legend-label">{p.label}</span>
          </span>
        ))}
      </figcaption>
    </figure>
  )
}
