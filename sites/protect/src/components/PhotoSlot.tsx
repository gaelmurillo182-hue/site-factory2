import { HAS_CLIENT_PHOTOS } from '../data/site'

type Props = {
  /** Что именно сюда встаёт, когда клиент пришлёт файл. */
  need: string
  /** Соотношение сторон слота, например '16 / 9'. */
  ratio?: string
  className?: string
}

/**
 * Слот под документальное фото объекта.
 *
 * Камеру на фасаде, щиток, бригаду и экран регистратора генерировать нельзя
 * (docs/06-ГЕНЕРАЦИЯ-ИЗОБРАЖЕНИЙ.md, граница честности): человек приедет
 * по адресу и сверит увиденное с реальностью. Пока фото не переданы,
 * на их месте стоит честный слот, а не картинка из модели.
 *
 * Когда фото придут — HAS_CLIENT_PHOTOS переключается в true,
 * и слоты заменяются на <img> в местах вызова.
 */
export default function PhotoSlot({ need, ratio = '4 / 3', className }: Props) {
  if (HAS_CLIENT_PHOTOS) return null

  return (
    <div
      className={className ? `photo-slot ${className}` : 'photo-slot'}
      style={{ aspectRatio: ratio }}
      role="img"
      aria-label={`Место под фотографию: ${need}. Фотография будет добавлена.`}
    >
      <span className="photo-slot__grid" aria-hidden="true" />
      <span className="photo-slot__label">
        <span className="photo-slot__kicker">Фото объекта</span>
        <span className="photo-slot__need">{need}</span>
      </span>
    </div>
  )
}
