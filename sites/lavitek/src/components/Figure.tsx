import type { Media } from '../data/media'

/**
 * Кадр с подписью и, если лицензия того требует, с атрибуцией.
 *
 * CC BY и CC BY-SA обязывают назвать автора и лицензию рядом с изображением —
 * без этого использование неправомерно. Строка короткая и намеренно неброская,
 * но она есть на каждом таком кадре.
 */
export default function Figure({
  media,
  priority,
  width = 1400,
  height = 933,
}: {
  media: Media
  priority?: boolean
  width?: number
  height?: number
}) {
  return (
    <figure className="lv-figureimg">
      <img
        src={media.src}
        alt={media.alt}
        width={width}
        height={height}
        loading={priority ? undefined : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
      />
      <figcaption>
        {media.caption}
        {media.credit ? '.' : null}
        {media.credit && (
          <span className="lv-figureimg__credit">
            {' '}
            Фото:{' '}
            <a href={media.credit.page} rel="noopener nofollow" target="_blank">
              {media.credit.author}
            </a>
            ,{' '}
            <a href={media.credit.licenseUrl} rel="noopener nofollow license" target="_blank">
              {media.credit.license}
            </a>
          </span>
        )}
      </figcaption>
    </figure>
  )
}
