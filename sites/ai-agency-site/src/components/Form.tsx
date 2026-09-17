import { useState } from 'react'
import { COMPANY } from '../content'

/**
 * Форма заявки.
 *
 * Куда уходят заявки, владелец ещё не решил (протокол совета §6). Пока адресат
 * не назначен, форма не делает вид, что отправляет: она честно говорит, что
 * канал не подключён, и предлагает написать напрямую. Ложная кнопка «отправлено»
 * на сайте, который продаёт честность, — самое дорогое, что здесь можно сделать.
 *
 * Два чекбокса разделены намеренно: согласие на обработку данных и согласие
 * на рекламные сообщения — разные согласия, объединять их нельзя.
 */
export function Form() {
  const [pd, setPd] = useState(false)
  const [ads, setAds] = useState(false)
  const [sent, setSent] = useState(false)

  const endpointReady = COMPANY.email !== null

  return (
    <form
      className="form"
      onSubmit={(e) => {
        e.preventDefault()
        if (endpointReady) setSent(true)
      }}
    >
      {!endpointReady && (
        <p className="notice">
          Приём заявок ещё не подключён: владелец не назначил адресата.
          До этого момента форма ничего не отправляет и сайт не публикуется.
          <span className="todo" style={{ marginLeft: 'var(--s-2)' }}>
            НУЖНО ОТ ВЛАДЕЛЬЦА: куда уходят заявки
          </span>
        </p>
      )}

      <div className="field">
        <label htmlFor="f-name">Как к вам обращаться</label>
        <input id="f-name" name="name" type="text" autoComplete="name" required />
      </div>

      <div className="field">
        <label htmlFor="f-contact">Телефон или мессенджер для ответа</label>
        <input id="f-contact" name="contact" type="text" required />
      </div>

      <div className="field">
        <label htmlFor="f-task">Что происходит сейчас и что хочется изменить</label>
        <textarea id="f-task" name="task" required />
      </div>

      <label className="consent">
        <input type="checkbox" checked={pd} onChange={(e) => setPd(e.target.checked)} required />
        <span>
          Согласен на обработку персональных данных на условиях{' '}
          <a className="link" href="#/politika">политики обработки</a>. Без этого
          согласия мы не сможем вам ответить.
        </span>
      </label>

      <label className="consent">
        <input type="checkbox" checked={ads} onChange={(e) => setAds(e.target.checked)} />
        <span>
          Согласен получать сообщения рекламного характера. Это согласие
          необязательное — на ответ по заявке оно не влияет.
        </span>
      </label>

      <button className="btn btn--primary" type="submit" disabled={!endpointReady || !pd}>
        {sent ? 'Заявка отправлена' : 'Отправить заявку'}
      </button>

      <p style={{ fontSize: 'var(--t-xs)', color: 'var(--c-text-3)' }}>
        Отвечаем в рабочее время. Если по вашей задаче автоматизация не окупится —
        напишем об этом прямо в ответе, а не на созвоне.
      </p>
    </form>
  )
}
