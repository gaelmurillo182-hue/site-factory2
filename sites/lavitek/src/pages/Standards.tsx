import { Link } from 'react-router-dom'
import Seo from '../components/Seo'
import Breadcrumbs from '../components/layout/Breadcrumbs'
import { Section, Head, Note, TableWrap } from '../components/spec'
import { standards, type Standard } from '../data/alloys'
import { breadcrumbLd } from '../data/schema'

const groups: Standard['group'][] = [
  'Марки и материал',
  'Изделия',
  'Методы испытаний',
  'Допуски и шероховатость',
]

export default function Standards() {
  const trail = [
    { name: 'Главная', path: '/' },
    { name: 'Нормативные документы', path: '/ntd' },
  ]

  return (
    <>
      <Seo
        title="НТД: ГОСТы на твёрдые сплавы и методы испытаний"
        description="Стандарты отрасли твёрдых сплавов: марки и материал, изделия, методы определения твёрдости, плотности и прочности при изгибе, допуски и шероховатость."
        path="/ntd"
        jsonLd={[breadcrumbLd(trail)]}
      />
      <Breadcrumbs trail={trail} />

      <Section tight>
        <div className="lv-split">
          <Head as="h1" eyebrow="Справочник" title="Нормативные документы" />
          <div className="lv-prose">
            <p className="lv-lead">
              Стандарты, применяемые в отрасли твёрдых сплавов. Список справочный: на эти
              документы ссылаются в чертежах, спецификациях и при входном контроле.
            </p>
            <Note tone="signal">
              Это перечень отраслевых стандартов, а не заявление о соответствии нашей
              продукции каждому из них. Конкретный ГОСТ становится обязательством, когда он
              указан в вашем чертеже или спецификации к договору — тогда мы и работаем по
              нему.
            </Note>
          </div>
        </div>
      </Section>

      {groups.map((g, i) => {
        const rows = standards.filter((s) => s.group === g)
        return (
          <Section key={g} tone={i % 2 === 0 ? 'sunk' : 'paper'}>
            <Head no={String(i + 1).padStart(2, '0')} title={g} />
            <TableWrap caption={g}>
              <thead>
                <tr>
                  <th scope="col">Обозначение</th>
                  <th scope="col">Название</th>
                  <th scope="col">Что регламентирует</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.code}>
                    <th scope="row">{s.code}</th>
                    <td>{s.name}</td>
                    <td>
                      {s.what}
                      {s.note && (
                        <>
                          <br />
                          <span style={{ color: 'var(--ink-faint)' }}>{s.note}</span>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </Section>
        )
      })}

      <Section>
        <div className="lv-split">
          <Head no="05" title="Как это используется в закупке" />
          <div className="lv-prose">
            <p>
              ГОСТ 24297-2013 связывает объём входного контроля со стабильностью качества
              поставщика: чем предсказуемее партии, тем меньше нужно проверять на каждой
              поставке. Поэтому марку сплава мы фиксируем письменно в спецификации, а
              повторный заказ идёт по той же марке и тому же чертежу.
            </p>
            <p>
              Методы, которыми проверяют партию, тоже стандартные: твёрдость по Роквеллу
              (ГОСТ 20017-74), плотность (ГОСТ 20018-74), предел прочности при поперечном
              изгибе (ГОСТ 20019-74), пористость и микроструктура (ГОСТ 9391-80). Если у вас
              есть требования к протоколу — назовите их в запросе, обсудим до размещения
              заказа.
            </p>
            <Note tone="tech">
              Характеристики марок — в разделе <Link to="/splavy">«Марки сплавов»</Link>,
              поля допусков и шероховатость — в разделе{' '}
              <Link to="/dopuski">«Допуски и шероховатость»</Link>.
            </Note>
          </div>
        </div>
      </Section>
    </>
  )
}
