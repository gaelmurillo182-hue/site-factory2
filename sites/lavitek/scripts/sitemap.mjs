#!/usr/bin/env node
/**
 * sitemap.xml и robots.txt из списка маршрутов. Руками такое не ведут:
 * забудешь строку — страница выпадет из обхода.
 */

import { writeFile, readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const SITE = resolve(HERE, '..')
const DIST = join(SITE, 'dist')

const siteSrc = await readFile(join(SITE, 'src/data/site.ts'), 'utf8')
const origin = siteSrc.match(/origin:\s*'([^']+)'/)[1]

const entries = JSON.parse(await readFile(join(DIST, 'routes.json'), 'utf8'))
const today = new Date().toISOString().slice(0, 10)

const xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  entries
    .map(
      (e) =>
        '  <url>\n' +
        `    <loc>${origin}${e.path}</loc>\n` +
        `    <lastmod>${today}</lastmod>\n` +
        `    <priority>${e.priority.toFixed(1)}</priority>\n` +
        '  </url>\n',
    )
    .join('') +
  '</urlset>\n'

const robots = `User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
`

await writeFile(join(DIST, 'sitemap.xml'), xml, 'utf8')
await writeFile(join(DIST, 'robots.txt'), robots, 'utf8')
console.log(`sitemap.xml: ${entries.length} адресов; robots.txt записан`)
