/** Готовые блоки JSON-LD. Собираются из констант, чтобы не расходиться с сайтом. */
import { site, contacts } from './site'

export const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: site.name,
  url: site.origin + '/',
  description:
    'Прямой импорт и изготовление изделий из карбида вольфрама, в том числе по чертежам заказчика. Поставка по России.',
  telephone: contacts.phoneOffice.human,
  email: contacts.email,
  address: {
    '@type': 'PostalAddress',
    postalCode: contacts.address.postalCode,
    addressLocality: contacts.address.city,
    streetAddress: contacts.address.street,
    addressCountry: 'RU',
  },
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: contacts.phoneOffice.human,
      contactType: 'sales',
      areaServed: 'RU',
      availableLanguage: 'Russian',
    },
  ],
}

export const localBusinessLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: site.name,
  url: site.origin + '/',
  telephone: contacts.phoneOffice.human,
  email: contacts.email,
  openingHours: contacts.hoursSchema,
  address: {
    '@type': 'PostalAddress',
    postalCode: contacts.address.postalCode,
    addressLocality: contacts.address.city,
    streetAddress: contacts.address.street,
    addressCountry: 'RU',
  },
  areaServed: { '@type': 'Country', name: 'Россия' },
}

export function breadcrumbLd(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: site.origin + (t.path === '/' ? '/' : t.path),
    })),
  }
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  }
}

/**
 * Product без цены и без availability: наличия склада мы не подтверждали,
 * а «price: 0 / InStock» на старом сайте — недостоверные данные в разметке.
 */
export function productLd(name: string, description: string, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    url: site.origin + path,
    material: 'Карбид вольфрама (твёрдый сплав)',
    category: 'Твердосплавные изделия',
    brand: { '@type': 'Brand', name: site.name },
  }
}
