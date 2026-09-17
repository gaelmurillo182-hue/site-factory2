import { Reveal, RevealItem } from './motion/Reveal'
import { MotionLink } from './motion/Interactive'

const WHATSAPP_URL = 'https://wa.me/79222066161'
const TELEGRAM_URL = 'https://t.me/salonAVANA'
const PHONE_TEL = 'tel:+79222066161'
const PHONE_DISPLAY = '+7 (922) 206-61-61'
const MAP_URL = 'https://yandex.ru/maps/?text=Екатеринбург, улица Печатников, 1'

export default function Contacts() {
  return (
    <section
      id="contacts"
      aria-labelledby="contacts-title"
      style={{
        background: 'var(--bg-deep)',
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
        <Reveal>
        <RevealItem
          as="h2"
          id="contacts-title"
          style={
            {
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              fontSize: 'var(--text-h2)',
              color: 'var(--text-primary)',
              letterSpacing: 'var(--tracking-heading)',
              lineHeight: 'var(--leading-heading)',
              marginBottom: 'var(--space-8)',
            } as React.CSSProperties
          }
        >
          Как нас найти
        </RevealItem>

        <RevealItem as="div" className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--space-8)' }}>
          {/* Левая колонка — контакты */}
          <div style={{ minWidth: 0 }}>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              <li
                style={{
                  paddingTop: 'var(--space-3)',
                  paddingBottom: 'var(--space-3)',
                  borderBottom: '1px solid var(--border-color-quiet)',
                }}
              >
                <p
                  style={
                    {
                      fontFamily: 'var(--font-text)',
                      fontSize: 'var(--text-caption)',
                      letterSpacing: 'var(--tracking-caps)',
                      textTransform: 'uppercase',
                      color: 'var(--text-quiet)',
                      marginBottom: 'var(--space-0-5)',
                    } as React.CSSProperties
                  }
                >
                  Адрес
                </p>
                <p
                  style={
                    {
                      fontFamily: 'var(--font-text)',
                      fontSize: 'var(--text-body)',
                      color: 'var(--text-primary)',
                    } as React.CSSProperties
                  }
                >
                  Екатеринбург, ул. Печатников, 1
                </p>
              </li>

              <li
                style={{
                  paddingTop: 'var(--space-3)',
                  paddingBottom: 'var(--space-3)',
                  borderBottom: '1px solid var(--border-color-quiet)',
                }}
              >
                <p
                  style={
                    {
                      fontFamily: 'var(--font-text)',
                      fontSize: 'var(--text-body)',
                      color: 'var(--text-secondary)',
                      lineHeight: 'var(--leading-body)',
                    } as React.CSSProperties
                  }
                >
                  Отдельный вход с улицы Печатников. Не торговый центр и не
                  жилой подъезд: заходите прямо с улицы, лифты и коды подъезда
                  не нужны.
                </p>
              </li>

              <li
                style={{
                  paddingTop: 'var(--space-3)',
                  paddingBottom: 'var(--space-3)',
                  borderBottom: '1px solid var(--border-color-quiet)',
                }}
              >
                <p
                  style={
                    {
                      fontFamily: 'var(--font-text)',
                      fontSize: 'var(--text-caption)',
                      letterSpacing: 'var(--tracking-caps)',
                      textTransform: 'uppercase',
                      color: 'var(--text-quiet)',
                      marginBottom: 'var(--space-0-5)',
                    } as React.CSSProperties
                  }
                >
                  Телефон
                </p>
                <a
                  href={PHONE_TEL}
                  style={
                    {
                      fontFamily: 'var(--font-numeric)',
                      fontSize: 'var(--text-body-lg)',
                      color: 'var(--text-accent)',
                      textDecoration: 'none',
                    } as React.CSSProperties
                  }
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                >
                  {PHONE_DISPLAY}
                </a>
              </li>

              <li
                style={{
                  paddingTop: 'var(--space-3)',
                  paddingBottom: 'var(--space-3)',
                  borderBottom: '1px solid var(--border-color-quiet)',
                }}
              >
                <p
                  style={
                    {
                      fontFamily: 'var(--font-text)',
                      fontSize: 'var(--text-caption)',
                      letterSpacing: 'var(--tracking-caps)',
                      textTransform: 'uppercase',
                      color: 'var(--text-quiet)',
                      marginBottom: 'var(--space-0-5)',
                    } as React.CSSProperties
                  }
                >
                  WhatsApp
                </p>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={
                    {
                      fontFamily: 'var(--font-text)',
                      fontSize: 'var(--text-body)',
                      color: 'var(--text-accent)',
                      textDecoration: 'none',
                    } as React.CSSProperties
                  }
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                >
                  wa.me/79222066161
                </a>
              </li>

              <li style={{ paddingTop: 'var(--space-3)' }}>
                <p
                  style={
                    {
                      fontFamily: 'var(--font-text)',
                      fontSize: 'var(--text-caption)',
                      letterSpacing: 'var(--tracking-caps)',
                      textTransform: 'uppercase',
                      color: 'var(--text-quiet)',
                      marginBottom: 'var(--space-0-5)',
                    } as React.CSSProperties
                  }
                >
                  Telegram
                </p>
                <a
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={
                    {
                      fontFamily: 'var(--font-text)',
                      fontSize: 'var(--text-body)',
                      color: 'var(--text-accent)',
                      textDecoration: 'none',
                    } as React.CSSProperties
                  }
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                >
                  @salonAVANA
                </a>
              </li>

              <li>
                <p
                  style={
                    {
                      fontFamily: 'var(--font-text)',
                      fontSize: 'var(--text-caption)',
                      letterSpacing: 'var(--tracking-caps)',
                      textTransform: 'uppercase',
                      color: 'var(--text-quiet)',
                      marginBottom: 'var(--space-0-5)',
                    } as React.CSSProperties
                  }
                >
                  Режим работы
                </p>
                <p
                  style={
                    {
                      fontFamily: 'var(--font-text)',
                      fontSize: 'var(--text-body)',
                      color: 'var(--text-primary)',
                    } as React.CSSProperties
                  }
                >
                  Ежедневно, 10:00–22:00
                </p>
              </li>
            </ul>
          </div>

          {/* Правая колонка — адрес и маршрут */}
          <div
            style={
              {
                minWidth: 0,
                padding: 'var(--space-5)',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
              } as React.CSSProperties
            }
          >
            <p
              style={
                {
                  fontFamily: 'var(--font-display)',
                  fontWeight: 400,
                  fontSize: 'var(--text-h3)',
                  color: 'var(--text-primary)',
                  letterSpacing: 'var(--tracking-heading)',
                  lineHeight: 'var(--leading-heading)',
                  marginBottom: 'var(--space-3)',
                } as React.CSSProperties
              }
            >
              Печатников,{' '}
              <span
                style={
                  {
                    fontFamily: 'var(--font-numeric)',
                    fontWeight: 'var(--weight-semibold)',
                    letterSpacing: 'var(--tracking-numeric)',
                  } as React.CSSProperties
                }
              >
                1
              </span>
            </p>
            <p
              style={
                {
                  fontFamily: 'var(--font-text)',
                  fontSize: 'var(--text-body)',
                  color: 'var(--text-secondary)',
                  lineHeight: 'var(--leading-body)',
                  marginBottom: 'var(--space-5)',
                } as React.CSSProperties
              }
            >
              Салон на Печатников, 1. Вход отдельный, с улицы. Если стоите у
              дома и не видите вывеску — позвоните, вас встретят.
            </p>
            <div className="flex flex-col sm:flex-row" style={{ gap: 'var(--space-2)' }}>
              <MotionLink
                href={MAP_URL}
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
                Построить маршрут
              </MotionLink>
              <MotionLink
                href={PHONE_TEL}
                style={
                  {
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--space-2) var(--space-4)',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-text)',
                    fontWeight: 'var(--weight-semibold)',
                    fontSize: 'var(--text-body)',
                    transition: 'border-color var(--transition-base)',
                  } as React.CSSProperties
                }
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-color-accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
              >
                Позвонить
              </MotionLink>
            </div>
          </div>
        </RevealItem>
        </Reveal>
      </div>
    </section>
  )
}
