import { useEffect, useState } from 'react'
import Logo from './Logo'
import { MotionLink } from './motion/Interactive'

const DIKIDI_URL = 'https://dikidi.net/970292'

const NAV_LINKS = [
  { href: '#services', label: 'Услуги' },
  { href: '#tiers', label: 'Уровни' },
  { href: '#works', label: 'Работы' },
  { href: '#price', label: 'Прайс' },
  { href: '#masters', label: 'Мастера' },
  { href: '#training', label: 'Обучение' },
  { href: '#contacts', label: 'Контакты' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '4.5rem',
        background: 'var(--bg-deep)',
        zIndex: 'var(--z-header)',
        borderBottom: '1px solid var(--border-color-quiet)',
      } as React.CSSProperties}
    >
      <div
        style={{
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          height: '100%',
          paddingLeft: 'var(--gutter)',
          paddingRight: 'var(--gutter)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Логотип */}
        <a
          href="#top"
          aria-label="AVANA — на главную"
          style={{
            display: 'flex',
            minWidth: 0,
            color: 'var(--text-primary)',
          }}
        >
          <Logo markSize={30} />
        </a>

        {/* Навигация desktop */}
        <nav
          className="hidden md:flex"
          aria-label="Основная навигация"
          style={{ gap: 'var(--space-5)' }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                fontFamily: 'var(--font-text)',
                fontSize: 'var(--text-small)',
                color: 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                transition: 'color var(--transition-base)',
              } as React.CSSProperties}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA desktop */}
        <MotionLink
          href={DIKIDI_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex"
          style={{
            alignItems: 'center',
            padding: 'var(--space-1) var(--space-3)',
            background: 'var(--bg-accent)',
            color: 'var(--text-on-accent)',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-text)',
            fontWeight: 'var(--weight-semibold)',
            fontSize: 'var(--text-small)',
            transition: 'opacity var(--transition-base)',
            flexShrink: 0,
          } as React.CSSProperties}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          Записаться
        </MotionLink>

        {/* Бургер mobile.
            Обёртка несёт md:hidden: у самой кнопки инлайновый display:flex,
            он перебил бы класс, и бургер остался бы видимым на десктопе. */}
        <div className="md:hidden" style={{ flexShrink: 0 }}>
        <button
          aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            width: '2.5rem',
            height: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-0-5)',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              display: 'block',
              width: '1.5rem',
              height: '2px',
              background: 'var(--text-primary)',
              transition: 'transform var(--transition-base), opacity var(--transition-base)',
              transform: menuOpen ? 'translateY(6px) rotate(45deg)' : 'none',
            } as React.CSSProperties}
          />
          <span
            style={{
              display: 'block',
              width: '1.5rem',
              height: '2px',
              background: 'var(--text-primary)',
              transition: 'opacity var(--transition-base)',
              opacity: menuOpen ? 0 : 1,
            } as React.CSSProperties}
          />
          <span
            style={{
              display: 'block',
              width: '1.5rem',
              height: '2px',
              background: 'var(--text-primary)',
              transition: 'transform var(--transition-base), opacity var(--transition-base)',
              transform: menuOpen ? 'translateY(-6px) rotate(-45deg)' : 'none',
            } as React.CSSProperties}
          />
        </button>
        </div>
      </div>

      {/* Мобильное меню */}
      <div
        className="md:hidden"
        style={{
          position: 'fixed',
          top: '4.5rem',
          left: 0,
          right: 0,
          bottom: 0,
          background: 'var(--overlay-scrim)',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'auto' : 'none',
          transition: `opacity var(--transition-base)`,
          zIndex: 'var(--z-overlay)',
        } as React.CSSProperties}
        onClick={() => setMenuOpen(false)}
      >
        <nav
          aria-label="Мобильная навигация"
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'var(--bg-deep)',
            padding: 'var(--space-4) var(--gutter)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            transform: menuOpen ? 'translateY(0)' : 'translateY(-12px)',
            opacity: menuOpen ? 1 : 0,
            transition: `transform var(--transition-base), opacity var(--transition-base)`,
          } as React.CSSProperties}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: 'var(--font-text)',
                fontSize: 'var(--text-body-lg)',
                color: 'var(--text-primary)',
              } as React.CSSProperties}
            >
              {link.label}
            </a>
          ))}
          <MotionLink
            href={DIKIDI_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textAlign: 'center',
              padding: 'var(--space-2) var(--space-3)',
              background: 'var(--bg-accent)',
              color: 'var(--text-on-accent)',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-text)',
              fontWeight: 'var(--weight-semibold)',
              fontSize: 'var(--text-body)',
            } as React.CSSProperties}
          >
            Записаться
          </MotionLink>
        </nav>
      </div>
    </header>
  )
}
