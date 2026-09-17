import Logo from './Logo'

const DIKIDI_URL = 'https://dikidi.net/970292'
const WHATSAPP_URL = 'https://wa.me/79222066161'
const TELEGRAM_URL = 'https://t.me/salonAVANA'
const PHONE_TEL = 'tel:+79222066161'
const PHONE_DISPLAY = '+7 (922) 206-61-61'

const NAV_LINKS = [
  { href: '#services', label: 'Услуги' },
  { href: '#tiers', label: 'Уровни мастеров' },
  { href: '#works', label: 'Работы' },
  { href: '#price', label: 'Прайс' },
  { href: '#masters', label: 'Мастера' },
  { href: '#training', label: 'Обучение' },
  { href: '#contacts', label: 'Контакты' },
]

export default function Footer() {
  return (
    <footer
      style={{
        background: 'var(--bg-deep)',
        paddingTop: 'var(--space-8)',
        paddingBottom: 'var(--space-6)',
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
        {/* Знак */}
        <div
          style={{
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <Logo markSize={32} withTagline={false} />
        </div>

        {/* Строка 1 */}
        <p
          style={
            {
              fontFamily: 'var(--font-text)',
              fontSize: 'var(--text-body)',
              color: 'var(--text-secondary)',
              lineHeight: 'var(--leading-body)',
              marginBottom: 'var(--space-3)',
              maxWidth: 'var(--measure-base)',
            } as React.CSSProperties
          }
        >
          AVANA — ресницы, брови. Екатеринбург, ул. Печатников, 1. Отдельный
          вход с улицы. Ежедневно, 10:00–22:00.
        </p>

        {/* Строка 2 */}
        <div
          className="flex flex-wrap"
          style={{ gap: 'var(--space-1) var(--space-3)', marginBottom: 'var(--space-5)' }}
        >
          <a
            href={PHONE_TEL}
            style={
              {
                fontFamily: 'var(--font-text)',
                fontSize: 'var(--text-body)',
                color: 'var(--text-accent)',
                textDecoration: 'none',
              } as React.CSSProperties
            }
          >
            {PHONE_DISPLAY}
          </a>
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
          >
            WhatsApp
          </a>
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
          >
            Telegram @salonAVANA
          </a>
          <a
            href={DIKIDI_URL}
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
          >
            Онлайн-запись в DIKIDI
          </a>
        </div>

        {/* Строка 3 — навигация */}
        <nav aria-label="Разделы сайта" style={{ marginBottom: 'var(--space-5)' }}>
          <ul
            className="flex flex-wrap"
            style={{ listStyle: 'none', margin: 0, padding: 0, gap: 'var(--space-1) var(--space-4)' }}
          >
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  style={
                    {
                      fontFamily: 'var(--font-text)',
                      fontSize: 'var(--text-small)',
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                    } as React.CSSProperties
                  }
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-accent)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Строка 5 — примечание к ценам */}
        <p
          style={
            {
              fontFamily: 'var(--font-text)',
              fontSize: 'var(--text-caption)',
              color: 'var(--text-secondary)',
              lineHeight: 'var(--leading-body)',
              maxWidth: 'var(--measure-base)',
              marginBottom: 'var(--space-4)',
            } as React.CSSProperties
          }
        >
          Цены на сайте совпадают с ценами в онлайн-записи и могут меняться.
          Актуальная стоимость — в карточке услуги при записи.
        </p>

        {/* Разделитель */}
        <div
          style={{
            borderTop: 'var(--line-hairline) solid var(--border-color-quiet)',
            marginBottom: 'var(--space-4)',
          }}
        />

        {/* Строка 4 — правовая */}
        <p
          style={
            {
              fontFamily: 'var(--font-text)',
              fontSize: 'var(--text-caption)',
              color: 'var(--text-quiet)',
            } as React.CSSProperties
          }
        >
          © 2026 AVANA
        </p>
      </div>
    </footer>
  )
}
