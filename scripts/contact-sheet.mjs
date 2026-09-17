// Контактный лист изображений: смотрим все кадры одним снимком, а не по одному.
// Запуск: node scripts/contact-sheet.mjs <папка с картинками>
import { chromium } from 'playwright'
import { readdirSync, readFileSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pathToFileURL } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dir = resolve(process.argv[2] ?? 'sites/ai-agency-site/public/img')
const files = readdirSync(dir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort()

const cells = files
  .map((f) => `<figure><img src="data:image/jpeg;base64,${readFileSync(join(dir, f)).toString('base64')}" alt=""><figcaption>${f}</figcaption></figure>`)
  .join('')

const html = `<!doctype html><meta charset="utf-8">
<style>
 body{margin:0;background:#0b0d0c;color:#eef1ee;font:13px system-ui;
      display:grid;grid-template-columns:repeat(2,1fr);gap:10px;padding:10px}
 figure{margin:0} img{width:100%;height:auto;display:block}
 figcaption{padding:4px 0;color:#a6b0aa}
</style>${cells}`

const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1600, height: 1000 } })
await p.setContent(html, { waitUntil: 'networkidle' })
await p.screenshot({ path: join(ROOT, 'agency/qa-site/contact-sheet.png'), fullPage: true })
await b.close()
console.log(`кадров: ${files.length} → agency/qa-site/contact-sheet.png`)
