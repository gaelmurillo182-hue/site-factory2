// Рендер страниц PDF в PNG через pdf.js внутри headless Chromium (Playwright).
// Замена pdftoppm, которого нет в этой системе.
// usage: node scripts/pdf-render.mjs <in.pdf> <outDir> <prefix> [scale] [first] [last]
import { chromium } from 'playwright';
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';

const [, , pdfPath, outDir, prefix = 'page', scaleArg = '2.0', firstArg, lastArg] = process.argv;
const scale = Number(scaleArg);
mkdirSync(outDir, { recursive: true });

const MIME = { '.mjs': 'text/javascript', '.js': 'text/javascript', '.html': 'text/html', '.map': 'application/json' };
const root = process.cwd();
const server = createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/') { res.writeHead(200, { 'Content-Type': 'text/html' }); return res.end('<!doctype html><meta charset="utf-8"><body></body>'); }
  const f = path.join(root, url);
  if (!f.startsWith(root) || !existsSync(f)) { res.writeHead(404); return res.end('nope'); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] ?? 'application/octet-stream' });
  res.end(readFileSync(f));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const pdfB64 = readFileSync(pdfPath).toString('base64');
const browser = await chromium.launch();
const page = await browser.newPage();
page.on('console', m => { if (m.type() === 'error') console.error('[page]', m.text()); });
await page.goto(base + '/');

const total = await page.evaluate(async ({ base, pdfB64 }) => {
  const pdfjsLib = await import(base + '/node_modules/pdfjs-dist/build/pdf.mjs');
  pdfjsLib.GlobalWorkerOptions.workerSrc = base + '/node_modules/pdfjs-dist/build/pdf.worker.mjs';
  const raw = atob(pdfB64);
  const data = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) data[i] = raw.charCodeAt(i);
  window.__doc = await pdfjsLib.getDocument({ data, useSystemFonts: true }).promise;
  return window.__doc.numPages;
}, { base, pdfB64 });

const first = firstArg ? Number(firstArg) : 1;
const last = lastArg ? Number(lastArg) : total;
console.log(`страниц: ${total}; рендерю ${first}..${last}, scale=${scale}`);

for (let i = first; i <= last; i++) {
  const b64 = await page.evaluate(async ({ i, scale }) => {
    const p = await window.__doc.getPage(i);
    const vp = p.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(vp.width); canvas.height = Math.ceil(vp.height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    await p.render({ canvasContext: ctx, viewport: vp }).promise;
    return canvas.toDataURL('image/png').split(',')[1];
  }, { i, scale });
  writeFileSync(path.join(outDir, `${prefix}-${String(i).padStart(2, '0')}.png`), Buffer.from(b64, 'base64'));
  process.stdout.write(`${i} `);
}
console.log('\nготово');
await browser.close();
server.close();
