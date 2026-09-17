/* Знак AVANA — дуга ресничного ряда с расходящимися волосками.
   Рисуется currentColor, поэтому наследует цвет от родителя:
   на графите — ivory, на бронзовой плашке — графит. */

interface LogoMarkProps {
  size?: number
  title?: string
}

export function LogoMark({ size = 28, title }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      style={{ display: 'block', flexShrink: 0, overflow: 'visible' }}
    >
      {title ? <title>{title}</title> : null}

      {/* Линия века — основание, на котором сидит ряд */}
      <path
        d="M2 22.5C7 26.5 12 28 16 28s9-1.5 14-5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Ресничный ряд: волоски удлиняются к внешнему углу */}
      <path d="M6.4 20.2 4.1 15.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M10 22.4 8.3 16.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M13.9 23.6 13 17" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M18 23.6 18.8 16.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M22 22.3 24.2 15.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M25.7 20 29 13.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />

      {/* Бровь — дуга выше ряда, тоньше и спокойнее */}
      <path
        d="M7 9.4C11 6.2 15.6 5.4 20 6.4c2.6.6 4.4 1.7 5.6 2.7"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  )
}

interface LogoProps {
  /** Размер знака в px */
  markSize?: number
  /** Кегль словесной части */
  wordSize?: string
  /** Показывать подпись «ресницы · брови» */
  withTagline?: boolean
}

export default function Logo({
  markSize = 28,
  wordSize = 'var(--text-h4)',
  withTagline = true,
}: LogoProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
      }}
    >
      <LogoMark size={markSize} />
      <span style={{ display: 'block' }}>
        <span
          style={
            {
              display: 'block',
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              fontSize: wordSize,
              letterSpacing: '0.14em',
              lineHeight: 1,
            } as React.CSSProperties
          }
        >
          AVANA
        </span>
        {withTagline ? (
          <span
            style={
              {
                display: 'block',
                fontFamily: 'var(--font-text)',
                fontSize: 'var(--text-caption)',
                letterSpacing: 'var(--tracking-caps)',
                textTransform: 'uppercase',
                color: 'var(--text-secondary)',
                marginTop: 'var(--space-0-5)',
              } as React.CSSProperties
            }
          >
            ресницы · брови
          </span>
        ) : null}
      </span>
    </span>
  )
}
