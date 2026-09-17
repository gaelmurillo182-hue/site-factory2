import Reveal from './motion/Reveal'
import { AUDIENCES } from '../data/content'

export default function Who() {
  return (
    <section className="section section--tight" id="who" aria-labelledby="who-title">
      <div className="container">
        <div className="who__head">
          <h2 className="h2" id="who-title">
            Половина заказов — дома и дачи. Половина — компании
          </h2>
          <p className="lead">
            Это два разных разговора. С собственником — про то, что он увидит на телефоне.
            С компанией — про регламент, документы и то, кто отвечает за объект.
          </p>
        </div>

        <div className="who__split">
          {AUDIENCES.map((a, i) => (
            <Reveal className="who__col" key={a.title} delay={i * 0.08}>
              <h3 className="h3 who__title">{a.title}</h3>
              <p className="text text--primary who__intro">{a.intro}</p>
              <ul className="ruled">
                {a.points.map((p) => (
                  <li key={p.slice(0, 20)}>{p}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
