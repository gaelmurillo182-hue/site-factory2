import { motion, useReducedMotion } from 'motion/react'
import type { ComponentPropsWithoutRef } from 'react'

/* ============================================================
   Отклик на действие: кнопки и кнопки-ссылки.
   Подъём 2px на hover, лёгкое сжатие на tap — пружина, не линейка.
   prefers-reduced-motion отключает whileHover/whileTap целиком.
   ============================================================ */

const TAP_SPRING = { type: 'spring', stiffness: 420, damping: 26, mass: 0.6 } as const

type MotionAProps = ComponentPropsWithoutRef<typeof motion.a>
type MotionButtonProps = ComponentPropsWithoutRef<typeof motion.button>

export function MotionLink(props: MotionAProps) {
  const reduced = useReducedMotion()
  return (
    <motion.a
      {...props}
      whileHover={reduced ? undefined : { y: -2 }}
      whileTap={reduced ? undefined : { scale: 0.98 }}
      transition={TAP_SPRING}
    />
  )
}

export function MotionButtonEl(props: MotionButtonProps) {
  const reduced = useReducedMotion()
  return (
    <motion.button
      {...props}
      whileHover={reduced ? undefined : { y: -2 }}
      whileTap={reduced ? undefined : { scale: 0.98 }}
      transition={TAP_SPRING}
    />
  )
}
