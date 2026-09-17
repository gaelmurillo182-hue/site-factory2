import { Markdown } from '../lib/Markdown'
import type { Kb, Note } from '../lib/types'
import { Icon } from './Icon'

type Props = {
  note: Note
  kb: Kb
  resolve: (target: string) => string | null
  onOpenNote: (id: string) => void
  onBackToChat: () => void
}

const money = (n: number) => n.toLocaleString('ru-RU') + ' ₽'

export function ArticleView({ note, kb, resolve, onOpenNote, onBackToChat }: Props) {
  const section = kb.sections.find((s) => s.key === note.section)
  const m = note.meta

  const chips: { label: string; kind?: 'accent' | 'warn' }[] = []
  if (m.level !== null) chips.push({ label: `Уровень ${m.level}` })
  if (m.price_from !== null) {
    chips.push({
      label:
        m.price_to === null
          ? `от ${money(m.price_from)}`
          : m.price_from === m.price_to
            ? money(m.price_from)
            : `${money(m.price_from)} — ${money(m.price_to)}`,
      kind: 'accent',
    })
  }
  if (m.pricing_model) chips.push({ label: String(m.pricing_model) })
  if (m.term) chips.push({ label: `срок ${m.term}` })
  if (m.hours !== null) chips.push({ label: `${m.hours} ч` })
  if (m.complexity !== null) chips.push({ label: `сложность ${m.complexity}/5` })
  if (m.rf_available) {
    chips.push({
      label: `в РФ: ${m.rf_available}`,
      kind: m.rf_available === 'да' ? 'accent' : 'warn',
    })
  }
  if (m.sizes) chips.push({ label: `размер ${m.sizes}` })
  if (m.cycle) chips.push({ label: `цикл ${m.cycle}` })
  if (m.funnel_stage) chips.push({ label: String(m.funnel_stage) })
  if (note.status !== 'готово') chips.push({ label: note.status, kind: 'warn' })
  if (m.verified_at) chips.push({ label: `проверено ${m.verified_at}` })

  const related = [...new Set([...note.links, ...note.backlinks])]
    .map((id) => kb.notes[id])
    .filter(Boolean)
    .slice(0, 14)

  return (
    <article className="article scroll">
      <div className="article__topbar">
        <p className="article__eyebrow">
          {section?.title ?? note.section}
          {note.group && note.group !== section?.title ? ` · ${note.group}` : ''}
        </p>
        <button type="button" className="btn btn--ghost" onClick={onBackToChat}>
          <Icon name="chat" size={14} /> К чату
        </button>
      </div>

      <h1 className="article__title">{note.title}</h1>

      {chips.length > 0 && (
        <div className="chips">
          {chips.map((c) => (
            <span key={c.label} className={`chip${c.kind ? ` chip--${c.kind}` : ''}`}>{c.label}</span>
          ))}
        </div>
      )}

      <Markdown text={note.body} resolve={resolve} onOpenNote={onOpenNote} />

      {related.length > 0 && (
        <section className="related">
          <h2 className="related__title">Связанные заметки</h2>
          <ul className="related__list">
            {related.map((r) => (
              <li key={r.id}>
                <button type="button" className="chip btn" onClick={() => onOpenNote(r.id)}>
                  {r.title}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
