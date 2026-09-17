import Reveal from './motion/Reveal'
import { OBJECT_GROUPS } from '../data/content'
import wash from '../assets/texture/05-wash-pale.jpg'

export default function Objects() {
  return (
    <section className="section objects" id="objects" aria-labelledby="objects-title">
      <img className="objects__wash" src={wash} alt="" aria-hidden="true" loading="lazy" />

      <div className="container objects__inner">
        <div className="objects__head">
          <h2 className="h2" id="objects-title">
            Объект любой. Разница в задаче, а не в размере
          </h2>
          <p className="lead">
            Однокомнатная квартира и склад на тысячу метров решают разные задачи и требуют
            разного оборудования. Одинаково в них одно: сначала мы спрашиваем, что вы
            хотите видеть на записи, и только потом называем состав системы.
          </p>
        </div>

        <div className="objects__groups">
          {OBJECT_GROUPS.map((group, gi) => (
            <Reveal className="objgroup" key={group.title} delay={gi * 0.07}>
              <h3 className="objgroup__title label label--accent">{group.title}</h3>
              <dl className="objgroup__list">
                {group.items.map((item) => (
                  <div className="objgroup__item" key={item.name}>
                    <dt className="objgroup__name">{item.name}</dt>
                    <dd className="objgroup__task">{item.task}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          ))}
        </div>

        <p className="note objects__foot">
          Вашего типа объекта в списке нет — звоните. Список закрывает то, с чем к нам
          приходят чаще всего. Редкий объект это не отказ, а разговор.
        </p>
      </div>
    </section>
  )
}
