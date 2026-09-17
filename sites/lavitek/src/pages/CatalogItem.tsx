import { Link, useParams } from 'react-router-dom'
import Seo from '../components/Seo'
import Figure from '../components/Figure'
import CtaBand from '../components/CtaBand'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import { Section, Head, Note, Facts } from '../components/spec'
import { findItem } from '../data/catalog'
import { itemMedia } from '../data/media'
import { breadcrumbLd, productLd } from '../data/schema'
import NotFound from './NotFound'

/**
 * Страница позиции каталога.
 *
 * Было шесть разделов и полная форма заявки на 4700px вертикали при 450 словах
 * текста — читатель прокручивал пустоту. Стало три смысловых блока: что это,
 * что важно знать, что прислать. Соседние позиции направления вынесены наверх:
 * так видно, где ты в дереве, а не только по хлебным крошкам.
 */
export default function CatalogItem() {
  const { dir, item } = useParams()
  const found = dir && item ? findItem(dir, item) : null
  if (!found) return <NotFound />

  const { dir: d, item: it } = found
  const path = `/catalog/${d.slug}/${it.slug}`
  const trail = [
    { name: 'Главная', path: '/' },
    { name: 'Каталог', path: '/catalog' },
    { name: d.title, path: `/catalog/${d.slug}` },
    { name: it.title, path },
  ]
  const media = itemMedia(d.slug, it.slug)

  return (
    <>
      <Seo
        title={it.seoTitle}
        description={it.seoDescription}
        path={path}
        jsonLd={[breadcrumbLd(trail), productLd(it.title, it.seoDescription, path)]}
      />
      <Breadcrumbs trail={trail} />

      <Section tight>
        <div className="lv-itemhero">
          <div>
            <Head as="h1" eyebrow={d.title} title={it.h1} lead={it.lead} />
            {it.note && <Note tone="tech">{it.note}</Note>}
          </div>
          {media && <Figure media={media} priority />}
        </div>

        {/* Соседи по направлению: указатель «где я», а не список внизу страницы. */}
        <nav className="lv-siblings" aria-label={`Позиции направления «${d.short}»`}>
          <span className="lv-siblings__label">{d.short}</span>
          {d.items.map((s) => (
            <Link
              key={s.slug}
              to={`/catalog/${d.slug}/${s.slug}`}
              aria-current={s.slug === it.slug ? 'page' : undefined}
            >
              {s.title}
            </Link>
          ))}
        </nav>
      </Section>

      <Section tone="sunk">
        <Head no="01" title="Что важно знать" />
        <div className="lv-facts3">
          <div>
            <h3>Где применяется</h3>
            <Facts items={it.where} />
          </div>
          <div>
            <h3>Как изнашивается</h3>
            <p>{it.wear}</p>
          </div>
          <div>
            <h3>Подбор сплава</h3>
            <p>{it.alloy}</p>
            <p style={{ marginTop: 'var(--s-4)' }}>
              <Link className="lv-more" to="/splavy">
                Марки и соответствия
              </Link>
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <div className="lv-split">
          <Head
            no="02"
            title="Что прислать для расчёта"
            lead="Ниже — минимум, без которого расчёт не сделать."
          />
          <div>
            <ol className="lv-steps">
              {it.need.map((n) => (
                <li key={n}>
                  <p>{n}</p>
                </li>
              ))}
            </ol>
            <p style={{ marginTop: 'var(--s-6)' }}>
              <Link className="lv-more" to="/po-chertezhu">
                Что прислать для расчёта
              </Link>
            </p>
          </div>
        </div>
      </Section>

      <CtaBand what={it.title} />
    </>
  )
}
