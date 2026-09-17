import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { readFile, writeFile } from 'node:fs/promises'

const [,, inPath, outPath] = process.argv
const data = new Uint8Array(await readFile(inPath))
const doc = await getDocument({ data, useSystemFonts: true }).promise
let out = ''
for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p)
  const tc = await page.getTextContent()
  let line = []
  let lastY = null
  const rows = []
  for (const it of tc.items) {
    if (!it.str) continue
    const y = Math.round(it.transform[5])
    if (lastY !== null && Math.abs(y - lastY) > 3) { rows.push(line.join(' ')); line = [] }
    line.push(it.str)
    lastY = y
  }
  rows.push(line.join(' '))
  out += `\n\n===== PAGE ${p} / ${doc.numPages} =====\n` + rows.map(r => r.replace(/\s+/g,' ').trim()).filter(Boolean).join('\n')
}
await writeFile(outPath, out, 'utf8')
console.log('pages:', doc.numPages, '->', outPath, 'chars:', out.length)
