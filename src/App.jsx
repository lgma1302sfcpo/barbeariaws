import { useEffect } from 'react'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import Services from './components/Services.jsx'
import BeforeAfter from './components/BeforeAfter.jsx'
import Gallery from './components/Gallery.jsx'
import Differentials from './components/Differentials.jsx'
import Testimonials from './components/Testimonials.jsx'
import Location from './components/Location.jsx'
import Footer from './components/Footer.jsx'
import FloatingWhatsApp from './components/FloatingWhatsApp.jsx'

export default function App() {
  useEffect(() => {
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
  }, [])

  useEffect(() => {
    if (!window.location.hash) return undefined

    const timeoutId = window.setTimeout(() => {
      document.querySelector(window.location.hash)?.scrollIntoView({ behavior: 'auto', block: 'start' })
    }, 120)

    return () => window.clearTimeout(timeoutId)
  }, [])

  return (
    <div className="min-h-screen bg-ink-950 text-white">
      <Header />
      <main>
        <Hero />
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
