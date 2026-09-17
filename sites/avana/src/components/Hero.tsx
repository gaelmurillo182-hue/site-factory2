import { motion, useReducedMotion } from 'motion/react'
import heroPhoto from '../assets/works/01-volume-wet-black.jpg'
import { Reveal, RevealItem } from './motion/Reveal'
import { MotionLink } from './motion/Interactive'

const DIKIDI_URL = 'https://dikidi.net/970292'
const WHATSAPP_URL = 'https://wa.me/79222066161'

export default function Hero() {
  const reduced = useReducedMotion()
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      style={{
        position: 'relative',
        minHeight: '100dvh',
        paddingTop: '4.5rem',
        background: 'var(--bg-page)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {/* Фотография работы. Слева плотная растушёвка под текст,
          справа кадр открыт. Проявляется по прозрачности — кадрирование
          зеркалом трансформом уже задано, масштаб при загрузке не трогаем. */}
      <motion.div
        aria-hidden="true"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduced ? 0 : 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
      >
        <img
          src={heroPhoto}
          alt=""
          fetchPriority="high"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 46%',
            /* Кадр зеркалим: глаз в оригинале левее центра и уходил
               под растушёвку. Отражение выводит работу в правую половину. */
            transform: 'scaleX(-1)',
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'var(--photo-tint)' }} />
        <div
          className="lg:hidden"
          style={{ position: 'absolute', inset: 0, background: 'var(--overlay-scrim)' }}
        />
        <div
          className="hidden lg:block"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to right, var(--bg-page) 0%, var(--bg-page) 30%, var(--hero-scrim-mid) 50%, var(--hero-scrim-soft) 72%, var(--hero-scrim-clear) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            insetInline: 0,
            bottom: 0,
            height: 'var(--space-16)',
            background:
              'linear-gradient(to top, var(--bg-page) 0%, var(--hero-scrim-clear) 100%)',
          }}
        />
      </motion.div>

      {/* Раскладка задана классами, а не инлайном: инлайновый display
          перебил бы lg:grid и разворот не собрался бы. */}
      <div
        className="lg:grid lg:grid-cols-12 lg:items-center"
        style={{
          position: 'relative',
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          width: '100%',
          paddingLeft: 'var(--gutter)',
          paddingRight: 'var(--gutter)',
          paddingTop: 'var(--space-6)',
          paddingBottom: 'var(--space-6)',
        }}
      >
        {/* Каскад при загрузке: надзаголовок → H1 → подзаголовок → кнопки.
            Сообщает порядок чтения первого экрана. */}
        <Reveal as="div" className="lg:col-span-7" style={{ minWidth: 0 }} amount={0.1}>
          {/* Адрес: салон — физическое место, куда человек поедет.
              Это функция, а не атмосферная плашка. */}
          <RevealItem
            as="p"
            style={
              {
                fontFamily: 'var(--font-text)',
                fontWeight: 'var(--weight-medium)',
                fontSize: 'var(--text-small)',
                color: 'var(--text-accent)',
                letterSpacing: 'var(--tracking-caps)',
                textTransform: 'uppercase',
                marginBottom: 'var(--space-4)',
              } as React.CSSProperties
            }
          >
            Екатеринбург, Печатников, 1
          </RevealItem>

          <RevealItem
            as="h1"
            id="hero-title"
            style={
              {
                fontFamily: 'var(--font-display)',
                fontWeight: 400,
                /* Кегль подобран так, чтобы заголовок укладывался
                   в две строки на десктопе и в три на мобильном. */
                fontSize: 'clamp(2.125rem, 1.5rem + 2.6vw, 3.75rem)',
                color: 'var(--text-primary)',
                lineHeight: 'var(--leading-display)',
                letterSpacing: 'var(--tracking-display)',
                marginBottom: 'var(--space-3)',
              } as React.CSSProperties
            }
          >
            Ресницы и брови,
            <br />
            за которые не стыдно
          </RevealItem>

          <RevealItem
            as="p"
            style={
              {
                fontFamily: 'var(--font-text)',
                fontSize: 'var(--text-body-lg)',
                color: 'var(--text-secondary)',
                lineHeight: 'var(--leading-body)',
                maxWidth: '46ch',
                marginBottom: 'var(--space-5)',
              } as React.CSSProperties
            }
          >
            Одиннадцать мастеров и три ценовых уровня на одну и ту же работу.
            Выбираете цену сами.
          </RevealItem>

          <RevealItem as="div" className="flex flex-col sm:flex-row" style={{ gap: 'var(--space-2)' }}>
            <MotionLink
              href={DIKIDI_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={
                {
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 'var(--space-2) var(--space-5)',
                  background: 'var(--bg-accent)',
                  color: 'var(--text-on-accent)',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-text)',
                  fontWeight: 'var(--weight-semibold)',
                  fontSize: 'var(--text-body)',
                  whiteSpace: 'nowrap',
                  boxShadow: 'var(--shadow-accent)',
                } as React.CSSProperties
              }
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
                  padding: 'var(--space-2) var(--space-5)',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: 'var(--line-hairline) solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-text)',
                  fontWeight: 'var(--weight-semibold)',
                  fontSize: 'var(--text-body)',
                  whiteSpace: 'nowrap',
                  transition: 'border-color var(--transition-base)',
                } as React.CSSProperties
              }
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color-accent)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)'
              }}
            >
              Написать в WhatsApp
            </MotionLink>
          </RevealItem>
        </Reveal>
      </div>
    </section>
  )
}
