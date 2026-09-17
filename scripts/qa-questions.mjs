#!/usr/bin/env node
// Итерация 3 — проверка пользы. Пятнадцать реальных вопросов, которые продажник
// задаёт базе в рабочий день. Смотрим, что ассистент находит.
// Запуск: node scripts/qa-questions.mjs [url]

import { chromium } from 'playwright'

const URL = process.argv[2] || 'http://127.0.0.1:5184/'

const QUESTIONS = [
  'сколько стоит бот для стоматологии',
  'что отвечать на возражение дорого',
  'кому продавать распознавание первички',
  'можно ли отправлять персональные данные в зарубежный ии',
  'какая подписка после сдачи проекта',
  'что делать если клиент говорит нейросети врут',
  'сколько стоит голосовой робот и когда он окупается',
  'что не берём в работу',
  'как заходить в холдинг',
  'чем открывать разговор с селлером на маркетплейсах',
  'что входит в аудит автоматизации',
  'какие вопросы задать на квалификации',
  'что нужно от клиента для запуска',
  'сколько стоит локальный контур',
  'что говорить про закон об ии',
]

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'ru-RU' })
await page.goto(URL, { waitUntil: 'networkidle' })
await page.waitForSelector('.page-header__title')

let empty = 0
for (const q of QUESTIONS) {
  await page.getByLabel('Вопрос к базе знаний').fill(q)
  await page.keyboard.press('Enter')
  await page.waitForTimeout(650)

  const last = page.locator('.msg:not(.msg--user) .msg__content').last()
  const first = (await last.locator('.prose > p, .prose > h3').first().innerText()).replace(/\s+/g, ' ').trim()
  const isEmpty = (await last.locator('.msg__source').innerText()).includes('нет')
  if (isEmpty) empty++
  console.log(`${isEmpty ? '  ПУСТО ' : '  ок    '} ${q}\n          → ${first.slice(0, 130)}`)
}

await browser.close()
console.log(`\nБез ответа: ${empty} из ${QUESTIONS.length}`)
