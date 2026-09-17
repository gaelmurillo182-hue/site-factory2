// Генерация data/numbers-check.md из data/tables.json.
// Полный список числовых значений для сверки глазами по оригиналу.
import { readFileSync, writeFileSync } from 'node:fs';

const d = JSON.parse(readFileSync('data/tables.json', 'utf8'));
const anomalies = readFileSync('data/_anomalies.md', 'utf8');
const L = [];

L.push('# Сверка числовых значений');
L.push('');
L.push('Источник: `input/source.pdf` (28 стр.). Машинно выгружено из `data/tables.json`,');
L.push('которое собрано из текстового слоя PDF без ручного перенабора цифр.');
L.push('');
L.push('«Стр.» — **печатная** нумерация каталога (она на единицу меньше номера страницы PDF:');
L.push('печатная 08 = PDF 9). Сверять по печатному номеру в кружке внизу страницы.');
L.push('');
L.push('Разделители исходника, не читаемые шрифтом: `、` (перечисление) и разделитель диапазона');
L.push('в столбце зернистости. В выгрузке они уже развёрнуты в отдельные значения — кроме');
L.push('помеченных TODO.');
L.push('');
L.push(anomalies.trim());
L.push('');
L.push('---');
L.push('');
L.push('## Полная выгрузка значений');
L.push('');

let total = 0;
for (const t of d.tables) {
  L.push(`### ${t.id} — стр. ${t.printedPage} (PDF ${t.pdfPage}) — ${t.titleEn}`);
  L.push('');
  if (t.id === 'grade-list') {
    L.push('| Марка | Твёрдость HRA | Плотность г/см³ | Прочность на изгиб Н/мм² | Зернистость мкм |');
    L.push('|---|---|---|---|---|');
    for (const r of t.rows) { L.push(`| ${r[1]} | ${r[2]} | ${r[3]} | ${r[4]} | ${r[5]} |`); total += 4; }
  } else if (t.id === 'gy01-tolerances') {
    L.push('| Ø d, мм | Допуск, мм |');
    L.push('|---|---|');
    for (const r of t.rows) { L.push(`| ${r[0]} | ${r[1]} |`); total += 2; }
  } else if (t.id === 'gp01') {
    L.push('| Артикул | Габарит, мм | Ø отверстия, мм |');
    L.push('|---|---|---|');
    for (const r of t.rows) { L.push(`| ${r[0]} | ${r[1]} | ${r[2].join(' · ')} |`); total += 1 + r[2].length; }
  } else if (t.id === 'gx01-mandrel') {
    L.push('| Артикул | D1/D2*L, мм | Ø отверстия, мм | Угол обжатия, ° |');
    L.push('|---|---|---|---|');
    for (const r of t.rows) { L.push(`| ${r[0]} | ${r[1].join(' · ')} | ${r[2]} | ${r[3]} |`); total += r[1].length + 2; }
  } else {
    L.push('| Артикул | Габарит, мм | Ø отверстия, мм (' + '№' + ' значений) | Угол обжатия, ° |');
    L.push('|---|---|---|---|');
    for (const r of t.rows) {
      const holes = r[2].length ? `${r[2].join(' · ')} <sub>(${r[2].length})</sub>` : '—';
      L.push(`| ${r[0]} | ${r[1]} | ${holes} | ${r[3] === '' ? '**пусто**' : r[3]} |`);
      total += 1 + r[2].length + (r[3] === '' ? 0 : 1);
    }
  }
  L.push('');
}

L.push('---');
L.push('');
L.push(`Всего числовых значений в выгрузке: **${total}**.`);
L.push('');

writeFileSync('data/numbers-check.md', L.join('\n'), 'utf8');
console.log('data/numbers-check.md записан, значений:', total);
