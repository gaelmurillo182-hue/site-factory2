import Reveal from './motion/Reveal'
import { PROCESS } from '../data/content'

export default function Process() {
  return (
    <section className="section" id="process" aria-labelledby="process-title">
      <div className="container">
        <div className="process__head">
          <h2 className="h2" id="process-title">
            От звонка до обслуживания
          </h2>
          <p className="lead">
            Семь шагов. Пятый и шестой видно на объекте, остальные — на бумаге и в
            переписке. Мы описываем их подробно, чтобы вы понимали, за что платите на
            каждом этапе.
          </p>
        </div>

        <ol className="process__list">
          {PROCESS.map((s, i) => (
            <Reveal as="li" className="process__step" key={s.n} delay={Math.min(i, 3) * 0.05}>
              <div className="process__marker" aria-hidden="true">
                <span className="process__no num">{s.n}</span>
              </div>
              <div className="process__body">
                <h3 className="h4 process__title">{s.title}</h3>
                <p className="text">{s.body}</p>
                {'accent' in s && s.accent && <p className="process__accent">{s.accent}</p>}
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
