import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
  /** Задержка в секундах — для лесенки внутри одной группы. */
  delay?: number
  /** Сдвиг по вертикали до появления, px. */
  offset?: number
  as?: 'div' | 'li' | 'article' | 'section'
}

/**
 * Появление при попадании в кадр. Двигаем только opacity и transform.
 * При prefers-reduced-motion элемент просто отрисован — без начального состояния.
 */
export default function Reveal({
  children,
  className,
  delay = 0,
  offset = 18,
  as = 'div',
}: Props) {
  const reduce = useReducedMotion()
  const Tag = motion[as]

  return (
    <Tag
      className={className}
      initial={reduce ? false : { opacity: 0, y: offset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  )
}
