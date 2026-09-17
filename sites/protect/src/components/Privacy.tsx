import { ArrowLeft } from '@phosphor-icons/react'
import Logo from './Logo'
import Footer from './Footer'
import { PRIVACY, PRIVACY_UPDATED } from '../data/privacy'

/**
 * Подсветка пометок [[НУЖНО ОТ КЛИЕНТА: …]].
 * Они остаются в тексте специально: политику нельзя публиковать, пока в ней
 * есть дыра, и выглядеть готовой она не должна.
 */
function withMarks(text: string) {
  return text.split(/(\[\[[^\]]*\]\])/g).map((part, i) =>
    part.startsWith('[[') ? (
      <mark className="need" key={i}>
        {part.slice(2, -2)}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

/**
 * Политика обработки персональных данных.
 * Отдельная страница, а не модальное окно: на неё ссылаются из формы и подвала,
 * её должно быть видно по прямому адресу и можно распечатать.
 */
export default function Privacy() {
  return (
    <>
      <header className="header">
        <div className="container header__inner">
          <a className="header__logo" href="/">
            <Logo />
          </a>
          <a className="btn btn--ghost btn--small" href="/">
            <ArrowLeft size={16} weight="bold" aria-hidden="true" />
            На главную
          </a>
        </div>
      </header>

      <main className="section" id="main">
        <div className="container container--prose doc">
          <h1 className="h2 doc__title">Политика обработки персональных данных</h1>
          <p className="note doc__updated">Редакция от {withMarks(PRIVACY_UPDATED)}</p>

          {PRIVACY.map((block) => (
            <section className="doc__section" key={block.title}>
              <h2 className="h4 doc__heading">{block.title}</h2>
              {block.body.map((p, i) =>
                Array.isArray(p) ? (
                  <ul className="ruled doc__list" key={i}>
                    {p.map((li) => (
                      <li key={li}>{withMarks(li)}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text doc__p" key={i}>
                    {withMarks(p)}
                  </p>
                ),
              )}
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </>
  )
}
