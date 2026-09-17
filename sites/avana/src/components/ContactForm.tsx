import { useId, useState, type FormEvent } from 'react'
import { Reveal, RevealItem } from './motion/Reveal'
import { MotionLink, MotionButtonEl } from './motion/Interactive'
import SectionBackdrop from './SectionBackdrop'
import texture from '../assets/texture/04-stone-shaft.jpg'

const DIKIDI_URL = 'https://dikidi.net/970292'
const WHATSAPP_URL = 'https://wa.me/79222066161'
const PHONE_DISPLAY = '+7 (922) 206-61-61'

const SERVICES = [
  'Наращивание ресниц',
  'Ламинирование ресниц',
  'Оформление бровей',
  'Перманентный макияж',
  'Макияж и укладка',
  'Депиляция лица',
  'Тату',
  'Обучение для мастеров',
  'Пока не решила',
]

type Status = 'idle' | 'sending' | 'success'

interface Errors {
  name?: string
  phone?: string
  service?: string
  comment?: string
  consent?: string
}

const EMPTY_FORM = {
  name: '',
  phone: '',
  service: '',
  comment: '',
  consent: false,
}

export default function ContactForm() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>('idle')

  const nameId = useId()
  const phoneId = useId()
  const serviceId = useId()
  const commentId = useId()
  const consentId = useId()
  const nameErrorId = useId()
  const phoneErrorId = useId()
  const serviceErrorId = useId()
  const commentErrorId = useId()
  const consentErrorId = useId()

  function validate(): Errors {
    const next: Errors = {}

    if (!form.name.trim()) {
      next.name = 'Напишите имя, чтобы знать, как к вам обращаться'
    } else if (form.name.trim().length < 2) {
      next.name = 'Похоже на опечатку. Напишите имя целиком'
    }

    const digits = form.phone.replace(/\D/g, '')
    if (!form.phone.trim()) {
      next.phone = 'Без телефона мы не сможем перезвонить'
    } else if (digits.length !== 11 || !(digits.startsWith('7') || digits.startsWith('8'))) {
      next.phone = 'Проверьте номер: нужно 11 цифр, начиная с 7 или 8'
    }

    if (!form.service) {
      next.service = 'Выберите направление или отметьте «Пока не решила»'
    }

    if (form.comment.length > 500) {
      next.comment = 'Слишком длинно. Оставьте до 500 знаков, остальное обсудим по телефону'
    }

    if (!form.consent) {
      next.consent = 'Отметьте согласие на обработку данных, иначе заявку не отправить'
    }

    return next
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setStatus('sending')
    window.setTimeout(() => {
      setStatus('success')
    }, 1000)
  }

  function handleReset() {
    setForm(EMPTY_FORM)
    setErrors({})
    setStatus('idle')
  }

  const buttonLabel = status === 'sending' ? 'Отправляем' : status === 'success' ? 'Заявка у нас' : 'Жду звонка из салона'

  const fieldStyle = {
    width: '100%',
    padding: 'var(--space-2) var(--space-3)',
    background: 'var(--bg-elevated)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    fontFamily: 'var(--font-text)',
    fontSize: 'var(--text-body)',
  } as React.CSSProperties

  const labelStyle = {
    display: 'block',
    fontFamily: 'var(--font-text)',
    fontSize: 'var(--text-small)',
    fontWeight: 'var(--weight-semibold)',
    color: 'var(--text-secondary)',
    marginBottom: 'var(--space-1)',
  } as React.CSSProperties

  const errorStyle = {
    marginTop: 'var(--space-1)',
    fontFamily: 'var(--font-text)',
    fontSize: 'var(--text-caption)',
    color: 'var(--text-accent)',
  } as React.CSSProperties

  return (
    <section
      id="contact-form"
      aria-labelledby="contact-form-title"
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--bg-page)',
        paddingTop: 'var(--section-y)',
        paddingBottom: 'var(--section-y)',
      }}
    >
      <SectionBackdrop src={texture} scrim={0.88} tone="dark" />
      <div
        style={{
          position: 'relative',
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          paddingLeft: 'var(--gutter)',
          paddingRight: 'var(--gutter)',
        }}
      >
        <Reveal style={{ marginBottom: 'var(--space-8)', maxWidth: 'var(--measure-wide)' }}>
          <RevealItem
            as="h2"
            id="contact-form-title"
            style={
              {
                fontFamily: 'var(--font-display)',
                fontWeight: 400,
                fontSize: 'var(--text-h2)',
                color: 'var(--text-primary)',
                letterSpacing: 'var(--tracking-heading)',
                lineHeight: 'var(--leading-heading)',
                marginBottom: 'var(--space-2)',
              } as React.CSSProperties
            }
          >
            Оставьте номер — подберём мастера и время
          </RevealItem>
          <RevealItem
            as="p"
            style={
              {
                fontFamily: 'var(--font-text)',
                fontSize: 'var(--text-body-lg)',
                color: 'var(--text-secondary)',
                lineHeight: 'var(--leading-body)',
                maxWidth: 'var(--measure-base)',
              } as React.CSSProperties
            }
          >
            Напишите, что хотите сделать, и вам предложат мастера под задачу и
            бюджет, назовут цену и ближайшие свободные окна. Если уже знаете, к
            кому идёте, быстрее записаться онлайн.
          </RevealItem>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto]" style={{ gap: 'var(--space-8)' }}>
          {/* Форма */}
          <div style={{ minWidth: 0, maxWidth: '32rem' }}>
            {status === 'success' ? (
              <div
                style={
                  {
                    padding: 'var(--space-5)',
                    background: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                  } as React.CSSProperties
                }
              >
                <h3
                  style={
                    {
                      fontFamily: 'var(--font-display)',
                      fontWeight: 400,
                      fontSize: 'var(--text-h3)',
                      color: 'var(--text-primary)',
                      letterSpacing: 'var(--tracking-heading)',
                      marginBottom: 'var(--space-2)',
                    } as React.CSSProperties
                  }
                >
                  Заявка принята
                </h3>
                <p
                  style={
                    {
                      fontFamily: 'var(--font-text)',
                      fontSize: 'var(--text-body)',
                      color: 'var(--text-secondary)',
                      lineHeight: 'var(--leading-body)',
                      marginBottom: 'var(--space-4)',
                    } as React.CSSProperties
                  }
                >
                  Администратор перезвонит и предложит мастера и свободное
                  время. Если нужно быстрее — напишите в WhatsApp:{' '}
                  {PHONE_DISPLAY}.
                </p>
                <MotionButtonEl
                  type="button"
                  onClick={handleReset}
                  style={
                    {
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 'var(--space-2) var(--space-4)',
                      background: 'var(--bg-accent)',
                      color: 'var(--text-on-accent)',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      fontFamily: 'var(--font-text)',
                      fontWeight: 'var(--weight-semibold)',
                      fontSize: 'var(--text-body)',
                      cursor: 'pointer',
                      transition: 'opacity var(--transition-base)',
                    } as React.CSSProperties
                  }
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  Вернуться на сайт
                </MotionButtonEl>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <label htmlFor={nameId} style={labelStyle}>
                    Как к вам обращаться
                  </label>
                  <input
                    id={nameId}
                    type="text"
                    placeholder="Например, Ольга"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? nameErrorId : undefined}
                    style={fieldStyle}
                  />
                  {errors.name && (
                    <p id={nameErrorId} role="alert" style={errorStyle}>
                      {errors.name}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <label htmlFor={phoneId} style={labelStyle}>
                    Телефон для связи
                  </label>
                  <input
                    id={phoneId}
                    type="tel"
                    placeholder="+7 (___) ___-__-__"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? phoneErrorId : undefined}
                    style={fieldStyle}
                  />
                  {errors.phone && (
                    <p id={phoneErrorId} role="alert" style={errorStyle}>
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <label htmlFor={serviceId} style={labelStyle}>
                    Что вас интересует
                  </label>
                  <select
                    id={serviceId}
                    value={form.service}
                    onChange={(e) => setForm({ ...form, service: e.target.value })}
                    aria-invalid={!!errors.service}
                    aria-describedby={errors.service ? serviceErrorId : undefined}
                    style={fieldStyle}
                  >
                    <option value="">Выберите направление</option>
                    {SERVICES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  {errors.service && (
                    <p id={serviceErrorId} role="alert" style={errorStyle}>
                      {errors.service}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <label htmlFor={commentId} style={labelStyle}>
                    Что важно учесть
                  </label>
                  <textarea
                    id={commentId}
                    rows={4}
                    placeholder="Ношу 2D, хочу мокрый эффект. Удобно в будни после 18:00"
                    value={form.comment}
                    onChange={(e) => setForm({ ...form, comment: e.target.value })}
                    aria-invalid={!!errors.comment}
                    aria-describedby={errors.comment ? commentErrorId : undefined}
                    style={{ ...fieldStyle, resize: 'vertical' }}
                  />
                  {errors.comment && (
                    <p id={commentErrorId} role="alert" style={errorStyle}>
                      {errors.comment}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <div className="flex items-start" style={{ gap: 'var(--space-2)' }}>
                    <input
                      id={consentId}
                      type="checkbox"
                      checked={form.consent}
                      onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                      aria-invalid={!!errors.consent}
                      aria-describedby={errors.consent ? consentErrorId : undefined}
                      style={{ marginTop: '0.25rem', flexShrink: 0 }}
                    />
                    <label
                      htmlFor={consentId}
                      style={
                        {
                          fontFamily: 'var(--font-text)',
                          fontSize: 'var(--text-caption)',
                          color: 'var(--text-quiet)',
                          lineHeight: 'var(--leading-body)',
                        } as React.CSSProperties
                      }
                    >
                      Нажимая кнопку, вы соглашаетесь на обработку персональных
                      данных.
                    </label>
                  </div>
                  {errors.consent && (
                    <p id={consentErrorId} role="alert" style={errorStyle}>
                      {errors.consent}
                    </p>
                  )}
                </div>

                <MotionButtonEl
                  type="submit"
                  disabled={status === 'sending'}
                  style={
                    {
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      padding: 'var(--space-2) var(--space-4)',
                      background: 'var(--bg-accent)',
                      color: 'var(--text-on-accent)',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      fontFamily: 'var(--font-text)',
                      fontWeight: 'var(--weight-semibold)',
                      fontSize: 'var(--text-body)',
                      boxShadow: 'var(--shadow-accent)',
                      cursor: status === 'sending' ? 'default' : 'pointer',
                      opacity: status === 'sending' ? 0.7 : 1,
                      transition: 'opacity var(--transition-base)',
                    } as React.CSSProperties
                  }
                >
                  {buttonLabel}
                </MotionButtonEl>
              </form>
            )}
          </div>

          {/* Альтернатива */}
          <div
            style={
              {
                minWidth: 0,
                maxWidth: '22rem',
                padding: 'var(--space-5)',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
                height: 'fit-content',
              } as React.CSSProperties
            }
          >
            <p
              style={
                {
                  fontFamily: 'var(--font-text)',
                  fontSize: 'var(--text-body)',
                  color: 'var(--text-secondary)',
                  lineHeight: 'var(--leading-body)',
                  marginBottom: 'var(--space-4)',
                } as React.CSSProperties
              }
            >
              Не хотите ждать звонка — выберите мастера и время сами в
              онлайн-записи или напишите в WhatsApp: там же можно прислать фото
              желаемого результата.
            </p>
            <div className="flex flex-col" style={{ gap: 'var(--space-2)' }}>
              <MotionLink
                href={DIKIDI_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={
                  {
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--space-2) var(--space-4)',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-text)',
                    fontWeight: 'var(--weight-semibold)',
                    fontSize: 'var(--text-body)',
                    transition: 'border-color var(--transition-base)',
                  } as React.CSSProperties
                }
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-color-accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
              >
                Открыть онлайн-запись
              </MotionLink>
              <MotionLink
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={
                  {
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 'var(--space-2) var(--space-4)',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-text)',
                    fontWeight: 'var(--weight-semibold)',
                    fontSize: 'var(--text-body)',
                    transition: 'border-color var(--transition-base)',
                  } as React.CSSProperties
                }
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-color-accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
              >
                Написать в WhatsApp
              </MotionLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
