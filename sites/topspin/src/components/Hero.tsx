import heroBg from '../assets/hero-bg.jpg'
import logo from '../assets/logo.png'

const YCLIENTS_URL = 'https://n1935836.yclients.com/'
const PHONE_TEL = 'tel:+79193926281'
const PHONE_DISPLAY = '+7 (919) 392-62-81'

const FACTS = [
  { value: '4', label: 'стола в зале' },
  { value: '500+', label: 'учеников' },
  { value: '140+', label: 'турниров в год' },
  { value: '09:00–22:00', label: 'работаем ежедневно' },
]

export default function Hero() {
  return (
    <>
      <section
        aria-label="Главный экран"
        style={{
          position: 'relative',
          minHeight: '100svh',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: '4.5rem', /* компенсация фиксированного хедера */
        }}
      >
        {/* Фоновое изображение */}
        <img
          src={heroBg}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />

        {/* Оверлей */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--color-table)',
            opacity: 0.82,
          }}
        />

        {/* Контент */}
        <div
          style={{
            position: 'relative',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            maxWidth: 'var(--container-max)',
            margin: '0 auto',
            width: '100%',
            paddingLeft: 'var(--gutter)',
            paddingRight: 'var(--gutter)',
            paddingTop: 'var(--space-10)',
            paddingBottom: 'var(--space-10)',
          } as React.CSSProperties}
        >
          <div style={{ maxWidth: 'var(--measure-wide)', minWidth: 0 }}>
            {/* Логотип в Hero */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-5)',
              }}
            >
              <img
                src={logo}
                alt="Логотип клуба Топ-Спин"
                style={{
                  width: 'clamp(64px, 6vw, 96px)',
                  height: 'clamp(64px, 6vw, 96px)',
                  objectFit: 'contain',
                  flexShrink: 0,
                }}
              />
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 'var(--weight-bold)',
                    fontSize: 'clamp(1.25rem, 1rem + 1.5vw, 2rem)',
                    color: 'var(--color-chalk)',
                    letterSpacing: 'var(--tracking-heading)',
                    lineHeight: 1.1,
                  } as React.CSSProperties}
                >
                  Топ-Спин
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-text)',
                    fontSize: 'var(--text-small)',
                    color: 'var(--color-ball-bright)',
                    marginTop: '0.25rem',
                    letterSpacing: '0.06em',
                  } as React.CSSProperties}
                >
                  Клуб настольного тенниса
                </div>
              </div>
            </div>

            {/* Надзаголовок */}
            <p
              style={{
                fontFamily: 'var(--font-text)',
                fontSize: 'var(--text-small)',
                color: 'var(--color-chalk-muted)',
                letterSpacing: 'var(--tracking-caps)',
                textTransform: 'uppercase',
                marginBottom: 'var(--space-3)',
              } as React.CSSProperties}
            >
              Екатеринбург, ул. Тверитина 45, 3&nbsp;этаж
            </p>

            {/* H1 */}
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.75rem, 1.16rem + 3vw, 3.5rem)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--color-chalk)',
                lineHeight: 'var(--leading-heading)',
                letterSpacing: 'var(--tracking-display)',
                marginBottom: 'var(--space-4)',
                hyphens: 'auto',
              } as React.CSSProperties}
            >
              Настольный теннис в&nbsp;Екатеринбурге: детская секция и&nbsp;игра для&nbsp;взрослых
            </h1>

            {/* Подзаголовок */}
            <p
              style={{
                fontFamily: 'var(--font-text)',
                fontSize: 'var(--text-body-lg)',
                color: 'var(--color-chalk-muted)',
                lineHeight: 'var(--leading-body)',
                marginBottom: 'var(--space-6)',
                maxWidth: '62ch',
              } as React.CSSProperties}
            >
              Клуб «Топ-Спин» на&nbsp;Тверитина,&nbsp;45. Детей берём с&nbsp;6&nbsp;лет
              и&nbsp;делим на&nbsp;группы по&nbsp;уровню, взрослых&nbsp;— на&nbsp;групповые
              и&nbsp;индивидуальные тренировки. По&nbsp;выходным играем рейтинговые турниры TTWR.
              Стол можно просто арендовать и&nbsp;играть своей компанией.
            </p>

            {/* Кнопки */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-3)',
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
                  boxShadow: 'var(--shadow-ball)',
                  transition: 'opacity var(--transition-base)',
                  whiteSpace: 'nowrap',
                } as React.CSSProperties}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Выбрать время и&nbsp;записаться
              </a>

              <a
                href={PHONE_TEL}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: 'var(--space-2) var(--space-5)',
                  background: 'transparent',
                  color: 'var(--color-chalk)',
                  border: '2px solid var(--color-chalk)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-text)',
                  fontWeight: 'var(--weight-semibold)',
                  fontSize: 'var(--text-body)',
                  transition: 'opacity var(--transition-base)',
                  whiteSpace: 'nowrap',
                } as React.CSSProperties}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Позвонить: {PHONE_DISPLAY}
              </a>
            </div>

            {/* Микрокопия */}
            <p
              style={{
                fontFamily: 'var(--font-text)',
                fontSize: 'var(--text-small)',
                color: 'var(--color-chalk-muted)',
              }}
            >
              Онлайн-запись открывается в&nbsp;YClients. Свободные слоты видно сразу.
            </p>
          </div>
        </div>

        {/* Строка фактов */}
        <div
          style={{
            position: 'relative',
            borderTop: '1px solid var(--line-color-dim)',
          }}
        >
          <div
            style={{
              maxWidth: 'var(--container-max)',
              margin: '0 auto',
              paddingLeft: 'var(--gutter)',
              paddingRight: 'var(--gutter)',
              paddingTop: 'var(--space-4)',
              paddingBottom: 'var(--space-4)',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 'var(--space-4) var(--space-6)',
            } as React.CSSProperties}
            className="md:grid-cols-4"
          >
            {FACTS.map(({ value, label }) => (
              <div key={label}>
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-h3)',
                    fontWeight: 'var(--weight-bold)',
                    color: 'var(--color-ball-bright)',
                    lineHeight: 1,
                    letterSpacing: 'var(--tracking-heading)',
                    marginBottom: 'var(--space-0-5)',
                  } as React.CSSProperties}
                >
                  {value}
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-text)',
                    fontSize: 'var(--text-small)',
                    color: 'var(--color-chalk-muted)',
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Линия стола под Hero */}
      <div
        aria-hidden="true"
        style={{
          height: 'var(--line-width)',
          background: 'var(--line-color)',
        }}
      />
    </>
  )
}
