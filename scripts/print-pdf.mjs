// Печать каталога в PDF через headless Chromium (Playwright) и сшивка.
// Обложки — отдельным проходом без полей и колонтитула; блок — с полями 18 мм
// и повторяющимся колонтитулом (логотип + колонцифра).
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { PDFDocument } from 'pdf-lib';

mkdirSync('output', { recursive: true });

// логотип в колонтитул — data-URI, внешние ресурсы в шаблон не подгружаются
const logoSvg = existsSync('input/logo.svg')
  ? readFileSync('input/logo.svg', 'utf8')
  : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 26">
       <rect x="1" y="1" width="198" height="24" rx="2" fill="none" stroke="#8a949b"
             stroke-width="1.5" stroke-dasharray="4 3"/>
       <text x="100" y="17.5" text-anchor="middle" font-family="Segoe UI, sans-serif"
             font-size="12" font-weight="700" letter-spacing="2.2" fill="#14304a">ЛАВИТЕК</text>
     </svg>`;
const logoUri = 'data:image/svg+xml;base64,' + Buffer.from(logoSvg, 'utf8').toString('base64');

const headerTemplate = `
<div style="width:100%;font-family:'Segoe UI',sans-serif;font-size:7pt;color:#79848b;
            padding:0 18mm;box-sizing:border-box;display:flex;align-items:center;
            justify-content:space-between;border-bottom:0;">
  <img src="${logoUri}" style="height:7mm;width:auto;display:block;">
  <span style="letter-spacing:.08em;text-transform:uppercase;">Каталог продукции</span>
</div>`;

const footerTemplate = `
<div style="width:100%;font-family:'Segoe UI',sans-serif;font-size:7pt;color:#79848b;
            padding:0 18mm;box-sizing:border-box;display:flex;align-items:center;
            justify-content:space-between;">
  <span>ООО «ЛАВИТЕК» · Екатеринбург</span>
  <span style="font-weight:700;color:#14304a;"><span class="pageNumber"></span></span>
</div>`;

const browser = await chromium.launch();
const ctx = await browser.newContext();

async function render(file, opts) {
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push(String(e)));
  await page.goto(pathToFileURL(path.resolve(file)).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const buf = await page.pdf({
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: false,
    ...opts,
  });
  if (errs.length) console.warn(`  [${file}] ошибки страницы:`, errs.slice(0, 5));
  await page.close();
  return buf;
}

const zero = { top: '0', bottom: '0', left: '0', right: '0' };
const coverPdf = await render('build/catalog-cover.html', { margin: zero });
const backPdf = await render('build/catalog-back.html', { margin: zero });
const bodyPdf = await render('build/catalog-body.html', {
  // Верхнее поле 24 мм: 18 мм наборной полосы плюс место под колонтитул с логотипом,
  // который Chromium рисует внутри поля. Остальные поля — ровно 18 мм.
  margin: { top: '24mm', bottom: '16mm', left: '18mm', right: '18mm' },
  displayHeaderFooter: true,
  headerTemplate,
  footerTemplate,
});

await browser.close();

// ─── сшивка ──────────────────────────────────────────────────────────────
const out = await PDFDocument.create();
out.setTitle('Каталог твердосплавных волок (фильер)');
out.setAuthor('ООО «ЛАВИТЕК»');
out.setSubject('Твердосплавные волоки для волочения проволоки, прутка, трубы и профиля');
out.setKeywords(['волока', 'фильера', 'твёрдый сплав', 'волочение', 'ЛАВИТЕК']);
out.setProducer('site-factory');
out.setCreator('ООО «ЛАВИТЕК»');

let n = 0;
for (const buf of [coverPdf, bodyPdf, backPdf]) {
  const src = await PDFDocument.load(buf);
  const pages = await out.copyPages(src, src.getPageIndices());
  pages.forEach(p => out.addPage(p));
  n += src.getPageCount();
}

writeFileSync('output/catalog-lavitek.pdf', await out.save());
console.log(`output/catalog-lavitek.pdf — ${n} стр., ${(readFileSync('output/catalog-lavitek.pdf').length / 1048576).toFixed(2)} МБ`);
console.log(`  обложка 1 + блок ${(await PDFDocument.load(bodyPdf)).getPageCount()} + задняя обложка 1`);
