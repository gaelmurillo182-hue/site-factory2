import { HAS_CLIENT_LOGO } from '../data/site'

type Props = {
  /** На тёмном фоне знак и слово перекрашиваются. */
  inverse?: boolean
  compact?: boolean
}

/**
 * Временный типографический знак.
 *
 * У клиента есть логотип в PNG, но файл не передан (brief/protect.md, раздел 9).
 * До передачи работает этот знак: угловая засечка листа плюс слово Geologica.
 * Когда файл придёт — HAS_CLIENT_LOGO переключается в true, сюда встаёт <img>,
 * ничего в вёрстке больше менять не нужно.
 */
export default function Logo({ inverse = false, compact = false }: Props) {
  if (HAS_CLIENT_LOGO) {
    return <img src="/logo.png" alt="ПРОТЕКТ" width={148} height={32} />
  }

  return (
    <span className={`logo${inverse ? ' logo--inverse' : ''}`}>
      <svg
        className="logo__mark"
        viewBox="0 0 32 32"
        width="32"
        height="32"
        aria-hidden="true"
        focusable="false"
      >
        {/* Угол листа с засечками — то же построение, что у рамок секций. */}
        <path d="M2 11V2h9" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <path d="M30 21v9h-9" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <rect
          x="9.5"
          y="9.5"
          width="13"
          height="13"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity="0.55"
        />
        <circle cx="16" cy="16" r="2.75" fill="currentColor" />
      </svg>

      <span className="logo__text">
        <span className="logo__word">ПРОТЕКТ</span>
        {!compact && <span className="logo__sub">Системы безопасности</span>}
      </span>
    </span>
  )
}
