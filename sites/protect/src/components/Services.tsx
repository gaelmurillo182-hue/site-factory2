import Reveal from './motion/Reveal'
import { ACTIVE_SERVICES } from '../data/content'

const [main, ...rest] = ACTIVE_SERVICES

export default function Services() {
  return (
    <section className="section" id="services" aria-labelledby="services-title">
      <div className="container">
        <div className="services__head">
          <h2 className="h2" id="services-title">
            Один подрядчик на весь объект
          </h2>
          <p className="lead">
            Камеры, доступ, сигнализация, сеть и питание — это один щиток, одна трасса и
            одна ответственность. Когда их делают три разные бригады, каждая следующая
            переделывает за предыдущей, а виноватого потом не найти.
          </p>
        </div>

        <div className="services__grid">
          <Reveal className="service service--main sheet">
            <span className="sheet__tick sheet__tick--tl" aria-hidden="true" />
            <span className="sheet__tick sheet__tick--br" aria-hidden="true" />
            <span className="sheet__no">01 / {String(ACTIVE_SERVICES.length).padStart(2, '0')}</span>

            {/* Текст делится на две колонки так, чтобы левая не оставалась
                наполовину пустой: первый абзац уходит под лид. */}
            <div className="service__main-head">
              <h3 className="h3 service__title">{main.title}</h3>
              {main.lead && <p className="service__lead">{main.lead}</p>}
              <p className="text service__body">{main.body[0]}</p>
            </div>

            <div className="service__main-rest">
              {main.body.slice(1).map((p) => (
                <p className="text service__body" key={p.slice(0, 24)}>
                  {p}
                </p>
              ))}
            </div>
          </Reveal>

          {rest.map((s, i) => (
            <Reveal
              /* Если в последнем ряду остаётся одна пустая ячейка, последняя
                 карточка растягивается на неё: дыра справа читается как ошибка
                 вёрстки, а не как воздух. */
              className={
                i === rest.length - 1 && rest.length % 4 === 3 ? 'service service--wide' : 'service'
              }
              key={s.id}
              delay={Math.min(i, 4) * 0.05}
            >
              <span className="service__index num" aria-hidden="true">
                {String(i + 2).padStart(2, '0')}
              </span>
              <h3 className="h4 service__title">{s.title}</h3>
              {s.body.map((p) => (
                <p className="text service__body" key={p.slice(0, 24)}>
                  {p}
                </p>
              ))}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
