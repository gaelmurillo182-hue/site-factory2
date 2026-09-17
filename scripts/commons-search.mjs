#!/usr/bin/env node
/**
 * Поиск изображений на Wikimedia Commons с проверкой лицензии.
 *
 * Зачем отдельный скрипт: на коммерческий B2B-сайт нельзя ставить картинку,
 * у которой не видно лицензии. Пинтерест, выдача картинок и «нашлось в гугле»
 * такими источниками не являются — там лежат чужие снимки под обычным
 * авторским правом. Commons отдаёт лицензию каждого файла машинно, и её можно
 * записать в реестр рядом со ссылкой на автора.
 *
 * Берём только то, что разрешено использовать коммерчески: CC0, общественное
 * достояние, CC BY, CC BY-SA. Всё с пометкой «NonCommercial» отбрасывается.
 *
 * Запуск:
 *   node scripts/commons-search.mjs "wire drawing die" [сколько]
 *   node scripts/commons-search.mjs --file запросы.json --out папка
 */

import { writeFile, mkdir } from 'node:fs/promises'
import { basename } from 'node:path'
import { pathToFileURL } from 'node:url'

const UA = 'site-factory/1.0 (image sourcing for a client website)'
const API = 'https://commons.wikimedia.org/w/api.php'

/**
 * Лицензии, под которыми файл можно ставить на коммерческий сайт.
 * Проверка идёт по нормализованной записи: Commons пишет и «CC BY-SA 3.0»,
 * и «cc-by-sa-3.0», и «Public domain».
 */
const OK = /^(cc0|cc-by|pd|public-domain|attribution)/
const BAD = /(^|-)(nc|nd)(-|$)|noncommercial|non-commercial|noderiv|fair-use|non-free/

const usableLicense = (license) =>
  OK.test(license.toLowerCase().trim().replace(/\s+/g, '-')) &&
  !BAD.test(license.toLowerCase().trim().replace(/\s+/g, '-'))

const pause = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * Commons отдаёт 429 при частых запросах. Ходим медленно и повторяем с
 * нарастающей паузой: выкачивать чужой сервис в несколько потоков некрасиво
 * и просто не работает.
 */
async function api(params, attempt = 0) {
  const url = `${API}?${new URLSearchParams({ format: 'json', origin: '*', ...params })}`
  const r = await fetch(url, { headers: { 'User-Agent': UA } })
  if (r.status === 429 && attempt < 4) {
    await pause(3000 * (attempt + 1))
    return api(params, attempt + 1)
  }
  if (!r.ok) throw new Error(`Commons ответил ${r.status}`)
  await pause(900)
  return r.json()
}

/** Метаданные и лицензия по списку файлов. */
async function details(titles) {
  const out = []
  for (let i = 0; i < titles.length; i += 20) {
    const chunk = titles.slice(i, i + 20)
    const d = await api({
      action: 'query',
      titles: chunk.join('|'),
      prop: 'imageinfo',
      iiprop: 'url|size|mime|extmetadata',
      iiurlwidth: '1400',
    })
    for (const page of Object.values(d.query?.pages ?? {})) {
      const info = page.imageinfo?.[0]
      if (!info) continue
      const m = info.extmetadata ?? {}
      const plain = (k) => (m[k]?.value ?? '').replace(/<[^>]+>/g, '').trim()
      const license = plain('LicenseShortName') || plain('License')
      out.push({
        title: page.title,
        file: basename(info.url),
        page: info.descriptionurl,
        src: info.thumburl ?? info.url,
        full: info.url,
        width: info.thumbwidth ?? info.width,
        height: info.thumbheight ?? info.height,
        mime: info.mime,
        license,
        licenseUrl: plain('LicenseUrl'),
        author: plain('Artist'),
        description: plain('ImageDescription').slice(0, 200),
        usable: usableLicense(license),
      })
    }
  }
  return out
}

export async function search(query, limit = 12) {
  const s = await api({
    action: 'query',
    list: 'search',
    srsearch: `${query} filetype:bitmap`,
    srnamespace: '6',
    srlimit: String(limit),
  })
  const titles = (s.query?.search ?? []).map((x) => x.title)
  if (!titles.length) return []
  return details(titles)
}

// Блок ниже работает только при прямом запуске: модуль импортируется и
// другими скриптами, тогда argv[1] указывает не сюда.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2)
  if (args[0] === '--file') {
    const queries = JSON.parse(await (await import('node:fs/promises')).readFile(args[1], 'utf8'))
    const outDir = args[3] ?? 'output/commons'
    await mkdir(outDir, { recursive: true })
    const all = {}
    for (const [key, q] of Object.entries(queries)) {
      const list = []
      for (const term of [].concat(q)) {
        try {
          list.push(...(await search(term, 10)))
        } catch (e) {
          console.error(`  ${key} / ${term}: ${e.message}`)
        }
      }
      all[key] = list.filter((x) => x.usable && x.width >= 800)
      console.log(`${key}: пригодных ${all[key].length}`)
    }
    await writeFile(`${outDir}/candidates.json`, JSON.stringify(all, null, 2), 'utf8')
    console.log(`\nсписок: ${outDir}/candidates.json`)
  } else {
    const list = await search(args[0], Number(args[1] ?? 10))
    for (const x of list) {
      console.log(
        `${x.usable ? '✓' : '✗'} ${x.license.padEnd(14)} ${String(x.width).padStart(5)}px  ${x.title}`,
      )
    }
  }
}
