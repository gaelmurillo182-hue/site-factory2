import { Reveal, RevealItem, StaggerGrid, StaggerItem } from './motion/Reveal'
import { MotionLink } from './motion/Interactive'
import SectionBackdrop from './SectionBackdrop'
import texture from '../assets/texture/01-paper-light.jpg'

const DIKIDI_URL = 'https://dikidi.net/970292'

interface Service {
  title: string
  price: string
  text: string
  cta: string
}

const SERVICES: Service[] = [
  {
    title: 'Наращивание ресниц',
    price: 'от 2 500 ₽',
    text: 'Объёмы от классики до мега-объёма 6–8D, мокрый эффект, норка, экспресс, уголки, нижние ресницы. LED-наращивание — без доплаты к любому объёму. Снятие ресниц AVANA бесплатно, если записываетесь на новое наращивание.',
    cta: 'Посмотреть объёмы и цены',
  },
  {
    title: 'Ламинирование ресниц',
    price: 'от 1 000 ₽',
    text: 'Верхние ресницы с окрашиванием — 2 500 ₽, час работы. Есть комплекс с бровями от 4 200 ₽ и скидка 10% на первый визит. Ботокс к ламинированию — 300 ₽.',
    cta: 'Записаться на ламинирование',
  },
  {
    title: 'Оформление бровей',
    price: 'от 600 ₽',
    text: 'Коррекция воском и пинцетом, окрашивание краской или хной, осветление, прореживание, ламинирование и долговременная укладка. Лёгкая коррекция занимает 10 минут, комплекс с окрашиванием — 45 минут.',
    cta: 'Записаться на брови',
  },
  {
    title: 'Перманентный макияж',
    price: 'от 6 500 ₽',
    text: 'Брови и губы — 8 500 ₽ первичная процедура, межресничка — 6 500 ₽. Перекрываем работу другого мастера за 8 900 ₽ и удаляем перманент ремувером, 3 900 ₽ за сеанс. Коррекции дешевле первичной процедуры.',
    cta: 'Записаться на перманент',
  },
  {
    title: 'Макияж и укладка',
    price: 'от 1 000 ₽',
    text: 'Дневной макияж — 3 500 ₽, вечерний «всё включено» — 4 000 ₽ за два часа. Лёгкая укладка от 1 000 ₽ на волосы до плеч и 1 500 ₽ на длинные. Берите вместе, если собираетесь на событие.',
    cta: 'Записаться на макияж',
  },
  {
    title: 'Депиляция лица',
    price: 'от 350 ₽',
    text: 'Одна зона — 10 минут. Комплекс из трёх зон от 900 ₽. Full face от 1 500 ₽, сюда входит коррекция бровей.',
    cta: 'Записаться на депиляцию',
  },
  {
    title: 'Тату',
    price: 'от 3 500 ₽',
    text: 'Мини-тату — 3 500 ₽, средний размер от 4 500 ₽. Индивидуальный эскиз разрабатывается отдельно, 600 ₽ и 40 минут. Ведёт Ирина, топ-мастер.',
    cta: 'Обсудить эскиз',
  },
]

export default function Services() {
  return (
    <section
      id="services"
      aria-labelledby="services-title"
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--bg-light)',
        paddingTop: 'var(--section-y)',
        paddingBottom: 'var(--section-y)',
      }}
    >
      <SectionBackdrop src={texture} scrim={0.9} tone="light" />
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
            id="services-title"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              fontSize: 'var(--text-h2)',
              color: 'var(--text-on-light)',
              letterSpacing: 'var(--tracking-display)',
              lineHeight: 'var(--leading-heading)',
              maxWidth: 'var(--measure-display)',
              hyphens: 'auto',
              marginBottom: 'var(--space-3)',
            } as React.CSSProperties}
          >
            Что делаем
          </RevealItem>
          <RevealItem
            as="p"
            style={{
              fontFamily: 'var(--font-text)',
              fontSize: 'var(--text-body-lg)',
              color: 'var(--text-on-light-secondary)',
              lineHeight: 'var(--leading-body)',
              maxWidth: 'var(--measure-base)',
            } as React.CSSProperties}
          >
            Семь направлений. Цены указаны «от» — точная сумма зависит от уровня
            мастера и выбранных дополнений, полный прайс ниже на странице.
          </RevealItem>
        </Reveal>

        <StaggerGrid
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
          style={{ gap: 'var(--space-4)' }}
        >
          {SERVICES.map((s) => (
            <StaggerItem
              as="article"
              key={s.title}
              style={{
                background: 'var(--bg-light-dim)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-4)',
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-numeric)',
                  fontWeight: 'var(--weight-extrabold)',
                  fontSize: 'var(--text-h4)',
                  color: 'var(--text-accent-on-light)',
                  letterSpacing: 'var(--tracking-numeric)',
                  lineHeight: 1,
                  marginBottom: 'var(--space-2)',
                } as React.CSSProperties}
              >
                {s.price}
              </div>

              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 400,
                  fontSize: 'var(--text-h4)',
                  color: 'var(--text-on-light)',
                  letterSpacing: 'var(--tracking-heading)',
                  lineHeight: 'var(--leading-heading)',
                  marginBottom: 'var(--space-2)',
                  hyphens: 'auto',
                } as React.CSSProperties}
              >
                {s.title}
              </h3>

              <p
                style={{
                  fontFamily: 'var(--font-text)',
                  fontSize: 'var(--text-body)',
                  color: 'var(--text-on-light-secondary)',
                  lineHeight: 'var(--leading-loose)',
                  flex: 1,
                  marginBottom: 'var(--space-4)',
                } as React.CSSProperties}
              >
                {s.text}
              </p>

              <MotionLink
                href={DIKIDI_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: 'var(--space-2) var(--space-3)',
                  background: 'var(--bg-accent-deep)',
                  color: 'var(--text-on-accent-deep)',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-text)',
                  fontWeight: 'var(--weight-semibold)',
                  fontSize: 'var(--text-small)',
                  marginTop: 'auto',
                  transition: 'opacity var(--transition-base)',
                } as React.CSSProperties}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                {s.cta}
              </MotionLink>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </section>
  )
}
