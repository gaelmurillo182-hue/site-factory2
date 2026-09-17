import { useEffect, useState } from 'react'
import {
  ABOUT, COMPANY, DIFFERENCES, ENTRY_POINTS, FACTS, FACTS_NOTE, FAQ, HERO,
  HOW_BUILT, LAW, METHOD, OFFERS, PRICE_NOTE, REFUSALS,
} from './content'
import { INDUSTRIES } from './industries'
import { Logo, Mark } from './components/Logo'
import { Reveal } from './components/Reveal'
import { Form } from './components/Form'
import { CookieBanner } from './components/CookieBanner'

/** Путь к картинке с учётом base: сайт собирается с относительными путями. */
const img = (name: string) => `${import.meta.env.BASE_URL}${name}`

function useRoute() {
  const [route, setRoute] = useState(() => window.location.hash.replace(/^#/, '') || '/')
  useEffect(() => {
    const onHash = () => {
      setRoute(window.location.hash.replace(/^#/, '') || '/')
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return route
}

export default function App() {
  const route = useRoute()
  const industry = INDUSTRIES.find((i) => route === `/otrasli/${i.slug}`)

  return (
    <>
      <Header />
      <main id="main">
        {industry ? <IndustryPage slug={industry.slug} /> : route === '/politika' ? <PolicyPage /> : <Home />}
      </main>
      <Footer />
      <CookieBanner />
    </>
  )
}

function Header() {
  return (
    <header className="header">
      <div className="page header__inner">
        <Logo />
        <nav className="header__nav" aria-label="Разделы сайта">
          <a href="#metod">Метод</a>
          <a href="#ceny">Цены</a>
          <a href="#ne-beremsya">Не беремся</a>
          <a href="#o-nas">О нас</a>
          <a href="#zayavka">Заявка</a>
        </nav>
      </div>
    </header>
  )
}

/** Полоса во всю ширину: кадр как фон, текст поверх. */
function Band({
  src, alt, side = 'left', children,
}: { src: string; alt: string; side?: 'left' | 'right'; children: React.ReactNode }) {
  return (
    <section className={`band${side === 'right' ? ' band--right' : ''}`}>
      <div className="band__media"><img src={img(src)} alt={alt} loading="lazy" /></div>
      <div className="band__scrim" />
      <div className="page">
        <div className="band__inner">{children}</div>
      </div>
    </section>
  )
}

function Home() {
  return (
    <>
      {/* Первый экран: изображение как холст, текст в нижней трети */}
      <section className="hero">
        <div className="hero__media">
          <img
            src={img('img/01-hero.jpg')}
            alt="Плоский каменный свод из трёх блоков, замковый камень в центре"
            fetchPriority="high"
          />
        </div>
        <div className="hero__scrim" />
        <div className="page">
          <p className="hero__slogan">{COMPANY.tagline}</p>
          <h1 className="hero__title">{HERO.title}</h1>
          <p className="hero__lead">{HERO.lead}</p>
          <div className="hero__actions">
            <a className="btn btn--primary" href="#zayavka">{HERO.cta}</a>
            <a className="btn btn--ghost" href="#ceny">{HERO.ctaSecondary}</a>
          </div>
        </div>
      </section>

      {/* Цифры рынка: чужие, со ссылками */}
      <Reveal as="section">
        <div className="page">
          <div className="facts">
            {FACTS.map((f) => (
              <div key={f.value}>
                <p className="fact__value">{f.value}</p>
                <p className="fact__label">{f.label}</p>
                <p className="fact__source">
                  <a className="link" href={f.href} target="_blank" rel="noreferrer noopener">{f.source}</a>
                </p>
              </div>
            ))}
          </div>
          <p className="facts__disclaimer">{FACTS_NOTE}</p>
        </div>
      </Reveal>

      {/* Отличия: нумерованные строки */}
      <Reveal as="section">
        <div className="page">
          <h2 className="text" style={{ marginBottom: 'var(--s-10)' }}>
            Три вещи, которые мы делаем иначе
          </h2>
          <div className="differences">
            {DIFFERENCES.map((d, i) => (
              <div className="difference" key={d.title}>
                <span className="difference__n">{String(i + 1).padStart(2, '0')}</span>
                <h3>{d.title}</h3>
                <p>{d.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Метод: пара «текст и кадр», ниже шаги */}
      <Reveal as="section">
        <div className="page" id="metod">
          <div className="split split--wide" style={{ marginBottom: 'var(--s-16)' }}>
            <div>
              <p className="eyebrow">{METHOD.slogan}</p>
              <h2>Кейсов нет. Есть метод</h2>
              <p className="lead" style={{ marginTop: 'var(--s-5)' }}>{METHOD.lead}</p>
            </div>
            <figure className="split__media" style={{ margin: 0 }}>
              <img src={img('img/02-metod.jpg')} alt="Штангенциркуль измеряет каменный кубик" loading="lazy" />
            </figure>
          </div>
          <div className="steps">
            {METHOD.steps.map((s) => (
              <div className="step" key={s.n}>
                <span className="step__n">{s.n}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Отрасли: две карточки с кадрами */}
      <Reveal as="section">
        <div className="page">
          <h2 className="text">Два пути, в которых мы сейчас сильнее всего</h2>
          <p className="lead text" style={{ marginTop: 'var(--s-4)', marginBottom: 'var(--s-10)' }}>
            Остальные ниши в этом квартале не открываем. Не потому, что не умеем, —
            потому что не хотим учиться за ваш счёт.
          </p>
          <div className="entries">
            {ENTRY_POINTS.map((e) => (
              <a className="entry" key={e.segment} href={`#${e.href}`}>
                <span className="entry__media">
                  <img src={img(e.img)} alt="" loading="lazy" />
                </span>
                <span className="entry__body">
                  <span className="entry__segment">{e.segment}</span>
                  <span className="entry__pain">{e.pain}</span>
                  <span className="entry__row">
                    <span className="entry__price">{e.price}</span>
                  </span>
                  <span className="entry__step">{e.step}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Полоса перед прайсом */}
      <Band src="img/07-ceny.jpg" alt="Ряд мерных стальных плиток, одна из них зелёная" side="right">
        <h2>Цена называется до договора, а не после</h2>
        <p className="lead" style={{ marginTop: 'var(--s-5)' }}>
          Две цены названы прямо и не меняются. Ещё две называются после аудита — и мы
          объясняем, почему именно так, а не «рассчитаем индивидуально». Строчки «от»
          в прайсе нет вообще.
        </p>
      </Band>

      {/* Витрина */}
      <Reveal as="section">
        <div className="page" id="ceny">
          <h2 className="text" style={{ marginBottom: 'var(--s-10)' }}>Две цены названы прямо. Две — после аудита</h2>
          <div className="offers">
            {OFFERS.map((o) => (
              <div className="offer" key={o.title}>
                <div className="offer__head">
                  <h3>{o.title}</h3>
                  <p className="offer__price">{o.price}</p>
                  <p className="offer__term">{o.term}</p>
                  {o.note && <p className="offer__note">{o.note}</p>}
                </div>
                <div>
                  <p className="offer__caption">Что входит</p>
                  <ul className="offer__list">{o.includes.map((x) => <li key={x}><span>{x}</span></li>)}</ul>
                </div>
                <div>
                  <p className="offer__caption">Что не входит</p>
                  <ul className="offer__list offer__list--no">{o.excludes.map((x) => <li key={x}><span>{x}</span></li>)}</ul>
                </div>
              </div>
            ))}
          </div>
          <p className="pricenote">{PRICE_NOTE}</p>
        </div>
      </Reveal>

      {/* Отказы: полоса с порогом, ниже список */}
      <Band src="img/06-porog.jpg" alt="Каменный порог, через который проходит полоса света">
        <p className="eyebrow">{REFUSALS.slogan}</p>
        <h2>За что не беремся</h2>
        <p className="lead" style={{ marginTop: 'var(--s-5)' }}>{REFUSALS.lead}</p>
      </Band>

      <Reveal as="section">
        <div className="page" id="ne-beremsya">
          <div className="refusals">
            {REFUSALS.items.map((r) => (
              <div className="refusal" key={r.title}>
                <h3>{r.title}</h3>
                <p>{r.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Данные и закон: пара, кадр слева */}
      <Reveal as="section">
        <div className="page" id="dannye">
          <div className="split split--flip">
            <div>
              <h2>{LAW.title}</h2>
              <p className="lead" style={{ marginTop: 'var(--s-5)' }}>{LAW.lead}</p>
            </div>
            <figure className="split__media" style={{ margin: 0 }}>
              <img src={img('img/05-dannye.jpg')} alt="Тёмные каменные плиты, одна светится изнутри" loading="lazy" />
            </figure>
          </div>
          <div className="qa" style={{ marginTop: 'var(--s-12)' }}>
            {LAW.items.map((i) => (
              <div className="qa__item" key={i.q}>
                <p className="qa__q">{i.q}</p>
                <p className="qa__a">{i.a}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* О нас */}
      <Reveal as="section">
        <div className="page" id="o-nas">
          <h2 className="text">{ABOUT.title}</h2>
          <p className="lead text" style={{ marginTop: 'var(--s-4)', marginBottom: 'var(--s-10)' }}>
            {ABOUT.lead}
          </p>
          <div className="about">
            {ABOUT.blocks.map((b) => (
              <div className="about__block" key={b.title}>
                <h3>{b.title}</h3>
                <p>{b.body}</p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 'var(--s-8)' }}>
            <span className="todo">НУЖНО ОТ ВЛАДЕЛЬЦА: имя, роль и фотография — или письменный отказ от фотографии</span>
          </p>
        </div>
      </Reveal>

      {/* Возражения */}
      <Reveal as="section">
        <div className="page">
          <h2 className="text">То, что нам говорят чаще всего</h2>
          <div className="qa" style={{ marginTop: 'var(--s-10)' }}>
            {FAQ.map((i) => (
              <div className="qa__item" key={i.q}>
                <p className="qa__q">{i.q}</p>
                <p className="qa__a">{i.a}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Заявка на фоне замкового камня */}
      <Band src="img/08-zamok.jpg" alt="Замковый камень, подсвеченный сзади зелёным светом">
        <h2 id="zayavka">Начинается всё с трёх цифр</h2>
        <p className="lead" style={{ marginTop: 'var(--s-5)', marginBottom: 'var(--s-10)' }}>
          Сколько это происходит, сколько времени занимает и где живут данные.
          Этого достаточно, чтобы назвать вам цену или сказать, что браться не стоит.
        </p>
        <Form />
      </Band>
    </>
  )
}

function IndustryPage({ slug }: { slug: string }) {
  const ind = INDUSTRIES.find((i) => i.slug === slug)!
  return (
    <>
      <section className="hero">
        <div className="hero__media"><img src={img(ind.img)} alt="" fetchPriority="high" /></div>
        <div className="hero__scrim" />
        <div className="page">
          <p className="hero__slogan">{ind.eyebrow}</p>
          <h1 className="hero__title" style={{ fontSize: 'var(--t-3xl)', maxWidth: '18ch' }}>{ind.title}</h1>
          <p className="hero__lead">{ind.lead}</p>
          <div className="hero__actions">
            <a className="btn btn--primary" href="#zayavka">Заказать аудит за 20 000 ₽</a>
            <a className="btn btn--ghost" href="#/">Все услуги и цены</a>
          </div>
        </div>
      </section>

      <Reveal as="section">
        <div className="page">
          <h2 className="text" style={{ marginBottom: 'var(--s-10)' }}>Что болит</h2>
          <div className="steps">
            {ind.pains.map((p, i) => (
              <div className="step" key={p}>
                <span className="step__n">{String(i + 1).padStart(2, '0')}</span>
                <p style={{ color: 'var(--c-text)', fontSize: 'var(--t-lg)', lineHeight: 'var(--lh-snug)', maxWidth: '58ch' }}>
                  {p}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section">
        <div className="page">
          <h2 className="text" style={{ marginBottom: 'var(--s-10)' }}>Порядок работы</h2>
          <div className="offers">
            {ind.steps.map((s) => (
              <div className="offer" key={s.title} style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,2fr)' }}>
                <div className="offer__head">
                  <h3>{s.title}</h3>
                  <p className="offer__price">{s.price}</p>
                </div>
                <p style={{ color: 'var(--c-text-2)' }}>{s.body}</p>
              </div>
            ))}
          </div>
          <p className="pricenote">
            {ind.anchor.claim} Наша цена ниже — и это не скидка, а следствие того,
            что мы не берём на себя того, чего не проверили.{' '}
            <a className="link" href={ind.anchor.href} target="_blank" rel="noreferrer noopener">
              Источник: {ind.anchor.source}
            </a>
          </p>
        </div>
      </Reveal>

      <Band src="img/06-porog.jpg" alt="Каменный порог, через который проходит полоса света">
        <h2>Чего мы в этой нише не делаем</h2>
      </Band>

      <Reveal as="section">
        <div className="page">
          <div className="refusals" style={{ gridTemplateColumns: 'minmax(0,1fr)' }}>
            {ind.limits.map((l) => (
              <div className="refusal" key={l}><p>{l}</p></div>
            ))}
          </div>
        </div>
      </Reveal>

      <Band src="img/08-zamok.jpg" alt="Замковый камень, подсвеченный сзади зелёным светом">
        <h2 id="zayavka">Начинается всё с трёх цифр</h2>
        <p className="lead" style={{ marginTop: 'var(--s-5)', marginBottom: 'var(--s-10)' }}>
          Сколько это происходит, сколько времени занимает и где живут данные.
        </p>
        <Form />
      </Band>
    </>
  )
}

function PolicyPage() {
  return (
    <section style={{ paddingBlock: 'var(--s-24)' }}>
      <div className="page text">
        <h1 style={{ fontSize: 'var(--t-2xl)', marginBottom: 'var(--s-6)' }}>
          Политика обработки персональных данных
        </h1>
        <p className="notice notice--danger" style={{ marginBottom: 'var(--s-8)' }}>
          Текст политики не написан. Он требует реквизитов ИП и подписи владельца,
          а до подачи уведомления в Роскомнадзор сайт не публикуется. Выдумывать
          юридический документ мы не станем — это ровно та ошибка, от которой
          мы отговариваем клиентов.
        </p>
        <p style={{ color: 'var(--c-text-2)' }}>
          Что здесь будет: кто оператор и его реквизиты · какие данные собираются
          через форму · на каком основании и с какой целью · срок хранения ·
          кому передаются · как отозвать согласие и по какому адресу ·
          как направить запрос субъекта данных.
        </p>
        <p style={{ marginTop: 'var(--s-6)' }}>
          <span className="todo">НУЖНО ОТ ВЛАДЕЛЬЦА: реквизиты ИП, адрес для запросов по ПДн, подача уведомления в РКН</span>
        </p>
        <p style={{ marginTop: 'var(--s-8)' }}><a className="link" href="#/">Вернуться на главную</a></p>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="page">
        <div className="footer__grid">
          <div>
            <div style={{ marginBottom: 'var(--s-4)' }}>
              <span className="logo">
                <Mark size={24} />
                <span className="logo__word" style={{ fontSize: 'var(--t-md)' }}>{COMPANY.name}</span>
              </span>
            </div>
            <p>{COMPANY.legal}</p>
            <p style={{ marginTop: 'var(--s-2)' }}>
              <span className="todo">НУЖНО ОТ ВЛАДЕЛЬЦА: ИНН, ОГРНИП, адрес</span>
            </p>
          </div>

          <div>
            <p className="footer__title">Отрасли</p>
            {INDUSTRIES.map((i) => (
              <p key={i.slug}><a className="link" href={`#/otrasli/${i.slug}`}>{i.title}</a></p>
            ))}
          </div>

          <div>
            <p className="footer__title">Документы и связь</p>
            <p><a className="link" href="#/politika">Политика обработки персональных данных</a></p>
            <p style={{ marginTop: 'var(--s-2)' }}>
              <span className="todo">НУЖНО ОТ ВЛАДЕЛЬЦА: почта, мессенджер, адрес для запросов по ПДн</span>
            </p>
          </div>
        </div>
        <p className="footer__built">{HOW_BUILT}</p>
      </div>
    </footer>
  )
}
