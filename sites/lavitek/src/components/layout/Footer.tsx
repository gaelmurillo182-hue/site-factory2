import { Link } from 'react-router-dom'
import Logo from './Logo'
import { contacts, site } from '../../data/site'
import { directions } from '../../data/catalog'

const worlds = [
  {
    title: 'Каталог',
    links: [
      ...directions.map((d) => ({ to: `/catalog/${d.slug}`, label: d.title })),
      { to: '/otrasli', label: 'Отрасли применения' },
    ],
  },
  {
    title: 'Справочник',
    links: [
      { to: '/splavy', label: 'Марки сплавов' },
      { to: '/dopuski', label: 'Допуски и шероховатость' },
      { to: '/ntd', label: 'Нормативные документы' },
    ],
  },
  {
    title: 'Как мы работаем',
    links: [
      { to: '/po-chertezhu', label: 'Изготовление по чертежу' },
      { to: '/uslugi', label: 'Услуги' },
      { to: '/dostavka-i-oplata', label: 'Доставка и оплата' },
      { to: '/preimushchestva', label: 'Как мы работаем' },
      { to: '/o-nas', label: 'О компании' },
      { to: '/pravovaya-informaciya', label: 'Правовая информация' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="lv-footer">
      <div className="lv-wrap">
        <div className="lv-footer__grid">
          <div>
            <Link to="/" className="lv-logo" aria-label="На главную">
              <Logo />
            </Link>
            <ul className="lv-footer__list" style={{ marginTop: 'var(--s-5)' }}>
              <li>
                <a href={`tel:${contacts.phoneOffice.tel}`}>{contacts.phoneOffice.human}</a>
              </li>
              <li>
                <a href={`tel:${contacts.phoneMobile.tel}`}>{contacts.phoneMobile.human}</a>
              </li>
              <li>
                <a href={`mailto:${contacts.email}`}>{contacts.email}</a>
              </li>
              <li>{contacts.address.full}</li>
              <li>{contacts.hours}</li>
            </ul>
          </div>

          {worlds.map((w) => (
            <div key={w.title}>
              <h2 className="lv-footer__title">{w.title}</h2>
              <ul className="lv-footer__list">
                {w.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="lv-footer__bottom">
          <p className="lv-footer__legal">
            Товарные знаки третьих лиц упомянуты в справочных целях и принадлежат их
            правообладателям. Мы не являемся их дилером, дистрибьютором или лицензиатом,
            а предлагаемая продукция не является их продукцией. Подробнее —{' '}
            <Link to="/pravovaya-informaciya">«Правовая информация»</Link>.
          </p>
          <p className="lv-footer__legal">
            Информация на сайте размещена в справочных целях и не является публичной офертой
            (ч. 1 ст. 437 ГК РФ). Наличие, стоимость, срок изготовления и технические
            параметры конкретной партии подтверждаются в счёте и спецификации.
          </p>
          <p>
            © {new Date().getFullYear()} {site.name}. {site.originHuman}
          </p>
        </div>
      </div>
    </footer>
  )
}
