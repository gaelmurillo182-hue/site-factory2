import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import { Section, Head, SpecList, SpecRow } from '../components/spec'
import { directions } from '../data/catalog'

export default function NotFound() {
  return (
    <>
      <Seo
        title="Страница не найдена"
        description="Такой страницы на сайте нет. Разделы каталога и справочника — ниже."
        path="/404"
        noindex
      />
      <Section>
        <Head
          as="h1"
          eyebrow="404"
          title="Такой страницы нет"
          lead="Возможно, адрес изменился. Ниже — разделы каталога; если ищете конкретную позицию, её проще назвать нам напрямую."
        />
        <SpecList>
          {directions.map((d, i) => (
            <SpecRow
              key={d.slug}
              no={String(i + 1).padStart(2, '0')}
              title={d.title}
              desc={d.lead}
              to={`/catalog/${d.slug}`}
            />
          ))}
        </SpecList>
        <p style={{ marginTop: 'var(--s-6)' }}>
          <Link className="lv-btn lv-btn--primary" to="/kontakty">
            Назовите позицию — найдём
          </Link>
        </p>
      </Section>
    </>
  )
}
