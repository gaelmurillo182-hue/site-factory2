import { useEffect, useState } from 'react'
import { List, X, Phone } from '@phosphor-icons/react'
import Logo from './Logo'
import { CONTACTS } from '../data/site'

const NAV = [
  { href: '#box', label: 'Что входит в работу' },
  { href: '#services', label: 'Направления' },
  { href: '#objects', label: 'Объекты' },
  { href: '#calc', label: 'Расчёт' },
  { href: '#money', label: 'Цены и документы' },
  { href: '#faq', label: 'Вопросы' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [stuck, setStuck] = useState(false)

  /* Шапка отделяется от страницы, только когда она реально «прилипла».
     Наблюдаем маячок в самом верху документа, а не слушаем событие scroll:
     обработчик scroll срабатывает на каждый кадр и роняет плавность. */
  useEffect(() => {
    const mark = document.createElement('div')
    mark.setAttribute('aria-hidden', 'true')
    mark.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none'
    document.body.prepend(mark)
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting), { threshold: 0 })
    io.observe(mark)
    return () => {
      io.disconnect()
      mark.remove()
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <header className={`header${stuck ? ' header--stuck' : ''}`}>
        <div className="container header__inner">
          <a className="header__logo" href="#top" aria-label="ПРОТЕКТ, на начало страницы">
            <Logo />
          </a>

          <nav className="header__nav" aria-label="Разделы страницы">
            {NAV.map((item) => (
              <a key={item.href} className="header__link" href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="header__side">
            <a className="header__phone" href={CONTACTS.phoneHref}>
              <span className="header__phone-num num">{CONTACTS.phone}</span>
              <span className="header__phone-note">Заявки и вопросы по объектам</span>
            </a>
            <a className="btn btn--primary btn--small header__cta" href="#lead">
              Записаться на замер
            </a>
          </div>

          <button
            className="header__burger"
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={24} weight="regular" /> : <List size={24} weight="regular" />}
          </button>
        </div>
      </header>

      {/* Меню вынесено из <header> намеренно: backdrop-filter на шапке делает её
          содержащим блоком для position: fixed, и панель схлопывалась в высоту шапки. */}
      <div
        className={`mobile-menu${open ? ' mobile-menu--open' : ''}`}
        id="mobile-menu"
        hidden={!open}
      >
        <nav className="mobile-menu__nav" aria-label="Разделы страницы, мобильное меню">
          {NAV.map((item) => (
            <a
              key={item.href}
              className="mobile-menu__link"
              href={item.href}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="mobile-menu__actions">
          <a className="btn btn--primary" href={CONTACTS.phoneHref}>
            <Phone size={18} weight="fill" aria-hidden="true" />
            Позвонить
          </a>
          <a className="btn btn--ghost" href="#lead" onClick={() => setOpen(false)}>
            Записаться на замер
          </a>
        </div>
      </div>
    </>
  )
}
