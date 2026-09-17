import { Reveal, RevealItem, StaggerGrid, StaggerItem } from './motion/Reveal'
import { MotionLink } from './motion/Interactive'

const DIKIDI_URL = 'https://dikidi.net/970292'

const modules = import.meta.glob<{ default: string }>(
  '../assets/works/*.{jpg,jpeg,png,webp}',
  { eager: true }
)
const photos = Object.keys(modules)
  .sort()
  .map((k) => modules[k].default)

/* Подписи сопоставляются с файлами по алфавиту имён — поэтому
   файлы в assets/works пронумерованы: 01-…, 02-… и так далее. */
const CAPTIONS = [
  'Объём с мокрым эффектом. Реснички собраны в пучки, между ними просветы',
  'Классика на свою ресничку. Спокойная длина, брови в укладке',
  'Цветное наращивание: бирюзовые кончики поверх чёрного ряда',
  'Норка. Мягкий изгиб и приглушённый блеск, тёплый коричневый тон',
  'Цветное наращивание в бордовом. Цветные реснички — доплата 300 ₽',
  'Коричневые реснички и ламинирование бровей. Всё держится на своём тоне',
  'Цветное наращивание с мятными кончиками, широкая бровь в укладке',
  'Работа целиком: ресницы, брови и макияж в одном образе',
]

const ALTS = [
  'Наращивание ресниц с мокрым эффектом, работа салона AVANA',
  'Классическое наращивание ресниц и укладка бровей, салон AVANA',
  'Цветное наращивание ресниц с бирюзовыми кончиками, салон AVANA',
  'Наращивание ресниц «норка», тёплый коричневый оттенок, салон AVANA',
  'Цветное наращивание ресниц в бордовом оттенке, салон AVANA',
  'Коричневые реснички и ламинирование бровей, салон AVANA',
  'Цветное наращивание ресниц с мятными кончиками, салон AVANA',
  'Ресницы, брови и макияж — работа салона AVANA в Екатеринбурге',
]

export default function Works() {
  return (
    <section
      id="works"
      aria-labelledby="works-title"
      style={{
        background: 'var(--bg-page)',
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
            id="works-title"
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
            Работы мастеров AVANA
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
            Снимки без ретуши формы: видно длину, границу ряда и то, как объём
            ложится на собственную ресницу. Смотрите то, что ближе к вашей задаче,
            и называйте номер при записи.
          </RevealItem>
        </Reveal>

        {photos.length > 0 ? (
          <>
            <StaggerGrid
              className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
              style={{ gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}
              amount={0.1}
            >
              {photos.map((src, i) => (
                <StaggerItem
                  as="figure"
                  key={src}
                  style={{
                    position: 'relative',
                    aspectRatio: 'var(--photo-ratio)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-photo)',
                    margin: 0,
                  } as React.CSSProperties}
                >
                  <img
                    src={src}
                    alt={ALTS[i] ?? 'Работа мастера салона AVANA'}
                    loading={i < 4 ? undefined : 'lazy'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: `transform var(--duration-slow) var(--ease-out)`,
                    } as React.CSSProperties}
                    onMouseEnter={(e) => {
                      ;(e.currentTarget as HTMLImageElement).style.transform = 'scale(1.03)'
                      const cap = e.currentTarget.nextElementSibling as HTMLElement | null
                      if (cap) cap.style.background = 'var(--overlay-photo-hover)'
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'
                      const cap = e.currentTarget.nextElementSibling as HTMLElement | null
                      if (cap) cap.style.background = 'var(--overlay-photo)'
                    }}
                  />
                  <figcaption
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'flex-end',
                      padding: 'var(--space-2)',
                      background: 'var(--overlay-photo)',
                      transition: `background var(--transition-base)`,
                      pointerEvents: 'none',
                      zIndex: 'var(--z-photo-caption)',
                    } as React.CSSProperties}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-text)',
                        fontSize: 'var(--text-caption)',
                        color: 'var(--text-primary)',
                        lineHeight: 'var(--leading-body)',
                      } as React.CSSProperties}
                    >
                      {CAPTIONS[i] ?? ''}
                    </span>
                  </figcaption>
                </StaggerItem>
              ))}
            </StaggerGrid>

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
              Хочу так же
            </MotionLink>
          </>
        ) : (
          <div
            style={{
              background: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-6)',
              maxWidth: 'var(--measure-base)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-text)',
                fontSize: 'var(--text-body)',
                color: 'var(--text-secondary)',
                lineHeight: 'var(--leading-body)',
                marginBottom: 'var(--space-4)',
              } as React.CSSProperties}
            >
              Фотографии работ готовятся к публикации.
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
              Смотреть работы в DIKIDI
            </MotionLink>
          </div>
        )}
      </div>
    </section>
  )
}
