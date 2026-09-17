/**
 * Постоянные величины проекта. Всё, что здесь, взято из материалов клиента
 * и аудита действующего сайта. Ничего выдуманного тут быть не должно.
 */

export const site = {
  name: 'Лавитек Твердые Сплавы',
  shortName: 'Лавитек',
  // Домен кириллический; в разметке и sitemap используется punycode-форма,
  // иначе часть парсеров ломается на не-ASCII в href.
  origin: 'https://xn----7sbbachm5apqmvuh3dwh.xn--p1ai',
  originHuman: 'карбид-вольфрама.рф',
  locale: 'ru_RU',
} as const

export const contacts = {
  phoneOffice: { human: '+7 (343) 206-04-66', tel: '+73432060466' },
  phoneMobile: { human: '+7 901 454-15-71', tel: '+79014541571' },
  whatsapp: 'https://wa.me/79014541571',
  telegram: 'https://t.me/89014541571',
  email: 'vdv@lavitek.ru',
  address: {
    postalCode: '620138',
    city: 'Екатеринбург',
    street: 'ул. Чистопольская, д. 13, офис 214',
    full: '620138, Екатеринбург, ул. Чистопольская, д. 13, офис 214',
  },
  hours: 'ПН–ПТ, 09:00–18:00',
  hoursSchema: 'Mo-Fr 09:00-18:00',
} as const

/** Факты, которые разрешено писать без оговорок. Источник — материалы клиента. */
export const facts = {
  leadTime: 'от 14 дней',
  tolerance: 'до 0,01 мм',
  standards: 'ГОСТ и ISO',
  scope: 'прямой импорт и изготовление изделий из карбида вольфрама',
} as const
