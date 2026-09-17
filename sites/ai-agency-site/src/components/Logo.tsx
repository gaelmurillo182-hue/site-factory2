import { COMPANY } from '../content'

/**
 * Знак «Свод» — плоский свод из трёх камней. Швы сходятся в точке под
 * конструкцией, поэтому средний камень клиновидный и заклинивается.
 * Цвет наследуется через currentColor: знак ставится только на плоскую заливку.
 */
export function Mark({ size = 28 }: { size?: number }) {
  return (
    <svg
      className="logo__mark"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      style={{ width: size, height: size }}
    >
      <polygon points="4,4 18,4 24.93,60 4,60" />
      <polygon points="22,4 42,4 35.07,60 28.93,60" />
      <polygon points="46,4 60,4 60,60 39.07,60" />
    </svg>
  )
}

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <a className="logo" href="#/" aria-label={`${COMPANY.name} — на главную`}>
      <Mark size={size} />
      <span className="logo__word">{COMPANY.name}</span>
    </a>
  )
}
