import { useEffect } from 'react'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import Services from './components/Services.jsx'
import BeforeAfter from './components/BeforeAfter.jsx'
import Gallery from './components/Gallery.jsx'
import Differentials from './components/Differentials.jsx'
import Products from './components/Products.jsx'
import Testimonials from './components/Testimonials.jsx'
import Location from './components/Location.jsx'
import Footer from './components/Footer.jsx'
import FloatingWhatsApp from './components/FloatingWhatsApp.jsx'
import Admin from './components/Admin.jsx'
import ProductDetail from './components/ProductDetail.jsx'
import AuthPage from './components/AuthPage.jsx'

export default function App() {
  const isAdmin = window.location.pathname === '/admin'
  const isLogin = window.location.pathname === '/login'
  const isRegister = window.location.pathname === '/cadastro'
  const productMatch = window.location.pathname.match(/^\/produto\/([^/]+)$/)
  const productId = productMatch ? decodeURIComponent(productMatch[1]) : ''
  const isProductPage = Boolean(productId)
  const isAuthPage = isLogin || isRegister

  useEffect(() => {
    if (isAdmin || isProductPage || isAuthPage) return undefined

    const elements = document.querySelectorAll('[data-reveal]')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.16 },
    )

    elements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [isAdmin, isProductPage, isAuthPage])

  useEffect(() => {
    if (isAdmin || isProductPage || isAuthPage) return undefined
    if (!window.location.hash) return undefined

    const timeoutId = window.setTimeout(() => {
      const hashId = window.location.hash.slice(1)
      if (!hashId) return

      try {
        document.getElementById(decodeURIComponent(hashId))?.scrollIntoView({ behavior: 'auto', block: 'start' })
      } catch {
        document.getElementById(hashId)?.scrollIntoView({ behavior: 'auto', block: 'start' })
      }
    }, 120)

    return () => window.clearTimeout(timeoutId)
  }, [isAdmin, isProductPage, isAuthPage])

  if (isAdmin) {
    return <Admin />
  }

  if (isProductPage) {
    return (
      <div className="min-h-screen bg-ink-950 text-white">
        <Header />
        <ProductDetail productId={productId} />
        <Footer />
        <FloatingWhatsApp />
      </div>
    )
  }

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-ink-950 text-white">
        <Header />
        <AuthPage mode={isRegister ? 'register' : 'login'} />
        <Footer />
        <FloatingWhatsApp />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-950 text-white">
      <Header />
      <main>
        <Hero />
        <Products />
        <BeforeAfter />
        <Gallery />
        <Differentials />
        <Services />
        <Testimonials />
        <Location />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  )
}
