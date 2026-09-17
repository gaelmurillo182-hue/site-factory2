import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import Figure from '../components/Figure'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import { Section, Head, Note, Facts, Todo } from '../components/spec'
import { contacts, site } from '../data/site'
import { directionMedia } from '../data/media'
import { breadcrumbLd, organizationLd } from '../data/schema'


export default function About() {
  const trail = [
    { name: 'Главная', path: '/' },
    { name: 'О компании', path: '/o-nas' },
  ]

  return (
    <>
      <Seo
        title="О компании Лавитек Твердые Сплавы"
        description="Лавитек — импортёр и организатор изготовления изделий из карбида вольфрама. Екатеринбург, поставка по России, изготовление по чертежам заказчика."
        path="/o-nas"
        jsonLd={[breadcrumbLd(trail), organizationLd]}
      />
      <Breadcrumbs trail={trail} />

      <Section tight>
        <div className="lv-split">
          <Head as="h1" eyebrow="О компании" title={site.name} />
          <div className="lv-prose">
            <p className="lv-lead">
              Мы поставляем изделия из карбида вольфрама предприятиям по всей России и
              организуем их изготовление по чертежам заказчика. Офис в Екатеринбурге.
            </p>
            <p>
              <strong>Мы не завод.</strong> Изделия производятся на производственных
              площадках в КНР — по вашей документации или по нашей, если чертежа нет и
              геометрию восстанавливают по образцу. Поиск площадки, размещение заказа,
              приёмка партии, платёж, таможенное оформление и доставка остаются на нас.
            </p>
            <p>
              «Собственное производство» и «полный цикл» в этой нише пишут многие.
              У нас это было бы неправдой, поэтому не написано.
            </p>
          </div>
        </div>
      </Section>

      <div className="lv-wrap lv-wrap--wide">
        <Figure media={directionMedia.mashinostroenie} width={1600} height={900} />
      </div>

      <Section tone="sunk">
        <div className="lv-split">
          <Head no="01" title="Что это даёт заказчику" />
          <div>
            <Facts
              items={[
                'Договор с российской компанией и расчёты в рублях — без валютного платежа и платёжного агента.',
                'Обычный комплект закрывающих документов вместо инвойса на чужом языке.',
                'Одна точка ответственности за партию: заказ, приёмка, таможня и доставка не разделены между тремя подрядчиками.',
                'Подбор марки сплава и допуска как часть работы, а не как отдельная платная услуга.',
              ]}
            />
          </div>
        </div>
      </Section>

      <Section>
        <div className="lv-split">
          <Head no="02" title="Реквизиты и контакты" />
          <div className="lv-prose">
            <p>
              <strong>Адрес:</strong> {contacts.address.full}
              <br />
              <strong>Телефон:</strong>{' '}
              <a href={`tel:${contacts.phoneOffice.tel}`}>{contacts.phoneOffice.human}</a>
              <br />
              <strong>Телефон, WhatsApp, Telegram:</strong>{' '}
              <a href={`tel:${contacts.phoneMobile.tel}`}>{contacts.phoneMobile.human}</a>
              <br />
              <strong>Почта:</strong> <a href={`mailto:${contacts.email}`}>{contacts.email}</a>
              <br />
              <strong>Режим работы:</strong> {contacts.hours}
            </p>
            <Note tone="signal">
              <Todo>
                полное наименование юридического лица или ИП, ИНН и ОГРН. Это обязательные
                сведения о владельце сайта, и до их получения раздел неполон
              </Todo>
            </Note>
            <p>
              <Link className="lv-more" to="/kontakty">
                Все контакты и форма запроса
              </Link>
            </p>
          </div>
        </div>
      </Section>

      <Section tone="sunk">
        <div className="lv-split">
          <Head no="03" title="Чего вы здесь не найдёте" />
          <div className="lv-prose">
            <p>
              Года основания, количества клиентов, объёмов поставок, числа заводов-партнёров
              и логотипов чужих брендов. Ничего из этого не подтверждено документами,
              которые мы могли бы предъявить, — а раз так, на сайте этому не место.
            </p>
            <p>
              Если для аккредитации поставщика вам нужны конкретные сведения о компании,
              запросите их напрямую: пришлём то, что действительно есть.
            </p>
          </div>
        </div>
      </Section>
    </>
  )
}
