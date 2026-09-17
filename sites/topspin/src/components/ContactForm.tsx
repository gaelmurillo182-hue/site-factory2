import { useState, useId } from 'react'

const YCLIENTS_URL = 'https://n1935836.yclients.com/'
const TELEGRAM_URL = 'https://t.me/knttopspin'
const PHONE_TEL = 'tel:+79193926281'
const PHONE_DISPLAY = '+7 (919) 392-62-81'

type FormStatus = 'idle' | 'sending' | 'success' | 'error'

interface FormData {
  name: string
  phone: string
  message: string
}

interface FormErrors {
  name?: string
  phone?: string
  message?: string
}

function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {}

  if (!data.name.trim()) {
    errors.name = 'Напишите имя, чтобы знать, как к вам обращаться'
  }

  if (!data.phone.trim()) {
    errors.phone = 'Без телефона мы не сможем перезвонить'
  } else {
    const digits = data.phone.replace(/\D/g, '')
    if (digits.length !== 11 || (digits[0] !== '7' && digits[0] !== '8')) {
      errors.phone = 'Проверьте номер: нужно 11 цифр, начиная с 7 или 8'
    }
  }

  if (data.message.length > 500) {
    errors.message =
      'Слишком длинно. Оставьте до 500 знаков, остальное обсудим по телефону'
  }

  return errors
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: 'var(--space-2) var(--space-3)',
  background: 'var(--bg-elevated)',
  color: 'var(--color-chalk)',
  border: '1px solid var(--line-color-dim)',
  borderRadius: 'var(--radius-sm)',
  fontFamily: 'var(--font-text)',
  fontSize: 'var(--text-body)',
  lineHeight: 'var(--leading-body)',
  outline: 'none',
  transition: 'border-color var(--transition-base)',
}

export default function ContactForm() {
  const uid = useId()
  const nameId = `${uid}-name`
  const phoneId = `${uid}-phone`
  const messageId = `${uid}-message`

  const [formData, setFormData] = useState<FormData>({ name: '', phone: '', message: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<FormStatus>('idle')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Сбрасываем ошибку поля при вводе
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = validateForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setStatus('sending')
    setErrors({})

    // Симуляция отправки — реальный бэкенд не подключён
    setTimeout(() => {
      setStatus('success')
    }, 1000)
  }

  const handleReset = () => {
    setStatus('idle')
    setFormData({ name: '', phone: '', message: '' })
    setErrors({})
  }

  return (
    <section
      id="contact-form"
      aria-labelledby="form-title"
      style={{
        background: 'var(--color-table)',
        paddingTop: 'var(--section-y)',
        paddingBottom: 'var(--section-y)',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          paddingLeft: 'var(--gutter)',
          paddingRight: 'var(--gutter)',
        }}
      >
        <div
          className="grid grid-cols-1 md:grid-cols-2"
          style={{ gap: 'var(--space-12)', alignItems: 'start' } as React.CSSProperties}
        >
          {/* Форма */}
          <div>
            <h2
              id="form-title"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-h2)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--color-chalk)',
                letterSpacing: 'var(--tracking-heading)',
                lineHeight: 'var(--leading-heading)',
                marginBottom: 'var(--space-2)',
              } as React.CSSProperties}
            >
              Оставьте номер — перезвоним и подберём время
            </h2>

            <p
              style={{
                fontFamily: 'var(--font-text)',
                fontSize: 'var(--text-body)',
                color: 'var(--color-chalk-muted)',
                lineHeight: 'var(--leading-body)',
                marginBottom: 'var(--space-6)',
                maxWidth: '52ch',
              } as React.CSSProperties}
            >
              Напишите, кто будет заниматься: ребёнок или вы. Мы предложим подходящую
              группу или тренера и назовём свободные часы.
            </p>

            {/* Состояние успеха */}
            {status === 'success' ? (
              <div
                role="alert"
                style={{
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: '3px solid var(--color-ok)',
                  padding: 'var(--space-5)',
                  marginBottom: 'var(--space-4)',
                } as React.CSSProperties}
              >
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-h4)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--color-chalk)',
                    marginBottom: 'var(--space-2)',
                  } as React.CSSProperties}
                >
                  Заявка принята
                </h3>
                <p
                  style={{
                    fontFamily: 'var(--font-text)',
                    fontSize: 'var(--text-body)',
                    color: 'var(--color-chalk-muted)',
                    lineHeight: 'var(--leading-body)',
                    marginBottom: 'var(--space-4)',
                  } as React.CSSProperties}
                >
                  Перезвоним в рабочие часы, с&nbsp;09:00 до&nbsp;22:00.
                  Если нужно быстрее — напишите в Telegram{' '}
                  <a
                    href={TELEGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--color-ball-bright)' }}
                  >
                    @knttopspin
                  </a>
                  .
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  style={{
                    fontFamily: 'var(--font-text)',
                    fontSize: 'var(--text-small)',
                    color: 'var(--color-chalk-muted)',
                    borderBottom: '1px solid var(--line-color-dim)',
                    paddingBottom: '1px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'underline',
                    textUnderlineOffset: '3px',
                  } as React.CSSProperties}
                >
                  Вернуться на сайт
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                {/* Поле Имя */}
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <label
                    htmlFor={nameId}
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-text)',
                      fontSize: 'var(--text-small)',
                      color: 'var(--color-chalk-muted)',
                      marginBottom: 'var(--space-1)',
                    } as React.CSSProperties}
                  >
                    Как к вам обращаться
                  </label>
                  <input
                    id={nameId}
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Например, Ирина"
                    value={formData.name}
                    onChange={handleChange}
                    aria-describedby={errors.name ? `${nameId}-error` : undefined}
                    aria-invalid={!!errors.name}
                    style={{
                      ...inputStyle,
                      borderColor: errors.name
                        ? 'var(--color-ball)'
                        : 'var(--line-color-dim)',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-chalk-muted)')}
                    onBlur={e =>
                      (e.currentTarget.style.borderColor = errors.name
                        ? 'var(--color-ball)'
                        : 'var(--line-color-dim)')
                    }
                  />
                  {errors.name && (
                    <p
                      id={`${nameId}-error`}
                      role="alert"
                      style={{
                        fontFamily: 'var(--font-text)',
                        fontSize: 'var(--text-small)',
                        color: 'var(--color-ball-bright)',
                        marginTop: 'var(--space-1)',
                      } as React.CSSProperties}
                    >
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Поле Телефон */}
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <label
                    htmlFor={phoneId}
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-text)',
                      fontSize: 'var(--text-small)',
                      color: 'var(--color-chalk-muted)',
                      marginBottom: 'var(--space-1)',
                    } as React.CSSProperties}
                  >
                    Телефон для связи
                  </label>
                  <input
                    id={phoneId}
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+7 (___) ___-__-__"
                    value={formData.phone}
                    onChange={handleChange}
                    aria-describedby={errors.phone ? `${phoneId}-error` : undefined}
                    aria-invalid={!!errors.phone}
                    style={{
                      ...inputStyle,
                      borderColor: errors.phone
                        ? 'var(--color-ball)'
                        : 'var(--line-color-dim)',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-chalk-muted)')}
                    onBlur={e =>
                      (e.currentTarget.style.borderColor = errors.phone
                        ? 'var(--color-ball)'
                        : 'var(--line-color-dim)')
                    }
                  />
                  {errors.phone && (
                    <p
                      id={`${phoneId}-error`}
                      role="alert"
                      style={{
                        fontFamily: 'var(--font-text)',
                        fontSize: 'var(--text-small)',
                        color: 'var(--color-ball-bright)',
                        marginTop: 'var(--space-1)',
                      } as React.CSSProperties}
                    >
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Поле Сообщение */}
                <div style={{ marginBottom: 'var(--space-5)' }}>
                  <label
                    htmlFor={messageId}
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-text)',
                      fontSize: 'var(--text-small)',
                      color: 'var(--color-chalk-muted)',
                      marginBottom: 'var(--space-1)',
                    } as React.CSSProperties}
                  >
                    Что интересует{' '}
                    <span
                      style={{ color: 'var(--color-off)', fontWeight: 'normal' } as React.CSSProperties}
                    >
                      (необязательно)
                    </span>
                  </label>
                  <textarea
                    id={messageId}
                    name="message"
                    rows={4}
                    placeholder="Ребёнку 8 лет, хотим в детскую секцию"
                    value={formData.message}
                    onChange={handleChange}
                    aria-describedby={errors.message ? `${messageId}-error` : undefined}
                    aria-invalid={!!errors.message}
                    style={{
                      ...inputStyle,
                      resize: 'vertical',
                      borderColor: errors.message
                        ? 'var(--color-ball)'
                        : 'var(--line-color-dim)',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-chalk-muted)')}
                    onBlur={e =>
                      (e.currentTarget.style.borderColor = errors.message
                        ? 'var(--color-ball)'
                        : 'var(--line-color-dim)')
                    }
                  />
                  {errors.message && (
                    <p
                      id={`${messageId}-error`}
                      role="alert"
                      style={{
                        fontFamily: 'var(--font-text)',
                        fontSize: 'var(--text-small)',
                        color: 'var(--color-ball-bright)',
                        marginTop: 'var(--space-1)',
                      } as React.CSSProperties}
                    >
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Кнопка отправки */}
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  style={{
                    width: '100%',
                    padding: 'var(--space-2) var(--space-4)',
                    background:
                      status === 'sending' ? 'var(--color-ink-muted)' : 'var(--color-ball)',
                    color: 'var(--color-board)',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-text)',
                    fontWeight: 'var(--weight-semibold)',
                    fontSize: 'var(--text-body)',
                    cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                    transition: 'background var(--transition-base), opacity var(--transition-base)',
                    marginBottom: 'var(--space-3)',
                  } as React.CSSProperties}
                >
                  {status === 'sending' ? 'Отправляем…' : 'Жду звонка от клуба'}
                </button>

                {/* Ошибка отправки */}
                {status === 'error' && (
                  <p
                    role="alert"
                    style={{
                      fontFamily: 'var(--font-text)',
                      fontSize: 'var(--text-small)',
                      color: 'var(--color-ball-bright)',
                      marginBottom: 'var(--space-3)',
                    } as React.CSSProperties}
                  >
                    Заявка не ушла. Попробуйте ещё раз или позвоните:{' '}
                    <a href={PHONE_TEL} style={{ color: 'inherit', textDecoration: 'underline' }}>
                      {PHONE_DISPLAY}
                    </a>
                  </p>
                )}

                {/* Согласие */}
                <p
                  style={{
                    fontFamily: 'var(--font-text)',
                    fontSize: 'var(--text-caption)',
                    color: 'var(--color-chalk-muted)',
                    lineHeight: 'var(--leading-body)',
                  } as React.CSSProperties}
                >
                  Нажимая кнопку, вы соглашаетесь на обработку персональных данных.
                </p>
              </form>
            )}
          </div>

          {/* Альтернативы */}
          <div
            style={{
              marginTop: 'var(--space-4)',
            }}
            className="md:mt-0"
          >
            <p
              style={{
                fontFamily: 'var(--font-text)',
                fontSize: 'var(--text-body-lg)',
                color: 'var(--color-chalk-muted)',
                lineHeight: 'var(--leading-body)',
                marginBottom: 'var(--space-6)',
              } as React.CSSProperties}
            >
              Не любите ждать звонка — выберите время в онлайн-записи или напишите
              в&nbsp;Telegram.
            </p>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
              }}
            >
              <a
                href={YCLIENTS_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-1)',
                  padding: 'var(--space-4)',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: '3px solid var(--color-ball)',
                  transition: 'opacity var(--transition-base)',
                } as React.CSSProperties}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-h4)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--color-chalk)',
                  } as React.CSSProperties}
                >
                  Онлайн-запись
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-text)',
                    fontSize: 'var(--text-body)',
                    color: 'var(--color-chalk-muted)',
                  }}
                >
                  Свободные слоты видно сразу. Выберите дату и время без звонка.
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-text)',
                    fontSize: 'var(--text-small)',
                    color: 'var(--color-ball-bright)',
                    marginTop: 'var(--space-1)',
                  } as React.CSSProperties}
                >
                  Открыть YClients →
                </span>
              </a>

              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-1)',
                  padding: 'var(--space-4)',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: '3px solid var(--color-chalk-muted)',
                  transition: 'opacity var(--transition-base)',
                } as React.CSSProperties}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-h4)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--color-chalk)',
                  } as React.CSSProperties}
                >
                  Telegram
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-text)',
                    fontSize: 'var(--text-body)',
                    color: 'var(--color-chalk-muted)',
                  }}
                >
                  Напишите в канал @knttopspin. Отвечаем быстро.
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-text)',
                    fontSize: 'var(--text-small)',
                    color: 'var(--color-ball-bright)',
                    marginTop: 'var(--space-1)',
                  } as React.CSSProperties}
                >
                  Написать →
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
