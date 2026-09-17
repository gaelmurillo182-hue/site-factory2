import Reveal from './motion/Reveal'
import PhotoSlot from './PhotoSlot'
import { TECH } from '../data/content'
import { BRANDS } from '../data/site'
import band from '../assets/texture/02-deep-band.jpg'

export default function Tech() {
  return (
    <section className="section section--deep tech" id="tech" aria-labelledby="tech-title">
      <img className="tech__band" src={band} alt="" aria-hidden="true" loading="lazy" />

      <div className="container tech__inner">
        <div className="tech__head">
          <h2 className="h2" id="tech-title">
            С чем работаем
          </h2>
          <p className="tech__lead">
            Ниже — производители, оборудование которых мы закупаем и ставим. Не дилерство
            и не партнёрство: статусов у нас нет, и придумывать их мы не будем. Бренд и
            модель подбираем под задачу и бюджет объекта, а не наоборот.
          </p>
        </div>

        <Reveal className="brands">
          <p className="label label--inverse">Оборудование</p>
          <p className="brands__list">
            {BRANDS.map((b, i) => (
              <span key={b}>
                {b}
                {i < BRANDS.length - 1 && <span className="brands__sep" aria-hidden="true"> · </span>}
              </span>
            ))}
          </p>
          <p className="brands__note">
            Гарантия на оборудование действует согласно гарантийному сроку производителя.
          </p>
        </Reveal>

        <div className="tech__body">
          <div className="tech__list">
            <h3 className="h4 tech__subtitle">Что реально ставим и зачем это на объекте</h3>
            <dl>
              {TECH.map((t, i) => (
                <Reveal as="div" className="tech__row" key={t.name} delay={Math.min(i, 5) * 0.04}>
                  <dt className="tech__name">{t.name}</dt>
                  <dd className="tech__why">{t.why}</dd>
                </Reveal>
              ))}
            </dl>
          </div>

          <aside className="tech__aside">
            <PhotoSlot
              need="камера на кронштейне, регистратор в шкафу, узел коммутации"
              ratio="3 / 4"
              className="photo-slot--dark"
            />
            <p className="tech__aside-note">
              Фотографии смонтированного оборудования ставим только свои. Пока их нет на
              сайте, здесь стоит рамка, а не картинка с чужого объекта.
            </p>
          </aside>
        </div>
      </div>
    </section>
  )
}
