/**
 * Знак — сечение волоки. Наружный контур изделия и сквозной канал внутри:
 * входной конус, калибрующий поясок, выходной конус. Это буквально то, что
 * компания поставляет, и в 24px читается как плотный блок с узкой перемычкой.
 */

export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M2 2h28v28H2V2zm9.4 0L14.9 13.1v5.8L11.4 30h9.2l-3.5-11.1v-5.8L20.6 2h-9.2z"
      />
    </svg>
  )
}

export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="lv-logo" data-compact={compact || undefined}>
      <LogoMark className="lv-logo__mark" />
      <span className="lv-logo__words">
        <span className="lv-logo__name">Лавитек</span>
        {!compact && <span className="lv-logo__sub">твердые сплавы</span>}
      </span>
    </span>
  )
}
