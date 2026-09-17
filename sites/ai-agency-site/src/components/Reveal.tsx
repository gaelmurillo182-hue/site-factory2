import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Появление секции при прокрутке. Анимируются только opacity и transform.
 * При prefers-reduced-motion правило в CSS показывает содержимое сразу,
 * поэтому здесь дополнительной проверки не нужно.
 */
export function Reveal({ children, as: Tag = 'div' }: { children: ReactNode; as?: 'div' | 'section' }) {
  const ref = useRef<HTMLElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || shown) return
    if (typeof IntersectionObserver === 'undefined') { setShown(true); return }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) { setShown(true); io.disconnect() }
      },
      { rootMargin: '0px 0px -12% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [shown])

  return (
    <Tag ref={ref as never} className="reveal" data-shown={shown}>
      {children}
    </Tag>
  )
}
