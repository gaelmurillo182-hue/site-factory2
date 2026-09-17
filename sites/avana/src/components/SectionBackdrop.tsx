/* Фоновая фактура секции.
   Изображения декоративные: материал и свет, а не работы мастеров
   и не интерьер салона. Поэтому alt пустой и aria-hidden.

   Секция-родитель обязана иметь position: relative, а её содержимое —
   position: relative, иначе подложка перекроет текст. */

interface SectionBackdropProps {
  src: string
  /** Плотность затемнения поверх фактуры, 0–1. Больше — тише фактура. */
  scrim?: number
  /** Тон затемнения: тёмные секции гасим фоном страницы, светлые — бумагой. */
  tone?: 'dark' | 'light'
  /** Смещение кадра, если интересное место уходит из виду. */
  position?: string
}

export default function SectionBackdrop({
  src,
  scrim = 0.82,
  tone = 'dark',
  position = 'center',
}: SectionBackdropProps) {
  const scrimColor =
    tone === 'dark'
      ? `color-mix(in srgb, var(--bg-page) ${Math.round(scrim * 100)}%, transparent)`
      : `color-mix(in srgb, var(--bg-light) ${Math.round(scrim * 100)}%, transparent)`

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      <img
        src={src}
        alt=""
        loading="lazy"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: position,
        }}
      />
      <div style={{ position: 'absolute', inset: 0, background: scrimColor }} />
    </div>
  )
}
