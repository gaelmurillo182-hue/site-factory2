#!/usr/bin/env node
/**
 * Картинка для соцсетей и мессенджеров, 1200×630 → public/og.jpg.
 *
 * Рисуется кодом из тех же токенов, что и сайт: генерировать её моделью
 * нельзя — там текст, а текст модели пишут с ошибками. Пересобирать нужно
 * только если поменялись цвета или название.
 *
 * Запуск: node scripts/og.mjs
 */

import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const HERE = dirname(fileURLToPath(import.meta.url))
const SITE = resolve(HERE, '..')

const tokens = await readFile(join(SITE, 'src/styles/tokens.css'), 'utf8')
const geologica = join(SITE, 'public/fonts/geologica-cyrillic.woff2')
const commissioner = join(SITE, 'public/fonts/commissioner-cyrillic.woff2')
const b64 = async (p) => (await readFile(p)).toString('base64')

const html = `<!doctype html>
<html lang="ru"><head><meta charset="utf-8">
<style>
  @font-face {
    font-family: 'Geologica Variable';
    src: url(data:font/woff2;base64,${await b64(geologica)}) format('woff2-variations');
    font-weight: 100 900;
  }
  @font-face {
    font-family: 'Commissioner Variable';
    src: url(data:font/woff2;base64,${await b64(commissioner)}) format('woff2-variations');
    font-weight: 100 900;
  }
  ${tokens}
  * { box-sizing: border-box; margin: 0; }
  body {
    width: 1200px; height: 630px;
    background: var(--graphite);
    color: var(--ink-invert);
    font-family: var(--font-text);
    display: grid;
    grid-template-rows: auto 1fr auto;
    padding: 64px 72px;
    position: relative;
    overflow: hidden;
  }
  .hatch {
    position: absolute; inset: 0;
    background-image: repeating-linear-gradient(-45deg, var(--rule-invert) 0 1px, transparent 1px 10px);
    opacity: .5;
    -webkit-mask-image: radial-gradient(120% 90% at 78% 40%, black, transparent 70%);
  }
  .row { display: flex; align-items: center; gap: 18px; position: relative; }
  .mark { width: 44px; height: 44px; }
  .name { font-family: var(--font-display); font-weight: 600; font-size: 30px; letter-spacing: -.02em; line-height: 1; }
  .sub { font-size: 13px; letter-spacing: .1em; text-transform: uppercase; color: var(--ink-invert-soft); margin-top: 5px; }
  h1 {
    position: relative;
    font-family: var(--font-display);
    font-weight: 600; font-size: 74px; line-height: 1.04; letter-spacing: -.025em;
    max-width: 20ch;
    align-self: center;
  }
  .facts { display: flex; gap: 56px; position: relative; }
  .fact__v { font-family: var(--font-display); font-weight: 600; font-size: 34px; line-height: 1; }
  .fact__l { font-size: 14px; letter-spacing: .08em; text-transform: uppercase; color: var(--ink-invert-soft); margin-top: 8px; }
  .dom { margin-left: auto; align-self: end; font-size: 18px; color: var(--ink-invert-soft); }
  .bar { position: absolute; left: 0; right: 0; bottom: 0; height: 8px; background: var(--signal); }
</style></head>
<body>
  <div class="hatch"></div>
  <div class="row">
    <svg class="mark" viewBox="0 0 32 32"><path fill="currentColor" fill-rule="evenodd"
      d="M2 2h28v28H2V2zm9.4 0L14.9 13.1v5.8L11.4 30h9.2l-3.5-11.1v-5.8L20.6 2h-9.2z"/></svg>
    <div>
      <div class="name">Лавитек</div>
      <div class="sub">твердые сплавы</div>
    </div>
  </div>

  <h1>Изделия из карбида вольфрама по вашему чертежу</h1>

  <div class="facts">
    <div><div class="fact__v">от 14 дн.</div><div class="fact__l">срок изготовления</div></div>
    <div><div class="fact__v">до 0,01 мм</div><div class="fact__l">достижимая точность</div></div>
    <div class="dom">карбид-вольфрама.рф</div>
  </div>
  <div class="bar"></div>
</body></html>`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
await page.setContent(html, { waitUntil: 'load' })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(300)
const buf = await page.screenshot({ type: 'jpeg', quality: 88 })
await writeFile(join(SITE, 'public/og.jpg'), buf)
await browser.close()
console.log(`public/og.jpg — ${(buf.length / 1024).toFixed(0)} КБ`)

// Иконка для iOS: SVG там не поддерживается, нужен PNG 180×180.
{
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: 180, height: 180 }, deviceScaleFactor: 1 })
  await p.setContent(
    `<style>html,body{margin:0}body{width:180px;height:180px;background:#f7f6f4;display:grid;place-items:center}
     svg{width:150px;height:150px}</style>
     <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path fill="#2b2f36" fill-rule="evenodd"
     d="M2 2h28v28H2V2zm8.2 0L14.2 12.4v7.2L10.2 30h11.6L17.8 19.6v-7.2L21.8 2H10.2z"/></svg>`,
    { waitUntil: 'load' },
  )
  const png = await p.screenshot({ type: 'png' })
  await writeFile(join(SITE, 'public/apple-touch-icon.png'), png)
  await b.close()
  console.log(`public/apple-touch-icon.png — ${(png.length / 1024).toFixed(0)} КБ`)
}
