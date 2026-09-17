import silk from '../assets/texture/01-silk-light.jpg'
import { Reveal, RevealItem } from './motion/Reveal'
import { MotionLink } from './motion/Interactive'

const WHATSAPP_URL = 'https://wa.me/79222066161'

/* Полосный акцент. На странице до него идут только сетки карточек —
   этот блок ломает ритм и даёт странице «момент».
   Изображение декоративное: это фактура, а не работа мастера
   и не интерьер салона. Ничего не утверждает, поэтому честно. */

export default function Statement() {
  return (
    <section
      aria-labelledby="statement-title"
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--bg-page)',
      }}
    >
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
        <img
          src={silk}
          alt=""
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
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
              'linear-gradient(to right, var(--bg-page) 0%, var(--hero-scrim-mid) 42%, var(--hero-scrim-soft) 66%, var(--hero-scrim-clear) 100%)',
          }}
        />
      </div>

      <div
        style={{
          position: 'relative',
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          paddingLeft: 'var(--gutter)',
          paddingRight: 'var(--gutter)',
          paddingTop: 'var(--section-y)',
          paddingBottom: 'var(--section-y)',
        }}
      >
        <Reveal>
          <RevealItem
            as="h2"
            id="statement-title"
            style={
              {
                fontFamily: 'var(--font-display)',
                fontWeight: 400,
                fontSize: 'var(--text-h2)',
                color: 'var(--text-primary)',
                letterSpacing: 'var(--tracking-display)',
                lineHeight: 'var(--leading-heading)',
                maxWidth: '16ch',
                marginBottom: 'var(--space-3)',
              } as React.CSSProperties
            }
          >
            Не знаете, какой объём вам подойдёт
          </RevealItem>

          <RevealItem
            as="p"
            style={
              {
                fontFamily: 'var(--font-text)',
                fontSize: 'var(--text-body-lg)',
                color: 'var(--text-secondary)',
                lineHeight: 'var(--leading-body)',
                maxWidth: '44ch',
                marginBottom: 'var(--space-5)',
              } as React.CSSProperties
            }
          >
            Пришлите в WhatsApp фото результата, который нравится. Вам скажут,
            какая это услуга, сколько стоит и к кому из мастеров идти.
          </RevealItem>

          <RevealItem as="div">
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
              Написать в WhatsApp
            </MotionLink>
          </RevealItem>
        </Reveal>
      </div>
    </section>
  )
}
