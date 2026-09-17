#!/usr/bin/env node
/**
 * Визуальный и функциональный QA сайта ПРОТЕКТ.
 *
 * Снимки на 390 и 1920, проверка горизонтального скролла, ошибок консоли,
 * контраста основного текста, состояния формы и калькулятора,
 * поведения при prefers-reduced-motion.
 *
 * Запуск (dev-сервер должен быть поднят):
 *   node sites/protect/scripts/qa.mjs [url]
 */

import { chromium } from 'playwright'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const SITE = resolve(HERE, '..')
const OUT = join(SITE, 'qa')
const URL = process.argv[2] || 'http://127.0.0.1:5176/'

await mkdir(OUT, { recursive: true })

const problems = []
const note = (s) => problems.push(s)

const browser = await chromium.launch()

async function open(width, height, extra = {}) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    locale: 'ru-RU',
    deviceScaleFactor: 1,
    ...extra,
  })
  const page = await ctx.newPage()
  page.on('console', (m) => {
    if (m.type() === 'error') note(`[${width}px консоль] ${m.text()}`)
  })
  page.on('pageerror', (e) => note(`[${width}px pageerror] ${e.message}`))
  const res = await page.goto(URL, { waitUntil: 'networkidle' })
  if (!res || !res.ok()) note(`[${width}px] страница не открылась: ${res && res.status()}`)
  await page.waitForSelector('h1')
  // Даём отыграть появлению первого экрана, иначе снимки ловят середину анимации.
  await page.waitForTimeout(900)
  return { ctx, page }
}

async function shot(page, name, full = false) {
  await page.screenshot({ path: join(OUT, `${name}.png`), fullPage: full })
  console.log('  снимок:', name + '.png')
}

async function noOverflow(page, label) {
  const over = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  if (over > 0) note(`${label}: горизонтальный скролл +${over}px`)
}

/** Ищем видимый текст, вылезший за правый край окна. */
async function findClipped(page, label) {
  const bad = await page.evaluate(() => {
    const w = document.documentElement.clientWidth
    const out = []
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      if (r.right > w + 1) {
        const cs = getComputedStyle(el)
        if (cs.position === 'fixed') continue
        out.push(`${el.tagName.toLowerCase()}.${el.className || '-'} +${Math.round(r.right - w)}px`)
      }
    }
    return out.slice(0, 8)
  })
  for (const b of bad) note(`${label}: за правым краем — ${b}`)
}

/** Контраст: считаем по фактическим вычисленным цветам. */
async function contrast(page, label) {
  const bad = await page.evaluate(() => {
    const lum = (c) => {
      const [r, g, b] = c.map((v) => {
        const s = v / 255
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
      })
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }
    // Через канву: браузер отдаёт вычисленные цвета в oklch и color-mix,
    // разбирать их регуляркой бессмысленно — пусть считает сам движок.
    const cnv = document.createElement('canvas')
    cnv.width = cnv.height = 1
    const ctx = cnv.getContext('2d', { willReadFrequently: true })
    const cache = new Map()
    const parse = (s) => {
      if (!s) return null
      if (cache.has(s)) return cache.get(s)
      let out = null
      try {
        ctx.clearRect(0, 0, 1, 1)
        ctx.fillStyle = '#000'
        ctx.fillStyle = s
        if (ctx.fillStyle === '#000000' && !/#000|rgb\(0, 0, 0\)|black/i.test(s)) {
          out = null
        } else {
          ctx.clearRect(0, 0, 1, 1)
          ctx.fillRect(0, 0, 1, 1)
          const d = ctx.getImageData(0, 0, 1, 1).data
          out = { rgb: [d[0], d[1], d[2]], a: d[3] / 255 }
        }
      } catch {
        out = null
      }
      cache.set(s, out)
      return out
    }
    const bgOf = (el) => {
      let n = el
      while (n && n !== document.documentElement) {
        const c = parse(getComputedStyle(n).backgroundColor)
        if (c && c.a > 0.9) return c.rgb
        n = n.parentElement
      }
      return [255, 255, 255]
    }
    const out = []
    const seen = new Set()
    for (const el of document.querySelectorAll('p, li, a, span, h1, h2, h3, h4, button, label, td, th, input')) {
      const txt = (el.textContent || '').trim()
      if (!txt || el.children.length > 0) continue
      const cs = getComputedStyle(el)
      if (cs.visibility === 'hidden' || cs.display === 'none') continue
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      if (r.bottom < 0) continue // уведённое за экран, например ссылка «к содержимому»
      const fg = parse(cs.color)
      if (!fg || fg.a < 0.95) continue
      const bg = bgOf(el)
      const L1 = lum(fg.rgb), L2 = lum(bg)
      const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)
      const size = parseFloat(cs.fontSize)
      const bold = parseInt(cs.fontWeight, 10) >= 700
      const large = size >= 24 || (size >= 18.66 && bold)
      const need = large ? 3 : 4.5
      if (ratio < need) {
        const key = `${cs.color}|${bg.join(',')}|${Math.round(size)}`
        if (seen.has(key)) continue
        seen.add(key)
        out.push(`${ratio.toFixed(2)}:1 при норме ${need} — ${cs.fontSize} «${txt.slice(0, 42)}»`)
      }
    }
    return out.slice(0, 12)
  })
  for (const b of bad) note(`${label} контраст: ${b}`)
}

/** Тапабельность: интерактивные элементы меньше 44×44 на мобильном. */
async function touchTargets(page, label) {
  const bad = await page.evaluate(() => {
    const out = []
    // Ссылка внутри абзаца — часть текста, а не отдельная цель нажатия.
    const inline = (el) => {
      if (el.tagName !== 'A') return false
      const p = el.closest('p, li, dd, label, figcaption')
      return Boolean(p) && p !== el
    }
    for (const el of document.querySelectorAll('a, button, input, select, [role="button"]')) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      if (inline(el)) continue
      // Чекбокс внутри подписи: нажимается вся подпись, её и меряем.
      if (el.tagName === 'INPUT' && el.type === 'checkbox') {
        const lab = el.closest('label')
        if (lab) {
          const lr = lab.getBoundingClientRect()
          if (lr.height >= 40 && lr.width >= 40) continue
        }
      }
      if (r.height < 40 || r.width < 40) {
        const t = (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)
        out.push(`${Math.round(r.width)}×${Math.round(r.height)} «${t}»`)
      }
    }
    return out.slice(0, 10)
  })
  for (const b of bad) note(`${label} мелкая цель: ${b}`)
}

async function sectionShots(page, prefix) {
  const ids = ['box', 'services', 'objects', 'calc', 'tech', 'process', 'money', 'who', 'faq', 'lead']
  for (const id of ids) {
    const found = await page.evaluate((a) => {
      const el = document.getElementById(a)
      if (!el) return false
      el.scrollIntoView({ block: 'start' })
      return true
    }, id)
    if (!found) {
      note(`${prefix}: нет секции #${id}`)
      continue
    }
    await page.waitForTimeout(650)
    await shot(page, `${prefix}-${id}`)
  }
}

console.log('\n1920 × 1080')
{
  const { ctx, page } = await open(1920, 1080)
  await shot(page, '1920-00-первый-экран')
  await noOverflow(page, '1920')
  await findClipped(page, '1920')
  await contrast(page, '1920')
  await sectionShots(page, '1920')
  await ctx.close()
}

console.log('\n390 × 844')
{
  const { ctx, page } = await open(390, 844, { isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
  await shot(page, '390-00-первый-экран')
  await noOverflow(page, '390')
  await findClipped(page, '390')
  await contrast(page, '390')
  await touchTargets(page, '390')
  await sectionShots(page, '390')
  await ctx.close()
}

console.log('\nprefers-reduced-motion: reduce')
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ru-RU', reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  await page.goto(URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  const hidden = await page.evaluate(() => {
    let n = 0
    for (const el of document.querySelectorAll('main *')) {
      const cs = getComputedStyle(el)
      if (parseFloat(cs.opacity) < 0.05 && el.getBoundingClientRect().height > 0) n++
    }
    return n
  })
  if (hidden > 0) note(`reduced-motion: ${hidden} элементов остались прозрачными — контент недоступен`)
  await shot(page, 'reduced-motion')
  await ctx.close()
}

console.log('\nФорма и калькулятор')
{
  const { ctx, page } = await open(1440, 900)

  // Калькулятор: пройти шаги до итога.
  const calc = await page.$('#calc')
  if (!calc) note('калькулятор: секции #calc нет')
  else {
    await page.evaluate(() => document.getElementById('calc')?.scrollIntoView({ block: 'start' }))
    await page.waitForTimeout(400)
    try {
      for (let step = 0; step < 12; step++) {
        const last = (await page.$('#calc [data-calc-finish]')) !== null
        const opt = page.locator('#calc [data-calc-option]').first()
        if ((await opt.count()) === 0) break
        await opt.click({ timeout: 5000 })
        await page.waitForTimeout(320)
        if (last) {
          await page.locator('#calc [data-calc-finish]').click({ timeout: 5000 })
          await page.waitForTimeout(500)
          break
        }
      }
    } catch (e) {
      note(`калькулятор: не удалось пройти шаги — ${String(e).split('\n')[0]}`)
    }
    await shot(page, 'калькулятор-итог')
    const sum = await page.evaluate(() => {
      const t = document.getElementById('calc')?.textContent || ''
      return /\d[\d\s]{3,}\s*₽/.test(t)
    })
    if (sum) note('калькулятор: на итоговом экране появилась сумма в рублях — по брифу суммы быть не должно')
  }

  // Форма: пустая отправка должна дать ошибки, а не улететь.
  await page.evaluate(() => document.getElementById('lead')?.scrollIntoView({ block: 'start' }))
  await page.waitForTimeout(400)
  const submit = await page.$('#lead button[type="submit"]')
  if (!submit) note('форма: нет кнопки отправки в #lead')
  else {
    await submit.click()
    await page.waitForTimeout(300)
    const errs = await page.$$eval('#lead [data-error]', (n) => n.length)
    if (errs === 0) note('форма: пустая отправка не показала ни одной ошибки поля')
    await shot(page, 'форма-ошибки')

    await page.fill('#lead input[name="name"]', 'Сивков Владимир Александрович')
    await page.fill('#lead input[name="address"]', 'Екатеринбург, ул. Малышева, 51')
    await page.fill('#lead input[name="phone"]', '+7 965 832-83-45')
    const agree = await page.$('#lead input[name="agree"]')
    if (agree) await agree.check()
    await page.waitForTimeout(150)
    await shot(page, 'форма-заполнена')
  }
  await ctx.close()
}

await browser.close()

const report =
  problems.length === 0
    ? 'Дефектов не найдено.\n'
    : problems.map((p, i) => `${i + 1}. ${p}`).join('\n') + '\n'

await writeFile(join(OUT, 'отчёт.txt'), report, 'utf8')
console.log('\n===== ОТЧЁТ =====')
console.log(report)
console.log('Снимки и отчёт:', OUT)
