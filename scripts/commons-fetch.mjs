#!/usr/bin/env node
/**
 * Скачивание отобранных файлов с Wikimedia Commons вместе с лицензией.
 *
 * Отбор делается глазами по контактному листу: поиск по ключевым словам
 * приносит и косплей, и гравюры XIX века. Здесь только выгрузка того, что
 * уже отобрано, плюс запись атрибуции — без неё CC BY и CC BY-SA нарушены.
 *
 * Запуск: node scripts/commons-fetch.mjs picks.json public/texture/items registry.json
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { chromium } from 'playwright'

const [, , picksPath, outDir, registryPath] = process.argv
const UA = 'site-factory/1.0 (image sourcing for a client website)'
const API = 'https://commons.wikimedia.org/w/api.php'

const pause = (ms) => new Promise((r) => setTimeout(r, ms))

async function info(title) {
  const url = `${API}?${new URLSearchParams({
    format: 'json',
    action: 'query',
    titles: title,
    prop: 'imageinfo',
    iiprop: 'url|size|extmetadata',
    iiurlwidth: '1400',
  })}`
  const r = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!r.ok) throw new Error(`Commons ответил ${r.status}`)
  const d = await r.json()
  const page = Object.values(d.query?.pages ?? {})[0]
  if (!page?.imageinfo?.[0]) throw new Error(`не найден файл ${title}`)
  const ii = page.imageinfo[0]
  const m = ii.extmetadata ?? {}
  const plain = (k) => (m[k]?.value ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  return {
    title: page.title,
    url: ii.thumburl ?? ii.url,
    page: ii.descriptionurl,
    license: plain('LicenseShortName'),
    licenseUrl: plain('LicenseUrl'),
    author: plain('Artist'),
    credit: plain('Credit'),
    description: plain('ImageDescription'),
  }
}

/** Пережимаем тем же способом, что и сгенерированные кадры: канва в браузере. */
async function optimize(browser, buffer, maxWidth, quality, mime = 'image/jpeg') {
  const page = await browser.newPage()
  const b64 = buffer.toString('base64')
  const out = await page.evaluate(
    async ([data, w, q, mime]) => {
      const img = new Image()
      // Тип обязателен: с 'image/*' часть браузеров отказывается декодировать.
      img.src = 'data:' + mime + ';base64,' + data
      await img.decode()
      const scale = Math.min(1, w / img.naturalWidth)
      const c = document.createElement('canvas')
      c.width = Math.round(img.naturalWidth * scale)
      c.height = Math.round(img.naturalHeight * scale)
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height)
      return c.toDataURL('image/jpeg', q).split(',')[1]
    },
    [b64, maxWidth, quality, mime],
  )
  await page.close()
  return Buffer.from(out, 'base64')
}

const picks = JSON.parse(await readFile(picksPath, 'utf8'))
await mkdir(outDir, { recursive: true })
const browser = await chromium.launch()
const registry = {}

for (const [key, title] of Object.entries(picks)) {
  try {
    const meta = await info(title)
    const raw = Buffer.from(await (await fetch(meta.url, { headers: { 'User-Agent': UA } })).arrayBuffer())
    const mime = /\.png($|\?)/i.test(meta.url) ? 'image/png' : 'image/jpeg'
    const jpg = await optimize(browser, raw, 1400, 0.72, mime)
    const file = `${key}.jpg`
    await writeFile(join(outDir, file), jpg)
    registry[key] = { file, ...meta }
    console.log(
      `  ✓ ${key.padEnd(26)} ${(jpg.length / 1024).toFixed(0)} КБ  ${meta.license} · ${meta.author.slice(0, 40)}`,
    )
    await pause(600)
  } catch (e) {
    console.error(`  ✗ ${key}: ${e.message}`)
  }
}

await browser.close()
await mkdir(dirname(registryPath), { recursive: true })
await writeFile(registryPath, JSON.stringify(registry, null, 2), 'utf8')
console.log(`\nреестр лицензий: ${registryPath}`)
