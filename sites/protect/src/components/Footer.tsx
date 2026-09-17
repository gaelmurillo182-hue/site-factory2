import Logo from './Logo'
import { BRANDS, COMPANY, CONTACTS } from '../data/site'

const SECTIONS = [
  { href: '#box', label: 'Что входит в работу' },
  { href: '#services', label: 'Направления' },
  { href: '#objects', label: 'Объекты' },
  { href: '#calc', label: 'Расчёт' },
  { href: '#money', label: 'Цены и документы' },
  { href: '#faq', label: 'Вопросы' },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__col footer__col--brand">
          <Logo inverse />
          <p className="footer__about">
            {COMPANY.city} и {COMPANY.region}. Работаем с {COMPANY.since} года.
          </p>
        </div>

        <div className="footer__col">
          <h2 className="label label--inverse">Контакты</h2>
          <a className="footer__phone num" href={CONTACTS.phoneHref}>
            {CONTACTS.phone}
          </a>
          {CONTACTS.telegram && (
            <a className="footer__link" href={CONTACTS.telegram} target="_blank" rel="noopener">
              Telegram
            </a>
          )}
        </div>

        <div className="footer__col">
          <h2 className="label label--inverse">Разделы</h2>
          <nav className="footer__nav" aria-label="Разделы страницы, подвал">
            {SECTIONS.map((s) => (
              <a className="footer__link" href={s.href} key={s.href}>
                {s.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="footer__col">
          <h2 className="label label--inverse">Реквизиты</h2>
          <p className="footer__req">{COMPANY.legal}</p>
          <p className="footer__req num">ИНН {COMPANY.inn}</p>
        </div>
      </div>

      <div className="container footer__legal">
        <p className="footer__disclaimer">
          Информация на сайте носит справочный характер и не является публичной офертой.
          Состав работ, оборудование и стоимость определяются после замера на объекте и
          фиксируются в договоре.
        </p>
        <p className="footer__disclaimer">
          Названия {BRANDS.join(', ')} и другие упомянутые обозначения являются
          товарными знаками их правообладателей и приведены исключительно для информации
          о том, с каким оборудованием мы работаем. {COMPANY.brand} не является
          официальным дилером, дистрибьютором, авторизованным партнёром или сервисным
          центром перечисленных производителей и не действует от их имени.
        </p>
        <p className="footer__copy">
          © {new Date().getFullYear()} {COMPANY.brand}.{' '}
          <a className="footer__link footer__link--inline" href="/privacy.html">
            Политика обработки персональных данных
          </a>
          .
        </p>
      </div>
    </footer>
  )
}
