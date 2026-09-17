#!/usr/bin/env node
/**
 * Перенос рабочих документов компании в Obsidian-хранилище.
 *
 * База знаний (01–06) собирается посевщиком из структурированных данных.
 * А отчёты директоров, протоколы совета, задачи и материалы фаз пишутся
 * как обычные документы — и до этого скрипта лежали вне хранилища.
 * Теперь Obsidian видит всё в одной папке.
 *
 * Запуск:  node scripts/vault-import-docs.mjs
 *
 * Файлы копируются, а не переносятся: исходники остаются на местах,
 * потому что на них ссылаются скрипты сборки и сам проект.
 * Повторный запуск обновляет копии.
 */

import { readdir, readFile, writeFile, mkdir, stat } from 'node:fs/promises'
import { basename, dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const VAULT = join(ROOT, 'vault')

/** Что и куда переносим. */
const SETS = [
  {
    from: 'agency',
    to: '07-Компания',
    recursive: false,
    tags: ['компания'],
    order: {
      'СВОДКА-ДЛЯ-ВЛАДЕЛЬЦА': 1,
      'КОНТЕКСТ': 2,
      'КОМАНДА': 3,
      'РЕШЕНИЯ-ВЛАДЕЛЬЦА': 4,
      'ПРОТОКОЛ-СОВЕТА-01': 5,
      'ПРОТОКОЛ-СОВЕТА-02': 6,
      'ЗАДАЧИ': 7,
    },
  },
  { from: 'agency/reports', to: '08-Отчёты-директоров', recursive: false, tags: ['отчёт'] },
  { from: 'brief/ai-agency-kb', to: '09-Материалы', recursive: false, tags: ['материалы'] },
]

/** Одиночные файлы вне папок. */
const SINGLES = [
  { from: 'brief/ai-agency-kb-site.md', to: '09-Материалы', tags: ['материалы'] },
  { from: 'CLAUDE.md', to: '07-Компания', tags: ['компания'], title: 'Правила студии' },
]

const safe = (s) =>
  s.replace(/\s*:\s*/g, ' — ').replace(/[\\/*?"<>|]/g, '').replace(/\s+/g, ' ').trim()

const slug = (s) =>
  'doc-' + s.toLowerCase().replace(/[^a-zа-я0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 48)

function frontmatter(fm) {
  const lines = ['---']
  for (const [k, v] of Object.entries(fm)) {
    if (v === undefined || v === null) continue
    lines.push(`${k}: ${Array.isArray(v) ? '[' + v.join(', ') + ']' : v}`)
  }
  lines.push('---')
  return lines.join('\n')
}

const today = new Date().toISOString().slice(0, 10)
let copied = 0

async function importFile(srcPath, toFolder, { tags, order = 999, title }) {
  const raw = await readFile(srcPath, 'utf8')
  const name = basename(srcPath, extname(srcPath))
  // Заголовок берём из первой строки-заголовка документа, если она есть
  const h1 = /^#\s+(.+)$/m.exec(raw)
  const noteTitle = title ?? (h1 ? h1[1].trim() : name)

  // У документа может уже быть свой frontmatter — тогда не дублируем
  const body = raw.startsWith('---') ? raw.slice(raw.indexOf('\n---', 3) + 4).replace(/^\r?\n/, '') : raw

  const fm = frontmatter({
    id: slug(name),
    title: safe(noteTitle),
    section: toFolder,
    group: toFolder.replace(/^\d+-/, ''),
    order,
    tags: [...tags, 'документ'],
    status: 'готово',
    source_file: srcPath.replace(ROOT + '\\', '').replace(ROOT + '/', '').replace(/\\/g, '/'),
    verified_at: today,
  })

  const dir = join(VAULT, toFolder)
  await mkdir(dir, { recursive: true })
  await writeFile(join(dir, `${safe(name)}.md`), `${fm}\n\n${body.trimEnd()}\n`, 'utf8')
  copied++
}

for (const set of SETS) {
  const dir = join(ROOT, set.from)
  let entries = []
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    console.log(`  пропущено, нет папки: ${set.from}`)
    continue
  }
  for (const e of entries) {
    if (!e.isFile() || !e.name.endsWith('.md')) continue
    const name = basename(e.name, '.md')
    await importFile(join(dir, e.name), set.to, {
      tags: set.tags,
      order: set.order?.[name] ?? 999,
    })
  }
}

for (const s of SINGLES) {
  const p = join(ROOT, s.from)
  try {
    await stat(p)
  } catch {
    console.log(`  пропущено, нет файла: ${s.from}`)
    continue
  }
  await importFile(p, s.to, { tags: s.tags, title: s.title })
}

console.log(`перенесено документов: ${copied}`)
console.log('Хранилище: откройте папку vault в Obsidian через «Открыть папку как хранилище».')
