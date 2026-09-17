import Reveal from './motion/Reveal'
import { BOX_ITEMS } from '../data/content'

export default function Box() {
  return (
    <section className="section section--surface" id="box" aria-labelledby="box-title">
      <div className="container">
        <div className="box__head">
          <h2 className="h2" id="box-title">
            Что не лежит в коробке с маркетплейса
          </h2>
          <div className="box__lead">
            <p className="text text--primary">
              Комплект из четырёх камер и регистратора стоит дёшево, и это честная цена
              за то, что в него входит. Если объект простой — гараж, одна дверь, розетка
              рядом, — его реально повесить самому за выходные. Мы не собираемся это
              отговаривать.
            </p>
            <p className="text">
              Разница видна на объектах посложнее. Ниже — восемь вещей, которые в коробку
              не кладут, потому что их нельзя положить в коробку.
            </p>
          </div>
        </div>

        <ol className="box__list">
          {BOX_ITEMS.map((item, i) => (
            <Reveal as="li" className="box__row" key={item.n} delay={Math.min(i, 3) * 0.05}>
              <div className="box__no">
                <span className="num">{item.n}</span>
              </div>

              <div className="box__cell box__cell--in">
                <p className="label">В коробке</p>
                <p className="box__in">{item.inBox}</p>
              </div>

              <div className="box__cell box__cell--do">
                <h3 className="h4 box__title">{item.title}</h3>
                <p className="text">{item.weDo}</p>
              </div>
            </Reveal>
          ))}
        </ol>

        <div className="box__out">
          <p className="box__verdict">
            Комплект с маркетплейса — это оборудование. Заказ у подрядчика — это
            работающая система и один человек, которому вы звоните, когда она перестала
            работать.
          </p>
          <a className="btn btn--primary" href="#lead">
            Обсудить объект на замере
          </a>
        </div>
      </div>
    </section>
  )
}
