import { Link, useParams } from 'react-router-dom'
import Seo from '../components/Seo'
import Figure from '../components/Figure'
import CtaBand from '../components/CtaBand'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import { Section, Head, SpecList, SpecRow } from '../components/spec'
import { directionBySlug, directions } from '../data/catalog'
import { directionMedia } from '../data/media'
import { breadcrumbLd, productLd } from '../data/schema'
import NotFound from './NotFound'

export default function CatalogDirection() {
  const { dir } = useParams()
  const d = dir ? directionBySlug[dir] : undefined
  if (!d) return <NotFound />

  const path = `/catalog/${d.slug}`
  const trail = [
    { name: 'Главная', path: '/' },
    { name: 'Каталог', path: '/catalog' },
    { name: d.title, path },
  ]
  const media = directionMedia[d.slug]
  const others = directions.filter((x) => x.slug !== d.slug)

  return (
    <>
      <Seo
        title={d.seoTitle}
        description={d.seoDescription}
        path={path}
        jsonLd={[breadcrumbLd(trail), productLd(d.title, d.seoDescription, path)]}
      />
      <Breadcrumbs trail={trail} />

      <Section tight>
        <div className="lv-itemhero">
          <div>
            <Head as="h1" eyebrow="Направление каталога" title={d.h1} lead={d.lead} />
          </div>
          {media && <Figure media={media} priority />}
        </div>
      </Section>

      <Section tone="sunk">
        <div className="lv-split">
          <Head no="01" title="Позиции направления" />
          <div>
            <SpecList>
              {d.items.map((item, i) => (
                <SpecRow
                  key={item.slug}
                  no={String(i + 1).padStart(2, '0')}
                  title={item.title}
                  desc={item.lead}
                  to={`${path}/${item.slug}`}
                />
              ))}
            </SpecList>

            {d.also.length > 0 && (
              <p className="lv-fineprint" style={{ marginTop: 'var(--s-5)' }}>
                Также в этом направлении, отдельных страниц пока нет:{' '}
                {d.also.join(', ').toLowerCase()}. Изготавливаются так же — от чертежа
                и типоразмера.
              </p>
            )}
          </div>
        </div>
      </Section>

      <Section>
        <div className="lv-split">
          <Head no="02" title="Как здесь выбирают сплав" />
          <div className="lv-prose">
            {d.intro.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </div>
      </Section>

      <Section tone="sunk" tight>
        <Head no="03" title="Другие направления" />
        <SpecList>
          {others.map((o, i) => (
            <SpecRow
              key={o.slug}
              no={String(i + 1).padStart(2, '0')}
              title={o.title}
              desc={o.lead}
              to={`/catalog/${o.slug}`}
            />
          ))}
        </SpecList>
        <p style={{ marginTop: 'var(--s-6)' }}>
          <Link className="lv-more" to="/catalog">
            Весь каталог
          </Link>
        </p>
      </Section>

      <CtaBand what={d.short.toLowerCase()} />
    </>
  )
}
