import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import CtaBand from '../components/CtaBand'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import { Section, Head, Note } from '../components/spec'
import { directions } from '../data/catalog'
import { directionCover } from '../data/media'
import { breadcrumbLd } from '../data/schema'

/**
 * Обзор каталога.
 *
 * Был дампом: шесть направлений со всеми девятнадцатью позициями подряд,
 * то есть повторял содержимое шести страниц направлений на 6300px. Стал
 * картой — куда идти, а не что там лежит.
 */
export default function CatalogIndex() {
  const trail = [
    { name: 'Главная', path: '/' },
    { name: 'Каталог', path: '/catalog' },
  ]

  return (
    <>
      <Seo
        title="Каталог твердосплавных изделий"
        description="Каталог изделий из карбида вольфрама: волочильный инструмент, пресс-оснастка, заготовки, детали для металлургии, нефтегаза и машиностроения."
        path="/catalog"
        jsonLd={[breadcrumbLd(trail)]}
      />
      <Breadcrumbs trail={trail} />

      <Section tight>
        <div className="lv-split">
          <Head
            as="h1"
            eyebrow="Каталог"
            title="Шесть направлений"
          />
          <div className="lv-prose">
            <p className="lv-lead">
              Страница каждой позиции отвечает на четыре вопроса: что это за изделие, где
              оно стоит, как изнашивается и что прислать для расчёта.
            </p>
            <Note tone="signal">
              Позиции изготавливаются под чертёж и типоразмер. Складского наличия мы не
              заявляем: нужна конкретная позиция со склада — спросите, проверим по текущим
              остаткам производственных площадок.
            </Note>
          </div>
        </div>
      </Section>

      <Section tone="sunk">
        <div className="lv-map">
          {directions.map((d) => {
            const media = directionCover(d.slug, d.items.map((i) => i.slug))
            return (
              <Link key={d.slug} className="lv-map__card" to={`/catalog/${d.slug}`}>
                {media && (
                  <div className="lv-map__img">
                    <img
                      src={media.src}
                      alt={media.alt}
                      width={1600}
                      height={900}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                )}
                <div className="lv-map__body">
                  <span className="lv-map__title">{d.title}</span>
                  <span className="lv-map__lead">{d.lead}</span>
                  <span className="lv-map__items">
                    {d.items.map((i) => i.title).join(' · ')}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        <p style={{ marginTop: 'var(--s-7)' }}>
          <Link className="lv-more" to="/po-chertezhu">
            Позиции нет в списке — что прислать для расчёта
          </Link>
        </p>
      </Section>

      <CtaBand />
    </>
  )
}
