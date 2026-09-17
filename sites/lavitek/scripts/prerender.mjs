#!/usr/bin/env node
/**
 * Предрендер маршрутов в статику.
 *
 * SPA-выдача для поисковика — брак: робот получает пустой <div id="root">.
 * Скрипт берёт серверный рендер приложения (dist-ssr/entry-server.js) и
 * вставляет его в шаблон клиентской сборки (dist/index.html), раскладывая
 * результат по dist/<route>/index.html.
 *
 * Почему серверный рендер, а не снимок готовой страницы браузером: к моменту
 * снимка уже отработали эффекты — плашка cookie, появление блоков при
 * прокрутке, — и разметка перестаёт совпадать с первым клиентским рендером.
 * Гидратация в таком случае падает, и React перерисовывает страницу целиком.
 *
 * Запуск: npm run build && npm run prerender
 */

import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pathToFileURL } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const SITE = resolve(HERE, '..')
const DIST = join(SITE, 'dist')

/**
 * React 19 выносит <title>, <meta> и <link> в начало серверного рендера.
 * Забираем этот блок и переносим в <head> — остальное уходит в #root.
 */
const HOISTED =
  /^(?:<title>[\s\S]*?<\/title>|<meta\b[^>]*?>|<link\b[^>]*?>)+/

const routes = JSON.parse(await readFile(join(DIST, 'routes.json'), 'utf8'))
const template = await readFile(join(SITE, '.prerender/index.template.html'), 'utf8')
const { render } = await import(pathToFileURL(join(SITE, 'dist-ssr/entry-server.js')).href)

if (!template.includes('<div id="root"></div>')) {
  throw new Error('в шаблоне нет пустого <div id="root"></div> — сборка не отработала?')
}

let failed = 0

for (const { path } of routes) {
  let markup
  try {
    markup = render(path)
  } catch (e) {
    failed++
    console.error(`  ${path} — ошибка рендера: ${e.message}`)
    continue
  }

  const head = (markup.match(HOISTED) ?? [''])[0]
  const body = markup.slice(head.length)

  if (!head.includes('<title>')) {
    failed++
    console.error(`  ${path} — не найден <title>, страница без метаданных`)
  }
  if (!body.includes('<h1')) {
    failed++
    console.error(`  ${path} — не найден h1`)
  }

  const html = template
    .replace('</head>', `  ${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`)

  const outDir = path === '/' ? DIST : join(DIST, path)
  await mkdir(outDir, { recursive: true })
  await writeFile(join(outDir, 'index.html'), html, 'utf8')
  console.log('  ✓', path, `(${(html.length / 1024).toFixed(0)} КБ)`)
}

// Страница 404 — отдельным файлом в корне: её отдаёт сервер на неизвестный
// адрес. В sitemap и в обход она не попадает.
{
  const markup = render('/404-stranica-ne-najdena')
  const head = (markup.match(HOISTED) ?? [''])[0]
  const body = markup.slice(head.length)
  const html = template
    .replace('</head>', `  ${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
  await writeFile(join(DIST, '404.html'), html, 'utf8')
  console.log('  ✓ /404.html')
}

console.log(`\nПредрендер: ${routes.length} маршрутов, ошибок — ${failed}`)
if (failed) process.exitCode = 1
