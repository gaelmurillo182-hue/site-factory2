import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const KEY = 'lavitek-cookie-choice'

/**
 * Уведомление об аналитике. Прямой нормы, обязывающей ставить плашку,
 * в российском праве нет, но условия использования Яндекс Метрики обязывают
 * владельца сайта информировать посетителей об обработке их данных.
 *
 * Выбор запоминается локально и на каждой странице не переспрашивает.
 */
export default function CookieNotice() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true)
    } catch {
      // Приватный режим или запрет хранилища — плашку не показываем,
      // иначе она будет всплывать на каждой странице.
    }
  }, [])

  function choose(value: 'all' | 'necessary') {
    try {
      localStorage.setItem(KEY, value)
    } catch {
      /* хранилище недоступно — просто закрываем */
    }
    setShow(false)
  }

  if (!show) return null

  return (
    <aside className="lv-cookie" role="region" aria-label="Обработка данных посетителей">
      <p>
        Мы используем файлы cookie и сервис Яндекс Метрика, чтобы сайт работал корректно и
        чтобы понимать, какие страницы полезны посетителям. Продолжая работу с сайтом, вы
        соглашаетесь с обработкой этих данных в соответствии с{' '}
        <Link to="/pravovaya-informaciya">Политикой обработки персональных данных</Link>.
      </p>
      <div className="lv-cookie__actions">
        <button type="button" className="lv-btn lv-btn--primary" onClick={() => choose('all')}>
          Принять
        </button>
        <button type="button" className="lv-btn lv-btn--ghost" onClick={() => choose('necessary')}>
          Только необходимые
        </button>
      </div>
    </aside>
  )
}
