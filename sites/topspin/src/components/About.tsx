interface AboutCard {
  title: string
  text: string
}

const CARDS: AboutCard[] = [
  {
    title: 'Тверитина, 45, третий этаж',
    text: 'Зал в ТЦ «Максидом». Заходите в торговый центр и поднимаетесь на третий этаж — клуб находится там же, без отдельного входа со двора.',
  },
  {
    title: 'Открыто каждый день с 09:00 до 22:00',
    text: 'Без выходных. Утром обычно свободнее — если хотите играть без соседних столов, берите слот в первой половине дня.',
  },
  {
    title: 'Шесть тренеров, среди них мастера спорта',
    text: 'С детьми и со взрослыми работают действующие спортсмены: чемпион России до 22 лет, призёры Первенства России и чемпионата УрФО. Начинающего не отправят «просто постучать» — с первого занятия ставят хват, стойку и подачу.',
  },
  {
    title: 'Рейтинговые турниры каждую неделю',
    text: 'Суббота и воскресенье — турниры с рейтингом TTWR: одиночные, парные и отдельная сетка для начинающих. Играть можно с любого уровня, отдельный разряд для участия не нужен.',
  },
  {
    title: '4 стола JOOLA и бесконтактное бронирование',
    text: 'Профессиональные столы JOOLA. Стол бронируется онлайн, доступ в зал бесконтактный — не нужно никого искать и ждать администратора. Ракетки в аренду — +200 ₽.',
  },
  {
    title: 'Группы по уровню, а не по возрасту',
    text: 'Детей распределяют по уровню подготовки, чтобы новичок не играл против того, кто занимается третий год. У взрослых так же: групповая тренировка или индивидуальная — зависит от того, с чего вы начинаете.',
  },
]

export default function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
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
        {/* Шапка */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h2
            id="about-title"
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
            Как устроен клуб
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-text)',
              fontSize: 'var(--text-body-lg)',
              color: 'var(--color-chalk-muted)',
              maxWidth: '55ch',
            } as React.CSSProperties}
          >
            Шесть вещей, о которых чаще всего спрашивают до первого визита.
          </p>
        </div>

        {/* Сетка карточек */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
          style={{ gap: 'var(--space-4)' }}
        >
          {CARDS.map((card) => (
            <article
              key={card.title}
              style={{
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
                borderLeft: '3px solid var(--color-ball)',
                padding: 'var(--space-4)',
              } as React.CSSProperties}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-h4)',
                  fontWeight: 'var(--weight-semibold)',
                  color: 'var(--color-chalk)',
                  letterSpacing: 'var(--tracking-heading)',
                  lineHeight: 'var(--leading-heading)',
                  marginBottom: 'var(--space-2)',
                } as React.CSSProperties}
              >
                {card.title}
              </h3>
              <p
                style={{
                  fontFamily: 'var(--font-text)',
                  fontSize: 'var(--text-body)',
                  color: 'var(--color-chalk-muted)',
                  lineHeight: 'var(--leading-body)',
                } as React.CSSProperties}
              >
                {card.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
