import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Logo from './Logo'
import { contacts } from '../../data/site'
import { directions } from '../../data/catalog'

/**
 * Шапка.
 *
 * Раньше в первом уровне стояли вперемешку «Каталог», «По чертежу»,
 * «Марки сплавов», «Доставка и оплата» и «Контакты» — пункты из трёх разных
 * миров выглядели однородными, и человек не понимал, где он находится.
 *
 * Теперь миров ровно три, и каждый раскрывается панелью:
 *   Каталог — что поставляем,
 *   Справочник — как выбрать,
 *   Как мы работаем — как купить.
 * Контакты и телефон стоят отдельно: это не мир, а действие.
 */

type MenuKey = 'catalog' | 'spravochnik' | 'rabota'

/** Разделы, по которым подсвечивается активный мир. */
const WORLD_OF: Record<MenuKey, string[]> = {
  catalog: ['/catalog', '/otrasli'],
  spravochnik: ['/splavy', '/dopuski', '/ntd'],
  rabota: ['/po-chertezhu', '/uslugi', '/dostavka-i-oplata', '/preimushchestva', '/o-nas'],
}

const MENUS: { key: MenuKey; label: string; columns: { title: string; to: string; items: { title: string; to: string }[] }[] }[] = [
  {
    key: 'catalog',
    label: 'Каталог',
    columns: [
      ...directions.map((d) => ({
        title: d.title,
        to: `/catalog/${d.slug}`,
        items: d.items.map((i) => ({ title: i.title, to: `/catalog/${d.slug}/${i.slug}` })),
      })),
      {
        title: 'Найти по задаче',
        to: '/otrasli',
        items: [
          { title: 'Отрасли применения', to: '/otrasli' },
          { title: 'Весь каталог одной страницей', to: '/catalog' },
        ],
      },
    ],
  },
  {
    key: 'spravochnik',
    label: 'Справочник',
    columns: [
      {
        title: 'Материал',
        to: '/splavy',
        items: [
          { title: 'Марки сплавов и соответствия', to: '/splavy' },
          { title: 'Допуски и шероховатость', to: '/dopuski' },
          { title: 'Нормативные документы', to: '/ntd' },
        ],
      },
    ],
  },
  {
    key: 'rabota',
    label: 'Как мы работаем',
    columns: [
      {
        title: 'Заказ',
        to: '/po-chertezhu',
        items: [
          { title: 'Изготовление по чертежу', to: '/po-chertezhu' },
          { title: 'Услуги', to: '/uslugi' },
          { title: 'Доставка и оплата', to: '/dostavka-i-oplata' },
        ],
      },
      {
        title: 'Компания',
        to: '/o-nas',
        items: [
          { title: 'Как мы работаем', to: '/preimushchestva' },
          { title: 'О компании', to: '/o-nas' },
        ],
      },
    ],
  },
]

export default function Header() {
  const [open, setOpen] = useState<MenuKey | null>(null)
  const [drawer, setDrawer] = useState(false)
  const { pathname } = useLocation()
  const headerRef = useRef<HTMLElement>(null)

  // Переход на другую страницу закрывает всё: иначе панель висит поверх новой.
  useEffect(() => {
    setOpen(null)
    setDrawer(false)
  }, [pathname])

  useEffect(() => {
    if (!open && !drawer) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(null)
        setDrawer(false)
      }
    }
    const onClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpen(null)
        setDrawer(false)
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [open, drawer])

  const inWorld = (key: MenuKey) => WORLD_OF[key].some((p) => pathname.startsWith(p))
  const panel = MENUS.find((m) => m.key === open)

  return (
    <header className="lv-header" ref={headerRef}>
      <div className="lv-wrap">
        <div className="lv-header__bar">
          <Link to="/" className="lv-logo" aria-label="Лавитек Твердые Сплавы, на главную">
            <Logo />
          </Link>

          <nav className="lv-nav" aria-label="Основное меню">
            {MENUS.map((m) => (
              <button
                key={m.key}
                type="button"
                className="lv-nav__link lv-nav__toggle"
                aria-expanded={open === m.key}
                data-here={inWorld(m.key) || undefined}
                onClick={() => setOpen(open === m.key ? null : m.key)}
              >
                {m.label}
                <span className="lv-nav__chev" aria-hidden="true" />
              </button>
            ))}
            <NavLink to="/kontakty" className="lv-nav__link">
              Контакты
            </NavLink>
          </nav>

          <a className="lv-header__phone" href={`tel:${contacts.phoneOffice.tel}`}>
            {contacts.phoneOffice.human}
          </a>

          <button
            type="button"
            className="lv-burger"
            aria-expanded={drawer}
            aria-label={drawer ? 'Закрыть меню' : 'Открыть меню'}
            onClick={() => setDrawer((v) => !v)}
          >
            <span className="lv-burger__lines" />
          </button>
        </div>
      </div>

      {panel && (
        <div className="lv-mega">
          <div className="lv-wrap">
            <div className="lv-mega__grid" data-wide={panel.columns.length > 3 || undefined}>
              {panel.columns.map((c) => (
                <div key={c.to + c.title}>
                  <Link className="lv-mega__dir" to={c.to}>
                    {c.title}
                  </Link>
                  <ul className="lv-mega__list">
                    {c.items.map((i) => (
                      <li key={i.to}>
                        <Link className="lv-mega__item" to={i.to}>
                          {i.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {drawer && (
        <div className="lv-drawer">
          <div className="lv-wrap">
            <nav className="lv-nav" aria-label="Меню">
              {MENUS.map((m) => (
                <div key={m.key}>
                  <p className="lv-drawer__world">{m.label}</p>
                  {m.columns.flatMap((c) => c.items).map((i) => (
                    <NavLink key={i.to} to={i.to} className="lv-nav__link">
                      {i.title}
                    </NavLink>
                  ))}
                </div>
              ))}
              <NavLink to="/kontakty" className="lv-nav__link">
                Контакты
              </NavLink>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
