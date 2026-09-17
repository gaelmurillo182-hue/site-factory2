/**
 * Кадры разделов и позиций.
 *
 * Два источника, и они по-разному ограничены.
 *
 * 1. **Wikimedia Commons** — реальные фотографии изделий. Берём только файлы,
 *    лицензия которых разрешает коммерческое использование: CC0, общественное
 *    достояние, CC BY, CC BY-SA. У каждого записаны автор, лицензия и ссылка
 *    на страницу файла; для CC BY и CC BY-SA атрибуция обязательна и выводится
 *    в подписи под кадром. Реестр — sites/lavitek/commons-registry.json,
 *    отбор делался глазами по контактному листу: поиск по ключевым словам
 *    приносит и гравюры XIX века, и косплей.
 *
 * 2. **Своя генерация** — фактуры и атмосфера там, где реальной фотографии с
 *    подходящей лицензией не нашлось. Такие кадры не изображают конкретное
 *    изделие и подписаны как иллюстративные.
 *
 * Чего здесь нет и быть не может: снимков из поисковой выдачи, Пинтереста и
 * каталогов конкурентов. Это чужие фотографии под обычным авторским правом,
 * и на коммерческом сайте они стоят претензии.
 *
 * Файлы лежат в public/texture и подключаются абсолютным путём: так один и тот
 * же адрес получается и в клиентской сборке, и в серверном рендере предрендера.
 */

export type Media = {
  src: string
  /** Что изображено. Читает скринридер и индексирует поисковик. */
  alt: string
  /** Видимая подпись под кадром. */
  caption: string
  /** Атрибуция для лицензий, которые её требуют. */
  credit?: { author: string; license: string; licenseUrl: string; page: string }
}

const CC_BY_SA_3 = 'https://creativecommons.org/licenses/by-sa/3.0'
const CC_BY_SA_4 = 'https://creativecommons.org/licenses/by-sa/4.0'
const CC_BY_3 = 'https://creativecommons.org/licenses/by/3.0'

/** Сгенерированный кадр: не изображает конкретное изделие. */
const own = (alt: string, src: string): Media => ({
  src,
  alt,
  caption: `${alt}. Иллюстративный кадр, не съёмка производства`,
})

/** Фотография с Wikimedia Commons. Автор и лицензия обязательны в подписи. */
const commons = (
  alt: string,
  file: string,
  author: string,
  license: string,
  licenseUrl: string,
  page: string,
): Media => ({
  src: `/texture/items/${file}`,
  alt,
  caption: alt,
  credit: { author, license, licenseUrl, page },
})

export const directionMedia: Record<string, Media> = {
  volocheniye: own('Бухты тянутой стальной проволоки', '/texture/03-wire.jpg'),
  'press-osnastka': own('Участок холодной штамповки', '/texture/04-press.jpg'),
  zagotovki: own('Макро шлифованной металлической поверхности', '/texture/05-ground.jpg'),
  metallurgiya: own('Прокатный передел, съёмка в расфокусе', '/texture/06-hotmill.jpg'),
  neftegaz: own('Макро металла, изношенного потоком с абразивом', '/texture/07-erosion.jpg'),
  mashinostroenie: own('Макро обработанной металлической поверхности', '/texture/08-machined.jpg'),
}

const itemOwn: Record<string, Media> = {
  // ── Реальные фотографии изделий, Wikimedia Commons ────────────────
  'voloki-fileryi': commons(
    'Волочильные доски с рядами фильер разного диаметра',
    'voloki-fileryi.jpg',
    'Mauro Cateb',
    'CC BY-SA 3.0',
    CC_BY_SA_3,
    'https://commons.wikimedia.org/wiki/File:Draw_plates.jpg',
  ),
  matritsy: commons(
    'Штамповка на прессе: заготовка в матрице',
    'matritsy.jpg',
    'F. Broer',
    'CC BY-SA 3.0',
    CC_BY_SA_3,
    'https://commons.wikimedia.org/wiki/File:Drop_forging_Gesenkschmieden.jpg',
  ),
  'vstavki-dlya-vysadki': commons(
    'Крепёж с высаженной головкой под внутренний шестигранник',
    'vstavki-dlya-vysadki.jpg',
    'Phiarc',
    'CC BY-SA 4.0',
    CC_BY_SA_4,
    'https://commons.wikimedia.org/wiki/File:DIN_914-like_1-4%22-20_UNC_x_9.5mm_hex_socket_screws.jpg',
  ),
  sterzhni: commons(
    'Цельнотвердосплавный инструмент, изготовленный из стержней',
    'sterzhni.jpg',
    'Splarka',
    'Public domain',
    'https://en.wikipedia.org/wiki/Public_domain',
    'https://commons.wikimedia.org/wiki/File:Tungsten_carbide.jpg',
  ),
  plastiny: commons(
    'Твердосплавная пластина, напаянная на стальной корпус',
    'plastiny.jpg',
    'Eike87',
    'CC BY-SA 3.0',
    CC_BY_SA_3,
    'https://commons.wikimedia.org/wiki/File:Carbide-tipped_jaws.JPG',
  ),
  shariki: commons(
    'Прецизионные шарики разных диаметров',
    'shariki.jpg',
    'Lucasbosch',
    'CC BY-SA 3.0',
    CC_BY_SA_3,
    'https://commons.wikimedia.org/wiki/File:Silicon_nitride_Si3N4_bearing_balls_1%E2%80%9320_mm.jpg',
  ),
  'sopla-abrazivnye': commons(
    'Абразивоструйная обработка поверхности',
    'sopla-abrazivnye.jpg',
    'National Institute for Occupational Safety and Health',
    'Public domain',
    'https://en.wikipedia.org/wiki/Public_domain',
    'https://commons.wikimedia.org/wiki/File:Sandblasting_with_protective_gear_(9245784107).jpg',
  ),
  'provodka-kanatnaya': commons(
    'Стальной канат на барабане',
    'provodka-kanatnaya.jpg',
    'W. Carter',
    'CC0',
    'https://creativecommons.org/publicdomain/zero/1.0',
    'https://commons.wikimedia.org/wiki/File:Steel_wire_rope_on_a_drum.jpg',
  ),
  'drosselnye-pary': commons(
    'Фонтанная арматура устья скважины',
    'drosselnye-pary.jpg',
    'HartmannValves',
    'CC BY 3.0',
    CC_BY_3,
    'https://commons.wikimedia.org/wiki/File:Wellhead_Bohrlochkopf.JPG',
  ),
  'koltsa-iznosostoykie': commons(
    'Металлические кольца разных типоразмеров',
    'koltsa-iznosostoykie.jpg',
    'CEphoto, Uwe Aranas',
    'CC BY-SA 3.0',
    CC_BY_SA_3,
    'https://commons.wikimedia.org/wiki/File:Lens-ring-gaskets-01.jpg',
  ),
  'gidromonitornye-nasadki': commons(
    'Шарошечное буровое долото с промывочными насадками',
    'gidromonitornye-nasadki.jpg',
    'Techcollector',
    'CC BY-SA 3.0',
    CC_BY_SA_3,
    'https://commons.wikimedia.org/wiki/File:Rollenmeissel_17.5inch.jpg',
  ),
  vtulki: commons(
    'Втулки скольжения',
    'vtulki.jpg',
    'MT Aerospace AG, Augsburg',
    'CC BY-SA 3.0',
    CC_BY_SA_3,
    'https://commons.wikimedia.org/wiki/File:CMCGleitlager.jpg',
  ),

  // ── Своя генерация: фотографии с подходящей лицензией не нашлось ──
  'voloki-dlya-trub': own('Торцы бесшовных труб', '/texture/items/voloki-dlya-trub.jpg'),
  'opravki-trubnye': own('Полированный металлический стержень', '/texture/items/opravki-trubnye.jpg'),
}

export function itemMedia(dirSlug: string, itemSlug: string): Media | null {
  return itemOwn[itemSlug] ?? directionMedia[dirSlug] ?? null
}

/**
 * Обложка направления для карты каталога.
 *
 * Абстрактная фактура на карте не работает: шесть плиток с макро металла
 * неотличимы друг от друга. Поэтому обложкой берём реальную фотографию первой
 * позиции направления, у которой она есть, и только если такой нет —
 * возвращаемся к фактуре.
 */
export function directionCover(dirSlug: string, itemSlugs: string[]): Media | null {
  for (const slug of itemSlugs) {
    const m = itemOwn[slug]
    if (m?.credit) return m
  }
  return directionMedia[dirSlug] ?? null
}
