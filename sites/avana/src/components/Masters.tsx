import { Reveal, RevealItem, StaggerGrid, StaggerItem } from './motion/Reveal'
import { MotionLink } from './motion/Interactive'

const DIKIDI_URL = 'https://dikidi.net/970292'
const WHATSAPP_URL = 'https://wa.me/79222066161'

type TierKey = 'master' | 'top' | 'owner'

interface Master {
  name: string
  tier: TierKey
  specialty: string
  rating?: string
}

const TIER_LABEL: Record<TierKey, string> = {
  master: 'Мастер',
  top: 'Топ-мастер',
  owner: 'Владелица салона',
}
const TIER_TEXT_TOKEN: Record<TierKey, string> = {
  master: '--tier-base-text',
  top: '--tier-top-text',
  owner: '--tier-owner-text',
}

const MASTERS: Master[] = [
  {
    name: 'Дарья Кобзаренко',
    tier: 'owner',
    specialty: 'LED-наращивание ресниц, оформление бровей',
    rating: '5,0 · 107 оценок',
  },
  {
    name: 'Катя',
    tier: 'master',
    specialty: 'Наращивание ресниц, ламинирование и оформление бровей',
    rating: '5,0 · 60 оценок',
  },
  {
    name: 'Анна',
    tier: 'top',
    specialty: 'Классическое и LED-наращивание, ламинирование и оформление бровей',
    rating: '5,0 · 32 оценки',
  },
  {
    name: 'Елена',
    tier: 'top',
    specialty: 'Макияж, оформление бровей, ламинирование ресниц',
    rating: '5,0 · 36 оценок',
  },
  {
    name: 'Ани',
    tier: 'master',
    specialty: 'Классическое и LED-наращивание ресниц',
    rating: '4,9 · 35 оценок',
  },
  {
    name: 'Арина',
    tier: 'master',
    specialty: 'Классическое и LED-наращивание ресниц',
    rating: '5,0 · 21 оценка',
  },
  {
    name: 'Юлия',
    tier: 'top',
    specialty: 'Оформление бровей, ламинирование ресниц',
    rating: '5,0 · 7 оценок',
  },
  {
    name: 'Катрина',
    tier: 'top',
    specialty: 'LED-наращивание ресниц',
    rating: '5,0 · 6 оценок',
  },
  {
    name: 'Ирина',
    tier: 'top',
    specialty: 'Перманентный макияж, тату',
    rating: '5,0 · 1 оценка',
  },
  {
    name: 'Эстель',
    tier: 'top',
    specialty: 'Макияж, оформление бровей, ламинирование ресниц',
    rating: '5,0 · 1 оценка',
  },
  {
    name: 'Алина',
    tier: 'top',
    specialty: 'Оформление бровей, ламинирование ресниц, перманентный макияж',
  },
]

export default function Masters() {
  return (
    <section
      id="masters"
      aria-labelledby="masters-title"
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
        {/* Шапка */}
        <Reveal style={{ marginBottom: 'var(--space-8)', maxWidth: 'var(--measure-wide)' }}>
          <RevealItem
            as="h2"
            id="masters-title"
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
            Кто работает в салоне
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
            Одиннадцать мастеров, семь из них в статусе «Топ-мастер». Оценки — из
            профиля онлайн-записи, их ставят после визита.
          </RevealItem>
        </Reveal>

        {/* Карточки */}
        <StaggerGrid
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
          style={{ gap: 'var(--space-3)' }}
        >
          {MASTERS.map((master) => (
            <StaggerItem
              as="article"
              key={master.name}
              style={
                {
                  minWidth: 0,
                  padding: 'var(--space-4)',
                  background: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                } as React.CSSProperties
              }
            >
              <p
                style={
                  {
                    fontFamily: 'var(--font-text)',
                    fontWeight: 'var(--weight-bold)',
                    fontSize: 'var(--text-caption)',
                    letterSpacing: 'var(--tracking-caps)',
                    textTransform: 'uppercase',
                    color: `var(${TIER_TEXT_TOKEN[master.tier]})`,
                    marginBottom: 'var(--space-1)',
                  } as React.CSSProperties
                }
              >
                {TIER_LABEL[master.tier]}
              </p>
              <h3
                style={
                  {
                    fontFamily: 'var(--font-display)',
                    fontWeight: 400,
                    fontSize: 'var(--text-h4)',
                    color: 'var(--text-primary)',
                    letterSpacing: 'var(--tracking-heading)',
                    marginBottom: 'var(--space-2)',
                    overflowWrap: 'break-word',
                  } as React.CSSProperties
                }
              >
                {master.name}
              </h3>
              <p
                style={
                  {
                    fontFamily: 'var(--font-text)',
                    fontSize: 'var(--text-small)',
                    color: 'var(--text-secondary)',
                    lineHeight: 'var(--leading-body)',
                    marginBottom: 'var(--space-3)',
                    minHeight: '3.6em',
                  } as React.CSSProperties
                }
              >
                {master.specialty}
              </p>
              <p
                style={
                  {
                    fontFamily: 'var(--font-numeric)',
                    fontWeight: 'var(--weight-bold)',
                    fontSize: 'var(--text-body)',
                    color: 'var(--text-primary)',
                    letterSpacing: 'var(--tracking-numeric)',
                    borderTop: '1px solid var(--border-color-quiet)',
                    paddingTop: 'var(--space-2)',
                  } as React.CSSProperties
                }
              >
                {master.rating ?? 'оценок пока нет'}
              </p>
            </StaggerItem>
          ))}
        </StaggerGrid>

        {/* Текст-связка */}
        <p
          style={
            {
              fontFamily: 'var(--font-text)',
              fontSize: 'var(--text-body)',
              color: 'var(--text-secondary)',
              lineHeight: 'var(--leading-body)',
              maxWidth: 'var(--measure-base)',
              marginTop: 'var(--space-8)',
              marginBottom: 'var(--space-4)',
            } as React.CSSProperties
          }
        >
          Оценок у мастеров разное количество: кто-то работает в салоне дольше.
          Если хотите конкретного мастера — выбирайте его в онлайн-записи, там
          видно только его свободные окна. Если важнее время, а не имя, напишите
          желаемый день, и вам предложат, кто свободен.
        </p>

        {/* Кнопки */}
        <div className="flex flex-col sm:flex-row" style={{ gap: 'var(--space-2)' }}>
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
                background: 'var(--bg-accent)',
                color: 'var(--text-on-accent)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-text)',
                fontWeight: 'var(--weight-semibold)',
                fontSize: 'var(--text-body)',
                boxShadow: 'var(--shadow-accent)',
                transition: 'opacity var(--transition-base)',
              } as React.CSSProperties
            }
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Записаться онлайн
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
            Подобрать по времени
          </MotionLink>
        </div>
      </div>
    </section>
  )
}
