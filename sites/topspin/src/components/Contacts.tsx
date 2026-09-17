const MAPS_URL =
  'https://yandex.ru/maps/?text=%D0%95%D0%BA%D0%B0%D1%82%D0%B5%D1%80%D0%B8%D0%BD%D0%B1%D1%83%D1%80%D0%B3%2C%20%D1%83%D0%BB.%20%D0%A2%D0%B2%D0%B5%D1%80%D0%B8%D1%82%D0%B8%D0%BD%D0%B0%2C%2045'
const TELEGRAM_URL = 'https://t.me/knttopspin'
const VK_URL = 'https://vk.com/knttopspin'
const PHONE_DISPLAY = '+7 (919) 392-62-81'
const PHONE_TEL = 'tel:+79193926281'
const EMAIL = 'artemkin1998@bk.ru'

export default function Contacts() {
  return (
    <section
      id="contacts"
      aria-labelledby="contacts-title"
      style={{
        background: 'var(--color-board)',
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
        <h2
          id="contacts-title"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-h2)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--color-chalk)',
            letterSpacing: 'var(--tracking-heading)',
            lineHeight: 'var(--leading-heading)',
            marginBottom: 'var(--space-8)',
          } as React.CSSProperties}
        >
          Как нас найти
        </h2>

        <div
          className="grid grid-cols-1 md:grid-cols-2"
          style={{ gap: 'var(--space-10)' } as React.CSSProperties}
        >
          {/* Информация */}
          <div>
            {/* Адрес */}
            <section aria-label="Адрес">
              <h3
                style={{
                  fontFamily: 'var(--font-text)',
                  fontSize: 'var(--text-small)',
                  color: 'var(--color-chalk-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--tracking-caps)',
                  marginBottom: 'var(--space-1)',
                } as React.CSSProperties}
              >
                Адрес
              </h3>
              <address
                style={{
                  fontStyle: 'normal',
                  fontFamily: 'var(--font-text)',
                  fontSize: 'var(--text-body-lg)',
                  color: 'var(--color-chalk)',
                  lineHeight: 'var(--leading-body)',
                  marginBottom: 'var(--space-5)',
                } as React.CSSProperties}
              >
                Екатеринбург, ул. Тверитина, 45, 3&nbsp;этаж
                <br />
                <span style={{ color: 'var(--color-chalk-muted)', fontSize: 'var(--text-body)' }}>
                  ТЦ «Максидом», третий этаж
                </span>
              </address>
            </section>

            {/* Телефон */}
            <section aria-label="Телефон" style={{ marginBottom: 'var(--space-5)' }}>
              <h3
                style={{
                  fontFamily: 'var(--font-text)',
                  fontSize: 'var(--text-small)',
                  color: 'var(--color-chalk-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--tracking-caps)',
                  marginBottom: 'var(--space-1)',
                } as React.CSSProperties}
              >
                Телефон
              </h3>
              <a
                href={PHONE_TEL}
                style={{
                  fontFamily: 'var(--font-text)',
                  fontSize: 'var(--text-body-lg)',
                  color: 'var(--color-chalk)',
                  transition: 'color var(--transition-base)',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-ball-bright)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-chalk)')}
              >
                {PHONE_DISPLAY}
              </a>
            </section>

            {/* Email */}
            <section aria-label="Email" style={{ marginBottom: 'var(--space-5)' }}>
              <h3
                style={{
                  fontFamily: 'var(--font-text)',
                  fontSize: 'var(--text-small)',
                  color: 'var(--color-chalk-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--tracking-caps)',
                  marginBottom: 'var(--space-1)',
                } as React.CSSProperties}
              >
                Email
              </h3>
              <a
                href={`mailto:${EMAIL}`}
                style={{
                  fontFamily: 'var(--font-text)',
                  fontSize: 'var(--text-body)',
                  color: 'var(--color-chalk)',
                  transition: 'color var(--transition-base)',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-ball-bright)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-chalk)')}
              >
                {EMAIL}
              </a>
            </section>

            {/* Режим работы */}
            <section aria-label="Режим работы" style={{ marginBottom: 'var(--space-5)' }}>
              <h3
                style={{
                  fontFamily: 'var(--font-text)',
                  fontSize: 'var(--text-small)',
                  color: 'var(--color-chalk-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--tracking-caps)',
                  marginBottom: 'var(--space-1)',
                } as React.CSSProperties}
              >
                Режим работы
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-text)',
                  fontSize: 'var(--text-body)',
                  color: 'var(--color-chalk)',
                }}
              >
                Ежедневно, 09:00–22:00
              </p>
            </section>

            {/* Соцсети */}
            <section aria-label="Соцсети" style={{ marginBottom: 'var(--space-5)' }}>
              <h3
                style={{
                  fontFamily: 'var(--font-text)',
                  fontSize: 'var(--text-small)',
                  color: 'var(--color-chalk-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--tracking-caps)',
                  marginBottom: 'var(--space-2)',
                } as React.CSSProperties}
              >
                Соцсети
              </h3>
              <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                <a
                  href={TELEGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: 'var(--font-text)',
                    fontSize: 'var(--text-body)',
                    color: 'var(--color-ball-bright)',
                    transition: 'opacity var(--transition-base)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  Telegram @knttopspin
                </a>
                <a
                  href={VK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: 'var(--font-text)',
                    fontSize: 'var(--text-body)',
                    color: 'var(--color-ball-bright)',
                    transition: 'opacity var(--transition-base)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  ВКонтакте
                </a>
              </div>
            </section>

            {/* Как добраться */}
            <section aria-label="Как добраться">
              <h3
                style={{
                  fontFamily: 'var(--font-text)',
                  fontSize: 'var(--text-small)',
                  color: 'var(--color-chalk-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--tracking-caps)',
                  marginBottom: 'var(--space-2)',
                } as React.CSSProperties}
              >
                Как добраться
              </h3>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-1)',
                }}
              >
                {[
                  'Метро Геологическая — пешком',
                  'Трамвай 3, 6, 10',
                  'Автобус 1',
                  'Троллейбус 5',
                  'Остановка «Тверитина»',
                ].map((item) => (
                  <li
                    key={item}
                    style={{
                      fontFamily: 'var(--font-text)',
                      fontSize: 'var(--text-body)',
                      color: 'var(--color-chalk-muted)',
                    }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Блок с картой / маршрутом */}
          <div>
            <div
              style={{
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-8)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 'var(--space-4)',
                height: '100%',
                minHeight: '18rem',
              } as React.CSSProperties}
            >
              {/* Декоративная линия */}
              <div
                aria-hidden="true"
                style={{
                  width: '3rem',
                  height: 'var(--line-width)',
                  background: 'var(--color-ball)',
                }}
              />

              <div>
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
                  Мы здесь
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-h3)',
                    fontWeight: 'var(--weight-bold)',
                    color: 'var(--color-chalk)',
                    letterSpacing: 'var(--tracking-heading)',
                    lineHeight: 'var(--leading-heading)',
                  } as React.CSSProperties}
                >
                  ул. Тверитина, 45
                  <br />
                  3&nbsp;этаж
                </p>
              </div>

              <p
                style={{
                  fontFamily: 'var(--font-text)',
                  fontSize: 'var(--text-body)',
                  color: 'var(--color-chalk-muted)',
                  lineHeight: 'var(--leading-body)',
                } as React.CSSProperties}
              >
                Мы в ТЦ «Максидом» на Тверитина, 45. Поднимайтесь на третий этаж.
                Если не нашли вход — позвоните, подскажем.
              </p>

              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  marginTop: 'auto',
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
                } as React.CSSProperties}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Построить маршрут
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
