import { Reveal, RevealItem } from './motion/Reveal'
import { MotionLink } from './motion/Interactive'

const DIKIDI_URL = 'https://dikidi.net/970292'

interface Effect {
  name: string
  what: string
  where: string
}

const EFFECTS: Effect[] = [
  {
    name: 'Норка',
    what: 'Мягкий изгиб и приглушённый, не пластиковый блеск. Спокойный вариант на каждый день',
    where: '3 000 ₽ мастер · 3 500 ₽ топ-мастер · 4 000 ₽ владелица (натуральная норка)',
  },
  {
    name: 'Мокрый эффект',
    what: 'Ресницы собраны в редкие пучки, между ними видны просветы. Выглядит так, будто ресницы только что намокли',
    where: 'от 2 700 ₽, объёмы от 2D до 4–5D',
  },
  {
    name: 'Эффект ламинирования',
    what: 'Наращивание, которое повторяет вид ламинированных ресниц: ряд поднят вверх, длина ровная',
    where: '2 900 ₽ мастер · 3 200 ₽ топ-мастер',
  },
  {
    name: '«Анимэ»',
    what: 'Ресницы разделены на выраженные пучки-лучи, взгляд становится кукольным',
    where: '4 000 ₽ топ-мастер · 4 700 ₽ владелица',
  },
  {
    name: '«Американка»',
    what: 'Акцент смещён к внешнему углу, глаз визуально вытягивается',
    where: '3 800 ₽, только у топ-мастера',
  },
  {
    name: '«TIFFANY»',
    what: 'Фирменный эффект салона, выполняет топ-мастер',
    where: '3 500 ₽',
  },
  {
    name: 'Уголки',
    what: 'Неполное наращивание: ресницы ставятся только на внешние углы',
    where: '2 000 ₽ мастер · 2 200 ₽ топ-мастер · 3 100 ₽ владелица',
  },
  {
    name: 'Экспресс',
    what: 'Быстрое наращивание, когда нужно успеть к событию',
    where: '2 500 ₽ мастер · 2 700 ₽ топ-мастер · 3 500 ₽ владелица',
  },
  {
    name: 'Лучики',
    what: 'Дополнение к любому объёму: отдельные длинные реснички поверх ряда',
    where: '300 ₽ мастер · 500 ₽ топ-мастер и владелица',
  },
]

export default function Effects() {
  return (
    <section
      id="effects"
      aria-labelledby="effects-title"
      style={{
        background: 'var(--bg-elevated)',
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
        <Reveal style={{ marginBottom: 'var(--space-8)', maxWidth: 'var(--measure-wide)' }}>
          <RevealItem
            as="h2"
            id="effects-title"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              fontSize: 'var(--text-h2)',
              color: 'var(--text-primary)',
              letterSpacing: 'var(--tracking-display)',
              lineHeight: 'var(--leading-heading)',
              maxWidth: 'var(--measure-display)',
              marginBottom: 'var(--space-3)',
            } as React.CSSProperties}
          >
            Чем эффекты отличаются друг от друга
          </RevealItem>
          <RevealItem
            as="p"
            style={{
              fontFamily: 'var(--font-text)',
              fontSize: 'var(--text-body-lg)',
              color: 'var(--text-secondary)',
              lineHeight: 'var(--leading-body)',
              maxWidth: 'var(--measure-base)',
            } as React.CSSProperties}
          >
            Если вы носите ресницы давно, переходите сразу к прайсу. Если
            выбираете впервые — вот короткие объяснения, чтобы не заказывать
            вслепую.
          </RevealItem>
        </Reveal>

        {/* Заголовки колонок — только desktop */}
        <div
          className="hidden md:grid"
          style={{
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.6fr) minmax(0, 1.4fr)',
            gap: 'var(--space-4)',
            paddingBottom: 'var(--space-2)',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: 'var(--space-1)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-text)',
              fontSize: 'var(--text-caption)',
              color: 'var(--text-quiet)',
              letterSpacing: 'var(--tracking-caps)',
              textTransform: 'uppercase',
            } as React.CSSProperties}
          >
            Эффект
          </span>
          <span
            style={{
              fontFamily: 'var(--font-text)',
              fontSize: 'var(--text-caption)',
              color: 'var(--text-quiet)',
              letterSpacing: 'var(--tracking-caps)',
              textTransform: 'uppercase',
            } as React.CSSProperties}
          >
            Что это
          </span>
          <span
            style={{
              fontFamily: 'var(--font-text)',
              fontSize: 'var(--text-caption)',
              color: 'var(--text-quiet)',
              letterSpacing: 'var(--tracking-caps)',
              textTransform: 'uppercase',
            } as React.CSSProperties}
          >
            Где в прайсе
          </span>
        </div>

        {/* Список-строки */}
        <div>
          {EFFECTS.map((effect) => (
            <div
              key={effect.name}
              className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_minmax(0,1.4fr)]"
              style={{
                gap: 'var(--space-1) var(--space-4)',
                padding: 'var(--space-3) 0',
                borderBottom: '1px solid var(--border-color-quiet)',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 400,
                  fontSize: 'var(--text-h4)',
                  color: 'var(--text-primary)',
                  letterSpacing: 'var(--tracking-heading)',
                  lineHeight: 'var(--leading-heading)',
                  minWidth: 0,
                } as React.CSSProperties}
              >
                {effect.name}
              </div>

              <div style={{ minWidth: 0 }}>
                <span
                  className="block md:hidden"
                  style={{
                    fontFamily: 'var(--font-text)',
                    fontSize: 'var(--text-caption)',
                    color: 'var(--text-quiet)',
                    letterSpacing: 'var(--tracking-caps)',
                    textTransform: 'uppercase',
                    marginBottom: 'var(--space-0-5)',
                  } as React.CSSProperties}
                >
                  Что это
                </span>
                <p
                  style={{
                    fontFamily: 'var(--font-text)',
                    fontSize: 'var(--text-body)',
                    color: 'var(--text-secondary)',
                    lineHeight: 'var(--leading-body)',
                    margin: 0,
                  } as React.CSSProperties}
                >
                  {effect.what}
                </p>
              </div>

              <div style={{ minWidth: 0 }}>
                <span
                  className="block md:hidden"
                  style={{
                    fontFamily: 'var(--font-text)',
                    fontSize: 'var(--text-caption)',
                    color: 'var(--text-quiet)',
                    letterSpacing: 'var(--tracking-caps)',
                    textTransform: 'uppercase',
                    marginBottom: 'var(--space-0-5)',
                  } as React.CSSProperties}
                >
                  Где в прайсе
                </span>
                <p
                  style={{
                    fontFamily: 'var(--font-numeric)',
                    fontSize: 'var(--text-small)',
                    color: 'var(--text-accent)',
                    letterSpacing: 'var(--tracking-numeric)',
                    lineHeight: 'var(--leading-body)',
                    margin: 0,
                  } as React.CSSProperties}
                >
                  {effect.where}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p
          style={{
            fontFamily: 'var(--font-text)',
            fontSize: 'var(--text-body)',
            color: 'var(--text-secondary)',
            lineHeight: 'var(--leading-body)',
            maxWidth: 'var(--measure-base)',
            marginTop: 'var(--space-6)',
            marginBottom: 'var(--space-4)',
          } as React.CSSProperties}
        >
          Не выбрали — возьмите позицию «Хочу довериться мастеру». Мастер
          посмотрит форму глаза и состояние своих ресниц и предложит объём и
          изгиб на месте.
        </p>

        <MotionLink
          href={DIKIDI_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-2) var(--space-4)',
            background: 'var(--bg-accent)',
            color: 'var(--text-on-accent)',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-text)',
            fontWeight: 'var(--weight-semibold)',
            fontSize: 'var(--text-body)',
            transition: 'opacity var(--transition-base)',
          } as React.CSSProperties}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          Довериться мастеру
        </MotionLink>
      </div>
    </section>
  )
}
