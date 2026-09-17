// Кроп участка страницы PDF в PNG с увеличением — для проверки спорных ячеек.
// usage: node scripts/pdf-crop.mjs <in.pdf> <page> <x0> <y0> <x1> <y1> <out.png> [scale]
// координаты в долях страницы (0..1)
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';

const [, , pdfPath, pageNo, x0, y0, x1, y1, out, scaleArg = '6'] = process.argv;
const scale = Number(scaleArg);
const MIME = { '.mjs': 'text/javascript', '.js': 'text/javascript', '.map': 'application/json' };
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
await page.goto(base + '/');
await page.evaluate(async ({ base, pdfB64 }) => {
  const lib = await import(base + '/node_modules/pdfjs-dist/build/pdf.mjs');
  lib.GlobalWorkerOptions.workerSrc = base + '/node_modules/pdfjs-dist/build/pdf.worker.mjs';
  const raw = atob(pdfB64); const data = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) data[i] = raw.charCodeAt(i);
  window.__doc = await lib.getDocument({ data, useSystemFonts: true }).promise;
}, { base, pdfB64 });

const b64 = await page.evaluate(async ({ pageNo, scale, x0, y0, x1, y1 }) => {
  const p = await window.__doc.getPage(pageNo);
  const vp = p.getViewport({ scale });
  const full = document.createElement('canvas');
  full.width = Math.ceil(vp.width); full.height = Math.ceil(vp.height);
  const ctx = full.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, full.width, full.height);
  await p.render({ canvasContext: ctx, viewport: vp }).promise;
  const cw = Math.round((x1 - x0) * full.width), ch = Math.round((y1 - y0) * full.height);
  const crop = document.createElement('canvas'); crop.width = cw; crop.height = ch;
  crop.getContext('2d').drawImage(full, Math.round(x0 * full.width), Math.round(y0 * full.height), cw, ch, 0, 0, cw, ch);
  return crop.toDataURL('image/png').split(',')[1];
}, { pageNo: Number(pageNo), scale, x0: Number(x0), y0: Number(y0), x1: Number(x1), y1: Number(y1) });

writeFileSync(out, Buffer.from(b64, 'base64'));
console.log('written', out);
await browser.close(); server.close();
