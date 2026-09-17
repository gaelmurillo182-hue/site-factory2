/**
 * Пережатие сгенерированных изображений без новых зависимостей.
 * Модель отдаёт PNG весом 1–2 МБ — в таком виде на страницу их ставить нельзя.
 * Playwright уже стоит для визуального QA, поэтому используем его canvas.
 *
 * Запуск из папки проекта, где установлен playwright:
 *   node ../../scripts/optimize-image.mjs <вход.png> <выход.jpg> [макс-ширина] [качество]
 *
 * Пример:
 *   node ../../scripts/optimize-image.mjs src/assets/texture/raw.png \
 *     src/assets/texture/01-silk.jpg 1600 0.82
 */

import { chromium } from 'playwright'
import { readFileSync, writeFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

const [, , inArg, outArg, widthArg, qualityArg] = process.argv

if (!inArg || !outArg) {
  console.error('Укажите путь входа и выхода: node optimize-image.mjs in.png out.jpg [ширина] [качество]')
  process.exit(1)
}

const src = resolve(inArg)
const out = resolve(outArg)
const maxWidth = Number(widthArg ?? 1600)
const quality = Number(qualityArg ?? 0.82)

const before = statSync(src).size
const b64 = readFileSync(src).toString('base64')
const mime = src.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'

const browser = await chromium.launch()
const page = await browser.newPage()

const jpeg = await page.evaluate(
  async ({ dataUrl, maxW, q }) => {
    const img = new Image()
    img.src = dataUrl
    await img.decode()
    const scale = Math.min(1, maxW / img.naturalWidth)
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.naturalWidth * scale)
    canvas.height = Math.round(img.naturalHeight * scale)
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', q)
  },
  { dataUrl: `data:${mime};base64,${b64}`, maxW: maxWidth, q: quality }
)

writeFileSync(out, Buffer.from(jpeg.split(',')[1], 'base64'))
await browser.close()

const after = statSync(out).size
const pct = Math.round((1 - after / before) * 100)
console.log(
  `${Math.round(before / 1024)} КБ → ${Math.round(after / 1024)} КБ (−${pct}%)  ${out}`
)
