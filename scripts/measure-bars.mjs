// Измерение диаграммы «марка → диапазон Ø отверстия» со стр. 07 исходника.
// Диаграмма содержит китайский текст внутри картинки, поэтому её нельзя вставить
// как есть. Чтобы не выдумывать цифры на глаз, положение полос и шкалы снимается
// с растра по пикселям: ось калибруется по подписям 0…25, границы полос ищутся
// по цветным (не серым) пикселям в полосе строки.
import { chromium } from 'playwright';
import { readFileSync, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';

const SCALE = 6;
const PAGE = 8;

const MIME = { '.mjs': 'text/javascript', '.png': 'image/png' };
const root = process.cwd();
const server = createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/') { res.writeHead(200, { 'Content-Type': 'text/html' }); return res.end('<!doctype html><meta charset="utf-8"><body></body>'); }
  const f = path.join(root, url);
  if (!f.startsWith(root) || !existsSync(f)) { res.writeHead(404); return res.end('no'); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] ?? 'application/octet-stream' });
  res.end(readFileSync(f));
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

const pdfB64 = readFileSync('input/source.pdf').toString('base64');
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(base + '/');

const out = await page.evaluate(async ({ base, pdfB64, PAGE, SCALE }) => {
  const lib = await import(base + '/node_modules/pdfjs-dist/build/pdf.mjs');
  lib.GlobalWorkerOptions.workerSrc = base + '/node_modules/pdfjs-dist/build/pdf.worker.mjs';
  const raw = atob(pdfB64); const data = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) data[i] = raw.charCodeAt(i);
  const doc = await lib.getDocument({ data, useSystemFonts: true }).promise;
  const p = await doc.getPage(PAGE);
  const vp = p.getViewport({ scale: SCALE });
  const cv = document.createElement('canvas');
  cv.width = Math.ceil(vp.width); cv.height = Math.ceil(vp.height);
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
  await p.render({ canvasContext: ctx, viewport: vp }).promise;

  const W = cv.width, H = cv.height;
  const img = ctx.getImageData(0, 0, W, H).data;
  const at = (x, y) => { const i = (y * W + x) * 4; return [img[i], img[i + 1], img[i + 2]]; };
  const dark = (x, y) => { const [r, g, b] = at(x, y); return r < 110 && g < 110 && b < 110; };
  // цветной = заметно отличаются каналы (полосы диаграммы сине-сиреневые)
  const colored = (x, y) => {
    const [r, g, b] = at(x, y);
    if (r > 246 && g > 246 && b > 246) return false;
    return (Math.max(r, g, b) - Math.min(r, g, b)) > 12 && Math.min(r, g, b) > 60;
  };

  // ── шкала: строка подписей 0…25 под диаграммой ───────────────────────
  // ищем самую «густую» на тёмные пиксели строку в нижней трети диаграммы
  const y0 = Math.round(H * 0.80), y1 = Math.round(H * 0.90);
  let best = { y: y0, n: 0 };
  for (let y = y0; y < y1; y++) {
    let n = 0;
    for (let x = Math.round(W * 0.10); x < Math.round(W * 0.90); x++) if (dark(x, y)) n++;
    if (n > best.n) best = { y, n };
  }
  // берём полосу высотой ±6 px вокруг найденной строки и склеиваем колонки
  const cols = [];
  for (let x = Math.round(W * 0.10); x < Math.round(W * 0.92); x++) {
    let hit = false;
    for (let y = best.y - 8; y <= best.y + 8; y++) if (dark(x, y)) { hit = true; break; }
    cols.push(hit);
  }
  const xOff = Math.round(W * 0.10);
  const groups = [];
  let s = -1;
  for (let i = 0; i < cols.length; i++) {
    if (cols[i] && s < 0) s = i;
    if ((!cols[i] || i === cols.length - 1) && s >= 0) {
      if (i - s >= 2) groups.push([xOff + s, xOff + i]);
      s = -1;
    }
  }
  // склеиваем группы, разделённые < 10 px (цифры внутри одного числа)
  const labels = [];
  for (const g of groups) {
    const last = labels[labels.length - 1];
    if (last && g[0] - last[1] < 30) last[1] = g[1];
    else labels.push([...g]);
  }
  const centers = labels.map(([a, b]) => (a + b) / 2);

  // ── полосы: 6 строк марок над шкалой ────────────────────────────────
  const bandTop = Math.round(H * 0.60), bandBot = best.y - 25;
  const rows = [];
  let inRow = false, rs = 0;
  for (let y = bandTop; y < bandBot; y++) {
    let n = 0;
    for (let x = Math.round(W * 0.12); x < Math.round(W * 0.90); x++) if (colored(x, y)) n++;
    if (n > 25 && !inRow) { inRow = true; rs = y; }
    else if (n <= 25 && inRow) { inRow = false; if (y - rs > 8) rows.push([rs, y]); }
  }
  const bars = rows.map(([a, b]) => {
    const y = Math.round((a + b) / 2);
    let lo = Infinity, hi = -Infinity, run = 0, runStart = -1;
    for (let x = Math.round(W * 0.12); x < Math.round(W * 0.90); x++) {
      if (colored(x, y)) { if (run === 0) runStart = x; run++; }
      else { if (run > 20) { if (runStart < lo) lo = runStart; if (x - 1 > hi) hi = x - 1; } run = 0; }
    }
    if (run > 20) { if (runStart < lo) lo = runStart; hi = Math.round(W * 0.90); }
    return { yTop: a, yBot: b, xLo: lo, xHi: hi };
  });

  return { W, H, labelRowY: best.y, labelCount: centers.length, centers, bars };
}, { base, pdfB64, PAGE, SCALE });

await browser.close(); server.close();

console.log(`растр ${out.W}×${out.H}, строка подписей y=${out.labelRowY}`);
console.log(`найдено подписей шкалы: ${out.labelCount} (ожидается 26 — это 0…25)`);
if (out.labelCount < 20) { console.error('шкала не распозналась, измерение не проводится'); process.exit(1); }

const c = out.centers;
const x0 = c[0], x25 = c[25] ?? c[c.length - 1];
const nSpan = (c[25] !== undefined) ? 25 : c.length - 1;
const mm = px => (px - x0) / (x25 - x0) * nSpan;

console.log(`шкала: 0 мм = ${x0.toFixed(0)} px, ${nSpan} мм = ${x25.toFixed(0)} px, ` +
            `1 мм = ${((x25 - x0) / nSpan).toFixed(1)} px\n`);

const GRADES = ['GU10UF', 'GU10', 'GU20', 'GK05A', 'GK05', 'GK30H'];
console.log(`полос найдено: ${out.bars.length}`);
out.bars.forEach((b, i) => {
  console.log(`${(GRADES[i] ?? '?').padEnd(8)} ${mm(b.xLo).toFixed(1).padStart(5)} … ${mm(b.xHi).toFixed(1).padStart(5)} мм`);
});
