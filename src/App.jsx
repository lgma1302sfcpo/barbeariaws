import { lazy, Suspense, useEffect } from 'react'
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
import FAQ from './components/FAQ.jsx'
import NotFound from './components/NotFound.jsx'
import { applyMetadata, pageMetadata } from './lib/seo.js'

const Admin = lazy(() => import('./components/Admin.jsx'))
const ProductDetail = lazy(() => import('./components/ProductDetail.jsx'))
const AuthPage = lazy(() => import('./components/AuthPage.jsx'))
const routeLoading = <main id="conteudo" className="section-shell min-h-screen pt-28" aria-live="polite">Carregando página…</main>

export default function App({ pathname = typeof window === 'undefined' ? '/' : window.location.pathname }) {
  const isAdmin = pathname === '/admin'
  const isLogin = pathname === '/login'
  const isRegister = pathname === '/cadastro'
  const productMatch = pathname.match(/^\/produto\/([^/]+)\/?$/)
  let productId = ''
  try { productId = productMatch ? decodeURIComponent(productMatch[1]) : '' } catch { /* URL malformada: 404. */ }
  const isProductPage = Boolean(productId)
  const isAuthPage = isLogin || isRegister

  useEffect(() => {
    // Produtos recebem metadados do servidor e, depois, dos dados públicos carregados.
    if (!isProductPage) applyMetadata(pageMetadata(pathname))
  }, [pathname, isProductPage])

  useEffect(() => {
    if (isAdmin || isProductPage || isAuthPage) return undefined
    if (!('IntersectionObserver' in window)) return undefined

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
    return <Suspense fallback={routeLoading}><Admin /></Suspense>
  }

  if (isProductPage) {
    return (
      <div className="min-h-screen bg-ink-950 text-white">
        <Header />
        <Suspense fallback={routeLoading}><ProductDetail productId={productId} /></Suspense>
        <Footer />
        <FloatingWhatsApp />
      </div>
    )
  }

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-ink-950 text-white">
        <Header />
        <Suspense fallback={routeLoading}><AuthPage mode={isRegister ? 'register' : 'login'} /></Suspense>
        <Footer />
        <FloatingWhatsApp />
      </div>
    )
  }

  if (pathname !== '/') return <NotFound />

  return (
    <div className="min-h-screen bg-ink-950 text-white">
      <Header />
      <main id="conteudo" tabIndex={-1}>
        <Hero />
        <Products />
        <BeforeAfter />
        <Gallery />
        <Differentials />
        <Services />
        <Testimonials />
        <Location />
        <FAQ />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  )
}
