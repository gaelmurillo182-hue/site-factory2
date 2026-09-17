#!/usr/bin/env node
/**
 * Контактный лист по кандидатам из Wikimedia Commons.
 *
 * Поиск по ключевым словам всегда приносит мусор: к «punch tool» прилетают
 * гравюры и схемы. Отбирать нужно глазами, поэтому раскладываем миниатюры
 * сеткой с подписями и снимаем одним кадром.
 *
 * Запуск: node scripts/commons-sheet.mjs output/commons/candidates.json output/commons
 */

import { readFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { chromium } from 'playwright'

const [, , listPath = 'output/commons/candidates.json', outDir = 'output/commons'] = process.argv
const PER_CATEGORY = 8
const PER_SHEET = 4 // категорий на лист

const all = JSON.parse(await readFile(listPath, 'utf8'))
await mkdir(outDir, { recursive: true })

const groups = Object.entries(all).filter(([, v]) => v.length)
const browser = await chromium.launch()

for (let i = 0; i < groups.length; i += PER_SHEET) {
  const slice = groups.slice(i, i + PER_SHEET)
  const html = `<style>
    body { margin:0; background:#14161a; color:#e8e9eb; font:13px/1.35 system-ui, sans-serif; padding:16px }
    h2 { font-size:15px; margin:18px 0 8px; color:#ff8a5c; letter-spacing:.04em }
    .row { display:grid; grid-template-columns:repeat(${PER_CATEGORY},1fr); gap:8px }
    figure { margin:0; background:#1d2026; border:1px solid #2c313a }
    img { width:100%; height:120px; object-fit:cover; display:block; background:#000 }
    figcaption { padding:5px 6px; font-size:10px; line-height:1.25; color:#9aa1ab;
      height:44px; overflow:hidden }
    b { color:#e8e9eb }
  </style>
  ${slice
    .map(
      ([key, list]) => `<h2>${key}</h2><div class="row">${list
        .slice(0, PER_CATEGORY)
        .map(
          (x, n) =>
            `<figure><img src="${x.src}" referrerpolicy="no-referrer"><figcaption><b>${n}</b> ${x.title
              .replace('File:', '')
              .slice(0, 70)}</figcaption></figure>`,
        )
        .join('')}</div>`,
    )
    .join('')}`

  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } })
  // Часть миниатюр Commons отдаёт медленно — не ждём их все, лист собирается
  // и с несколькими пустыми плитками.
  await page.setContent(html, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(6000)
  const file = join(outDir, `sheet-${String(i / PER_SHEET + 1).padStart(2, '0')}.png`)
  await page.screenshot({ path: file, fullPage: true })
  console.log('  ', file)
  await page.close()
}

await browser.close()
