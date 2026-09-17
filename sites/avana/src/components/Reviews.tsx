import { Reveal, RevealItem } from './motion/Reveal'
import { MotionLink } from './motion/Interactive'
import SectionBackdrop from './SectionBackdrop'
import texture from '../assets/texture/03-bokeh-band.jpg'

const DIKIDI_URL = 'https://dikidi.net/970292'

export default function Reviews() {
  return (
    <section
      id="reviews"
      aria-labelledby="reviews-title"
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--bg-elevated)',
        paddingTop: 'var(--section-y)',
        paddingBottom: 'var(--section-y)',
      }}
    >
      <SectionBackdrop src={texture} scrim={0.85} tone="dark" />
      <div
        style={{
          position: 'relative',
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          paddingLeft: 'var(--gutter)',
          paddingRight: 'var(--gutter)',
        }}
      >
        <Reveal>
        <RevealItem
          as="h2"
          id="reviews-title"
          style={
            {
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              fontSize: 'var(--text-h2)',
              color: 'var(--text-primary)',
              letterSpacing: 'var(--tracking-heading)',
              lineHeight: 'var(--leading-heading)',
              marginBottom: 'var(--space-6)',
            } as React.CSSProperties
          }
        >
          Оценки и отзывы
        </RevealItem>

        <RevealItem as="div" className="grid grid-cols-1 md:grid-cols-[auto_1fr]" style={{ gap: 'var(--space-6)', alignItems: 'start' }}>
          {/* Рейтинг */}
          <div className="flex items-end" style={{ gap: 'var(--space-2)' }}>
            <span
              style={
                {
                  fontFamily: 'var(--font-numeric)',
                  fontWeight: 'var(--weight-extrabold)',
                  fontSize: 'var(--text-h1)',
                  color: 'var(--text-primary)',
                  letterSpacing: 'var(--tracking-numeric)',
                  lineHeight: 1,
                } as React.CSSProperties
              }
            >
              4,9
            </span>
            <div style={{ paddingBottom: 'var(--space-1)' }}>
              <div
                style={
                  {
                    fontFamily: 'var(--font-text)',
                    fontSize: 'var(--text-body)',
                    color: 'var(--text-secondary)',
                  } as React.CSSProperties
                }
              >
                из 5
              </div>
              <div
                style={
                  {
                    fontFamily: 'var(--font-text)',
                    fontSize: 'var(--text-small)',
                    color: 'var(--text-quiet)',
                  } as React.CSSProperties
                }
              >
                458 оценок · 96 отзывов
              </div>
            </div>
          </div>

          {/* Текст и бейдж */}
          <div style={{ minWidth: 0, maxWidth: 'var(--measure-base)' }}>
            <span
              style={
                {
                  display: 'inline-block',
                  marginBottom: 'var(--space-3)',
                  padding: 'var(--badge-padding-y) var(--badge-padding-x)',
                  background: 'var(--badge-hit-bg)',
                  color: 'var(--badge-hit-text)',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-text)',
                  fontWeight: 'var(--weight-semibold)',
                  fontSize: 'var(--text-caption)',
                  letterSpacing: 'var(--tracking-caps)',
                  textTransform: 'uppercase',
                } as React.CSSProperties
              }
            >
              DIKIDI AWARDS ’25
            </span>
            <p
              style={
                {
                  fontFamily: 'var(--font-text)',
                  fontSize: 'var(--text-body)',
                  color: 'var(--text-secondary)',
                  lineHeight: 'var(--leading-body)',
                  marginBottom: 'var(--space-4)',
                } as React.CSSProperties
              }
            >
              4,9 из 5 — средняя оценка по 458 оценкам и 96 отзывам в
              онлайн-записи. Рейтинг собран за полтора года работы. Оценку
              ставят в профиле онлайн-записи после визита, накрутить её изнутри
              нельзя.
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
                  marginBottom: 'var(--space-1)',
                } as React.CSSProperties
              }
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Читать отзывы в DIKIDI
            </MotionLink>
            <p
              style={
                {
                  fontFamily: 'var(--font-text)',
                  fontSize: 'var(--text-caption)',
                  color: 'var(--text-quiet)',
                } as React.CSSProperties
              }
            >
              Отзывы открываются на площадке онлайн-записи, в отдельной вкладке.
            </p>
          </div>
        </RevealItem>
        </Reveal>
      </div>
    </section>
  )
}
