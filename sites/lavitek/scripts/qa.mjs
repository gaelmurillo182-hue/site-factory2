#!/usr/bin/env node
/**
 * Визуальный и функциональный QA сайта «Лавитек».
 *
 * Поднимает статический сервер на собранном и предрендеренном dist и обходит все
 * маршруты: ошибки консоли и гидратации, горизонтальный скролл, обрезанный
 * текст, контраст по WCAG AA, размеры целей нажатия на мобильном,
 * уникальность title, description и h1.
 *
 * Снимки — 1920 и 390 по списку ключевых страниц, в sites/lavitek/qa.
 *
 * Запуск: npm run build && npm run prerender && npm run qa
 */

import { spawn } from 'node:child_process'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const HERE = dirname(fileURLToPath(import.meta.url))
const SITE = resolve(HERE, '..')
const DIST = join(SITE, 'dist')
const OUT = join(SITE, 'qa')
const PORT = 4180
const BASE = `http://127.0.0.1:${PORT}`

/** Страницы, с которых снимаем скриншоты. Остальные проверяем без снимков. */
const SHOT_ROUTES = [
  '/',
  '/catalog',
  '/catalog/volocheniye',
  '/catalog/volocheniye/voloki-fileryi',
  '/po-chertezhu',
  '/splavy',
  '/dopuski',
  '/kontakty',
]

const problems = []
const note = (s) => problems.push(s)

await mkdir(OUT, { recursive: true })
const routes = JSON.parse(await readFile(join(DIST, 'routes.json'), 'utf8')).map((r) => r.path)

// Свой сервер, а не vite preview: preview отдаёт SPA-заглушку на адрес без
// завершающего слэша, и предрендеренные страницы так не проверить.
const preview = spawn(process.execPath, [join(HERE, 'serve.mjs'), String(PORT)], {
  cwd: SITE,
  stdio: 'ignore',
})

async function waitForServer() {
  for (let i = 0; i < 80; i++) {
    try {
      const r = await fetch(BASE + '/')
      if (r.ok) return
    } catch {
      /* поднимается */
    }
    await new Promise((r) => setTimeout(r, 300))
  }
  throw new Error('статический сервер не поднялся')
}

/** Контраст считаем по фактическим вычисленным цветам, через канву. */
async function contrast(page, label) {
  const bad = await page.evaluate(() => {
    const lum = (c) => {
      const [r, g, b] = c.map((v) => {
        const s = v / 255
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
      })
      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }
    // Браузер отдаёт цвета в oklch и color-mix; разбирать их регуляркой
    // бессмысленно — пусть считает сам движок.
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
        ctx.clearRect(0, 0, 1, 1)
        ctx.fillRect(0, 0, 1, 1)
        const d = ctx.getImageData(0, 0, 1, 1).data
        out = { rgb: [d[0], d[1], d[2]], a: d[3] / 255 }
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
    for (const el of document.querySelectorAll(
      'p, li, a, span, h1, h2, h3, h4, button, label, td, th, summary, figcaption',
    )) {
      const txt = (el.textContent || '').trim()
      if (!txt || el.children.length > 0) continue
      const cs = getComputedStyle(el)
      if (cs.visibility === 'hidden' || cs.display === 'none') continue
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      if (r.bottom < 0) continue
      const fg = parse(cs.color)
      if (!fg || fg.a < 0.95) continue
      const bg = bgOf(el)
      const L1 = lum(fg.rgb)
      const L2 = lum(bg)
      const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05)
      const size = parseFloat(cs.fontSize)
      const bold = parseInt(cs.fontWeight, 10) >= 700
      const large = size >= 24 || (size >= 18.66 && bold)
      const need = large ? 3 : 4.5
      if (ratio < need) {
        const key = `${cs.color}|${bg.join(',')}|${Math.round(size)}`
        if (seen.has(key)) continue
        seen.add(key)
        out.push(`${ratio.toFixed(2)}:1 при норме ${need} — ${cs.fontSize} «${txt.slice(0, 40)}»`)
      }
    }
    return out.slice(0, 8)
  })
  for (const b of bad) note(`${label} контраст: ${b}`)
}

async function touchTargets(page, label) {
  const bad = await page.evaluate(() => {
    const out = []
    // Ссылка внутри текста — часть абзаца, а не отдельная цель нажатия.
    // Определяем по факту: в ближайшем блочном родителе есть текст помимо неё.
    const inline = (el) => {
      if (el.tagName !== 'A') return false
      const box = el.parentElement?.closest('p, li, dd, label, figcaption, td, th, div, span')
      if (!box || box === el) return false
      const own = (el.textContent || '').trim().length
      const all = (box.textContent || '').trim().length
      return all > own + 12
    }
    for (const el of document.querySelectorAll('a, button, input, select, [role="button"]')) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      if (inline(el)) continue
      if (el.tagName === 'INPUT' && el.type === 'checkbox') {
        const lab = el.closest('label')
        if (lab) {
          const lr = lab.getBoundingClientRect()
          if (lr.height >= 40 && lr.width >= 40) continue
        }
      }
      if (r.height < 40 || r.width < 40) {
        const t = (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 28)
        out.push(`${Math.round(r.width)}×${Math.round(r.height)} «${t}»`)
      }
    }
    return out.slice(0, 8)
  })
  for (const b of bad) note(`${label} мелкая цель: ${b}`)
}

/** Горизонтальный скролл и элементы, вылезшие за правый край. */
async function noOverflow(page, label) {
  const over = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  if (over > 0) {
    note(`${label}: горизонтальный скролл +${over}px`)
    const who = await page.evaluate(() => {
      const w = document.documentElement.clientWidth
      const out = []
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.height === 0) continue
        if (getComputedStyle(el).position === 'fixed') continue
        if (r.right <= w + 1) continue
        // Показываем самый глубокий элемент: у родителей причина та же.
        if ([...el.children].some((c) => c.getBoundingClientRect().right > w + 1)) continue
        out.push(`${el.tagName.toLowerCase()}.${el.className || '-'} +${Math.round(r.right - w)}px`)
      }
      return out.slice(0, 4)
    })
    for (const x of who) note(`${label}: за правым краем — ${x}`)
  }
}

async function structure(page, route, seen) {
  const info = await page.evaluate(() => {
    const h1 = [...document.querySelectorAll('h1')].map((e) => e.textContent.trim())
    const imgs = [...document.querySelectorAll('img')].filter(
      (i) => !i.hasAttribute('alt') || (!i.width && !i.getAttribute('width')),
    ).length
    return {
      title: document.title,
      desc: document.querySelector('meta[name="description"]')?.content ?? '',
      canonical: document.querySelector('link[rel="canonical"]')?.href ?? '',
      h1,
      badImgs: imgs,
    }
  })
  if (info.h1.length !== 1) note(`${route}: h1 на странице — ${info.h1.length}`)
  if (!info.title) note(`${route}: пустой title`)
  if (info.title.length > 70) note(`${route}: title ${info.title.length} символов`)
  if (!info.desc) note(`${route}: нет description`)
  if (info.desc.length > 200) note(`${route}: description ${info.desc.length} символов`)
  if (!info.canonical) note(`${route}: нет canonical`)
  if (info.badImgs) note(`${route}: изображений без alt или размеров — ${info.badImgs}`)

  for (const [key, val] of [
    ['title', info.title],
    ['description', info.desc],
    ['h1', info.h1[0] ?? ''],
  ]) {
    const map = seen[key]
    if (val && map.has(val)) note(`${route}: ${key} повторяет ${map.get(val)}`)
    else if (val) map.set(val, route)
  }
}

const browser = await chromium.launch()

try {
  await waitForServer()
  const seen = { title: new Map(), description: new Map(), h1: new Map() }

  for (const [w, h, label, extra] of [
    [1920, 1080, '1920', {}],
    [390, 844, '390', { isMobile: true, hasTouch: true, deviceScaleFactor: 2 }],
  ]) {
    console.log(`\n${label} × ${h}`)
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, locale: 'ru-RU', ...extra })
    const page = await ctx.newPage()
    page.on('console', (m) => {
      if (m.type() !== 'error') return
      const t = m.text()
      // Счётчик Метрики в headless не проходит проверку сертификата: у Chromium
      // в этом режиме нет системного хранилища корневых сертификатов.
      // Это среда проверки, а не дефект сайта.
      if (/yandex.(ru|net)/.test(t) || /ERR_CERT_AUTHORITY_INVALID/.test(t)) return
      note(`[${label} консоль] ${t.slice(0, 160)}`)
    })
    page.on('pageerror', (e) => note(`[${label} pageerror] ${e.message.slice(0, 160)}`))

    for (const route of routes) {
      const res = await page.goto(BASE + route, { waitUntil: 'networkidle' })
      if (!res || !res.ok()) {
        note(`${route}: статус ${res && res.status()}`)
        continue
      }
      await page.waitForTimeout(500)
      // Горизонтальный скролл проверяем на обоих размерах: раньше проверка
      // жила внутри structure() и шла только на 1920 — из-за этого мимо прошли
      // 25 страниц, разъезжавшихся на 390.
      await noOverflow(page, `${label} ${route}`)
      if (label === '1920') await structure(page, route, seen)
      await contrast(page, `${label} ${route}`)
      if (label === '390') await touchTargets(page, `${label} ${route}`)

      if (SHOT_ROUTES.includes(route)) {
        // Даём отыграть появлению блоков, иначе снимок ловит середину анимации.
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        await page.waitForTimeout(900)
        await page.evaluate(() => window.scrollTo(0, 0))
        await page.waitForTimeout(400)
        const name = route === '/' ? 'glavnaya' : route.replace(/\//g, '-').slice(1)
        await page.screenshot({ path: join(OUT, `${label}-${name}.png`), fullPage: true })
        console.log('  снимок:', `${label}-${name}.png`)
      } else {
        console.log('  ✓', route)
      }
    }
    await ctx.close()
  }

  console.log('\nprefers-reduced-motion: reduce')
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      locale: 'ru-RU',
      reducedMotion: 'reduce',
    })
    const page = await ctx.newPage()
    await page.goto(BASE + '/po-chertezhu', { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    const hidden = await page.evaluate(() => {
      let n = 0
      for (const el of document.querySelectorAll('main *')) {
        const cs = getComputedStyle(el)
        if (parseFloat(cs.opacity) < 0.1 && el.getBoundingClientRect().height > 0) n++
      }
      return n
    })
    if (hidden) note(`reduced-motion: скрытых элементов — ${hidden}`)
    await page.screenshot({ path: join(OUT, 'reduced-motion.png'), fullPage: true })
    await ctx.close()
  }
} finally {
  await browser.close()
  preview.kill()
}

const report =
  problems.length === 0
    ? 'Дефектов не найдено.\n'
    : problems.map((p, i) => `${i + 1}. ${p}`).join('\n') + '\n'

await writeFile(join(OUT, 'ОТЧЁТ.txt'), report, 'utf8')
console.log(`\n${'='.repeat(60)}\nНайдено замечаний: ${problems.length}\n`)
console.log(report.slice(0, 6000))
