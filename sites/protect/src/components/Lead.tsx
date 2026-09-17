import { useState, type FormEvent } from 'react'
import { CheckCircle, Phone, PaperPlaneTilt, Copy } from '@phosphor-icons/react'
import { CONTACTS, LEAD_ENDPOINT, MONEY } from '../data/site'
import stone from '../assets/texture/04-stone-cool.jpg'

type Errors = Partial<Record<'name' | 'address' | 'phone' | 'agree' | 'send', string>>

const DIGITS = /\d/g

/**
 * Заявка на замер. Три обязательных поля из брифа: ФИО, адрес объекта, телефон.
 *
 * Куда уходит заявка:
 *   — LEAD_ENDPOINT задан → POST на сервер, дальше почта и Telegram-бот;
 *   — LEAD_ENDPOINT пуст  → заявка никуда не отправляется. Показываем человеку
 *     собранную заявку и телефон. Ничего не имитируем: «отправлено» без
 *     отправки — это потерянный клиент, который думает, что ему перезвонят.
 *
 * WhatsApp как запасной канал не используется: домены мессенджера исключены
 * из НСДИ, кнопка бы не открывалась. См. data/site.ts, комментарий у CONTACTS.
 *
 * Вместе с заявкой уходит отметка о согласии с датой и временем: без неё
 * факт согласия в споре доказать нечем (ПОЛИТИКА-ПДН.md, часть 2).
 */
export default function Lead() {
  const [errors, setErrors] = useState<Errors>({})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [draft, setDraft] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  function validate(fd: FormData): Errors {
    const e: Errors = {}
    const name = String(fd.get('name') || '').trim()
    const address = String(fd.get('address') || '').trim()
    const phone = String(fd.get('phone') || '').trim()
    const agree = fd.get('agree')

    if (!name) e.name = 'Напишите, как к вам обращаться'
    if (!address) e.address = 'Укажите адрес объекта хотя бы до улицы'
    if (!phone) e.phone = 'Без телефона мы не сможем перезвонить'
    else if ((phone.match(DIGITS) || []).length < 10) e.phone = 'Проверьте номер: не хватает цифр'
    if (!agree) e.agree = 'Отметьте согласие на обработку данных'
    return e
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const fd = new FormData(form)
    const found = validate(fd)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      form.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus()
      return
    }

    const payload = {
      name: String(fd.get('name')).trim(),
      address: String(fd.get('address')).trim(),
      phone: String(fd.get('phone')).trim(),
      consent: {
        given: true,
        at: new Date().toISOString(),
        text: 'Согласие на обработку имени, телефона и адреса объекта для ответа на заявку',
      },
    }

    if (!LEAD_ENDPOINT) {
      setDraft(
        [
          'Заявка на замер',
          `Имя: ${payload.name}`,
          `Адрес объекта: ${payload.address}`,
          `Телефон: ${payload.phone}`,
        ].join('\n'),
      )
      setSent(true)
      return
    }

    setSending(true)
    try {
      const res = await fetch(LEAD_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(String(res.status))
      setSent(true)
      setDraft(null)
      form.reset()
    } catch {
      setErrors({
        send: `Заявка не ушла. Проверьте соединение и нажмите ещё раз. Если не получается — позвоните: ${CONTACTS.phone}.`,
      })
    } finally {
      setSending(false)
    }
  }

  async function copyDraft() {
    if (!draft) return
    try {
      await navigator.clipboard.writeText(draft)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className="section lead-section" id="lead" aria-labelledby="lead-title">
      <img className="lead-section__bg" src={stone} alt="" aria-hidden="true" loading="lazy" />

      <div className="container lead-section__inner">
        <div className="lead-section__copy">
          <p className="label label--accent">Замер</p>
          <h2 className="h2 lead-section__title" id="lead-title">
            Вызовите инженера на объект
          </h2>
          <p className="text text--primary">
            Инженер приедет, посмотрит объект и посчитает состав системы с ценой. Замер по
            городу — {MONEY.survey}, и эта сумма вычитается из стоимости заказа, если
            работы вы закажете нам. Ни к чему не обязывает: после замера вы получите схему
            точек и смету и решите сами.
          </p>

          <div className="lead-section__direct">
            <a className="lead-direct" href={CONTACTS.phoneHref}>
              <Phone size={20} weight="fill" aria-hidden="true" />
              <span>
                <span className="lead-direct__value num">{CONTACTS.phone}</span>
                <span className="lead-direct__note">Не любите формы — звоните</span>
              </span>
            </a>

            {CONTACTS.telegram && (
              <a className="lead-direct" href={CONTACTS.telegram} target="_blank" rel="noopener">
                <PaperPlaneTilt size={20} weight="fill" aria-hidden="true" />
                <span>
                  <span className="lead-direct__value">Telegram</span>
                  <span className="lead-direct__note">Можно написать</span>
                </span>
              </a>
            )}
          </div>
        </div>

        <div className="sheet lead-form__sheet">
          <span className="sheet__tick sheet__tick--tl" aria-hidden="true" />
          <span className="sheet__tick sheet__tick--tr" aria-hidden="true" />
          <span className="sheet__tick sheet__tick--bl" aria-hidden="true" />
          <span className="sheet__tick sheet__tick--br" aria-hidden="true" />

          {sent ? (
            <div className="lead-done" role="status">
              <CheckCircle size={40} weight="light" aria-hidden="true" />

              {draft ? (
                <>
                  <h3 className="h3">Заявка собрана</h3>
                  <p className="text">
                    Приём заявок ещё не подключён, поэтому позвоните — так быстрее всего.
                    Заявку можно скопировать и продиктовать по телефону.
                  </p>
                  <pre className="lead-draft">{draft}</pre>
                  <div className="lead-done__actions">
                    <a className="btn btn--primary" href={CONTACTS.phoneHref}>
                      <Phone size={18} weight="fill" aria-hidden="true" />
                      {CONTACTS.phone}
                    </a>
                    <button type="button" className="btn btn--ghost" onClick={copyDraft}>
                      <Copy size={18} weight="regular" aria-hidden="true" />
                      {copied ? 'Скопировано' : 'Скопировать заявку'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="h3">Заявка у нас</h3>
                  <p className="text">
                    Перезвоним, чтобы уточнить объект и согласовать удобное время замера.
                    Если торопитесь — звоните сами:{' '}
                    <a className="link" href={CONTACTS.phoneHref}>
                      {CONTACTS.phone}
                    </a>
                    .
                  </p>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    onClick={() => setSent(false)}
                  >
                    Отправить ещё одну
                  </button>
                </>
              )}
            </div>
          ) : (
            <form className="lead-form" onSubmit={onSubmit} noValidate>
              <div className="field">
                <label className="field__label" htmlFor="lead-name">
                  Как к вам обращаться
                </label>
                <input
                  className="field__input"
                  id="lead-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Иван Петрович"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'err-name' : undefined}
                />
                {errors.name && (
                  <p className="field__error" id="err-name" data-error>
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="field">
                <label className="field__label" htmlFor="lead-address">
                  Адрес объекта
                </label>
                <input
                  className="field__input"
                  id="lead-address"
                  name="address"
                  type="text"
                  autoComplete="street-address"
                  placeholder="Екатеринбург, ул. Малышева, 51"
                  aria-invalid={Boolean(errors.address)}
                  aria-describedby={errors.address ? 'err-address' : 'hint-address'}
                />
                {errors.address ? (
                  <p className="field__error" id="err-address" data-error>
                    {errors.address}
                  </p>
                ) : (
                  <p className="field__hint" id="hint-address">
                    Достаточно улицы и района. Точный адрес уточним по телефону.
                  </p>
                )}
              </div>

              <div className="field">
                <label className="field__label" htmlFor="lead-phone">
                  Телефон
                </label>
                <input
                  className="field__input num"
                  id="lead-phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+7 900 000-00-00"
                  aria-invalid={Boolean(errors.phone)}
                  aria-describedby={errors.phone ? 'err-phone' : undefined}
                />
                {errors.phone && (
                  <p className="field__error" id="err-phone" data-error>
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Согласие называет конкретные данные и конкретную цель:
                  «согласен с обработкой персональных данных» без перечня
                  и цели согласием по ч. 4 ст. 9 152-ФЗ не является.
                  Отметка не проставлена заранее, без неё отправка заблокирована. */}
              <div className="field field--check">
                <label className="check">
                  <input
                    type="checkbox"
                    name="agree"
                    aria-invalid={Boolean(errors.agree)}
                    aria-describedby={errors.agree ? 'err-agree' : undefined}
                  />
                  <span>
                    Согласен на обработку моих имени, номера телефона и адреса объекта для
                    связи по этой заявке и расчёта стоимости работ. Согласие можно отозвать
                    в любой момент —{' '}
                    <a
                      className="link"
                      href="/privacy.html"
                      target="_blank"
                      rel="noopener"
                    >
                      политика обработки персональных данных
                    </a>
                    .
                  </span>
                </label>
                {errors.agree && (
                  <p className="field__error" id="err-agree" data-error>
                    {errors.agree}
                  </p>
                )}
              </div>

              {errors.send && (
                <p className="field__error field__error--wide" data-error role="alert">
                  {errors.send}
                </p>
              )}

              <button className="btn btn--primary lead-form__submit" type="submit" disabled={sending}>
                {sending ? 'Отправляем…' : 'Записаться на замер'}
              </button>

              <p className="tiny lead-form__route">
                Перезвоним по этому номеру, чтобы уточнить задачу и согласовать замер.
                Данные никому не передаём, в рассылки не добавляем.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
