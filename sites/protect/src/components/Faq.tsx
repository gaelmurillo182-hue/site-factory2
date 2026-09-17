import { useState } from 'react'
import { Plus, Minus } from '@phosphor-icons/react'
import { motion, useReducedMotion } from 'motion/react'
import { FAQ } from '../data/content'

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  const reduce = useReducedMotion()

  return (
    <section className="section" id="faq" aria-labelledby="faq-title">
      <div className="container container--prose">
        <h2 className="h2 faq__title" id="faq-title">
          Что спрашивают до заказа
        </h2>

        <div className="faq__list">
          {FAQ.map((item, i) => {
            const isOpen = open === i
            return (
              <div className={`faq__item${isOpen ? ' faq__item--open' : ''}`} key={item.q}>
                <h3 className="faq__q-wrap">
                  <button
                    type="button"
                    className="faq__q"
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    id={`faq-q-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <span className="faq__q-text">{item.q}</span>
                    <span className="faq__icon" aria-hidden="true">
                      {isOpen ? <Minus size={18} weight="bold" /> : <Plus size={18} weight="bold" />}
                    </span>
                  </button>
                </h3>

                {/* Раскрытие — смена состояния, её видно: ответ въезжает,
                    а не появляется рывком. Двигаем только opacity и transform,
                    высоту меняет сам поток, без анимации height. */}
                <div
                  className="faq__a"
                  id={`faq-a-${i}`}
                  role="region"
                  aria-labelledby={`faq-q-${i}`}
                  hidden={!isOpen}
                >
                  {item.a.map((p, k) => (
                    <motion.p
                      className="text"
                      key={p.slice(0, 24)}
                      initial={reduce || !isOpen ? false : { opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: reduce ? 0 : 0.25,
                        delay: reduce ? 0 : k * 0.05,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      {p}
                    </motion.p>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
