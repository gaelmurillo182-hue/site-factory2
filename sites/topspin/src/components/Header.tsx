import { useState, useEffect } from 'react'
import logo from '../assets/logo.png'

const YCLIENTS_URL = 'https://n1935836.yclients.com/'

const NAV_LINKS = [
  { href: '#about', label: 'О клубе' },
  { href: '#trainers', label: 'Тренеры' },
  { href: '#schedule', label: 'Расписание' },
  { href: '#subscriptions', label: 'Цены' },
  { href: '#contacts', label: 'Контакты' },
]

export default function Header() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const close = () => setOpen(false)

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 'var(--z-header)',
          background: 'var(--color-board)',
          borderBottom: '1px solid var(--line-color-dim)',
        } as React.CSSProperties}
      >
        <div
          style={{
            maxWidth: 'var(--container-max)',
            margin: '0 auto',
            paddingLeft: 'var(--gutter)',
            paddingRight: 'var(--gutter)',
            height: '4.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
          }}
        >
          {/* Логотип */}
          <a
            href="/"
            aria-label="Топ-Спин — на главную"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              flexShrink: 0,
            }}
          >
            <img
              src={logo}
              alt=""
              width={52}
              height={52}
              style={{ objectFit: 'contain' }}
            />
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 'var(--weight-bold)',
                fontSize: '1.375rem',
                color: 'var(--color-chalk)',
                letterSpacing: 'var(--tracking-heading)',
                lineHeight: 1,
              } as React.CSSProperties}
            >
              Топ-Спин
            </span>
          </a>

          {/* Десктопная навигация */}
          <nav
            aria-label="Основная навигация"
            className="hidden md:flex"
            style={{
              flex: 1,
              justifyContent: 'center',
              gap: 'var(--space-5)',
            }}
          >
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                style={{
                  fontFamily: 'var(--font-text)',
                  fontSize: 'var(--text-small)',
                  color: 'var(--color-chalk-muted)',
                  whiteSpace: 'nowrap',
                  padding: '0.25rem 0',
                  transition: 'color var(--transition-base)',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-chalk)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-chalk-muted)')}
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Растяжка на мобильном */}
          <div className="flex-1 md:hidden" />

          {/* CTA кнопка десктоп */}
          <div className="hidden md:block">
            <a
              href={YCLIENTS_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.5rem 1.25rem',
                background: 'var(--color-ball)',
                color: 'var(--color-board)',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-text)',
                fontWeight: 'var(--weight-semibold)',
                fontSize: 'var(--text-small)',
                flexShrink: 0,
                transition: 'opacity var(--transition-base)',
              } as React.CSSProperties}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Записаться
            </a>
          </div>

          {/* Гамбургер */}
          <div className="md:hidden">
            <button
              type="button"
              aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen(o => !o)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '5px',
                width: '2.25rem',
                height: '2.25rem',
                padding: '0.25rem',
              }}
            >
              <span
                style={{
                  display: 'block',
                  width: '20px',
                  height: '2px',
                  background: 'var(--color-chalk)',
                  transition: 'transform var(--transition-base)',
                  transform: open ? 'translateY(7px) rotate(45deg)' : 'none',
                }}
              />
              <span
                style={{
                  display: 'block',
                  width: '20px',
                  height: '2px',
                  background: 'var(--color-chalk)',
                  transition: 'opacity var(--transition-base)',
                  opacity: open ? 0 : 1,
                }}
              />
              <span
                style={{
                  display: 'block',
                  width: '20px',
                  height: '2px',
                  background: 'var(--color-chalk)',
                  transition: 'transform var(--transition-base)',
                  transform: open ? 'translateY(-7px) rotate(-45deg)' : 'none',
                }}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Оверлей (мобильный) */}
      <div
        aria-hidden="true"
        onClick={close}
        className="md:hidden"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99,
          background: 'rgba(0,0,0,0.55)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity var(--transition-base)',
        }}
      />

      {/* Мобильное меню */}
      <div className="md:hidden">
        <nav
          id="mobile-nav"
          aria-label="Мобильная навигация"
          style={{
            position: 'fixed',
            top: '4.5rem',
            left: 0,
            right: 0,
            zIndex: 101,
            background: 'var(--color-board)',
            borderBottom: '1px solid var(--line-color-dim)',
            padding: 'var(--space-3) var(--gutter) var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
            transform: open ? 'translateY(0)' : 'translateY(-110%)',
            opacity: open ? 1 : 0,
            transition: 'transform var(--transition-base), opacity var(--transition-base)',
          } as React.CSSProperties}
        >
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={close}
              style={{
                fontFamily: 'var(--font-text)',
                fontSize: 'var(--text-body)',
                color: 'var(--color-chalk)',
                padding: 'var(--space-2) 0',
                borderBottom: '1px solid var(--line-color-dim)',
              }}
            >
              {label}
            </a>
          ))}
          <a
            href={YCLIENTS_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={close}
            style={{
              marginTop: 'var(--space-3)',
              display: 'block',
              textAlign: 'center',
              padding: 'var(--space-2) var(--space-3)',
              background: 'var(--color-ball)',
              color: 'var(--color-board)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-text)',
              fontWeight: 'var(--weight-semibold)',
              fontSize: 'var(--text-body)',
            } as React.CSSProperties}
          >
            Записаться онлайн
          </a>
        </nav>
      </div>
    </>
  )
}
