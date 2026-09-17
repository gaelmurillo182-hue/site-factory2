import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { contacts } from '../data/site'

/**
 * Форма запроса расчёта.
 *
 * Серверного обработчика у сайта пока нет, и подставлять сюда чужой сервис
 * нельзя: с 01.07.2025 ч. 5 ст. 18 152-ФЗ запрещает первичный сбор
 * персональных данных россиян в базы за пределами РФ (именно на этом
 * попадал старый сайт, отправлявший заявки в Supabase).
 *
 * Поэтому форма собирает письмо и открывает почтовый клиент: данные никуда,
 * кроме почты клиента, не уходят. Как только появится обработчик на
 * российском хостинге, здесь меняется одна функция submit.
 */

type Fields = {
  name: string
  phone: string
  email: string
  company: string
  message: string
}

const empty: Fields = { name: '', phone: '', email: '', company: '', message: '' }

export default function RequestForm({
  subject = 'Запрос расчёта',
  hint,
}: {
  subject?: string
  hint?: string
}) {
  const [v, setV] = useState<Fields>(empty)
  const [agreed, setAgreed] = useState(false)
  const [sent, setSent] = useState(false)
  const ids = {
    name: useId(),
    phone: useId(),
    email: useId(),
    company: useId(),
    message: useId(),
    consent: useId(),
  }

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setV((prev) => ({ ...prev, [k]: e.target.value }))

  const ready = agreed && v.name.trim().length > 1 && v.phone.trim().length > 4

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!ready) return
    const body = [
      `Имя: ${v.name}`,
      `Телефон: ${v.phone}`,
      v.email && `Почта: ${v.email}`,
      v.company && `Компания: ${v.company}`,
      '',
      v.message,
      '',
      '— Отправлено с сайта. Согласие на обработку персональных данных получено.',
    ]
      .filter(Boolean)
      .join('\n')
    window.location.href = `mailto:${contacts.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  return (
    <form className="lv-form" onSubmit={submit} noValidate>
      {hint && <p className="lv-fineprint">{hint}</p>}

      <div className="lv-field">
        <label className="lv-field__label" htmlFor={ids.name}>
          Имя <span className="lv-field__req">*</span>
        </label>
        <input
          id={ids.name}
          className="lv-input"
          name="name"
          autoComplete="name"
          required
          value={v.name}
          onChange={set('name')}
        />
      </div>

      <div className="lv-cols-2">
        <div className="lv-field">
          <label className="lv-field__label" htmlFor={ids.phone}>
            Телефон <span className="lv-field__req">*</span>
          </label>
          <input
            id={ids.phone}
            className="lv-input"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            value={v.phone}
            onChange={set('phone')}
          />
        </div>
        <div className="lv-field">
          <label className="lv-field__label" htmlFor={ids.email}>
            Почта
          </label>
          <input
            id={ids.email}
            className="lv-input"
            name="email"
            type="email"
            autoComplete="email"
            value={v.email}
            onChange={set('email')}
          />
        </div>
      </div>

      <div className="lv-field">
        <label className="lv-field__label" htmlFor={ids.company}>
          Предприятие
        </label>
        <input
          id={ids.company}
          className="lv-input"
          name="company"
          autoComplete="organization"
          value={v.company}
          onChange={set('company')}
        />
      </div>

      <div className="lv-field">
        <label className="lv-field__label" htmlFor={ids.message}>
          Что нужно
        </label>
        <textarea
          id={ids.message}
          className="lv-textarea"
          name="message"
          value={v.message}
          onChange={set('message')}
          placeholder="Изделие, типоразмер, марка сплава или условия работы, количество, срок…"
        />
      </div>

      <div className="lv-formnote">
        <strong>Чертёж присылайте на почту или в мессенджер</strong> — так он дойдёт
        в исходном формате: {' '}
        <a href={`mailto:${contacts.email}`}>{contacts.email}</a>,{' '}
        <a href={contacts.whatsapp} rel="noopener">
          WhatsApp
        </a>{' '}
        или{' '}
        <a href={contacts.telegram} rel="noopener">
          Telegram
        </a>{' '}
        на {contacts.phoneMobile.human}.
        <br />
        <br />
        Чертежи используем только для расчёта и не передаём третьим лицам, кроме
        производственной площадки по вашему заказу.{' '}
        <Link to="/pravovaya-informaciya">Условия по документации и NDA</Link>.
      </div>

      <label className="lv-consent" htmlFor={ids.consent}>
        <input
          id={ids.consent}
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        <span>
          Я даю согласие{' '}
          <span className="lv-todo">[[НУЖНО ОТ КЛИЕНТА: точное наименование, ИП или ООО]]</span> на
          обработку моих персональных данных — имени, номера телефона, адреса электронной
          почты, названия компании и сведений, указанных мной в тексте обращения и в
          приложенных файлах, — с целью рассмотрения моего запроса, подготовки расчёта и
          коммерческого предложения и связи со мной. Согласие действует до его отзыва и может
          быть отозвано письменным заявлением на {contacts.email}. Я ознакомлен(а) с{' '}
          <Link to="/pravovaya-informaciya">Политикой обработки персональных данных</Link>.
        </span>
      </label>

      <div>
        <button className="lv-btn lv-btn--primary" type="submit" disabled={!ready}>
          Отправить запрос
        </button>
        {/*
          Кнопка неактивна до согласия — этого требует ч. 1 ст. 9 152-ФЗ.
          Но молча неактивная кнопка выглядит как поломка, поэтому говорим,
          чего не хватает.
        */}
        {!ready && (
          <p className="lv-fineprint" style={{ marginTop: 'var(--s-3)' }} aria-live="polite">
            Чтобы отправить, заполните имя и телефон и отметьте согласие на обработку данных.
          </p>
        )}
      </div>

      {sent && (
        <p className="lv-fineprint" role="status">
          Открываем ваш почтовый клиент с готовым письмом — его нужно отправить самому.
          Если клиент не открылся, напишите на <a href={`mailto:${contacts.email}`}>{contacts.email}</a> или позвоните{' '}
          <a href={`tel:${contacts.phoneOffice.tel}`}>{contacts.phoneOffice.human}</a>.
        </p>
      )}

      <p className="lv-fineprint">
        Отправка заявки не является заказом и не влечёт обязательств сторон. Мы свяжемся с
        вами, уточним параметры и направим счёт или коммерческое предложение с точными
        сроками и ценой.
      </p>
    </form>
  )
}
