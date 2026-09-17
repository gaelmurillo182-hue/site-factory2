import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import CtaBand from '../components/CtaBand'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import { Section, Head, Note } from '../components/spec'
import { breadcrumbLd } from '../data/schema'

/**
 * Отрасли — вторая ось навигации по каталогу: инженер знает свою отрасль
 * и не обязан знать, в каком разделе лежит нужная позиция.
 *
 * Раньше страница была третьим по счёту списком тех же позиций — шесть
 * блоков с кадром, текстом и выноской на 5800px. Это и создавало ощущение
 * «одно и то же в трёх местах». Теперь это компактный указатель.
 */
const industries = [
  {
    t: 'Метизное производство',
    what: 'Волочение проволоки и прутка, калибровка, холодная высадка крепежа.',
    wear: 'Изнашивается калибрующий поясок волоки: ушёл поясок — ушёл диаметр проволоки.',
    links: [
      { title: 'Волоки и фильеры', to: '/catalog/volocheniye/voloki-fileryi' },
      { title: 'Заготовки волок', to: '/catalog/volocheniye/zagotovki-volok' },
      { title: 'Вставки для высадки', to: '/catalog/press-osnastka/vstavki-dlya-vysadki' },
    ],
  },
  {
    t: 'Металлургия и прокат',
    what: 'Чистовые блоки проволочных станов, сортовые станы, тянущие и направляющие узлы.',
    wear: 'Истирание ручья окалиной и термическая сетка трещин от циклического охлаждения.',
    links: [
      { title: 'Прокатные ролики', to: '/catalog/metallurgiya/prokatnye-roliki' },
      { title: 'Бандажи для валков', to: '/catalog/metallurgiya/bandazhi-valkov' },
      { title: 'Канатная проводка', to: '/catalog/metallurgiya/provodka-kanatnaya' },
    ],
  },
  {
    t: 'Нефтегазовое оборудование',
    what: 'Дроссельные и клапанные узлы, промывочные насадки, детали против гидроабразива.',
    wear: 'Деталь работает в паре и прирабатывается вместе с ответной — меняют пару целиком.',
    links: [
      { title: 'Дроссельные пары', to: '/catalog/neftegaz/drosselnye-pary' },
      { title: 'Клапанные пары', to: '/catalog/neftegaz/klapannye-pary' },
      { title: 'Гидромониторные насадки', to: '/catalog/neftegaz/gidromonitornye-nasadki' },
    ],
  },
  {
    t: 'Машиностроение и ремонт',
    what: 'Узлы трения, направляющие, уплотнения, детали насосов.',
    wear: 'Считают не цену детали, а стоимость незапланированной остановки линии.',
    links: [
      { title: 'Втулки твердосплавные', to: '/catalog/mashinostroenie/vtulki' },
      { title: 'Износостойкие кольца', to: '/catalog/mashinostroenie/koltsa-iznosostoykie' },
      { title: 'Шарики твердосплавные', to: '/catalog/zagotovki/shariki' },
    ],
  },
  {
    t: 'Инструментальное производство',
    what: 'Участки со своей шлифовкой, электроэрозией и заточкой.',
    wear: 'Критерий выбора один — повторяемость: изменилось зерно, и режимы не попадают в размер.',
    links: [
      { title: 'Стержни твердосплавные', to: '/catalog/zagotovki/sterzhni' },
      { title: 'Пластины-заготовки', to: '/catalog/zagotovki/plastiny' },
      { title: 'Матрицы', to: '/catalog/press-osnastka/matritsy' },
    ],
  },
  {
    t: 'Холодная штамповка',
    what: 'Автоматы холодной высадки, прессование порошков, брикетирование.',
    wear: 'Нагрузка циклическая и ударная: сплав выбирают по прочности при изгибе, а не по твёрдости.',
    links: [
      { title: 'Матрицы', to: '/catalog/press-osnastka/matritsy' },
      { title: 'Пуансоны', to: '/catalog/press-osnastka/puansony' },
      { title: 'Пресс-оснастка', to: '/catalog/press-osnastka' },
    ],
  },
]

export default function Industries() {
  const trail = [
    { name: 'Главная', path: '/' },
    { name: 'Отрасли применения', path: '/otrasli' },
  ]

  return (
    <>
      <Seo
        title="Отрасли применения твердосплавных изделий"
        description="Где применяются изделия из карбида вольфрама: метизное производство, металлургия, нефтегазовое оборудование, машиностроение, холодная штамповка."
        path="/otrasli"
        jsonLd={[breadcrumbLd(trail)]}
      />
      <Breadcrumbs trail={trail} />

      <Section tight>
        <div className="lv-split">
          <Head as="h1" eyebrow="Отрасли" title="Найти по своей задаче" />
          <div className="lv-prose">
            <p className="lv-lead">
              Второй способ дойти до нужной позиции: не через каталог, а через свою отрасль.
              По каждой — что именно изнашивается и какие позиции спрашивают чаще.
            </p>
            <Note tone="signal">
              Это описание применения материала, а не перечень заказчиков. Список выполненных
              поставок появится здесь, когда будет согласовано, о каких работах можно
              рассказывать публично.
            </Note>
          </div>
        </div>
      </Section>

      <Section tone="sunk">
        <div className="lv-spec">
          {industries.map((ind, i) => (
            <div className="lv-branch" key={ind.t}>
              <span className="lv-branch__no">{String(i + 1).padStart(2, '0')}</span>
              <div className="lv-branch__body">
                <h2 className="lv-branch__title">{ind.t}</h2>
                <p className="lv-branch__what">{ind.what}</p>
                <p className="lv-branch__wear">{ind.wear}</p>
              </div>
              <ul className="lv-branch__links">
                {ind.links.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to}>{l.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section tight>
        <div className="lv-split">
          <Head no="01" title="Отрасли нет в списке" />
          <div className="lv-prose">
            <p>
              Материал один и тот же, меняются условия. Опишите узел — что происходит,
              с какой скоростью, при какой температуре, есть ли абразив и удар. Если ставить
              туда твёрдый сплав смысла нет — так и скажем.
            </p>
            <p>
              <Link className="lv-more" to="/po-chertezhu">
                Что прислать для расчёта
              </Link>
            </p>
          </div>
        </div>
      </Section>

      <CtaBand />
    </>
  )
}
