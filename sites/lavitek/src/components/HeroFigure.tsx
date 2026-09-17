import { useEffect, useState, type ComponentType } from 'react'
import { DieSvg } from './DieDiagram'

type ViewerProps = { tone?: 'paper' | 'dark' }

/**
 * Фигура первого экрана: объёмная волока в разрезе.
 *
 * Серверный рендер отдаёт плоскую схему с подписями зон — она читается сразу,
 * весит килобайты и не двигается. Уже в браузере на её место встаёт объёмная
 * модель тем же профилем. Пропорции карточки одинаковые, поэтому подмена не
 * дёргает вёрстку.
 *
 * При `prefers-reduced-motion` модель не грузится вовсе: остаётся схема.
 * React.lazy здесь не подходит — при серверном рендере граница Suspense
 * остаётся незавершённой и ломает гидратацию.
 */
export default function HeroFigure() {
  const [Viewer, setViewer] = useState<ComponentType<ViewerProps> | null>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let alive = true
    import('./DieViewer').then((m) => {
      if (alive) setViewer(() => m.default)
    })
    return () => {
      alive = false
    }
  }, [])

  return (
    <figure className="lv-die">
      {Viewer ? <Viewer tone="paper" /> : <DieSvg />}
      <figcaption className="lv-die__cap">
        Волока в разрезе: вход, обжатие, калибровка, выход. Размер держит калибрующий
        поясок — по его выработке и определяют момент перешлифовки.
      </figcaption>
    </figure>
  )
}
