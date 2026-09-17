import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import CookieNotice from '../CookieNotice'

export default function Layout() {
  const { pathname, hash } = useLocation()

  // При переходе на другую страницу браузер сохраняет позицию прокрутки —
  // в многостраничнике это выглядит как «страница открылась с середины».
  useEffect(() => {
    if (hash) return
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <>
      <a className="skip-link" href="#content">
        К содержимому
      </a>
      <Header />
      <main id="content">
        <Outlet />
      </main>
      <Footer />
      <CookieNotice />
    </>
  )
}
