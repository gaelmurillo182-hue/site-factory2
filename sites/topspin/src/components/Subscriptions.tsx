const YCLIENTS_URL = 'https://n1935836.yclients.com/'

interface Plan {
  name: string
  price: string
  pricePerSession: string
  visits: string
  duration: string
  text: string
  cta: string
  featured?: boolean
}

const PLANS: Plan[] = [
  {
    name: 'Разовое',
    price: '900 ₽',
    pricePerSession: '900 ₽/занятие',
    visits: '1 посещение',
    duration: 'без срока',
    text: 'Одно групповое занятие без обязательств. Подходит, чтобы посмотреть зал и понять, подходит ли формат.',
    cta: 'Взять разовое',
  },
  {
    name: 'Старт',
    price: '3 200 ₽',
    pricePerSession: '800 ₽/занятие',
    visits: '4 посещения',
    duration: '1 месяц',
    text: 'Начальный абонемент для тех, кто только пробует ходить регулярно.',
    cta: 'Выбрать «Старт»',
  },
  {
    name: 'Оптимальный',
    price: '5 600 ₽',
    pricePerSession: '700 ₽/занятие',
    visits: '8 посещений',
    duration: '1 месяц',
    text: 'Для тех, кто уже ходит стабильно. Групповые занятия для взрослых, скидка 5% на турниры.',
    cta: 'Выбрать «Оптимальный»',
    featured: true,
  },
  {
    name: 'Детский',
    price: '5 000 ₽',
    pricePerSession: '500 ₽/занятие',
    visits: '10 тренировок',
    duration: '1 месяц',
    text: 'Абонемент для детской секции, от 6 лет, группа по уровню подготовки.',
    cta: 'Выбрать детский',
  },
]

export default function Subscriptions() {
  return (
    <section
      id="subscriptions"
      aria-labelledby="subscriptions-title"
      style={{
        background: 'var(--color-sand)',
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
        {/* Шапка */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h2
            id="subscriptions-title"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-h2)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--color-ink)',
              letterSpacing: 'var(--tracking-heading)',
              lineHeight: 'var(--leading-heading)',
              marginBottom: 'var(--space-2)',
            } as React.CSSProperties}
          >
            Абонементы
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-text)',
              fontSize: 'var(--text-body-lg)',
              color: 'var(--color-ink-muted)',
              maxWidth: '52ch',
            } as React.CSSProperties}
          >
            Если ходите регулярно, занятие выходит дешевле разового.
          </p>
        </div>

        {/* Тарифы */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
          style={{ gap: 'var(--space-4)', alignItems: 'stretch' } as React.CSSProperties}
        >
          {PLANS.map((plan) => (
            <article
              key={plan.name}
              style={{
                background: 'var(--color-chalk)',
                borderRadius: 'var(--radius-md)',
                border: plan.featured
                  ? '2px solid var(--color-ball)'
                  : '2px solid transparent',
                padding: 'var(--space-4)',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: plan.featured ? 'var(--shadow-ball)' : 'var(--shadow-sm)',
                position: 'relative',
              } as React.CSSProperties}
            >
              {/* Бейдж «Популярный» */}
              {plan.featured && (
                <div
                  aria-label="Популярный тариф"
                  style={{
                    position: 'absolute',
                    top: '-1px',
                    right: 'var(--space-3)',
                    background: 'var(--color-ball)',
                    color: 'var(--color-board)',
                    fontFamily: 'var(--font-text)',
                    fontWeight: 'var(--weight-semibold)',
                    fontSize: 'var(--text-caption)',
                    letterSpacing: 'var(--tracking-caps)',
                    textTransform: 'uppercase',
                    padding: '0.25rem 0.625rem',
                    borderRadius: '0 0 var(--radius-sm) var(--radius-sm)',
                  } as React.CSSProperties}
                >
                  Популярный
                </div>
              )}

              {/* Название */}
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-h4)',
                  fontWeight: 'var(--weight-semibold)',
                  color: 'var(--color-ink)',
                  letterSpacing: 'var(--tracking-heading)',
                  marginBottom: 'var(--space-1)',
                  hyphens: 'auto',
                  overflowWrap: 'break-word',
                } as React.CSSProperties}
              >
                {plan.name}
              </h3>

              {/* Цена */}
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-h3)',
                  fontWeight: 'var(--weight-bold)',
                  color: 'var(--color-ball)',
                  letterSpacing: 'var(--tracking-heading)',
                  lineHeight: 1,
                  marginBottom: 'var(--space-1)',
                  whiteSpace: 'nowrap',
                } as React.CSSProperties}
              >
                {plan.price}
              </div>

              {/* Цена за занятие */}
              <div
                style={{
                  fontFamily: 'var(--font-text)',
                  fontSize: 'var(--text-small)',
                  color: 'var(--color-ink-muted)',
                  marginBottom: 'var(--space-3)',
                } as React.CSSProperties}
              >
                {plan.pricePerSession}
              </div>

              {/* Параметры */}
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--space-2)',
                  flexWrap: 'wrap',
                  marginBottom: 'var(--space-3)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-text)',
                    fontSize: 'var(--text-small)',
                    color: 'var(--color-ink)',
                    background: 'var(--color-sand)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.125rem 0.5rem',
                  } as React.CSSProperties}
                >
                  {plan.visits}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-text)',
                    fontSize: 'var(--text-small)',
                    color: 'var(--color-ink)',
                    background: 'var(--color-sand)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.125rem 0.5rem',
                  } as React.CSSProperties}
                >
                  {plan.duration}
                </span>
              </div>

              {/* Описание */}
              <p
                style={{
                  fontFamily: 'var(--font-text)',
                  fontSize: 'var(--text-body)',
                  color: 'var(--color-ink-muted)',
                  lineHeight: 'var(--leading-body)',
                  flex: 1,
                  marginBottom: 'var(--space-4)',
                } as React.CSSProperties}
              >
                {plan.text}
              </p>

              {/* CTA */}
              <a
                href={YCLIENTS_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: 'var(--space-2) var(--space-3)',
                  background: plan.featured ? 'var(--color-ball)' : 'transparent',
                  color: plan.featured ? 'var(--color-board)' : 'var(--color-ball)',
                  border: plan.featured ? 'none' : '2px solid var(--color-ball)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-text)',
                  fontWeight: 'var(--weight-semibold)',
                  fontSize: 'var(--text-small)',
                  transition: 'opacity var(--transition-base)',
                } as React.CSSProperties}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                {plan.cta}
              </a>
            </article>
          ))}
        </div>

        {/* Примечание */}
        <p
          style={{
            marginTop: 'var(--space-5)',
            fontFamily: 'var(--font-text)',
            fontSize: 'var(--text-small)',
            color: 'var(--color-ink-muted)',
            lineHeight: 'var(--leading-body)',
            maxWidth: '65ch',
          } as React.CSSProperties}
        >
          Абонемент действует 1 месяц. Занятия в пределах срока не сгорают — если
          пропустили, запишитесь на другое время в YClients.
        </p>
      </div>
    </section>
  )
}
