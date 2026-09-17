#!/usr/bin/env node
// Разовый посев Obsidian-vault из структурированных данных.
// Существующие файлы НЕ перезаписываются: после посева vault редактирует человек.
// Запуск:  node scripts/seed-vault.mjs [--force]

import { mkdir, writeFile, access } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { automations } from './vault-seed/automations.mjs'
import { products } from './vault-seed/products.mjs'
import { segments } from './vault-seed/segments.mjs'
import { staticNotes } from './vault-seed/static-notes.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const VAULT = join(ROOT, 'vault')
const FORCE = process.argv.includes('--force')
const VERIFIED = '2026-08-28'

const stats = { created: 0, skipped: 0 }

// ── коды и имена файлов ────────────────────────────────────────────────────
// Windows не допускает в именах файлов \ / : * ? " < > | — двоеточие вдобавок
// создаёт альтернативный поток NTFS и молча обрезает имя. Чистим до записи.
const safe = (s) =>
  s.replace(/\s*:\s*/g, ' — ').replace(/[\\/*?"<>|]/g, '').replace(/\s+/g, ' ').trim()

const autCode = (id) => id.toUpperCase()
const prodCode = (id) => id.toUpperCase()
const segCode = (id) => 'Б' + id.slice(1)

const autName = (a) => safe(`${autCode(a.id)} · ${a.title}`)
const prodName = (p) => safe(`${prodCode(p.id)} · ${p.title}`)
const segName = (s) => safe(`${segCode(s.id)} · ${s.title}`)

// title → полное имя заметки, чтобы чинить короткие [[ссылки]]
const byTitle = new Map()
for (const a of automations) byTitle.set(a.title, autName(a))
for (const p of products) byTitle.set(p.title, prodName(p))
for (const s of segments) byTitle.set(s.title, segName(s))

const byId = {
  aut: new Map(automations.map((a) => [a.id, autName(a)])),
  prod: new Map(products.map((p) => [p.id, prodName(p)])),
  seg: new Map(segments.map((s) => [s.id, segName(s)])),
}

/** Заменяет [[Короткое имя]] на [[КОД · Короткое имя]], если такая заметка есть. */
function fixLinks(text) {
  return text.replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, (full, target, alias) => {
    const t = target.trim()
    const resolved = byTitle.get(t)
    return resolved ? `[[${resolved}${alias || ''}]]` : full
  })
}

// ── frontmatter ────────────────────────────────────────────────────────────
function yamlValue(v) {
  if (v === null || v === undefined) return 'null'
  if (Array.isArray(v)) return '[' + v.map((x) => yamlScalar(x)).join(', ') + ']'
  return yamlScalar(v)
}
function yamlScalar(v) {
  if (typeof v === 'number') return String(v)
  const s = String(v)
  return /[:#\[\]{}",]|^\s|\s$/.test(s) ? JSON.stringify(s) : s
}
function frontmatter(obj) {
  const lines = ['---']
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue
    lines.push(`${k}: ${yamlValue(v)}`)
  }
  lines.push('---')
  return lines.join('\n')
}

async function exists(p) {
  try { await access(p); return true } catch { return false }
}

const seenPaths = new Set()

async function write(folder, rawName, fm, body) {
  const name = safe(rawName)
  const dir = join(VAULT, folder)
  const key = (folder + '/' + name).toLowerCase()
  if (seenPaths.has(key)) throw new Error(`Дубль имени заметки: ${folder}/${name}.md`)
  seenPaths.add(key)
  await mkdir(dir, { recursive: true })
  const file = join(dir, `${name}.md`)
  if (!FORCE && (await exists(file))) { stats.skipped++; return }
  const content = frontmatter(fm) + '\n\n' + fixLinks(body).trimEnd() + '\n'
  await writeFile(file, content, 'utf8')
  stats.created++
}

// ── 01-Автоматизации ───────────────────────────────────────────────────────
// Сквозной счётчик, а не отдельный на каждую группу: приложение сортирует
// заметки по order, и при счётчике на группу группы перемешивались бы.
let autOrder = 0
function nextOrder() {
  autOrder += 10
  return autOrder
}

async function seedAutomations() {
  for (const a of automations) {
    const linked = a.products.map((id) => byId.prod.get(id)).filter(Boolean)
    const prices = a.products.map((id) => products.find((p) => p.id === id)).filter(Boolean)
    const priceFrom = prices.length ? Math.min(...prices.map((p) => p.price_from)) : null
    const priceTo = prices.length ? (prices.some((p) => p.price_to === null) ? null : Math.max(...prices.map((p) => p.price_to))) : null

    const fm = {
      id: a.id, title: a.title, section: '01-Автоматизации', group: a.group,
      order: nextOrder(), tags: ['автоматизация', ...a.audience],
      status: 'готово', complexity: a.complexity, rf_available: a.rf,
      price_from: priceFrom, price_to: priceTo, pricing_model: 'разовая',
      audience: a.audience, verified_at: VERIFIED,
    }

    // Сложность и доступность в РФ приложение показывает отдельными чипами
    // из frontmatter — дублировать их строкой в теле не нужно.
    const body = [
      '## Какую боль снимает',
      a.pain,
      '',
      '## Что делает',
      a.what,
      '',
      '## Что нужно от клиента',
      a.needs,
      '',
      '## На чём делается',
      a.stack,
      '',
      '## Ограничения',
      a.limits,
      '',
      '## В каких продуктах',
      linked.length ? linked.map((n) => `- [[${n}]]`).join('\n') : '- Отдельным продуктом не оформлено. Входит в состав по запросу.',
      '',
      '## Кому это',
      a.segments.map((id) => `- [[${byId.seg.get(id)}]]`).join('\n'),
      '',
      '---',
      'Источник каталога: [[Карта рынка — август 2026]]. Ограничения по праву: [[Право и данные]].',
    ].join('\n')

    await write('01-Автоматизации', autName(a), fm, body)
  }
}

// ── 02-Продукты ────────────────────────────────────────────────────────────
async function seedProducts() {
  let order = 0
  for (const p of products) {
    order += 10
    const priceLabel = p.price_to === null
      ? `от ${p.price_from.toLocaleString('ru-RU')} ₽`
      : `${p.price_from.toLocaleString('ru-RU')} ₽`
    const unit = p.model === 'подписка' ? ' в месяц' : ''

    const fm = {
      id: p.id, title: p.title, section: '02-Продукты', group: `Уровень ${p.level}`,
      order, tags: ['продукт'], status: 'готово',
      level: String(p.level), price_from: p.price_from, price_to: p.price_to,
      pricing_model: p.model, hours: p.hours, term: p.term,
      audience: p.segments, verified_at: VERIFIED,
    }

    // Цена, уровень, срок и трудоёмкость выводятся чипами из frontmatter.
    // В теле остаётся то, чего в чипах нет.
    const body = [
      `**${priceLabel}${unit}.** Расходы клиента на сервисы — ${p.services_cost}.`,
      'В цену не входят: платит клиент со своего аккаунта.',
      '',
      '## Что входит',
      p.includes.map((x) => `- ${x}`).join('\n'),
      '',
      '## Что не входит',
      p.excludes.map((x) => `- ${x}`).join('\n'),
      '',
      '## Когда это нужно клиенту',
      p.trigger,
      '',
      '## Кому предлагать',
      p.segments.length ? p.segments.map((id) => `- [[${byId.seg.get(id)}]]`).join('\n') : '- Предлагается действующим клиентам после сдачи проекта.',
      '',
      '## Первое сообщение',
      '> ' + p.firstMessage,
      '',
      '## Три вопроса на квалификацию',
      p.qualify.map((q, i) => `${i + 1}. ${q}`).join('\n'),
      '',
      '## Что показывать на демо',
      p.demo,
      '',
      '## Возражения',
      p.objections.map(([o, ans]) => `**«${o}»**\n${ans}`).join('\n\n'),
      '',
      '## Что входит из каталога',
      p.automations.length ? p.automations.map((id) => `- [[${byId.aut.get(id)}]]`).filter((x) => !x.includes('undefined')).join('\n') : '- Не составное.',
      '',
      '## Куда растёт дальше',
      p.upgrade,
      '',
      '---',
      'Цена — решение агентства, не факт о рынке. Цены рынка: [[Карта рынка — август 2026]].',
      'Правила по данным: [[Право и данные]]. Как продавать: [[Путь сделки]].',
    ].join('\n')

    await write('02-Продукты', prodName(p), fm, body)
  }
}

// ── 04-Сегменты ────────────────────────────────────────────────────────────
async function seedSegments() {
  let order = 0
  for (const s of segments) {
    order += 10
    const list = (ids) => ids.length ? ids.map((id) => `- [[${byId.prod.get(id)}]]`).join('\n') : '- —'

    const fm = {
      // sg-префикс: коды сегментов b1…b14 иначе сталкиваются с автоматизациями b01…b10
      id: 'sg' + s.id.slice(1), title: s.title, section: '04-Сегменты', group: 'Сегменты',
      order, tags: ['сегмент'], status: 'готово',
      sizes: s.sizes, cycle: s.cycle, audience: [s.title], verified_at: VERIFIED,
    }

    const body = [
      `**Размер: ${s.sizes} · Цикл сделки: ${s.cycle}**`,
      '',
      '## Что болит',
      s.pain,
      '',
      '## Кто принимает решение',
      s.lpr,
      '',
      '## На каком языке говорить',
      s.language,
      '',
      '## Где искать',
      s.where,
      '',
      '## С чего заходим',
      list(s.entry),
      '',
      '## Основное предложение',
      list(s.core),
      '',
      '## Верх линейки',
      list(s.top),
      '',
      '## Чего не обещаем в этом сегменте',
      s.forbidden,
      '',
      '---',
      'Связано: [[Путь сделки]] · [[Библиотека возражений]] · [[Каналы поиска клиентов]]',
    ].join('\n')

    await write('04-Сегменты', segName(s), fm, body)
  }
}

// ── статические заметки ────────────────────────────────────────────────────
async function seedStatic() {
  for (const n of staticNotes) {
    await write(n.folder, n.name, { ...n.fm, tags: n.fm.tags, verified_at: n.fm.verified_at }, n.body)
  }
}

// ── запуск ─────────────────────────────────────────────────────────────────
await mkdir(VAULT, { recursive: true })
await seedStatic()
await seedAutomations()
await seedProducts()
await seedSegments()

console.log(`vault: создано ${stats.created}, пропущено (уже существует) ${stats.skipped}`)
if (stats.skipped && !FORCE) console.log('Чтобы перезаписать существующие заметки: node scripts/seed-vault.mjs --force')
