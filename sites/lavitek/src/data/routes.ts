/**
 * Полный список маршрутов сайта.
 *
 * Единственный источник правды: по нему ходит предрендер (scripts/prerender.mjs)
 * и по нему собирается sitemap.xml (scripts/sitemap.mjs). Забыть строку здесь —
 * значит потерять страницу из обхода, поэтому руками список нигде не дублируется.
 *
 * Слаги /uslugi, /otrasli, /o-nas, /preimushchestva, /kontakty сохранены
 * с действующего сайта: они проиндексированы, менять их — терять набранное.
 */

import { directions } from './catalog'

export type RouteMeta = {
  path: string
  /** Короткое имя для хлебных крошек и меню. */
  name: string
  priority: number
}

const staticRoutes: RouteMeta[] = [
  { path: '/', name: 'Главная', priority: 1.0 },
  { path: '/catalog', name: 'Каталог', priority: 0.9 },
  { path: '/po-chertezhu', name: 'Изготовление по чертежу', priority: 0.9 },
  { path: '/splavy', name: 'Марки сплавов', priority: 0.9 },
  { path: '/dopuski', name: 'Допуски и шероховатость', priority: 0.8 },
  { path: '/ntd', name: 'Нормативные документы', priority: 0.7 },
  { path: '/uslugi', name: 'Услуги', priority: 0.8 },
  { path: '/otrasli', name: 'Отрасли', priority: 0.8 },
  { path: '/dostavka-i-oplata', name: 'Доставка и оплата', priority: 0.7 },
  { path: '/preimushchestva', name: 'Как мы работаем', priority: 0.7 },
  { path: '/o-nas', name: 'О компании', priority: 0.7 },
  { path: '/kontakty', name: 'Контакты', priority: 0.7 },
  { path: '/pravovaya-informaciya', name: 'Правовая информация', priority: 0.2 },
]

const catalogRoutes: RouteMeta[] = directions.flatMap((d) => [
  { path: `/catalog/${d.slug}`, name: d.title, priority: 0.8 },
  ...d.items.map((i) => ({
    path: `/catalog/${d.slug}/${i.slug}`,
    name: i.title,
    priority: 0.7,
  })),
])

export const routes: RouteMeta[] = [...staticRoutes, ...catalogRoutes]

export const routeName = (path: string) =>
  routes.find((r) => r.path === path)?.name ?? path

/**
 * Пути, перечисленные литералами, — чтобы предрендер и sitemap не зависели
 * от исполнения TypeScript. Список собирается автоматически из данных выше;
 * скрипты читают строки вида `path: '…'`, поэтому дублировать их не нужно.
 */
