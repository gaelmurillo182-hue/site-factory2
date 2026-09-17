const YCLIENTS_URL = 'https://n1935836.yclients.com/'
const TELEGRAM_URL = 'https://t.me/knttopspin'

export default function Schedule() {
  return (
    <section
      id="schedule"
      aria-labelledby="schedule-title"
      style={{
        background: 'var(--color-table)',
        paddingTop: 'var(--section-y)',
        paddingBottom: 'var(--section-y)',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          paddingLeft: 'var(--gutter)',
          paddingRight: 'var(--gutter)',
        }}
      >
        <div
          className="md:grid md:grid-cols-2"
          style={{ gap: 'var(--space-12)', alignItems: 'start' } as React.CSSProperties}
        >
          {/* Левая колонка */}
          <div>
            <h2
              id="schedule-title"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-h2)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--color-chalk)',
                letterSpacing: 'var(--tracking-heading)',
                lineHeight: 'var(--leading-heading)',
                marginBottom: 'var(--space-5)',
              } as React.CSSProperties}
            >
              Расписание
            </h2>

            <p
              style={{
                fontFamily: 'var(--font-text)',
                fontSize: 'var(--text-body-lg)',
                color: 'var(--color-chalk-muted)',
                lineHeight: 'var(--leading-body)',
                marginBottom: 'var(--space-6)',
                maxWidth: '55ch',
              } as React.CSSProperties}
            >
              Клуб открыт ежедневно с&nbsp;09:00 до&nbsp;22:00. Турниры — по&nbsp;субботам
              и&nbsp;воскресеньям. Свободные слоты для аренды стола и&nbsp;записи на&nbsp;тренировку
              видно в&nbsp;онлайн-записи: там&nbsp;же указано, какие часы уже заняты.
            </p>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--space-3)',
              }}
            >
              <a
                href={YCLIENTS_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: 'var(--space-2) var(--space-5)',
                  background: 'var(--color-ball)',
                  color: 'var(--color-board)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-text)',
                  fontWeight: 'var(--weight-semibold)',
                  fontSize: 'var(--text-body)',
                  transition: 'opacity var(--transition-base)',
                  whiteSpace: 'nowrap',
                } as React.CSSProperties}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Посмотреть свободные слоты
              </a>

              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: 'var(--space-2) var(--space-5)',
                  background: 'transparent',
                  color: 'var(--color-chalk)',
                  border: '2px solid var(--line-color-dim)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-text)',
                  fontWeight: 'var(--weight-semibold)',
                  fontSize: 'var(--text-body)',
                  transition: 'border-color var(--transition-base), opacity var(--transition-base)',
                  whiteSpace: 'nowrap',
                } as React.CSSProperties}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--color-chalk)'
                  e.currentTarget.style.opacity = '0.85'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--line-color-dim)'
                  e.currentTarget.style.opacity = '1'
                }}
              >
                Открыть канал в Telegram
              </a>
            </div>
          </div>

          {/* Правая колонка — Telegram-примечание */}
          <div
            style={{
              marginTop: 'var(--space-8)',
              padding: 'var(--space-5)',
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-md)',
              borderLeft: '3px solid var(--color-ball)',
            } as React.CSSProperties}
            className="md:mt-0"
          >
            <p
              style={{
                fontFamily: 'var(--font-text)',
                fontSize: 'var(--text-small)',
                color: 'var(--color-chalk-muted)',
                textTransform: 'uppercase',
                letterSpacing: 'var(--tracking-caps)',
                marginBottom: 'var(--space-2)',
              } as React.CSSProperties}
            >
              Оперативно
            </p>
            <p
              style={{
                fontFamily: 'var(--font-text)',
                fontSize: 'var(--text-body)',
                color: 'var(--color-chalk)',
                lineHeight: 'var(--leading-body)',
              } as React.CSSProperties}
            >
              Изменения в расписании, сетки турниров и переносы занятий публикуем
              в&nbsp;Telegram-канале{' '}
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'var(--color-ball-bright)',
                  transition: 'opacity var(--transition-base)',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                @knttopspin
              </a>
              . Если планируете играть в конкретный день — проще всего свериться там.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
