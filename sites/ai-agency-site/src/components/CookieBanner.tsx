import { useEffect, useState } from 'react'

const KEY = 'svod.cookies'

/**
 * Баннер с двумя равноправными кнопками — требование юриста агентства.
 * Кнопка отказа не серая и не мельче: «принять» и «отклонить» весят одинаково.
 * Никаких счётчиков до явного согласия на сайте не подключается.
 */
export function CookieBanner() {
  const [choice, setChoice] = useState<string | null>('pending')

  useEffect(() => {
    try {
      setChoice(localStorage.getItem(KEY))
    } catch {
      setChoice(null)
    }
  }, [])

  if (choice !== null) return null

  const decide = (value: 'yes' | 'no') => {
    try {
      localStorage.setItem(KEY, value)
    } catch {
      /* приватный режим — решение действует до перезагрузки */
    }
    setChoice(value)
  }

  return (
    <div className="cookie" role="dialog" aria-label="Согласие на аналитику">
      <p>
        Сайт может собирать обезличенную статистику посещений. Аналитика
        не подключается, пока вы не согласитесь. Отказ ничего не ломает:
        сайт работает одинаково в обоих случаях.
      </p>
      <div className="cookie__actions">
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => decide('no')}>
          Отклонить
        </button>
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => decide('yes')}>
          Согласиться
        </button>
      </div>
    </div>
  )
}
