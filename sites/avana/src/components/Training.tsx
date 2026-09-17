import { Reveal, RevealItem, StaggerGrid, StaggerItem } from './motion/Reveal'
import { MotionLink } from './motion/Interactive'
import SectionBackdrop from './SectionBackdrop'
import texture from '../assets/texture/02-amber-wash.jpg'

const DIKIDI_URL = 'https://dikidi.net/970292'
const TELEGRAM_URL = 'https://t.me/salonAVANA'

interface Program {
  title: string
  price: string
  format: string
  who: string
  gives: string
  cta: string
}

const PROGRAMS: Program[] = [
  {
    title: 'Наращивание ресниц',
    price: '59 900 ₽',
    format: 'Индивидуально, 9 часов',
    who: 'Тем, кто начинает с нуля, и тем, кто уже работает, но хочет поставить технику заново.',
    gives: 'Постановка руки, работа с объёмами и эффектами из действующего прайса салона.',
    cta: 'Узнать программу курса',
  },
  {
    title: 'Перманентный макияж, одна зона',
    price: 'от 35 000 ₽',
    format: 'Индивидуально, 9 часов',
    who: 'Мастерам, которые добавляют перманент к своим услугам и хотят начать с одной зоны.',
    gives: 'Одна зона на выбор, отработанная до самостоятельной работы.',
    cta: 'Выбрать зону и записаться',
  },
  {
    title: 'Перманентный макияж, три зоны',
    price: '75 000 ₽',
    format: 'Индивидуально, 9 часов',
    who: 'Тем, кто выходит на перманент как на основное направление.',
    gives: 'Губы, брови и межресничка — три зоны, которые вместе закрывают основной спрос в прайсе.',
    cta: 'Записаться на курс',
  },
]

export default function Training() {
  return (
    <section
      id="training"
      aria-labelledby="training-title"
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--bg-light-dim)',
        paddingTop: 'var(--section-y)',
        paddingBottom: 'var(--section-y)',
      }}
    >
      <SectionBackdrop src={texture} scrim={0.85} tone="light" />
      <div
        style={{
          position: 'relative',
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          paddingLeft: 'var(--gutter)',
          paddingRight: 'var(--gutter)',
        }}
      >
        {/* Шапка */}
        <Reveal style={{ marginBottom: 'var(--space-8)', maxWidth: 'var(--measure-wide)' }}>
          <RevealItem
            as="p"
            style={
              {
                fontFamily: 'var(--font-text)',
                fontWeight: 'var(--weight-bold)',
                fontSize: 'var(--text-caption)',
                letterSpacing: 'var(--tracking-caps)',
                textTransform: 'uppercase',
                color: 'var(--text-accent-on-light)',
                marginBottom: 'var(--space-2)',
              } as React.CSSProperties
            }
          >
            Для мастеров, не для клиенток
          </RevealItem>
          <RevealItem
            as="h2"
            id="training-title"
            style={
              {
                fontFamily: 'var(--font-display)',
                fontWeight: 400,
                fontSize: 'var(--text-h2)',
                color: 'var(--text-on-light)',
                letterSpacing: 'var(--tracking-heading)',
                lineHeight: 'var(--leading-heading)',
                marginBottom: 'var(--space-2)',
              } as React.CSSProperties
            }
          >
            Обучение для мастеров
          </RevealItem>
          <RevealItem
            as="p"
            style={
              {
                fontFamily: 'var(--font-text)',
                fontSize: 'var(--text-body-lg)',
                color: 'var(--text-on-light-secondary)',
                lineHeight: 'var(--leading-body)',
                maxWidth: 'var(--measure-base)',
              } as React.CSSProperties
            }
          >
            Индивидуальный формат: один ученик, девять часов, работа руками с
            первого дня. Программы ведёт действующий салон, а не отдельный
            учебный центр — вы видите, как устроен поток и как считаются цены на
            уровне «топ-мастер».
          </RevealItem>
        </Reveal>

        {/* Программы */}
        <StaggerGrid className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 'var(--space-3)', alignItems: 'stretch' }}>
          {PROGRAMS.map((program) => (
            <StaggerItem
              as="article"
              key={program.title}
              style={
                {
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 'var(--space-4)',
                  background: 'var(--bg-light)',
                  border: '1px solid var(--border-color-on-light)',
                  borderRadius: 'var(--radius-md)',
                } as React.CSSProperties
              }
            >
              <h3
                style={
                  {
                    fontFamily: 'var(--font-display)',
                    fontWeight: 400,
                    fontSize: 'var(--text-h4)',
                    color: 'var(--text-on-light)',
                    letterSpacing: 'var(--tracking-heading)',
                    marginBottom: 'var(--space-2)',
                  } as React.CSSProperties
                }
              >
                {program.title}
              </h3>
              <p
                style={
                  {
                    fontFamily: 'var(--font-numeric)',
                    fontWeight: 'var(--weight-extrabold)',
                    fontSize: 'var(--text-h3)',
                    color: 'var(--text-accent-on-light)',
                    letterSpacing: 'var(--tracking-numeric)',
                    lineHeight: 1,
                    marginBottom: 'var(--space-1)',
                  } as React.CSSProperties
                }
              >
                {program.price}
              </p>
              <p
                style={
                  {
                    fontFamily: 'var(--font-text)',
                    fontSize: 'var(--text-small)',
                    color: 'var(--text-on-light-secondary)',
                    marginBottom: 'var(--space-3)',
                  } as React.CSSProperties
                }
              >
                {program.format}
              </p>

              <div style={{ marginBottom: 'var(--space-2)' }}>
                <p
                  style={
                    {
                      fontFamily: 'var(--font-text)',
                      fontWeight: 'var(--weight-bold)',
                      fontSize: 'var(--text-caption)',
                      letterSpacing: 'var(--tracking-caps)',
                      textTransform: 'uppercase',
                      color: 'var(--text-on-light)',
                      marginBottom: 'var(--space-0-5)',
                    } as React.CSSProperties
                  }
                >
                  Кому подходит
                </p>
                <p
                  style={
                    {
                      fontFamily: 'var(--font-text)',
                      fontSize: 'var(--text-small)',
                      color: 'var(--text-on-light-secondary)',
                      lineHeight: 'var(--leading-body)',
                    } as React.CSSProperties
                  }
                >
                  {program.who}
                </p>
              </div>

              <div style={{ marginBottom: 'var(--space-4)', flex: 1 }}>
                <p
                  style={
                    {
                      fontFamily: 'var(--font-text)',
                      fontWeight: 'var(--weight-bold)',
                      fontSize: 'var(--text-caption)',
                      letterSpacing: 'var(--tracking-caps)',
                      textTransform: 'uppercase',
                      color: 'var(--text-on-light)',
                      marginBottom: 'var(--space-0-5)',
                    } as React.CSSProperties
                  }
                >
                  Что даёт
                </p>
                <p
                  style={
                    {
                      fontFamily: 'var(--font-text)',
                      fontSize: 'var(--text-small)',
                      color: 'var(--text-on-light-secondary)',
                      lineHeight: 'var(--leading-body)',
                    } as React.CSSProperties
                  }
                >
                  {program.gives}
                </p>
              </div>

              <MotionLink
                href={DIKIDI_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={
                  {
                    display: 'block',
                    textAlign: 'center',
                    padding: 'var(--space-2) var(--space-3)',
                    background: 'var(--bg-accent-deep)',
                    color: 'var(--text-on-accent-deep)',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-text)',
                    fontWeight: 'var(--weight-semibold)',
                    fontSize: 'var(--text-small)',
                    transition: 'opacity var(--transition-base)',
                  } as React.CSSProperties
                }
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                {program.cta}
              </MotionLink>
            </StaggerItem>
          ))}
        </StaggerGrid>

        {/* Текст под программами */}
        <div style={{ marginTop: 'var(--space-8)', maxWidth: 'var(--measure-base)' }}>
          <p
            style={
              {
                fontFamily: 'var(--font-text)',
                fontSize: 'var(--text-body)',
                color: 'var(--text-on-light-secondary)',
                lineHeight: 'var(--leading-body)',
                marginBottom: 'var(--space-3)',
              } as React.CSSProperties
            }
          >
            Обучение идёт по записи, поток набирается индивидуально. Напишите,
            какое направление интересует и какой у вас опыт — вам ответят по
            срокам и условиям.
          </p>
          <MotionLink
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={
              {
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-2) var(--space-4)',
                background: 'transparent',
                color: 'var(--text-accent-on-light)',
                border: '1px solid var(--border-color-on-light)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-text)',
                fontWeight: 'var(--weight-semibold)',
                fontSize: 'var(--text-body)',
                transition: 'border-color var(--transition-base)',
              } as React.CSSProperties
            }
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--text-accent-on-light)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color-on-light)')}
          >
            Написать об обучении
          </MotionLink>
        </div>
      </div>
    </section>
  )
}
