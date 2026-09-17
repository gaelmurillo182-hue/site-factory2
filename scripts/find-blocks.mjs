// Поиск точных границ прямоугольных изображений на странице PDF.
// usage: node scripts/find-blocks.mjs <in.pdf> <page> <xProbe 0..1>
// Печатает вертикальные диапазоны (в долях страницы), где вдоль колонки xProbe
// идут «серые» пиксели — то есть растровая вставка, а не фон и не текст.
import { chromium } from 'playwright';
import { readFileSync, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';

const [, , pdfPath, pageNo, xProbeArg = '0.25'] = process.argv;
const SCALE = 4;

const root = process.cwd();
const server = createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/') { res.writeHead(200, { 'Content-Type': 'text/html' }); return res.end('<!doctype html><meta charset="utf-8"><body></body>'); }
  const f = path.join(root, url);
  if (!f.startsWith(root) || !existsSync(f)) { res.writeHead(404); return res.end('no'); }
  res.writeHead(200, { 'Content-Type': 'text/javascript' });
  res.end(readFileSync(f));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;
const pdfB64 = readFileSync(pdfPath).toString('base64');

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(base + '/');
const bands = await page.evaluate(async ({ base, pdfB64, pageNo, SCALE, xProbe }) => {
  const lib = await import(base + '/node_modules/pdfjs-dist/build/pdf.mjs');
  lib.GlobalWorkerOptions.workerSrc = base + '/node_modules/pdfjs-dist/build/pdf.worker.mjs';
  const raw = atob(pdfB64); const data = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) data[i] = raw.charCodeAt(i);
  const doc = await lib.getDocument({ data, useSystemFonts: true }).promise;
  const p = await doc.getPage(pageNo);
  const vp = p.getViewport({ scale: SCALE });
  const cv = document.createElement('canvas');
  cv.width = Math.ceil(vp.width); cv.height = Math.ceil(vp.height);
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
  await p.render({ canvasContext: ctx, viewport: vp }).promise;
  const W = cv.width, H = cv.height;
  const img = ctx.getImageData(0, 0, W, H).data;
  const x = Math.round(xProbe * W);
  // «серый»: каналы близки друг к другу и яркость в средней зоне
  const grey = y => {
    const i = (y * W + x) * 4;
    const r = img[i], g = img[i + 1], b = img[i + 2];
    return Math.max(r, g, b) - Math.min(r, g, b) < 18 && r > 70 && r < 225;
  };
  const out = []; let s = -1;
  for (let y = 0; y < H; y++) {
    if (grey(y) && s < 0) s = y;
    else if (!grey(y) && s >= 0) { if (y - s > H * 0.02) out.push([s / H, y / H]); s = -1; }
  }
  if (s >= 0) out.push([s / H, 1]);
  return out;
}, { base, pdfB64, pageNo: Number(pageNo), SCALE, xProbe: Number(xProbeArg) });

await browser.close(); server.close();
console.log(`стр. ${pageNo}, зондирующая колонка x=${xProbeArg}: найдено блоков ${bands.length}`);
bands.forEach(([a, b], i) => console.log(`  ${i + 1}: y ${a.toFixed(4)} … ${b.toFixed(4)}  (высота ${(b - a).toFixed(4)})`));
