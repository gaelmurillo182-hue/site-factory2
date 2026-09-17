import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import RequestForm from '../components/RequestForm'
import { Section, Head, Note, Todo } from '../components/spec'
import { contacts } from '../data/site'
import { breadcrumbLd, localBusinessLd } from '../data/schema'


export default function Contacts() {
  const trail = [
    { name: 'Главная', path: '/' },
    { name: 'Контакты', path: '/kontakty' },
  ]

  return (
    <>
      <Seo
        title="Контакты — Лавитек Твердые Сплавы, Екатеринбург"
        description="Телефон, почта и адрес: 620138, Екатеринбург, ул. Чистопольская, д. 13, офис 214. Поставка твердосплавных изделий по всей России."
        path="/kontakty"
        jsonLd={[breadcrumbLd(trail), localBusinessLd]}
      />
      <Breadcrumbs trail={trail} />

      <Section tight>
        <div className="lv-split">
          <Head as="h1" eyebrow="Контакты" title="Как с нами связаться" />
          <div className="lv-prose">
            <p className="lv-lead">
              Быстрее всего — позвонить или прислать чертёж в мессенджер. Офис в
              Екатеринбурге, поставка по всей России.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="sunk">
        <div className="lv-cols-2">
          <div className="lv-prose">
            <h2 style={{ fontSize: 'var(--t-xl)' }}>Связь</h2>
            <p>
              <strong>Офис:</strong>{' '}
              <a href={`tel:${contacts.phoneOffice.tel}`}>{contacts.phoneOffice.human}</a>
              <br />
              <strong>Мобильный, WhatsApp, Telegram:</strong>{' '}
              <a href={`tel:${contacts.phoneMobile.tel}`}>{contacts.phoneMobile.human}</a>
              <br />
              <strong>Почта:</strong> <a href={`mailto:${contacts.email}`}>{contacts.email}</a>
            </p>
            <p>
              <a className="lv-btn lv-btn--ghost" href={contacts.whatsapp} rel="noopener">
                Написать в WhatsApp
              </a>{' '}
              <a className="lv-btn lv-btn--ghost" href={contacts.telegram} rel="noopener">
                Написать в Telegram
              </a>
            </p>
          </div>
          <div className="lv-prose">
            <h2 style={{ fontSize: 'var(--t-xl)' }}>Адрес и режим работы</h2>
            <p>
              {contacts.address.postalCode}, {contacts.address.city},
              <br />
              {contacts.address.street}
            </p>
            <p>
              <strong>Режим работы:</strong> {contacts.hours}
            </p>
            <Note tone="signal">
              <Todo>
                полное наименование юрлица или ИП, ИНН, ОГРН — обязательные сведения о
                владельце сайта. И часовой пояс в подписи к режиму работы: писать «мск» или
                «екб»
              </Todo>
            </Note>
          </div>
        </div>
      </Section>

      <Section>
        <div className="lv-split">
          <Head no="01" title="Как прислать чертёж" />
          <div className="lv-prose">
            <p>
              Чертежи, эскизы и спецификации отправляйте на почту или в мессенджер — так
              файл дойдёт в исходном формате. Подойдут PDF, DWG, DXF, фотографии листа или
              снимки детали с замерами.
            </p>
            <p>
              Файлы используем только для расчёта и не передаём третьим лицам, кроме
              производственной площадки по вашему заказу. Нужен NDA до отправки — напишите,
              направим в течение рабочего дня.{' '}
              <Link to="/pravovaya-informaciya">Полные условия</Link>.
            </p>
          </div>
        </div>
      </Section>

      <section
        className="lv-sec lv-sec--dark lv-tex"
        id="zapros"
      >
        <div className="lv-tex__layer" style={{ backgroundImage: 'url(/texture/10-contact.jpg)' }} aria-hidden="true" />
        <div className="lv-wrap lv-split">
          <Head
            no="02"
            eyebrow="Запрос расчёта"
            title="Опишите задачу"
            lead="Ответим маркой сплава, достижимым допуском, сроком и ценой."
          />
          <RequestForm subject="Обращение со страницы «Контакты»" />
        </div>
      </section>
    </>
  )
}
