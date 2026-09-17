import { motion, useReducedMotion, type Variants } from 'motion/react'
import type { CSSProperties, ElementType, ReactNode } from 'react'

/* ============================================================
   Появление секций и стагger в сетках.
   Единственный источник вариантов — не дублировать в компонентах.
   Правила: только transform/opacity, выход быстрее входа,
   не стартовать со scale(0), prefers-reduced-motion вырождает
   в статичную разметку без анимации.
   ============================================================ */

export const EASE_ENTER = [0.16, 1, 0.3, 1] as const

/* Заголовок + подзаголовок секции: сначала заголовок, потом текст. */
const headingContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
}

const headingItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_ENTER } },
}

/* Сетки карточек: услуги, уровни мастера, фото работ, мастера, тарифы обучения. */
const gridContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.055 } },
}

const gridItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_ENTER } },
}

interface RevealProps {
  children: ReactNode
  as?: ElementType
  className?: string
  style?: CSSProperties
  id?: string
  /** Доля видимости элемента, при которой запускается анимация. */
  amount?: number
}

type StaticProps = RevealProps

function StaticEl({ as: Component = 'div', children, className, style, id }: StaticProps) {
  const Tag = Component as ElementType
  return (
    <Tag id={id} className={className} style={style}>
      {children}
    </Tag>
  )
}

/** motion.div / motion.h2 / motion.p и так далее — по имени тега. */
function motionTag(as: ElementType) {
  return (motion as unknown as Record<string, ElementType>)[as as string] ?? motion.div
}

/** Контейнер заголовка секции. Дети — HeadingItem. */
export function Reveal({ children, as = 'div', className, style, id, amount = 0.3 }: RevealProps) {
  const reduced = useReducedMotion()
  if (reduced) {
    return (
      <StaticEl as={as} className={className} style={style} id={id}>
        {children}
      </StaticEl>
    )
  }
  const M = motionTag(as)
  return (
    <M
      id={id}
      className={className}
      style={style}
      variants={headingContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
    >
      {children}
    </M>
  )
}

/** Дочерний элемент Reveal: наследует hidden/visible от родителя. */
export function RevealItem({ children, as = 'div', className, style, id }: Omit<RevealProps, 'amount'>) {
  const reduced = useReducedMotion()
  if (reduced) {
    return (
      <StaticEl as={as} className={className} style={style} id={id}>
        {children}
      </StaticEl>
    )
  }
  const M = motionTag(as)
  return (
    <M id={id} className={className} style={style} variants={headingItem}>
      {children}
    </M>
  )
}

/** Контейнер сетки карточек. Дети — StaggerItem. */
export function StaggerGrid({ children, as = 'div', className, style, id, amount = 0.15 }: RevealProps) {
  const reduced = useReducedMotion()
  if (reduced) {
    return (
      <StaticEl as={as} className={className} style={style} id={id}>
        {children}
      </StaticEl>
    )
  }
  const M = motionTag(as)
  return (
    <M
      id={id}
      className={className}
      style={style}
      variants={gridContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
    >
      {children}
    </M>
  )
}

/** Карточка внутри StaggerGrid. */
export function StaggerItem({ children, as = 'div', className, style, id }: Omit<RevealProps, 'amount'>) {
  const reduced = useReducedMotion()
  if (reduced) {
    return (
      <StaticEl as={as} className={className} style={style} id={id}>
        {children}
      </StaticEl>
    )
  }
  const M = motionTag(as)
  return (
    <M id={id} className={className} style={style} variants={gridItem}>
      {children}
    </M>
  )
}
