#!/usr/bin/env node
/**
 * Посекционные снимки страницы для визуального разбора.
 *
 * Полностраничный снимок длинной страницы весит мегабайты и плохо читается.
 * Здесь каждая полоса снимается отдельно и с ограничением по высоте.
 *
 * Запуск: node scripts/shots.mjs /splavy 1440
 */

import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const HERE = dirname(fileURLToPath(import.meta.url))
const SITE = resolve(HERE, '..')
const OUT = join(SITE, 'qa', 'sections')
const PORT = 4191
const BASE = `http://127.0.0.1:${PORT}`

const route = process.argv[2] || '/'
const width = Number(process.argv[3] || 1440)

await mkdir(OUT, { recursive: true })
const server = spawn(process.execPath, [join(HERE, 'serve.mjs'), String(PORT)], { stdio: 'ignore' })

async function wait() {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(BASE + '/')).ok) return
    } catch {
      /* поднимается */
    }
    await new Promise((r) => setTimeout(r, 300))
  }
  throw new Error('сервер не поднялся')
}

try {
  await wait()
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, locale: 'ru-RU' })
  const page = await ctx.newPage()
  await page.goto(BASE + route, { waitUntil: 'networkidle' })
  // Прокручиваем страницу целиком, чтобы отыграли появления блоков.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 60))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(700)

  const slug = route === '/' ? 'glavnaya' : route.replace(/\//g, '-').slice(1)
  const blocks = await page.locator('main > *, header, footer').all()
  let i = 0
  for (const b of blocks) {
    const box = await b.boundingBox()
    if (!box || box.height < 40) continue
    i++
    await b.screenshot({
      path: join(OUT, `${slug}-${String(i).padStart(2, '0')}.png`),
      scale: 'css',
    })
    console.log(`  ${slug}-${String(i).padStart(2, '0')}.png  ${Math.round(box.height)}px`)
  }
  await browser.close()
} finally {
  server.kill()
}
