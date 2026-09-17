#!/usr/bin/env node
// Визуальный и функциональный QA публичного сайта «Свод».
// Снимки 390 и 1920, обе темы, контраст, ошибки консоли, горизонтальный скролл.
// Запуск: node scripts/qa-site.mjs [url]

import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'agency/qa-site')
const URL = process.argv[2] || 'http://127.0.0.1:5186/'

await mkdir(OUT, { recursive: true })
const errors = []
const browser = await chromium.launch()

async function open(width, height, extra = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, locale: 'ru-RU', ...extra })
  const page = await ctx.newPage()
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`[${width}px] ${m.text()}`) })
  page.on('pageerror', (e) => errors.push(`[${width}px pageerror] ${e.message}`))
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.waitForSelector('.hero__title')
  return { ctx, page }
}

/** Закрыть cookie-баннер, иначе он перекрывает содержимое на снимках. */
async function dismissCookie(page) {
  const btn = page.getByRole('button', { name: 'Отклонить' })
  if (await btn.count()) { await btn.click(); await page.waitForTimeout(150) }
}

async function shot(page, name, full = false) {
  await page.screenshot({ path: join(OUT, name + '.png'), fullPage: full })
  console.log('  снимок: ' + name + '.png')
}

async function noOverflow(page, label) {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  if (over > 0) errors.push(`${label}: горизонтальный скролл +${over}px`)
}

console.log('1920 × 1080')
{
  const { ctx, page } = await open(1920, 1080)
  await shot(page, '1920-01-первый-экран')
  await dismissCookie(page)

  for (const [anchor, name] of [['#metod', '02-метод'], ['#ceny', '03-цены'], ['#ne-beremsya', '04-отказы'], ['#dannye', '05-данные'], ['#zayavka', '06-заявка']]) {
    await page.evaluate((a) => document.querySelector(a)?.scrollIntoView(), anchor)
    await page.waitForTimeout(700)
    await shot(page, '1920-' + name)
  }
  await noOverflow(page, '1920')
  await ctx.close()
}

console.log('1920 × 1080, тёмная тема')
{
  const { ctx, page } = await open(1920, 1080, { colorScheme: 'dark' })
  await dismissCookie(page)
  await shot(page, '1920-07-тёмная-тема')
  await ctx.close()
}

console.log('Отраслевая страница')
{
  const { ctx, page } = await open(1920, 1080)
  await dismissCookie(page)
  await page.getByRole('link', { name: /Стоматологии/ }).first().click()
  await page.waitForTimeout(600)
  await shot(page, '1920-08-стоматология')
  await ctx.close()
}

console.log('390 × 844')
{
  const { ctx, page } = await open(390, 844)
  await shot(page, '390-01-первый-экран')
  await noOverflow(page, '390')

  // Проверяем до закрытия баннера: обе кнопки должны весить одинаково.
  const sizes = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('.cookie__actions .btn')]
    return btns.map((b) => ({ text: b.textContent.trim(), w: Math.round(b.getBoundingClientRect().width) }))
  })
  console.log('  cookie-кнопки: ' + JSON.stringify(sizes))
  if (sizes.length !== 2) errors.push('cookie: баннер не показан или кнопок не две')
  else if (Math.abs(sizes[0].w - sizes[1].w) > 24) {
    errors.push('cookie: кнопки заметно разного размера — отказ должен весить столько же, сколько согласие')
  }

  await dismissCookie(page)
  await page.evaluate(() => document.querySelector('#ceny')?.scrollIntoView())
  await page.waitForTimeout(700)
  await shot(page, '390-02-цены')
  await noOverflow(page, '390 цены')

  await page.evaluate(() => document.querySelector('#zayavka')?.scrollIntoView())
  await page.waitForTimeout(700)
  await shot(page, '390-03-заявка')

  await ctx.close()
}

console.log('\nконтраст (светлая тема):')
{
  const { ctx, page } = await open(1440, 900)
  const c = await page.evaluate(() => {
    const css = getComputedStyle(document.documentElement)
    const toRgb = (v) => { const d = document.createElement('div'); d.style.color = v; document.body.appendChild(d); const r = getComputedStyle(d).color; d.remove(); return r.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number) }
    const lum = ([r, g, b]) => { const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4 }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) }
    const ratio = (a, b) => { const [l1, l2] = [lum(toRgb(a)), lum(toRgb(b))].sort((x, y) => y - x); return (l1 + 0.05) / (l2 + 0.05) }
    const v = (n) => css.getPropertyValue(n).trim()
    return {
      'text/bg': ratio(v('--c-text'), v('--c-bg')),
      'text-2/bg': ratio(v('--c-text-2'), v('--c-bg')),
      'accent/bg': ratio(v('--c-accent'), v('--c-bg')),
      'accent-ink/accent': ratio(v('--c-accent-ink'), v('--c-accent')),
      'link/bg': ratio(v('--c-link'), v('--c-bg')),
      'danger/bg': ratio(v('--c-danger'), v('--c-bg')),
      'warn/warn-soft': ratio(v('--c-warn'), v('--c-warn-soft')),
    }
  })
  for (const [k, val] of Object.entries(c)) {
    const ok = val >= 4.5
    console.log(`  ${ok ? 'ок ' : 'НИЗКО'} ${k}: ${val.toFixed(2)}`)
    if (!ok) errors.push(`контраст ${k} = ${val.toFixed(2)}, нужно ≥ 4.5`)
  }
  await ctx.close()
}

await browser.close()
console.log('\n' + (errors.length ? `Дефекты (${errors.length}):` : 'Дефектов не найдено.'))
for (const e of errors) console.log('  • ' + e)
process.exit(errors.length ? 1 : 0)
