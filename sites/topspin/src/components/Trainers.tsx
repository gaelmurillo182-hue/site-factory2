import veraSmirnova from '../assets/trainers/vera-smirnova.png'
import polinaDegtyareva from '../assets/trainers/polina-degtyareva.png'
import evgenyPopov from '../assets/trainers/evgeny-popov.png'
import alexeyKarmanov from '../assets/trainers/alexey-karmanov.png'
import arinaAssapova from '../assets/trainers/arina-assapova.png'
import alexanderTyutryumov from '../assets/trainers/alexander-tyutryumov.png'

const TELEGRAM_URL = 'https://t.me/knttopspin'

interface Trainer {
  name: string
  role: string
  credentials: string
  text: string
  photo: string
  phone?: string
  telegramHandle?: string
}

const TRAINERS: Trainer[] = [
  {
    name: 'Вера Смирнова',
    role: 'Тренер',
    credentials: 'Мастер спорта · Победитель Клубного чемпионата ФНТР (супер-лига) · Призёр Первенства России · Призёр чемпионата УрФО',
    text: 'Опыт и профессионализм Веры позволяет ей эффективно передавать знания и навыки ученикам.',
    photo: veraSmirnova,
    phone: '+7 992 335-26-47',
    telegramHandle: 'verochkkaa',
  },
  {
    name: 'Полина Дегтярева',
    role: 'Тренер',
    credentials: 'Мастер спорта · Призёр Командного чемпионата России · Многократный победитель первенств УрФО',
    text: 'Владеет глубокими знаниями техники и тактики игры, а также принципами эффективного тренировочного процесса.',
    photo: polinaDegtyareva,
    phone: '+7 912 617-80-61',
    telegramHandle: 'Polinaaa21deg',
  },
  {
    name: 'Евгений Попов',
    role: 'Тренер',
    credentials: 'КМС · Призёр областных и российских соревнований · Опыт выступлений на уровне страны',
    text: 'Находит общий язык с каждым спортсменом — от младших возрастов до взрослых игроков.',
    photo: evgenyPopov,
    phone: '+7 912 634-74-35',
  },
  {
    name: 'Алексей Карманов',
    role: 'Тренер',
    credentials: 'Индивидуальные тренировки · Работа с начинающими · Персональный подход',
    text: 'Помогает пройти путь от первых робких ударов до уверенной и техничной игры. Индивидуально 1 600 ₽/час, сплит 2 200 ₽/час.',
    photo: alexeyKarmanov,
    phone: '+7 912 220-55-76',
  },
  {
    name: 'Арина Ассапова',
    role: 'Тренер',
    credentials: 'КМС · Призёр первенства России (парный разряд) · Победитель первенств УрФО',
    text: 'Работает и со взрослыми, и с детьми. Призёр Всероссийских соревнований.',
    photo: arinaAssapova,
    phone: '+7 912 642-81-40',
    telegramHandle: 'arinkisfg',
  },
  {
    name: 'Александр Тютрюмов',
    role: 'Спарринг-партнёр',
    credentials: 'Чемпион России (до 22 лет) · Серебряный призёр «Топ-16 России» · Рейтинг TTWR: 1889',
    text: 'Действующий спортсмен клуба УГМК, лучший игрок Свердловской области. 1&nbsp;ч — 2&nbsp;500&nbsp;₽, 1,5&nbsp;ч — 3&nbsp;500&nbsp;₽ + аренда.',
    photo: alexanderTyutryumov,
    phone: '+7 912 239-28-40',
    telegramHandle: 'tiutriumov',
  },
]

export default function Trainers() {
  return (
    <section
      id="trainers"
      aria-labelledby="trainers-title"
      style={{
        background: 'var(--color-board)',
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
            id="trainers-title"
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
            Кто ведёт тренировки
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-text)',
              fontSize: 'var(--text-body-lg)',
              color: 'var(--color-chalk-muted)',
              maxWidth: '55ch',
            } as React.CSSProperties}
          >
            Шесть тренеров, среди них мастера спорта и кандидаты в мастера.
          </p>
        </div>

        {/* Сетка тренеров */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
          style={{ gap: 'var(--space-6)' }}
        >
          {TRAINERS.map((trainer) => (
            <article key={trainer.name}>
              {/* Фото 1:1 */}
              <div
                style={{
                  aspectRatio: '1 / 1',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  marginBottom: 'var(--space-3)',
                  background: 'var(--bg-elevated)',
                } as React.CSSProperties}
              >
                <img
                  src={trainer.photo}
                  alt={`Тренер ${trainer.name}`}
                  width={400}
                  height={400}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'top center',
                    display: 'block',
                  }}
                />
              </div>

              {/* Имя */}
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-h4)',
                  fontWeight: 'var(--weight-semibold)',
                  color: 'var(--color-chalk)',
                  letterSpacing: 'var(--tracking-heading)',
                  lineHeight: 'var(--leading-heading)',
                  marginBottom: 'var(--space-0-5)',
                } as React.CSSProperties}
              >
                {trainer.name}
              </h3>

              {/* Роль */}
              <div
                style={{
                  fontFamily: 'var(--font-text)',
                  fontSize: 'var(--text-small)',
                  color: 'var(--color-chalk-muted)',
                  marginBottom: 'var(--space-1)',
                } as React.CSSProperties}
              >
                {trainer.role}
              </div>

              {/* Регалии */}
              <p
                style={{
                  fontFamily: 'var(--font-text)',
                  fontSize: 'var(--text-small)',
                  color: 'var(--color-ball-bright)',
                  lineHeight: 'var(--leading-body)',
                  marginBottom: 'var(--space-2)',
                } as React.CSSProperties}
              >
                {trainer.credentials}
              </p>

              {/* Текст */}
              <p
                style={{
                  fontFamily: 'var(--font-text)',
                  fontSize: 'var(--text-body)',
                  color: 'var(--color-chalk-muted)',
                  lineHeight: 'var(--leading-body)',
                  marginBottom: 'var(--space-3)',
                } as React.CSSProperties}
                dangerouslySetInnerHTML={{ __html: trainer.text }}
              />

              {/* Контакты */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'var(--space-2)',
                }}
              >
                {trainer.phone && (
                  <a
                    href={`tel:${trainer.phone.replace(/[\s\-()]/g, '')}`}
                    style={{
                      fontFamily: 'var(--font-text)',
                      fontSize: 'var(--text-small)',
                      color: 'var(--color-chalk-muted)',
                      borderBottom: '1px solid var(--line-color-dim)',
                      paddingBottom: '1px',
                      transition: 'color var(--transition-base)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-chalk)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-chalk-muted)')}
                  >
                    {trainer.phone}
                  </a>
                )}
                {trainer.telegramHandle && (
                  <a
                    href={`https://t.me/${trainer.telegramHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: 'var(--font-text)',
                      fontSize: 'var(--text-small)',
                      color: 'var(--color-ball-bright)',
                      transition: 'opacity var(--transition-base)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    @{trainer.telegramHandle}
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* CTA блок под тренерами */}
        <div
          style={{
            marginTop: 'var(--space-12)',
            paddingTop: 'var(--space-8)',
            borderTop: 'var(--line-width) solid var(--line-color-dim)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 'var(--space-4)',
          } as React.CSSProperties}
          className="md:flex-row md:items-center md:justify-between"
        >
          <p
            style={{
              fontFamily: 'var(--font-text)',
              fontSize: 'var(--text-body-lg)',
              color: 'var(--color-chalk-muted)',
              lineHeight: 'var(--leading-body)',
              maxWidth: '52ch',
            } as React.CSSProperties}
          >
            Не знаете, к кому идти на первое занятие, — позвоните, подберём тренера
            под возраст и уровень.
          </p>
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: 'var(--space-2) var(--space-5)',
              background: 'var(--color-ball)',
              color: 'var(--color-board)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-text)',
              fontWeight: 'var(--weight-semibold)',
              fontSize: 'var(--text-body)',
              flexShrink: 0,
              transition: 'opacity var(--transition-base)',
            } as React.CSSProperties}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Подобрать тренера
          </a>
        </div>
      </div>
    </section>
  )
}
