import { Reveal, RevealItem, StaggerGrid, StaggerItem } from './motion/Reveal'
import { MotionLink } from './motion/Interactive'
import SectionBackdrop from './SectionBackdrop'
import texture from '../assets/texture/06-three-bands.jpg'

const DIKIDI_URL = 'https://dikidi.net/970292'
const WHATSAPP_URL = 'https://wa.me/79222066161'

interface Tier {
  label: string
  price: string
  text: string
  cta: string
  lineColor: string
  lineWidth: string
  textColor: string
  surface: string
}

const TIERS: Tier[] = [
  {
    label: 'Мастер',
    price: 'наращивание 2 500–4 300 ₽',
    text: 'Базовый уровень прайса. Делает классику, объёмы до мега-объёма, мокрый эффект, экспресс, работает с нижними ресницами. Подходит, если вы носите привычный объём и вам нужен предсказуемый результат за меньшие деньги.',
    cta: 'Записаться к мастеру',
    lineColor: 'var(--tier-base-line)',
    lineWidth: 'var(--line-hairline)',
    textColor: 'var(--tier-base-text)',
    surface: 'var(--tier-base-surface)',
  },
  {
    label: 'Топ-мастер',
    price: 'наращивание 2 700–5 000 ₽',
    text: 'Семь мастеров салона работают в этом статусе. К ним идут за эффектами, которых нет на базовом уровне: «Анимэ», «TIFFANY», «Американка». Ламинирование ресниц и большая часть работ по бровям — тоже здесь.',
    cta: 'Записаться к топ-мастеру',
    lineColor: 'var(--tier-top-line)',
    lineWidth: 'var(--line-hairline)',
    textColor: 'var(--tier-top-text)',
    surface: 'var(--tier-top-surface)',
  },
  {
    label: 'Владелица салона, Дарья Кобзаренко',
    price: 'наращивание 3 500–6 000 ₽',
    text: 'Оценка 5,0 по 107 отзывам. Ведёт LED-наращивание и оформление бровей, обучает мастеров наращиванию. Отдельная позиция в прайсе — «Первый раз у Дарьи», 5 000 ₽: приём для тех, кто приходит к ней впервые.',
    cta: 'Записаться к Дарье',
    lineColor: 'var(--tier-owner-line)',
    lineWidth: 'var(--tier-owner-line-width)',
    textColor: 'var(--tier-owner-text)',
    surface: 'var(--tier-owner-surface)',
  },
]

export default function Tiers() {
  return (
    <section
      id="tiers"
      aria-labelledby="tiers-title"
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--bg-page)',
        paddingTop: 'var(--section-y)',
        paddingBottom: 'var(--section-y)',
      }}
    >
      <SectionBackdrop src={texture} scrim={0.88} tone="dark" position="center" />
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
            id="tiers-title"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              fontSize: 'var(--text-h2)',
              color: 'var(--text-primary)',
              letterSpacing: 'var(--tracking-display)',
              lineHeight: 'var(--leading-heading)',
              maxWidth: 'var(--measure-display)',
              hyphens: 'auto',
              marginBottom: 'var(--space-3)',
            } as React.CSSProperties}
          >
            Три уровня мастера на одну и ту же услугу
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
            Наращивание второго объёма есть у мастера, у топ-мастера и у владелицы
            салона. Разница — в цене, в опыте и в том, насколько быстро появляется
            свободное окно. Ниже — что стоит за каждым уровнем, чтобы вы выбирали
            осознанно, а не по остатку свободных слотов.
          </RevealItem>
        </Reveal>

        <StaggerGrid
          className="grid grid-cols-1 md:grid-cols-3"
          style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}
        >
          {TIERS.map((tier) => (
            <StaggerItem
              as="article"
              key={tier.label}
              style={{
                background: tier.surface,
                borderTop: `${tier.lineWidth} solid ${tier.lineColor}`,
                padding: 'var(--space-4)',
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-text)',
                  fontWeight: 'var(--weight-semibold)',
                  fontSize: 'var(--text-caption)',
                  color: tier.textColor,
                  letterSpacing: 'var(--tracking-caps)',
                  textTransform: 'uppercase',
                  marginBottom: 'var(--space-3)',
                } as React.CSSProperties}
              >
                {tier.label}
              </span>

              <div
                style={{
                  fontFamily: 'var(--font-numeric)',
                  fontWeight: 'var(--weight-extrabold)',
                  fontSize: 'var(--text-h4)',
                  color: 'var(--text-primary)',
                  letterSpacing: 'var(--tracking-numeric)',
                  lineHeight: 1.2,
                  marginBottom: 'var(--space-3)',
                } as React.CSSProperties}
              >
                {tier.price}
              </div>

              <p
                style={{
                  fontFamily: 'var(--font-text)',
                  fontSize: 'var(--text-body)',
                  color: 'var(--text-secondary)',
                  lineHeight: 'var(--leading-loose)',
                  flex: 1,
                  marginBottom: 'var(--space-4)',
                } as React.CSSProperties}
              >
                {tier.text}
              </p>

              <MotionLink
                href={DIKIDI_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: 'var(--space-2) var(--space-3)',
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-text)',
                  fontWeight: 'var(--weight-semibold)',
                  fontSize: 'var(--text-small)',
                  marginTop: 'auto',
                  transition: 'border-color var(--transition-base)',
                } as React.CSSProperties}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-color-accent)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
              >
                {tier.cta}
              </MotionLink>
            </StaggerItem>
          ))}
        </StaggerGrid>

        <p
          style={{
            fontFamily: 'var(--font-text)',
            fontSize: 'var(--text-body)',
            color: 'var(--text-secondary)',
            lineHeight: 'var(--leading-body)',
            maxWidth: 'var(--measure-base)',
          } as React.CSSProperties}
        >
          Не выбрали уровень —{' '}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--text-accent)', textDecoration: 'underline' }}
          >
            напишите в WhatsApp
          </a>
          , что хотите получить, и вам подберут мастера под задачу и бюджет.
          Позиция «Хочу довериться мастеру» в прайсе тоже существует: 3 000 ₽ у
          мастера и топ-мастера, 4 200 ₽ у владелицы.
        </p>
      </div>
    </section>
  )
}
