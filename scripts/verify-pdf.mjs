// Самопроверка готового PDF: иероглифы, следы исходного бренда, полнота чисел.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const PDF = 'output/catalog-lavitek.pdf';
execFileSync('pdftotext', ['-enc', 'UTF-8', '-layout', PDF, 'extract/verify.txt'], { stdio: 'ignore' });
const text = readFileSync('extract/verify.txt', 'utf8');
const pages = text.split('\f');

let fail = 0;
const ok = m => console.log('  OK   ' + m);
const bad = m => { fail++; console.log('  ПРОВАЛ ' + m); };

console.log('\n1) Иероглифы и следы исходного бренда');
const cjk = [...text.matchAll(/[　-〿㐀-䶿一-鿿＀-￯]/g)];
cjk.length ? bad(`найдено ${cjk.length} символов CJK: ${[...new Set(cjk.map(m => m[0]))].join(' ')}`)
           : ok('символов CJK нет');

const brand = /GEHM|XTC|Jiujiang|Xiamen|Golden\s*Egret|cxtc|gehm\.com/gi;
const hits = [...text.matchAll(brand)];
hits.length ? bad(`упоминания исходного бренда: ${[...new Set(hits.map(m => m[0]))].join(', ')}`)
            : ok('упоминаний GEHM / XTC / Jiujiang / Xiamen нет');

const contacts = [...text.matchAll(/[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}|https?:\/\/\S+|\+86[\d\s-]+/g)];
contacts.length ? bad(`посторонние контакты: ${[...new Set(contacts.map(m => m[0]))].join(', ')}`)
                : ok('китайских контактов, e-mail и URL нет');

console.log('\n2) Кириллица подхватилась (нет «квадратиков»)');
const tofu = [...text.matchAll(/[�□■]/g)];
const cyr = (text.match(/[А-Яа-яЁё]/g) || []).length;
tofu.length ? bad(`символов-заменителей: ${tofu.length}`) : ok('символов-заменителей нет');
cyr > 3000 ? ok(`кириллических букв в текстовом слое: ${cyr}`)
           : bad(`кириллицы подозрительно мало: ${cyr}`);

console.log('\n3) Сверка чисел с data/tables.json');
// в PDF десятичная запятая, в данных — точка; приводим к одному виду
const flat = text.replace(/(\d),(\d)/g, '$1.$2').replace(/[\s ]+/g, ' ');
const D = JSON.parse(readFileSync('data/tables.json', 'utf8'));
const skip = new Set(['1.0j2.0', '1.5j3.0', '2419', '1924', '']);   // TODO-01..04 и пустая ячейка
const missing = [];
let checked = 0;
for (const t of D.tables) {
  for (const row of t.rows) {
    for (const cell of row) {
      const vals = Array.isArray(cell) ? cell : [cell];
      for (const v of vals) {
        const s = String(v);
        if (skip.has(s)) continue;
        if (!/\d/.test(s)) continue;                       // не числовое — пропускаем
        // те же преобразования, что применяет вёрстка: см. dec/dim/spec/ang
        // в build/make-catalog.mjs и раздел «Оформление чисел» в data/glossary.md
        const norm = s
          .replace(/9\*7钢套：/, 'обойма 9×7: ')
          .replace(/[*x]/g, '×')
          .replace(/~/g, '–')
          .replace(/或/g, ' или ')
          .replace(/（/g, ' (').replace(/）/g, ')')
          .replace(/＜/g, '< ').replace(/＞/g, '> ');
        checked++;
        if (!flat.includes(norm)) missing.push(`${t.id} / ${row[0]} / «${s}»`);
      }
    }
  }
}
missing.length
  ? bad(`не найдено в PDF ${missing.length} из ${checked} значений:\n         ` + missing.slice(0, 25).join('\n         '))
  : ok(`все ${checked} числовых значений присутствуют в PDF`);

console.log('\n4) Полнота артикулов');
const items = D.tables.flatMap(t => t.rows.map(r => r[0])).filter(s => /^G[A-Z]?\d|^GX01/.test(s));
const lostItems = [...new Set(items)].filter(i => !text.includes(i));
lostItems.length ? bad(`нет в PDF: ${lostItems.join(', ')}`)
                 : ok(`все ${new Set(items).size} уникальных артикулов на месте`);

console.log('\n5) Структура и нумерация');
console.log(`  всего страниц: ${pages.length - 1}`);
const folios = pages.map(p => (p.match(/ООО «ЛАВИТЕК» · Екатеринбург\s+(\d+)\s*$/m) || [])[1]).filter(Boolean).map(Number);
const seq = folios.every((n, i) => n === i + 1);
seq ? ok(`колонцифры сквозные 1…${folios.length}, обложки не пронумерованы`)
    : bad(`нумерация с разрывами: ${folios.join(',')}`);

console.log('\n6) Пробелы, ожидающие данных клиента');
const todos = [...text.matchAll(/\[\[НУЖНО ОТ КЛИЕНТА: ([^\]]+)\]\]/g)].map(m => m[1].replace(/\s+/g, ' '));
console.log(`  меток в PDF: ${todos.length}`);
todos.forEach((t, i) => console.log(`   ${i + 1}. ${t.slice(0, 92)}`));

console.log(fail ? `\nИТОГ: провалов — ${fail}` : '\nИТОГ: все проверки пройдены');
process.exit(fail ? 1 : 0);
