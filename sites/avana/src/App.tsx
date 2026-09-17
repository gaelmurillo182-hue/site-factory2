import Header from './components/Header'
import Hero from './components/Hero'
import Facts from './components/Facts'
import Tiers from './components/Tiers'
import Services from './components/Services'
import Works from './components/Works'
import Effects from './components/Effects'
import Statement from './components/Statement'
import Price from './components/Price'
import Masters from './components/Masters'
import Training from './components/Training'
import Reviews from './components/Reviews'
import Contacts from './components/Contacts'
import ContactForm from './components/ContactForm'
import Footer from './components/Footer'

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Facts />
        <Tiers />
        <Services />
        <Works />
        <Effects />
        <Statement />
        <Price />
        <Masters />
        <Training />
        <Reviews />
        <Contacts />
        <ContactForm />
      </main>
      <Footer />
    </>
  )
}
