import kidsImg from '../assets/training-kids.jpg'
import adultImg from '../assets/adult-training.jpg'
import tournamentImg from '../assets/tournament.jpg'
import hallImg from '../assets/hall-1.jpg'
import doublesImg from '../assets/doubles-tournament.jpg'
import equipmentImg from '../assets/equipment.jpg'

const YCLIENTS_URL = 'https://n1935836.yclients.com/'

interface Service {
  title: string
  price: string
  audience: string
  text: string
  cta: string
  img: string
  imgAlt: string
}

const SERVICES: Service[] = [
  {
    title: 'Детская секция',
    price: '500 ₽ за тренировку',
    audience: 'Дети от 6 лет',
    text: 'Группы формируются по уровню подготовки. На занятии — техника, работа у стола, подвижные упражнения. Первое занятие покажет, подходит ли ребёнку формат и в какую группу его ставить.',
    cta: 'Записать ребёнка',
    img: kidsImg,
    imgAlt: 'Детская тренировка по настольному теннису в клубе Топ-Спин',
  },
  {
    title: 'Групповая тренировка',
    price: '900 ₽ за тренировку',
    audience: 'Взрослые с любого уровня',
    text: 'Тренировка с тренером в группе: разминка, отработка ударов, игровая часть. Подходит, если играли в школе или во дворе и хотите наконец играть правильно.',
    cta: 'Выбрать время',
    img: adultImg,
    imgAlt: 'Групповая тренировка взрослых по настольному теннису',
  },
  {
    title: 'Индивидуальная тренировка',
    price: 'от 1 600 ₽/час',
    audience: 'Разбор вашей игры',
    text: 'Час один на один с тренером. Разбирают конкретно вашу технику: хват, подачу, приём, передвижение. Быстрее, чем в группе, но и дороже.',
    cta: 'Записаться к тренеру',
    img: equipmentImg,
    imgAlt: 'Индивидуальная тренировка по настольному теннису',
  },
  {
    title: 'Рейтинговый турнир TTWR',
    price: '500 ₽ участие',
    audience: 'Субботы и воскресенья',
    text: 'Одиночные, парные и сетка для начинающих. Результат идёт в рейтинг TTWR — у вас появляется собственный рейтинговый номер и понятная точка отсчёта.',
    cta: 'Заявиться на турнир',
    img: tournamentImg,
    imgAlt: 'Рейтинговый турнир TTWR по настольному теннису',
  },
  {
    title: 'Аренда стола',
    price: '600 ₽/час',
    audience: 'С ракетками — 800 ₽/час',
    text: 'Бронируете стол онлайн, приходите своей компанией и играете. Доступ в зал бесконтактный — не нужно никого искать и ждать.',
    cta: 'Забронировать стол',
    img: hallImg,
    imgAlt: 'Аренда стола для настольного тенниса в клубе Топ-Спин',
  },
  {
    title: 'Корпоративные игры',
    price: 'Индивидуально',
    audience: 'Компании и команды',
    text: 'Аренда зала под корпоративный турнир или праздник. Организация спортивных мероприятий, подготовка команд к соревнованиям.',
    cta: 'Оставить заявку',
    img: doublesImg,
    imgAlt: 'Корпоративный турнир по настольному теннису',
  },
]

export default function Services() {
  return (
    <section
      id="services"
      aria-labelledby="services-title"
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
            id="services-title"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-h2)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--color-ink)',
              letterSpacing: 'var(--tracking-heading)',
              lineHeight: 'var(--leading-heading)',
              marginBottom: 'var(--space-2)',
              hyphens: 'auto',
            } as React.CSSProperties}
          >
            Выберите свой формат
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-text)',
              fontSize: 'var(--text-body-lg)',
              color: 'var(--color-ink-muted)',
              maxWidth: '55ch',
            } as React.CSSProperties}
          >
            Цены за одно занятие. Абонементы дешевле — они ниже на странице.
          </p>
        </div>

        {/* Сетка */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
          style={{ gap: 'var(--space-4)' }}
        >
          {SERVICES.map((s) => (
            <article
              key={s.title}
              style={{
                background: 'var(--color-chalk)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-sm)',
              } as React.CSSProperties}
            >
              {/* Фото */}
              <div
                style={{
                  aspectRatio: '16 / 9',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <img
                  src={s.img}
                  alt={s.imgAlt}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'transform var(--duration-slow) var(--ease-out)',
                  } as React.CSSProperties}
                  onMouseEnter={e => ((e.currentTarget as HTMLImageElement).style.transform = 'scale(1.04)')}
                  onMouseLeave={e => ((e.currentTarget as HTMLImageElement).style.transform = 'scale(1)')}
                />
              </div>

              {/* Контент */}
              <div
                style={{
                  padding: 'var(--space-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                }}
              >
                {/* Цена */}
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-h4)',
                    fontWeight: 'var(--weight-bold)',
                    color: 'var(--color-ball)',
                    letterSpacing: 'var(--tracking-heading)',
                    lineHeight: 1,
                    marginBottom: 'var(--space-0-5)',
                    whiteSpace: 'nowrap',
                  } as React.CSSProperties}
                >
                  {s.price}
                </div>

                {/* Аудитория */}
                <div
                  style={{
                    fontFamily: 'var(--font-text)',
                    fontSize: 'var(--text-small)',
                    color: 'var(--color-ink-muted)',
                    marginBottom: 'var(--space-2)',
                  } as React.CSSProperties}
                >
                  {s.audience}
                </div>

                {/* Название */}
                <h3
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-h4)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--color-ink)',
                    letterSpacing: 'var(--tracking-heading)',
                    lineHeight: 'var(--leading-heading)',
                    marginBottom: 'var(--space-2)',
                    hyphens: 'auto',
                  } as React.CSSProperties}
                >
                  {s.title}
                </h3>

                {/* Текст */}
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
                  {s.text}
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
                    background: 'var(--color-ball)',
                    color: 'var(--color-board)',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-text)',
                    fontWeight: 'var(--weight-semibold)',
                    fontSize: 'var(--text-small)',
                    transition: 'opacity var(--transition-base)',
                    marginTop: 'auto',
                  } as React.CSSProperties}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  {s.cta}
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
