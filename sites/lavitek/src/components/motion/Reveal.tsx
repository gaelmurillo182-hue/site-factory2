import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Появление блока при прокрутке.
 *
 * Своя реализация на IntersectionObserver, а не библиотека: анимация здесь
 * одна, и тянуть ради неё пакет незачем. Двигаем только transform и opacity,
 * старт не со scale(0), при prefers-reduced-motion эффекта нет вовсе —
 * блок сразу виден.
 */
export default function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
}: {
  children: ReactNode
  delay?: number
  as?: 'div' | 'section' | 'li'
}) {
  const ref = useRef<HTMLElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          // Показываем и тогда, когда блок уже уехал вверх: при быстрой прокрутке
          // или нажатии End он мог ни разу не пересечься с окном и остался бы
          // прозрачным навсегда.
          if (e.isIntersecting || e.boundingClientRect.top < 0) {
            setShown(true)
            io.disconnect()
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref as never}
      data-reveal={shown ? 'in' : 'out'}
      style={{ transitionDelay: delay ? `${delay}ms` : undefined }}
    >
      {children}
    </Tag>
  )
}
