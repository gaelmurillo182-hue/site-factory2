import { Link } from 'react-router-dom'

export type Crumb = { name: string; path: string }

export default function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  return (
    <nav aria-label="Хлебные крошки" className="lv-wrap">
      <ol className="lv-crumbs">
        {trail.map((c, i) => {
          const last = i === trail.length - 1
          return (
            <li key={c.path} aria-current={last ? 'page' : undefined}>
              {last ? c.name : <Link to={c.path}>{c.name}</Link>}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
