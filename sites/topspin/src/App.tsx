import Header from './components/Header'
import Hero from './components/Hero'
import About from './components/About'
import Services from './components/Services'
import Trainers from './components/Trainers'
import Schedule from './components/Schedule'
import Subscriptions from './components/Subscriptions'
import Contacts from './components/Contacts'
import ContactForm from './components/ContactForm'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        {/* Линия между одноцветными секциями */}
        <div
          aria-hidden="true"
          style={{ height: 'var(--line-width)', background: 'var(--line-color-dim)' }}
        />
        <Services />
        <Trainers />
        <div
          aria-hidden="true"
          style={{ height: 'var(--line-width)', background: 'var(--line-color-dim)' }}
        />
        <Schedule />
        <div
          aria-hidden="true"
          style={{ height: 'var(--line-width)', background: 'var(--line-color-dim)' }}
        />
        <Subscriptions />
        <Contacts />
        <div
          aria-hidden="true"
          style={{ height: 'var(--line-width)', background: 'var(--line-color-dim)' }}
        />
        <ContactForm />
      </main>
      <Footer />
    </>
  )
}
