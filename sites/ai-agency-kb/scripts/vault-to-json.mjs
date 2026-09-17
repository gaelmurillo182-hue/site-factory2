#!/usr/bin/env node
// Сборщик: vault/*.md → src/data/kb.json
// Направление одностороннее. Приложение в vault не пишет.
// Заметка без id или title роняет сборку с именем файла — молча пропускать нельзя.

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join, resolve, basename, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const APP = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const VAULT = resolve(APP, '../../vault')
const OUT = join(APP, 'src/data/kb.json')

/** Порядок и подписи разделов. Папка, которой здесь нет, в приложение не попадает. */
const SECTIONS = [
  { key: '01-Автоматизации', title: 'Автоматизации', icon: 'grid',
    subtitle: 'Каталог направлений: что можно сделать, для кого и насколько это сложно' },
  { key: '02-Продукты', title: 'Продукты и цены', icon: 'tag',
    subtitle: 'Линейка от 5 000 ₽ до 1 200 000 ₽. Состав, сроки, что входит и что нет' },
  { key: '03-Продажи', title: 'Продажи', icon: 'chat',
    subtitle: 'Кому, где, как и за сколько. Скрипты, квалификация, возражения' },
  { key: '04-Сегменты', title: 'Сегменты', icon: 'users',
    subtitle: 'Четырнадцать отраслей: что болит, кто решает, на каком языке говорить' },
  { key: '05-Документы', title: 'Документы', icon: 'doc',
    subtitle: 'Договор, ТЗ, доступы, приёмка. Структуры и чек-листы' },
  { key: '06-Ресёрч', title: 'Ресёрч', icon: 'search',
    subtitle: 'Карта рынка, право и данные, открытые вопросы. Всё с источниками и датами' },
  { key: '00-Инбокс', title: 'Инбокс', icon: 'inbox',
    subtitle: 'То, что пришло и ещё не разложено по разделам' },
  { key: '07-Компания', title: 'Компания', icon: 'book',
    subtitle: 'Решения совета, задачи квартала, решения владельца, правила студии' },
  { key: '99-Мета', title: 'Мета', icon: 'gear',
    subtitle: 'Карта разделов, словарь тегов, шаблоны заметок' },
]

/**
 * Папки, которые живут в хранилище, но в приложение не попадают.
 * Отчёты директоров и материалы фаз — это по 40–60 КБ каждый; их выводы уже
 * лежат в разделах 01–07, а весь текст целиком раздул бы сборку впятеро.
 * В Obsidian они видны и ищутся, в приложении — нет.
 */
const VAULT_ONLY = ['08-Отчёты-директоров', '09-Материалы']

// ── разбор frontmatter ─────────────────────────────────────────────────────
function parseScalar(raw) {
  const s = raw.trim()
  if (s === '' || s === 'null') return null
  if (s === 'true') return true
  if (s === 'false') return false
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s)
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    try { return JSON.parse(s.replace(/^'|'$/g, '"')) } catch { return s.slice(1, -1) }
  }
  return s
}

function parseList(raw) {
  const inner = raw.trim().slice(1, -1).trim()
  if (!inner) return []
  const out = []
  let buf = '', quote = null
  for (const ch of inner) {
    if (quote) { buf += ch; if (ch === quote) quote = null; continue }
    if (ch === '"' || ch === "'") { quote = ch; buf += ch; continue }
    if (ch === ',') { out.push(parseScalar(buf)); buf = ''; continue }
    buf += ch
  }
  if (buf.trim()) out.push(parseScalar(buf))
  return out
}

function parseFrontmatter(text, file) {
  if (!text.startsWith('---')) throw new Error(`Нет frontmatter: ${file}`)
  const end = text.indexOf('\n---', 3)
  if (end === -1) throw new Error(`Не закрыт frontmatter: ${file}`)
  const head = text.slice(4, end)
  const body = text.slice(end + 4).replace(/^\r?\n/, '')
  const fm = {}
  for (const line of head.split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith('#')) continue
    const i = line.indexOf(':')
    if (i === -1) continue
    const key = line.slice(0, i).trim()
    const raw = line.slice(i + 1).trim()
    fm[key] = raw.startsWith('[') ? parseList(raw) : parseScalar(raw)
  }
  return { fm, body }
}

// ── обход vault ────────────────────────────────────────────────────────────
async function walk(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await walk(full)))
    else if (entry.name.endsWith('.md')) out.push(full)
  }
  return out
}

function sectionOf(relPath) {
  const top = relPath.split(/[\\/]/)[0]
  return SECTIONS.find((s) => s.key === top) || null
}

function headingsOf(body) {
  const out = []
  for (const line of body.split(/\r?\n/)) {
    const m = /^(#{1,4})\s+(.+)$/.exec(line)
    if (m) out.push({ level: m[1].length, text: m[2].trim() })
  }
  return out
}

/** Текст без разметки — для поиска. */
function plain(body) {
  return body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\[\[([^\]|]+)(\|([^\]]+))?\]\]/g, (_, t, __, alias) => alias || t)
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// ── сборка ─────────────────────────────────────────────────────────────────
const files = await walk(VAULT)
if (!files.length) throw new Error(`В ${VAULT} нет ни одной заметки. Сначала: node scripts/seed-vault.mjs`)

const notes = []
const nameToId = new Map()
const problems = []
let skippedVaultOnly = 0

for (const file of files) {
  const rel = relative(VAULT, file)
  const top = rel.split(/[\\/]/)[0]
  if (VAULT_ONLY.includes(top)) { skippedVaultOnly++; continue }

  const section = sectionOf(rel)
  if (!section) { problems.push(`Папка вне списка разделов: ${rel}`); continue }

  const text = await readFile(file, 'utf8')
  const { fm, body } = parseFrontmatter(text, rel)
  if (!fm.id) problems.push(`Нет поля id: ${rel}`)
  if (!fm.title) problems.push(`Нет поля title: ${rel}`)
  if (!fm.id || !fm.title) continue

  const name = basename(file, '.md')
  nameToId.set(name, fm.id)
  nameToId.set(fm.title, fm.id)

  notes.push({
    id: String(fm.id),
    title: String(fm.title),
    name,
    section: section.key,
    group: fm.group ? String(fm.group) : section.title,
    order: typeof fm.order === 'number' ? fm.order : 999,
    tags: Array.isArray(fm.tags) ? fm.tags.map(String) : [],
    status: fm.status ? String(fm.status) : 'готово',
    meta: {
      complexity: fm.complexity ?? null,
      rf_available: fm.rf_available ?? null,
      price_from: fm.price_from ?? null,
      price_to: fm.price_to ?? null,
      pricing_model: fm.pricing_model ?? null,
      level: fm.level ?? null,
      hours: fm.hours ?? null,
      term: fm.term ?? null,
      sizes: fm.sizes ?? null,
      cycle: fm.cycle ?? null,
      funnel_stage: fm.funnel_stage ?? null,
      verified_at: fm.verified_at ?? null,
    },
    body,
    text: plain(body),
    headings: headingsOf(body),
    links: [],
  })
}

const ids = new Set(notes.map((n) => n.id))
const dupes = notes.map((n) => n.id).filter((id, i, arr) => arr.indexOf(id) !== i)
if (dupes.length) problems.push(`Повторяющиеся id: ${[...new Set(dupes)].join(', ')}`)

// разрешение [[wiki-links]] в id
let broken = 0
for (const n of notes) {
  const found = new Set()
  for (const m of n.body.matchAll(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g)) {
    const target = m[1].trim()
    if (/^НУЖНО (ОТ КЛИЕНТА|ПРОВЕРИТЬ)/.test(target)) continue
    const id = nameToId.get(target)
    if (id && id !== n.id) found.add(id)
    else if (!id) { broken++; problems.push(`Битая ссылка [[${target}]] в «${n.name}»`) }
  }
  n.links = [...found]
}

// обратные ссылки
const backlinks = new Map()
for (const n of notes) for (const id of n.links) {
  if (!backlinks.has(id)) backlinks.set(id, new Set())
  backlinks.get(id).add(n.id)
}
for (const n of notes) n.backlinks = [...(backlinks.get(n.id) || [])]

if (problems.length) {
  console.error('\nСборка kb.json остановлена. Проблемы:\n')
  for (const p of problems.slice(0, 40)) console.error('  • ' + p)
  if (problems.length > 40) console.error(`  … и ещё ${problems.length - 40}`)
  process.exit(1)
}

// дерево разделов
const tree = SECTIONS.map((s) => {
  const own = notes.filter((n) => n.section === s.key).sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, 'ru'))
  const groups = []
  for (const n of own) {
    let g = groups.find((x) => x.title === n.group)
    if (!g) { g = { title: n.group, notes: [] }; groups.push(g) }
    g.notes.push(n.id)
  }
  return { ...s, count: own.length, groups }
}).filter((s) => s.count > 0)

await mkdir(dirname(OUT), { recursive: true })
await writeFile(OUT, JSON.stringify({
  generatedAt: new Date().toISOString().slice(0, 10),
  counts: { notes: notes.length, sections: tree.length, links: notes.reduce((a, n) => a + n.links.length, 0) },
  sections: tree,
  notes: Object.fromEntries(notes.map((n) => [n.id, n])),
}, null, 0), 'utf8')

console.log(`kb.json: ${notes.length} заметок, ${tree.length} разделов, ${notes.reduce((a, n) => a + n.links.length, 0)} связей, битых ссылок ${broken}, только в хранилище ${skippedVaultOnly}`)
