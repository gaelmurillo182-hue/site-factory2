import Header from './components/Header'
import Hero from './components/Hero'
import Box from './components/Box'
import Services from './components/Services'
import Objects from './components/Objects'
import Calculator from './components/Calculator'
import Tech from './components/Tech'
import Process from './components/Process'
import Money from './components/Money'
import Who from './components/Who'
import Faq from './components/Faq'
import Lead from './components/Lead'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        К содержимому
      </a>

      <Header />

      <main id="main">
        <Hero />
        <Box />
        <Services />
        <Objects />

        <section className="section section--surface" id="calc" aria-labelledby="calc-title">
          <div className="container">
            <div className="calc__head">
              <h2 className="h2" id="calc-title">
                Соберите состав системы за минуту
              </h2>
              <div>
                <p className="lead">
                  Семь вопросов о вашем объекте. На выходе — перечень того, из чего будет
                  состоять система, и список того, что нужно проверить на месте. Суммы
                  здесь не будет, и на последнем экране написано почему.
                </p>
                <p className="note">
                  Ответы ни к чему не обязывают. Телефон спросим только в конце, и только
                  если захотите вызвать инженера.
                </p>
              </div>
            </div>

            <Calculator />
          </div>
        </section>

        <Tech />
        <Process />
        <Money />
        <Who />
        <Faq />
        <Lead />
      </main>

      <Footer />
    </>
  )
}
