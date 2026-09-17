#!/usr/bin/env node
/**
 * Минимальный статический сервер для проверки собранного сайта.
 *
 * `vite preview` здесь не подходит: он отдаёт SPA-заглушку на адрес без
 * завершающего слэша и предрендеренные страницы не проверить. Этот сервер
 * работает так же, как боевой nginx с `try_files $uri $uri/index.html`:
 * /splavy → dist/splavy/index.html.
 *
 * Запуск: node scripts/serve.mjs [порт]
 */

import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { join, resolve, extname, normalize } from 'node:path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const DIST = resolve(HERE, '..', 'dist')
const PORT = Number(process.argv[2] || 4180)

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
}

async function pick(pathname) {
  // Защита от выхода за пределы dist.
  const clean = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '')
  const direct = join(DIST, clean)
  if (!direct.startsWith(DIST)) return null

  for (const candidate of [direct, join(direct, 'index.html')]) {
    try {
      const s = await stat(candidate)
      if (s.isFile()) return candidate
    } catch {
      /* пробуем следующий вариант */
    }
  }
  return null
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const file = (await pick(url.pathname)) ?? (await pick('/404.html'))

  if (!file) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('404')
    return
  }
  res.writeHead(file.endsWith('404.html') ? 404 : 200, {
    'content-type': TYPES[extname(file)] ?? 'application/octet-stream',
    'cache-control': 'no-store',
  })
  createReadStream(file).pipe(res)
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Статика из dist на http://127.0.0.1:${PORT}`)
})
