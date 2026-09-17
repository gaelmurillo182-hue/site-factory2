import Reveal from './motion/Reveal'
import PlanDrawing from './PlanDrawing'
import { CONTACTS, MONEY } from '../data/site'
import { SERVICES_COUNT, SERVICES_COUNT_WORD } from '../data/content'
import film from '../assets/texture/01-film-light.jpg'

const FACTS = [
  { value: 'С 2023 года', note: 'Работаем в Екатеринбурге и по Свердловской области' },
  {
    value: `${SERVICES_COUNT} направлений`,
    note: 'Один подрядчик вместо четырёх бригад на объекте',
  },
  { value: `Замер ${MONEY.survey}`, note: 'Сумма засчитывается в заказ' },
]

export default function Hero() {
  return (
    <section className="hero grid-field" id="top" aria-labelledby="hero-title">
      <img className="hero__film" src={film} alt="" aria-hidden="true" fetchPriority="high" />
      <div className="container hero__grid">
        <div className="hero__copy">
          <p className="label hero__eyebrow">
            Екатеринбург и Свердловская область. С 2023 года
          </p>

          <h1 className="h1 hero__title" id="hero-title">
            Видеонаблюдение и охранные системы, которые работают через год после
            монтажа
          </h1>

          <p className="lead hero__lead">
            {SERVICES_COUNT_WORD.replace(/^./, (c) => c.toUpperCase())} систем, свой
            инженер и своя бригада, один договор и один ответственный за результат.
          </p>

          <div className="hero__actions">
            <a className="btn btn--primary" href="#lead">
              Вызвать инженера на замер
            </a>
            <a className="btn btn--ghost" href="#calc">
              Собрать состав системы
            </a>
          </div>

          <p className="note hero__micro">
            Позвонить:{' '}
            <a className="link" href={CONTACTS.phoneHref}>
              {CONTACTS.phone}
            </a>
          </p>
        </div>

        <Reveal className="hero__plan" offset={16} delay={0.08}>
          <PlanDrawing />
        </Reveal>
      </div>

      <div className="container hero__facts">
        {FACTS.map((f, i) => (
          <Reveal className="fact" key={f.value} delay={i * 0.07}>
            <span className="fact__value num">{f.value}</span>
            <span className="fact__note">{f.note}</span>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
