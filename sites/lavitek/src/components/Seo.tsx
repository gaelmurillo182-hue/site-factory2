import { site } from '../data/site'

type Props = {
  title: string
  description: string
  path: string
  /** Схемы JSON-LD страницы. Уходят в статику вместе с предрендером. */
  jsonLd?: unknown[]
  noindex?: boolean
}

/**
 * React 19 поднимает <title>, <meta> и <link> в <head> сам, поэтому
 * отдельная библиотека вроде react-helmet здесь не нужна.
 */
export default function Seo({ title, description, path, jsonLd = [], noindex }: Props) {
  const url = site.origin + (path === '/' ? '/' : path)
  // Короткая приписка вместо полного названия: длинный title поисковик обрезает.
  const full = title.includes(site.shortName) ? title : `${title} — ${site.shortName}`

  return (
    <>
      <title>{full}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, follow" />}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={site.name} />
      <meta property="og:locale" content={site.locale} />
      <meta property="og:title" content={full} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={`${site.origin}/og.jpg`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />

      {jsonLd.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Данные собираются нами же из констант, посторонней строки тут нет.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  )
}
