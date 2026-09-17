// Сборка ответа ассистента. Ответ — всегда фрагмент из базы плюс ссылки.
// Ни одного сгенерированного утверждения: не нашлось — так и сказано.

import type { Kb, Message } from './types'
import { bestBlock, MIN_SCORE, type SearchIndex } from './search'

export const ASSISTANT_NAME = 'Свод'
export const ASSISTANT_ROLE = 'отвечает только по базе знаний агентства'
/** Падежные формы имени вынесены отдельно: склеивать их в шаблоне нельзя. */
export const ASSISTANT_CHAT_LABEL = 'Чат со Сводом'
export const ASSISTANT_PLACEHOLDER = 'Спросите у Свода…'

export function buildAnswer(query: string, index: SearchIndex, kb: Kb): Message {
  const hits = index.search(query, 8)
  const top = hits[0]

  if (!top || top.score < MIN_SCORE) {
    const sections = kb.sections.filter((s) => s.key !== '99-Мета' && s.key !== '00-Инбокс')
    return {
      role: 'assistant',
      empty: true,
      sources: [],
      text: [
        'В базе нет ответа на этот вопрос. Придумывать не буду.',
        '',
        'Что можно сделать:',
        '',
        ...sections.map((s) => `- **${s.title}** — ${s.subtitle}`),
        '',
        'Если вопрос рабочий и повторяется — заведите заметку в **00-Инбокс**. База растёт из таких вопросов.',
      ].join('\n'),
    }
  }

  const note = top.note
  const block = bestBlock(note, query)
  const section = kb.sections.find((s) => s.key === note.section)

  const related = hits
    .slice(1)
    .filter((h) => h.score > top.score * 0.35)
    .slice(0, 4)

  const parts: string[] = []
  parts.push(`Ближе всего — **${note.title}** (${section?.title ?? note.section}).`)

  // Цифры из frontmatter выводим первой строкой: на вопрос «сколько стоит»
  // релевантный блок текста отвечает окольно, а цена нужна сразу.
  const facts = summary(note)
  if (facts) {
    parts.push('')
    parts.push(facts)
  }
  parts.push('')

  if (block) {
    if (block.heading) parts.push(`### ${block.heading}`)
    parts.push(block.body.trim())
  } else {
    const first = note.body.split(/\n##\s/)[0].trim()
    parts.push(first.slice(0, 900))
  }

  parts.push('')
  parts.push(`Заметка целиком: [[${note.name}]]`)

  if (related.length) {
    parts.push('')
    parts.push('**Ещё по теме**')
    for (const h of related) parts.push(`- [[${h.note.name}]] — ${sectionTitle(kb, h.note.section)}`)
  }

  return { role: 'assistant', text: parts.join('\n'), sources: [note.id, ...related.map((h) => h.id)], vote: null }
}

/** Одна строка ключевых цифр заметки, если они у неё есть. */
function summary(note: Kb['notes'][string]): string | null {
  const m = note.meta
  const money = (n: number) => n.toLocaleString('ru-RU') + ' ₽'
  const bits: string[] = []

  if (m.price_from !== null) {
    const unit = m.pricing_model === 'подписка' ? ' в месяц' : ''
    bits.push(
      m.price_to === null || m.price_to === m.price_from
        ? `**${m.price_to === null ? 'от ' : ''}${money(m.price_from)}${unit}**`
        : `**${money(m.price_from)} — ${money(m.price_to)}${unit}**`,
    )
  }
  if (m.term) bits.push(`срок ${m.term}`)
  if (m.hours !== null) bits.push(`${m.hours} ч работы`)
  if (m.complexity !== null) bits.push(`сложность ${m.complexity} из 5`)
  if (m.rf_available) bits.push(`в РФ: ${m.rf_available}`)
  if (m.sizes) bits.push(`размер клиента ${m.sizes}`)
  if (m.cycle) bits.push(`цикл сделки ${m.cycle}`)

  return bits.length ? bits.join(' · ') : null
}

function sectionTitle(kb: Kb, key: string): string {
  return kb.sections.find((s) => s.key === key)?.title ?? key
}

/** Заголовок разговора из первого вопроса. */
export function titleFrom(query: string): string {
  const clean = query.trim().replace(/\s+/g, ' ')
  return clean.length > 46 ? clean.slice(0, 45).trimEnd() + '…' : clean
}
