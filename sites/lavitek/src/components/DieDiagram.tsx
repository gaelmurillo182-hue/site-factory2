/**
 * Сечение волоки с подписью зон.
 *
 * Это не иллюстрация ради картинки: именно про эти четыре участка канала идёт
 * разговор при заказе, и именно они определяют, сколько метров пройдёт
 * инструмент до перешлифовки. Схема нарисована кодом — масштабируется без
 * потерь, весит килобайты и читается на 390px.
 */

const AXIS = 250
const BODY_TOP = 130
const BODY_BOTTOM = 370

/** Верхняя граница канала: пары «координата по оси — половина просвета». */
const PROFILE: [number, number][] = [
  [180, 78],
  [250, 46],
  [360, 16],
  [400, 16],
  [470, 34],
  [540, 40],
]

/**
 * Выноски идут в два ряда: подписи длинные, в один ряд они наезжают друг
 * на друга уже на планшете.
 */
const ZONES = [
  { x: 215, label: 'Смазочная зона', note: 'захват смазки', row: 1 },
  { x: 305, label: 'Рабочий конус', note: 'обжатие', row: 0 },
  { x: 380, label: 'Калибрующий поясок', note: 'размер', row: 1 },
  { x: 470, label: 'Выходной конус', note: 'снятие напряжений', row: 0 },
]

const ROW_Y = [40, 86]

const upper = PROFILE.map(([x, h]) => `${x},${AXIS - h}`).join(' ')
const lower = [...PROFILE].reverse().map(([x, h]) => `${x},${AXIS + h}`).join(' ')
const BODY = `M180,${BODY_TOP} H540 V${BODY_BOTTOM} H180 Z M${upper} L${lower} Z`

export const DIE_CAPTION =
  'Канал волоки в разрезе. Размер держит калибрующий поясок — по его выработке и определяют момент перешлифовки.'

/** Только схема, без карточки и подписи: нужна составным фигурам. */
export function DieSvg() {
  return (
    <svg
        viewBox="0 0 720 440"
        className="lv-die__svg"
        role="img"
        aria-label="Схема сечения волоки: смазочная зона, рабочий конус, калибрующий поясок, выходной конус"
      >
        <defs>
          <pattern
            id="lv-hatch-45"
            width="7"
            height="7"
            patternTransform="rotate(45)"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="0" x2="0" y2="7" stroke="currentColor" strokeWidth="1" opacity="0.55" />
          </pattern>
        </defs>

        {/* Протягиваемый металл: вошёл толстым, вышел тонким. */}
        <path
          d={`M40,${AXIS - 46} H250 L360,${AXIS - 16} H680 V${AXIS + 16} H360 L250,${AXIS + 46} H40 Z`}
          className="lv-die__wire"
        />

        {/* Тело волоки: заливка, поверх штриховка сечения. Канал — вырез. */}
        <path d={BODY} className="lv-die__body" fillRule="evenodd" />
        <path
          d={BODY}
          fill="url(#lv-hatch-45)"
          fillRule="evenodd"
          stroke="currentColor"
          strokeWidth="1.5"
        />

        <line x1="30" y1={AXIS} x2="690" y2={AXIS} className="lv-die__axis" />

        {ZONES.map((z) => {
          const y = ROW_Y[z.row]
          return (
            <g key={z.label} className="lv-die__lead">
              <line x1={z.x} y1={BODY_TOP - 6} x2={z.x} y2={y + 20} />
              <circle cx={z.x} cy={BODY_TOP - 6} r="2.5" />
              <text x={z.x} y={y} textAnchor="middle" className="lv-die__label">
                {z.label}
              </text>
              <text x={z.x} y={y + 16} textAnchor="middle" className="lv-die__note">
                {z.note}
              </text>
            </g>
          )
        })}

        {/* Размер на входе и на выходе — как на чертеже. */}
        <g className="lv-die__dim">
          <line x1="96" y1={AXIS - 46} x2="96" y2={AXIS + 46} />
          <line x1="90" y1={AXIS - 46} x2="102" y2={AXIS - 46} />
          <line x1="90" y1={AXIS + 46} x2="102" y2={AXIS + 46} />
          <text x="96" y={AXIS - 56} textAnchor="middle">
            ⌀ до
          </text>
          <line x1="624" y1={AXIS - 16} x2="624" y2={AXIS + 16} />
          <line x1="618" y1={AXIS - 16} x2="630" y2={AXIS - 16} />
          <line x1="618" y1={AXIS + 16} x2="630" y2={AXIS + 16} />
          <text x="624" y={AXIS - 26} textAnchor="middle">
            ⌀ после
          </text>
        </g>

        <text x="180" y={BODY_BOTTOM + 34} className="lv-die__note">
          вход
        </text>
        <text x="540" y={BODY_BOTTOM + 34} textAnchor="end" className="lv-die__note">
          выход
        </text>
    </svg>
  )
}

export default function DieDiagram() {
  return (
    <figure className="lv-die">
      <DieSvg />
      <figcaption className="lv-die__cap">{DIE_CAPTION}</figcaption>
    </figure>
  )
}
