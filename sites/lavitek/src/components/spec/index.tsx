/**
 * Мелкие элементы «языка чертежа»: заголовок раздела, строка спецификации,
 * размер с допуском, техническая таблица, выноска.
 * Собраны в одном файле — по отдельности каждый занял бы десять строк.
 */

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function Section({
  tone = 'paper',
  tight,
  children,
}: {
  tone?: 'paper' | 'sunk' | 'dark'
  tight?: boolean
  children: ReactNode
}) {
  const cls = [
    'lv-sec',
    tone === 'sunk' && 'lv-sec--sunk',
    tone === 'dark' && 'lv-sec--dark',
    tight && 'lv-sec--tight',
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <section className={cls}>
      <div className="lv-wrap">{children}</div>
    </section>
  )
}

export function Head({
  no,
  eyebrow,
  title,
  lead,
  as: Tag = 'h2',
}: {
  no?: string
  eyebrow?: string
  title: string
  lead?: string
  as?: 'h1' | 'h2'
}) {
  return (
    <div className="lv-head">
      {eyebrow && <span className="lv-eyebrow">{eyebrow}</span>}
      <div className="lv-head__row">
        {no && <span className="lv-head__no">{no}</span>}
        <Tag>{title}</Tag>
      </div>
      {lead && <p className="lv-lead">{lead}</p>}
    </div>
  )
}

/**
 * Число как размер с допуском: значение, единица и поле отклонений.
 * Так его читает человек, который каждый день смотрит в чертёж.
 */
export function Dim({
  value,
  unit,
  upper,
  lower,
}: {
  value: string
  unit?: string
  upper?: string
  lower?: string
}) {
  return (
    <span className="lv-dim num">
      {value}
      {unit && <span className="lv-dim__unit">{unit}</span>}
      {(upper || lower) && (
        <span className="lv-dim__tol" aria-label={`допуск ${upper ?? ''} ${lower ?? ''}`}>
          <span>{upper ?? ''}</span>
          <span>{lower ?? ''}</span>
        </span>
      )}
    </span>
  )
}

export function SpecList({ children }: { children: ReactNode }) {
  return <div className="lv-spec">{children}</div>
}

export function SpecRow({
  no,
  title,
  desc,
  to,
}: {
  no: string
  title: string
  desc?: string
  to?: string
}) {
  const inner = (
    <>
      <span className="lv-spec__no">{no}</span>
      <span className="lv-spec__title">{title}</span>
      {desc && <span className="lv-spec__desc">{desc}</span>}
      {to && (
        <span className="lv-spec__arrow" aria-hidden="true">
          →
        </span>
      )}
    </>
  )
  return to ? (
    <Link className="lv-spec__row" to={to}>
      {inner}
    </Link>
  ) : (
    <div className="lv-spec__row">{inner}</div>
  )
}

export function Note({
  tone = 'plain',
  children,
}: {
  tone?: 'plain' | 'signal' | 'tech'
  children: ReactNode
}) {
  const cls = ['lv-note', tone === 'signal' && 'lv-note--signal', tone === 'tech' && 'lv-note--tech']
    .filter(Boolean)
    .join(' ')
  return <p className={cls}>{children}</p>
}

/** Пометка о том, чего нет в материалах клиента. В сдаче собирается списком. */
export function Todo({ children }: { children: ReactNode }) {
  return <span className="lv-todo">[[НУЖНО ОТ КЛИЕНТА: {children}]]</span>
}

export function TableWrap({ caption, children }: { caption?: string; children: ReactNode }) {
  return (
    <div className="lv-tablewrap" tabIndex={0} role="region" aria-label={caption}>
      <table className="lv-table">
        {caption && <caption>{caption}</caption>}
        {children}
      </table>
    </div>
  )
}

/** Маркер «значение требует сверки». Неуверенность показываем, а не прячем. */
export function Check({ reason }: { reason: string }) {
  return (
    <abbr className="lv-check" title={reason}>
      ?
    </abbr>
  )
}

export function Facts({ items }: { items: string[] }) {
  return (
    <ul className="lv-facts">
      {items.map((t) => (
        <li key={t}>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  )
}
