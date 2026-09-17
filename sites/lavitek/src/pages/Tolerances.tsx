import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import { Section, Head, Note, TableWrap, Check, Dim } from '../components/spec'
import { toleranceRows, roughnessRows } from '../data/alloys'
import { breadcrumbLd, faqLd } from '../data/schema'

const faq = [
  {
    q: 'Чем h6 отличается от h14?',
    a: 'Буква h означает, что верхнее отклонение равно нулю: деталь никогда не больше номинала, поле допуска уходит только в минус. Цифра — квалитет, то есть ширина поля. Для диаметра 10 мм h6 даёт от 9,991 до 10,000 мм, h14 — от 9,64 до 10,00 мм. Это не «точнее и грубее», а разный маршрут обработки: h14 — заготовка под шлифовку, h6 — шлифованный размер под посадку.',
  },
  {
    q: 'Что означает js?',
    a: 'Симметричное поле допуска: отклонения ± IT/2 относительно номинала. Для диаметра 10 мм js6 — это 10 ± 0,0055 мм.',
  },
  {
    q: 'Какая шероховатость достижима на твёрдом сплаве?',
    a: 'При обычном алмазном шлифовании режущего клина — Ra 1,25…0,63 мкм. У лучших образцов инструмента — Ra 0,32…0,16 мкм. Тонкое шлифование и полирование дают меньшие значения, но их нужно оговаривать отдельно: это заметно влияет на цену и срок.',
  },
]

export default function Tolerances() {
  const trail = [
    { name: 'Главная', path: '/' },
    { name: 'Допуски и шероховатость', path: '/dopuski' },
  ]

  return (
    <>
      <Seo
        title="Допуски h6 и h14, квалитеты, шероховатость"
        description="Предельные отклонения полей h6 и h14 по диапазонам размеров, что означают h, js и квалитет IT, достижимая шероховатость Ra при алмазной обработке."
        path="/dopuski"
        jsonLd={[breadcrumbLd(trail), faqLd(faq)]}
      />
      <Breadcrumbs trail={trail} />

      <Section tight>
        <div className="lv-split">
          <Head as="h1" eyebrow="Справочник" title="Допуски и шероховатость" />
          <div className="lv-prose">
            <p className="lv-lead">
              Система допусков — по ГОСТ 25346-2013 и ГОСТ 25347-2013, эквивалентам
              ISO 286. Параметры шероховатости — по ГОСТ 2789-73.
            </p>
            <p>
              Страница нужна для одного разговора: когда в заявке написано «стержень 10 мм»,
              а нужно понять, речь о заготовке под шлифовку или о готовом размере под
              посадку. Разница в цене и сроке — принципиальная.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="sunk">
        <Head
          no="01"
          title="Как читается обозначение"
          lead="Буква задаёт положение поля допуска относительно номинала, цифра — его ширину."
        />
        <div className="lv-cols-2">
          <div className="lv-prose">
            <p>
              <strong>h — основной вал.</strong> Верхнее отклонение равно нулю, поле уходит
              только в минус. Максимальный размер детали совпадает с номинальным. Для
              твердосплавного стержня это ключевое свойство: стержень h6 диаметром 10 мм
              никогда не больше 10,000 мм, а значит гарантированно войдёт в отверстие H7.
            </p>
            <p>
              <strong>Цифра — квалитет IT.</strong> Чем больше число, тем шире поле и грубее
              размер. IT6 для диаметра 10 мм — это 9 мкм, IT14 — 360 мкм, разница в сорок
              раз.
            </p>
            <p>
              <strong>js — симметричное поле:</strong> ± IT/2 относительно номинала.
            </p>
          </div>
          <div>
            <p style={{ fontSize: 'var(--t-2xs)', letterSpacing: 'var(--tr-caps)', textTransform: 'uppercase', color: 'var(--ink-faint)', marginBottom: 'var(--s-4)' }}>
              Пример записи
            </p>
            <p style={{ fontSize: 'var(--t-3xl)' }}>
              <Dim value="⌀ 12" unit="h6" upper="0" lower="−0,011" />
            </p>
            <p style={{ marginTop: 'var(--s-4)', color: 'var(--ink-soft)', maxWidth: '36ch' }}>
              Диаметр двенадцать, поле h6: фактический размер от 11,989 до 12,000 мм.
              Так это выглядит в чертеже и так же должно выглядеть в спецификации к договору.
            </p>
          </div>
        </div>
      </Section>

      <Section>
        <Head
          no="02"
          title="Предельные отклонения h6 и h14"
          lead="Верхнее отклонение для поля h равно нулю, нижнее равно минус величине квалитета."
        />
        <TableWrap caption="Предельные отклонения по ГОСТ 25347-2013 (ISO 286-2)">
          <thead>
            <tr>
              <th scope="col">Номинальный размер, мм</th>
              <th scope="col">IT6, мкм</th>
              <th scope="col">h6: верх / низ, мм</th>
              <th scope="col">IT14, мкм</th>
              <th scope="col">h14: верх / низ, мм</th>
            </tr>
          </thead>
          <tbody>
            {toleranceRows.map((r) => (
              <tr key={r.range}>
                <th scope="row">{r.range}</th>
                <td data-num>{r.it6}</td>
                <td data-num>{r.h6}</td>
                <td data-num>{r.it14}</td>
                <td data-num>{r.h14}</td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
        <Note tone="signal">
          Часть популярных справочников публикует под заголовком IT14 значения ряда IT11 —
          столбцы у них сдвинуты. Приведённые здесь цифры соответствуют ряду ISO 286; для
          ответственного размера сверяйтесь с официальным текстом ГОСТ 25347-2013.
        </Note>
      </Section>

      <Section tone="sunk">
        <div className="lv-split">
          <Head no="03" title="Шероховатость после алмазной обработки" />
          <div>
            <TableWrap caption="Достижимые значения Ra">
              <thead>
                <tr>
                  <th scope="col">Операция</th>
                  <th scope="col">Ra, мкм</th>
                </tr>
              </thead>
              <tbody>
                {roughnessRows.map((r) => (
                  <tr key={r.op}>
                    <th scope="row">
                      {r.op}
                      {r.check && (
                        <Check reason="значение из каталогов поставщиков, нормативным документом не подтверждено" />
                      )}
                    </th>
                    <td data-num>{r.ra}</td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
            <Note tone="tech">
              Шероховатость почти всегда дороже допуска. Если по функции узла достаточно
              Ra 0,63 — не стоит закладывать 0,16: срок вырастет, а работать будет так же.
              Мы скажем об этом при расчёте, если увидим запас в чертеже.
            </Note>
          </div>
        </div>
      </Section>

      <Section>
        <Head no="04" eyebrow="Вопросы" title="Что уточняют по допускам" />
        <div className="lv-faq">
          {faq.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <div className="lv-faq__body">{f.a}</div>
            </details>
          ))}
        </div>
        <p style={{ marginTop: 'var(--s-6)' }}>
          <Link className="lv-more" to="/ntd">
            Перечень нормативных документов
          </Link>
        </p>
      </Section>
    </>
  )
}
