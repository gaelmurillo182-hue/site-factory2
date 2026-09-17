import logo from '../assets/logo.png'

const TELEGRAM_URL = 'https://t.me/knttopspin'
const VK_URL = 'https://vk.com/knttopspin'
const PHONE_DISPLAY = '+7 (919) 392-62-81'
const PHONE_TEL = 'tel:+79193926281'

export default function Footer() {
  return (
    <footer
      style={{
        background: 'var(--color-board)',
      }}
    >
      {/* Основной контент */}
      <div
        style={{
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          paddingLeft: 'var(--gutter)',
          paddingRight: 'var(--gutter)',
          paddingTop: 'var(--space-10)',
          paddingBottom: 'var(--space-8)',
        }}
      >
        <div
          className="grid grid-cols-1 md:grid-cols-3"
          style={{ gap: 'var(--space-8)' }}
        >
          {/* Логотип и описание */}
          <div>
            <a
              href="/"
              aria-label="Топ-Спин — на главную"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-3)',
              }}
            >
              <img
                src={logo}
                alt=""
                width={32}
                height={32}
                style={{ objectFit: 'contain' }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 'var(--weight-bold)',
                  fontSize: 'var(--text-body-lg)',
                  color: 'var(--color-chalk)',
                  letterSpacing: 'var(--tracking-heading)',
                } as React.CSSProperties}
              >
                Топ-Спин
              </span>
            </a>
            <p
              style={{
                fontFamily: 'var(--font-text)',
                fontSize: 'var(--text-small)',
                color: 'var(--color-chalk-muted)',
                lineHeight: 'var(--leading-body)',
              } as React.CSSProperties}
            >
              Клуб настольного тенниса в Екатеринбурге.
              <br />
              Детская секция, тренировки для взрослых,
              <br />
              рейтинговые турниры TTWR.
            </p>
          </div>

          {/* Контакты */}
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-text)',
                fontSize: 'var(--text-small)',
                color: 'var(--color-chalk-muted)',
                textTransform: 'uppercase',
                letterSpacing: 'var(--tracking-caps)',
                marginBottom: 'var(--space-3)',
              } as React.CSSProperties}
            >
              Контакты
            </h3>
            <address
              style={{
                fontStyle: 'normal',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-text)',
                  fontSize: 'var(--text-body)',
                  color: 'var(--color-chalk)',
                }}
              >
                ул. Тверитина, 45, 3&nbsp;этаж
              </span>
              <a
                href={PHONE_TEL}
                style={{
                  fontFamily: 'var(--font-text)',
                  fontSize: 'var(--text-body)',
                  color: 'var(--color-chalk)',
                  transition: 'color var(--transition-base)',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-ball-bright)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-chalk)')}
              >
                {PHONE_DISPLAY}
              </a>
              <span
                style={{
                  fontFamily: 'var(--font-text)',
                  fontSize: 'var(--text-small)',
                  color: 'var(--color-chalk-muted)',
                }}
              >
                Ежедневно 09:00–22:00
              </span>
            </address>
          </div>

          {/* Соцсети */}
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-text)',
                fontSize: 'var(--text-small)',
                color: 'var(--color-chalk-muted)',
                textTransform: 'uppercase',
                letterSpacing: 'var(--tracking-caps)',
                marginBottom: 'var(--space-3)',
              } as React.CSSProperties}
            >
              Мы в соцсетях
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
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
                ВКонтакте vk.com/knttopspin
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Линия стола */}
      <div
        aria-hidden="true"
        style={{
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          paddingLeft: 'var(--gutter)',
          paddingRight: 'var(--gutter)',
        }}
      >
        <div
          style={{
            height: 'var(--line-width)',
            background: 'var(--line-color-dim)',
          }}
        />
      </div>

      {/* Правовая строка */}
      <div
        style={{
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          paddingLeft: 'var(--gutter)',
          paddingRight: 'var(--gutter)',
          paddingTop: 'var(--space-4)',
          paddingBottom: 'var(--space-6)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-text)',
            fontSize: 'var(--text-caption)',
            color: 'var(--color-chalk-muted)',
            lineHeight: 'var(--leading-body)',
          } as React.CSSProperties}
        >
          © 2026 Клуб настольного тенниса «Топ-Спин» · ИП Артемкин Алексей
        </p>
        <button
          type="button"
          style={{
            fontFamily: 'var(--font-text)',
            fontSize: 'var(--text-caption)',
            color: 'var(--color-chalk-muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
          } as React.CSSProperties}
          onClick={() => window.alert('Политика конфиденциальности — страница в разработке')}
        >
          Политика конфиденциальности
        </button>
      </div>
    </footer>
  )
}
