#!/usr/bin/env node
// Визуальный и функциональный QA приложения ai-agency-kb.
// Снимает 390 и 1920, прогоняет сценарии, ловит ошибки консоли.
// Запуск: node scripts/qa-kb.mjs [url]

import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'brief/ai-agency-kb/qa')
// По умолчанию — собранная версия (npx vite preview --host 127.0.0.1 --port 5184).
// Дев-сервер: node scripts/qa-kb.mjs http://localhost:5183/
const URL = process.argv[2] || 'http://127.0.0.1:5184/'

await mkdir(OUT, { recursive: true })

const errors = []
const browser = await chromium.launch()

async function newPage(width, height) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, locale: 'ru-RU' })
  const page = await ctx.newPage()
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`[${width}px console] ${m.text()}`) })
  page.on('pageerror', (e) => errors.push(`[${width}px pageerror] ${e.message}`))
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.waitForSelector('.page-header__title', { timeout: 15000 })
  return { ctx, page }
}

async function shot(page, name) {
  await page.screenshot({ path: join(OUT, name + '.png'), fullPage: false })
  console.log('  снимок: ' + name + '.png')
}

// ── 1920 ───────────────────────────────────────────────────────────────────
console.log('1920 × 1080')
{
  const { ctx, page } = await newPage(1920, 1080)
  await shot(page, '1920-01-старт')

  // раскрыть раздел «Продукты и цены» и открыть карточку продукта.
  // Заголовок «Сборка «Клиника»» есть и в автоматизациях, и в продуктах —
  // ищем строго внутри нужной группы, иначе селектор неоднозначен.
  await page.getByRole('button', { name: /Продукты и цены/ }).click()
  await page.waitForTimeout(320)
  await page
    .locator('.nav__group')
    .filter({ hasText: 'Продукты и цены' })
    .getByRole('button', { name: 'Сборка «Клиника»', exact: true })
    .click()
  await page.waitForTimeout(320)
  await shot(page, '1920-02-статья-продукт')

  // вернуться в чат и задать вопрос
  await page.getByRole('button', { name: /К чату/ }).click()
  await page.getByLabel('Вопрос к базе знаний').fill('сколько стоит бот для клиники')
  await page.keyboard.press('Enter')
  await page.waitForTimeout(900)
  await shot(page, '1920-03-ответ-ассистента')

  // вопрос, ответа на который в базе нет
  await page.getByLabel('Вопрос к базе знаний').fill('как приготовить борщ')
  await page.keyboard.press('Enter')
  await page.waitForTimeout(900)
  await shot(page, '1920-04-ответа-нет')

  // поиск по базе
  await page.getByLabel('Поиск по базе знаний').fill('152-фз')
  await page.waitForTimeout(400)
  await shot(page, '1920-05-поиск')

  // поиск без результата
  await page.getByLabel('Поиск по базе знаний').fill('криптовалюта нфт')
  await page.waitForTimeout(400)
  await shot(page, '1920-06-поиск-пусто')

  // светлая тема
  await page.getByLabel('Поиск по базе знаний').fill('')
  await page.getByRole('button', { name: /Светлая тема/ }).click()
  await page.waitForTimeout(400)
  await shot(page, '1920-07-светлая-тема')

  await ctx.close()
}

// ── 390 ────────────────────────────────────────────────────────────────────
console.log('390 × 844')
{
  const { ctx, page } = await newPage(390, 844)
  await shot(page, '390-01-старт')

  await page.getByRole('tab', { name: /Разделы/ }).click()
  await page.waitForTimeout(250)
  await shot(page, '390-02-разделы')

  // раздел «Автоматизации» раскрыт по умолчанию — сразу открываем заметку
  await page
    .getByRole('button', { name: 'Бот записи на приём с синхронизацией расписания', exact: true })
    .click()
  await page.waitForTimeout(300)
  await shot(page, '390-03-статья')

  await page.getByRole('button', { name: /К чату/ }).click()
  await page.waitForTimeout(200)
  await page.getByLabel('Вопрос к базе знаний').fill('кому предлагать распознавание первички')
  await page.keyboard.press('Enter')
  await page.waitForTimeout(900)
  await shot(page, '390-04-чат')

  // горизонтального скролла быть не должно
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  if (overflow > 0) errors.push(`[390px] горизонтальный скролл страницы: +${overflow}px`)

  await ctx.close()
}

// ── контраст основных пар ──────────────────────────────────────────────────
{
  const { ctx, page } = await newPage(1440, 900)
  const contrast = await page.evaluate(() => {
    const css = getComputedStyle(document.documentElement)
    const toRgb = (v) => {
      const d = document.createElement('div')
      d.style.color = v
      document.body.appendChild(d)
      const c = getComputedStyle(d).color
      d.remove()
      return c.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number)
    }
    const lum = ([r, g, b]) => {
      const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4 }
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
    }
    const ratio = (a, b) => {
      const [l1, l2] = [lum(toRgb(a)), lum(toRgb(b))].sort((x, y) => y - x)
      return (l1 + 0.05) / (l2 + 0.05)
    }
    const v = (n) => css.getPropertyValue(n).trim()
    return {
      'text/bg': ratio(v('--c-text'), v('--c-bg')),
      'text-2/bg': ratio(v('--c-text-2'), v('--c-bg')),
      'text-3/surface': ratio(v('--c-text-3'), v('--c-surface')),
      'accent/bg': ratio(v('--c-accent'), v('--c-bg')),
      'link/surface': ratio(v('--c-link'), v('--c-surface')),
      'accent-ink/accent': ratio(v('--c-accent-ink'), v('--c-accent')),
    }
  })
  console.log('\nконтраст (тёмная тема):')
  for (const [k, val] of Object.entries(contrast)) {
    const need = k.includes('text-3') ? 3 : 4.5
    const mark = val >= need ? 'ок ' : 'НИЗКО'
    console.log(`  ${mark} ${k}: ${val.toFixed(2)} (нужно ≥ ${need})`)
    if (val < need) errors.push(`контраст ${k} = ${val.toFixed(2)}, нужно ≥ ${need}`)
  }
  await ctx.close()
}

await browser.close()

console.log('\n' + (errors.length ? `Дефекты (${errors.length}):` : 'Дефектов не найдено.'))
for (const e of errors) console.log('  • ' + e)
process.exit(errors.length ? 1 : 0)
