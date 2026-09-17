/**
 * Генерация изображений через API Gemini или OpenAI.
 *
 * Ключ НИКОГДА не пишется в код и не передаётся аргументом командной строки
 * (аргументы видны в списке процессов и попадают в историю оболочки).
 * Скрипт читает его из `.env.local` в корне студии или из переменной окружения.
 *
 * Подготовка — один раз:
 *   1. Скопировать `.env.local.example` в `.env.local`
 *   2. Вписать туда свой ключ
 *   3. `.env.local` уже в `.gitignore`, в репозиторий не попадёт
 *
 * Запуск:
 *   node scripts/generate-images.mjs --prompts sites/avana/image-prompts.json \
 *     --out sites/avana/src/assets/texture --provider gemini
 *
 * Флаги:
 *   --prompts <путь>    JSON с массивом requests (формат см. sites/avana/image-prompts.json)
 *   --out <папка>       куда складывать готовые файлы
 *   --provider          gemini | openai   (по умолчанию gemini)
 *   --model <id>        переопределить модель
 *   --only 1,3,5        сгенерировать только указанные index
 *   --no-optimize       не пережимать, оставить как отдало API
 *   --max-width 1600    ширина после пережатия
 *   --quality 0.82      качество JPEG
 *   --dry-run           показать, что будет сделано, без вызовов API
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

/* ---------- аргументы ---------- */

function parseArgs(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) continue
    const key = a.slice(2)
    const next = argv[i + 1]
    if (next && !next.startsWith('--')) {
      out[key] = next
      i++
    } else {
      out[key] = true
    }
  }
  return out
}

const args = parseArgs(process.argv.slice(2))

/* ---------- .env.local ---------- */

function loadEnvFile() {
  const path = join(ROOT, '.env.local')
  if (!existsSync(path)) return
  for (const raw of readFileSync(path, 'utf8').split('\n')) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnvFile()

/* ---------- провайдеры ---------- */

const PROVIDERS = {
  gemini: {
    envKey: 'GEMINI_API_KEY',
    defaultModel: 'gemini-2.5-flash-image',
    docs: 'https://aistudio.google.com/apikey',
    async generate({ prompt, model, apiKey, aspectRatio }) {
      const url =
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ['IMAGE'],
            ...(aspectRatio ? { imageConfig: { aspectRatio } } : {}),
          },
        }),
      })
      if (!res.ok) {
        throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 400)}`)
      }
      const json = await res.json()
      const parts = json?.candidates?.[0]?.content?.parts ?? []
      const img = parts.find((p) => p.inlineData?.data)
      if (!img) {
        const text = parts.find((p) => p.text)?.text
        throw new Error(
          `Gemini не вернул изображение${text ? `: ${text.slice(0, 300)}` : ''}`
        )
      }
      return {
        buffer: Buffer.from(img.inlineData.data, 'base64'),
        ext: (img.inlineData.mimeType || 'image/png').includes('jpeg') ? 'jpg' : 'png',
      }
    },
  },

  /* OpenAI-совместимый провайдер.
     Подходит и для самого OpenAI, и для прокси-платформ вроде
     AgentPlatform: у них тот же формат, отличается только базовый URL. */
  openai: {
    envKey: 'OPENAI_API_KEY',
    defaultModel: 'gpt-image-1',
    defaultBaseUrl: 'https://api.openai.com/v1',
    docs: 'https://platform.openai.com/api-keys',

    async listModels({ apiKey, baseUrl }) {
      const res = await fetch(`${baseUrl}/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
      if (!res.ok) {
        throw new Error(`${res.status}: ${(await res.text()).slice(0, 300)}`)
      }
      const json = await res.json()
      return (json?.data ?? []).map((m) => m.id).sort()
    },

    async generate({ prompt, model, apiKey, aspectRatio, baseUrl, jpeg, responseFormat }) {
      // Эндпоинт принимает размер в пикселях, а не соотношение сторон
      const size =
        aspectRatio === '1:1'
          ? '1024x1024'
          : aspectRatio === '9:16' || aspectRatio === '4:5'
            ? '1024x1536'
            : '1536x1024'

      const body = { model, prompt, size, n: 1 }
      // AgentPlatform в примерах отдаёт ссылку — так надёжнее для прокси
      if (responseFormat) body.response_format = responseFormat
      if (jpeg) {
        body.output_format = 'jpeg'
        body.output_compression = 85
      } else {
        body.output_format = 'png'
      }

      const res = await fetch(`${baseUrl}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        throw new Error(`${res.status}: ${(await res.text()).slice(0, 400)}`)
      }

      const json = await res.json()
      const item = json?.data?.[0]
      if (item?.b64_json) {
        return {
          buffer: Buffer.from(item.b64_json, 'base64'),
          ext: jpeg ? 'jpg' : 'png',
        }
      }
      // Часть прокси отдаёт ссылку вместо base64
      if (item?.url) {
        const img = await fetch(item.url)
        if (!img.ok) throw new Error(`не скачалось изображение по url: ${img.status}`)
        const buf = Buffer.from(await img.arrayBuffer())
        return { buffer: buf, ext: item.url.includes('.jpg') ? 'jpg' : 'png' }
      }
      throw new Error(
        `ответ без изображения: ${JSON.stringify(json).slice(0, 300)}`
      )
    },
  },

  /* Модели, которые отдают картинку через chat/completions,
     а не через /images/generations. Так работает
     google/gemini-3-pro-image-preview на AgentPlatform. */
  chat: {
    envKey: 'OPENAI_API_KEY',
    defaultModel: 'google/gemini-3-pro-image-preview',
    defaultBaseUrl: 'https://api.agentplatform.ru/v1',
    docs: 'https://app.agentplatform.ru/api-keys',

    listModels: (opts) => PROVIDERS.openai.listModels(opts),

    async generate({ prompt, model, apiKey, aspectRatio, baseUrl }) {
      const ask = aspectRatio
        ? `${prompt}\n\nAspect ratio: ${aspectRatio}.`
        : prompt

      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: ask }],
        }),
      })
      if (!res.ok) {
        throw new Error(`${res.status}: ${(await res.text()).slice(0, 400)}`)
      }

      const json = await res.json()
      const msg = json?.choices?.[0]?.message ?? {}

      // Разные прокси кладут картинку в разные места — проверяем по очереди
      const candidates = []

      if (Array.isArray(msg.images)) {
        for (const im of msg.images) {
          candidates.push(im?.image_url?.url ?? im?.url ?? im)
        }
      }
      if (Array.isArray(msg.content)) {
        for (const part of msg.content) {
          if (part?.image_url?.url) candidates.push(part.image_url.url)
          if (part?.inline_data?.data) candidates.push(`b64:${part.inline_data.data}`)
        }
      }
      if (typeof msg.content === 'string') {
        const m = msg.content.match(/https?:\/\/\S+?\.(png|jpg|jpeg|webp)/i)
        if (m) candidates.push(m[0])
        const d = msg.content.match(/data:image\/[a-z]+;base64,([A-Za-z0-9+/=]+)/)
        if (d) candidates.push(`b64:${d[1]}`)
      }

      const found = candidates.find(Boolean)
      if (!found) {
        throw new Error(
          `ответ без изображения: ${JSON.stringify(json).slice(0, 400)}`
        )
      }

      if (typeof found === 'string' && found.startsWith('b64:')) {
        return { buffer: Buffer.from(found.slice(4), 'base64'), ext: 'png' }
      }
      if (typeof found === 'string' && found.startsWith('data:')) {
        return {
          buffer: Buffer.from(found.split(',')[1], 'base64'),
          ext: 'png',
        }
      }

      const img = await fetch(found)
      if (!img.ok) throw new Error(`не скачалось изображение: ${img.status}`)
      return {
        buffer: Buffer.from(await img.arrayBuffer()),
        ext: /\.jpe?g/i.test(found) ? 'jpg' : 'png',
      }
    },
  },
}

/* ---------- пережатие ---------- */

async function optimize(buffer, ext, maxWidth, quality) {
  if (ext === 'jpg' && buffer.length < 300 * 1024) return { buffer, ext, skipped: true }

  const { chromium } = await import('playwright')
  const browser = await chromium.launch()
  const page = await browser.newPage()
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg'

  const dataUrl = await page.evaluate(
    async ({ src, maxW, q }) => {
      const img = new Image()
      img.src = src
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
    {
      src: `data:${mime};base64,${buffer.toString('base64')}`,
      maxW: maxWidth,
      q: quality,
    }
  )

  await browser.close()
  return { buffer: Buffer.from(dataUrl.split(',')[1], 'base64'), ext: 'jpg' }
}

/* ---------- основной поток ---------- */

const providerName = String(args.provider ?? 'gemini').toLowerCase()
const provider = PROVIDERS[providerName]

if (!provider) {
  console.error(
    `Неизвестный провайдер: ${providerName}. Доступны: openai, chat, gemini`
  )
  process.exit(1)
}

const baseUrl = String(
  args['base-url'] ?? process.env.OPENAI_BASE_URL ?? provider.defaultBaseUrl ?? ''
).replace(/\/+$/, '')

const apiKeyEarly = process.env[provider.envKey]

/* Разведка моделей: точные ID у прокси-платформ свои,
   гадать не нужно — спрашиваем сам API. */
if (args['list-models']) {
  if (!provider.listModels) {
    console.error(`Провайдер ${providerName} не умеет перечислять модели`)
    process.exit(1)
  }
  if (!apiKeyEarly) {
    console.error(`Не найден ${provider.envKey} в .env.local`)
    process.exit(1)
  }
  console.log(`Запрос списка моделей: ${baseUrl}/models\n`)
  try {
    const models = await provider.listModels({ apiKey: apiKeyEarly, baseUrl })
    const image = models.filter((m) => /image|imagen|dall|flux|sd|banana/i.test(m))
    if (image.length) {
      console.log('Похожие на генерацию изображений:')
      for (const m of image) console.log(`  ${m}`)
      console.log()
    }
    console.log(`Всего моделей: ${models.length}`)
    for (const m of models) console.log(`  ${m}`)
  } catch (e) {
    console.error(`Не получилось: ${e.message}`)
    process.exit(1)
  }
  process.exit(0)
}

if (!args.prompts || !args.out) {
  console.error('Нужны --prompts <файл.json> и --out <папка>')
  process.exit(1)
}

const apiKey = apiKeyEarly
if (!apiKey && !args['dry-run']) {
  console.error(
    `\nНе найден ${provider.envKey}.\n\n` +
      `  1. Скопируйте .env.local.example в .env.local\n` +
      `  2. Впишите ключ в строку ${provider.envKey}=\n` +
      `  3. Получить ключ: ${provider.docs}\n\n` +
      `Ключ читается из файла — в командную строку его передавать не нужно.\n`
  )
  process.exit(1)
}

const model = args.model ?? provider.defaultModel
const maxWidth = Number(args['max-width'] ?? 1600)
const quality = Number(args.quality ?? 0.82)
const doOptimize = !args['no-optimize']
const only = args.only
  ? new Set(String(args.only).split(',').map((s) => Number(s.trim())))
  : null

const spec = JSON.parse(readFileSync(resolve(args.prompts), 'utf8'))
const requests = (spec.requests ?? []).filter((r) => !only || only.has(r.index))

const outDir = resolve(args.out)
mkdirSync(outDir, { recursive: true })

console.log(`Провайдер: ${providerName} · модель: ${model}`)
if (baseUrl) console.log(`Адрес API: ${baseUrl}`)
console.log(`Кадров: ${requests.length} · папка: ${outDir}\n`)

if (args['dry-run']) {
  for (const r of requests) {
    console.log(`[${r.index}] ${r._куда ?? ''}`)
    console.log(`    ${String(r.params.prompt).slice(0, 120)}...\n`)
  }
  console.log('Пробный прогон, вызовов API не было.')
  process.exit(0)
}

let ok = 0
let failed = 0

for (const r of requests) {
  const name = r._файл ?? `${String(r.index).padStart(2, '0')}`
  process.stdout.write(`[${r.index}] генерация... `)
  try {
    let { buffer, ext } = await provider.generate({
      prompt: r.params.prompt,
      model,
      apiKey,
      aspectRatio: r.params.aspect_ratio,
      baseUrl,
      jpeg: Boolean(args.jpeg),
      // По умолчанию не шлём: gpt-image-1.5 через прокси его не принимает
      responseFormat: args['response-format'],
    })
    const rawSize = buffer.length

    if (doOptimize) {
      const opt = await optimize(buffer, ext, maxWidth, quality)
      buffer = opt.buffer
      ext = opt.ext
    }

    const file = join(outDir, `${name}.${ext}`)
    writeFileSync(file, buffer)
    const kb = (n) => Math.round(n / 1024)
    console.log(
      `готово · ${kb(rawSize)} КБ → ${kb(statSync(file).size)} КБ · ${file}`
    )
    ok++
  } catch (e) {
    console.log(`ОШИБКА\n    ${e.message}\n`)
    failed++
  }
}

console.log(`\nГотово: ${ok} · Ошибок: ${failed}`)
if (ok > 0) {
  console.log('Дальше: подключить файлы в компоненты и прогнать визуальный QA.')
}
