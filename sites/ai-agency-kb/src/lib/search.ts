// Локальный поиск по kb.json. Ни одного обращения наружу.
// Ассистент отвечает только фрагментами из базы. Ничего не сочиняет:
// не нашлось — так и говорит.

import type { Kb, Note } from './types'

/** Слова, которые в русском запросе почти всегда шум. */
const STOP = new Set([
  'и', 'в', 'во', 'не', 'на', 'что', 'как', 'а', 'то', 'все', 'она', 'так', 'его',
  'но', 'да', 'ты', 'к', 'у', 'же', 'вы', 'за', 'бы', 'по', 'ее', 'мне', 'было',
  'вот', 'от', 'меня', 'о', 'из', 'ему', 'теперь', 'даже', 'ну', 'ли', 'если',
  'или', 'ни', 'быть', 'был', 'для', 'мы', 'тебя', 'их', 'чем', 'была', 'сам',
  'чтоб', 'без', 'при', 'этом', 'это', 'эта', 'этот', 'есть', 'нет', 'мой',
  // вопросительные и служебные: в заметках они встречаются повсеместно
  // и вместо сигнала дают шум
  'про', 'об', 'обо', 'до', 'после', 'еще', 'только', 'где', 'кто', 'кому',
  'куда', 'какие', 'какой', 'какая', 'какое', 'когда', 'зачем', 'почему',
  'сколько', 'чего', 'надо', 'можно', 'делать', 'сказать', 'говорить',
  'он', 'она', 'оно', 'они', 'нам', 'нас', 'вам', 'там', 'тут', 'уже',
])

/**
 * Грубая нормализация русского слова.
 *
 * Список окончаний здесь не работает: он чувствителен к порядку и разводит формы
 * одного слова («квалификация» → «квалификац», «квалификации» → «квалификаци»),
 * из-за чего поиск не находит очевидное. Поэтому — срезаем хвост из гласных,
 * мягкого и краткого, а затем обрезаем до общей основы.
 */
const STEM_LEN = 7
function stem(word: string): string {
  let w = word
  while (w.length > 3 && /[аеиоуыэюяйь]$/.test(w)) w = w.slice(0, -1)
  return w.length > STEM_LEN ? w.slice(0, STEM_LEN) : w
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9]+/gi, ' ')
    .split(' ')
    .filter((w) => w.length > 1 && !STOP.has(w))
    .map(stem)
}

type Doc = {
  id: string
  /** токен → вес, накопленный по полям */
  weights: Map<string, number>
  length: number
}

export type Hit = { id: string; score: number; note: Note }

export class SearchIndex {
  private docs: Doc[] = []
  private df = new Map<string, number>()
  private avgLen = 1
  private notes: Record<string, Note>
  private titleTokens = new Map<string, Set<string>>()

  constructor(kb: Kb) {
    this.notes = kb.notes
    for (const note of Object.values(kb.notes)) {
      const weights = new Map<string, number>()
      const add = (text: string, weight: number) => {
        for (const t of tokenize(text)) weights.set(t, (weights.get(t) ?? 0) + weight)
      }
      add(note.title, 12)
      add(note.tags.join(' '), 6)
      add(note.group, 4)
      add(note.headings.map((h) => h.text).join(' '), 4)
      add(note.text, 2)

      this.titleTokens.set(note.id, new Set(tokenize(note.title + ' ' + note.group)))

      const length = [...weights.values()].reduce((a, b) => a + b, 0)
      this.docs.push({ id: note.id, weights, length })
      for (const t of weights.keys()) this.df.set(t, (this.df.get(t) ?? 0) + 1)
    }
    this.avgLen = this.docs.reduce((a, d) => a + d.length, 0) / Math.max(1, this.docs.length)
  }

  /** BM25 с полевыми весами плюс бонус за точное вхождение запроса в заголовок. */
  search(query: string, limit = 12): Hit[] {
    const terms = tokenize(query)
    if (!terms.length) return []

    const k1 = 1.4
    const b = 0.6
    const N = this.docs.length
    const raw = query.toLowerCase().replace(/ё/g, 'е').trim()

    const hits: Hit[] = []
    for (const doc of this.docs) {
      let score = 0
      let matched = 0
      for (const term of terms) {
        const f = doc.weights.get(term)
        if (!f) continue
        matched++
        const df = this.df.get(term) ?? 1
        const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5))
        score += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * doc.length) / this.avgLen)))
      }
      if (!score) continue

      // запрос из нескольких слов, а совпало одно — почти всегда мимо
      if (terms.length > 1) score *= 0.4 + 0.6 * (matched / terms.length)

      const note = this.notes[doc.id]

      // Совпадение с заголовком — сильнейший сигнал: длинная заметка, где нужные
      // слова разбросаны по тексту, иначе обходит короткую заметку ровно по теме.
      // Доля, а не «всё или ничего»: в живом вопросе всегда есть лишние слова.
      const title = this.titleTokens.get(doc.id)!
      const inTitle = terms.filter((t) => title.has(t)).length
      if (inTitle) score *= 1 + 1.8 * (inTitle / terms.length)
      if (raw.length > 3 && note.title.toLowerCase().replace(/ё/g, 'е').includes(raw)) score *= 1.8

      hits.push({ id: doc.id, score, note })
    }

    return hits.sort((x, y) => y.score - x.score).slice(0, limit)
  }
}

/** Блок заметки: заголовок второго уровня и текст под ним. */
export type Block = { heading: string | null; body: string }

export function blocks(note: Note): Block[] {
  const out: Block[] = []
  let heading: string | null = null
  let buf: string[] = []
  const flush = () => {
    const body = buf.join('\n').trim()
    if (body) out.push({ heading, body })
    buf = []
  }
  for (const line of note.body.split(/\r?\n/)) {
    const m = /^##\s+(.+)$/.exec(line)
    if (m) { flush(); heading = m[1].trim(); continue }
    buf.push(line)
  }
  flush()
  return out
}

/** Самый релевантный кусок заметки под запрос. */
export function bestBlock(note: Note, query: string): Block | null {
  const terms = new Set(tokenize(query))
  if (!terms.size) return null
  const scored = blocks(note).map((block) => {
    const bag = tokenize((block.heading ?? '') + ' ' + block.body)
    let score = 0
    for (const t of bag) if (terms.has(t)) score++
    for (const t of tokenize(block.heading ?? '')) if (terms.has(t)) score += 4
    return { block, score: score / Math.max(6, Math.sqrt(bag.length)) }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored[0] && scored[0].score > 0 ? scored[0].block : null
}

/** Ниже этого порога считаем, что в базе ответа нет. */
export const MIN_SCORE = 1.6
