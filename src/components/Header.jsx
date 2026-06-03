import { useEffect, useState } from 'react'
import { Instagram, Menu, X } from 'lucide-react'
import { navItems, siteConfig, whatsappUrl } from '../data/siteContent.js'
import WhatsAppIcon from './shared/WhatsAppIcon.jsx'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition duration-300 ${
        scrolled ? 'border-b border-white/10 bg-ink-950/90 shadow-2xl backdrop-blur-xl' : 'bg-gradient-to-b from-black/70 to-transparent'
      }`}
    >
      <div className="section-shell flex h-20 items-center justify-between gap-4">
        <a href="#topo" className="flex items-center gap-3" aria-label="Ir para o topo">
          <img
            src={siteConfig.logo}
            alt={`Logo ${siteConfig.brandName}`}
            className="h-12 w-12 rounded-md border border-gold-300/20 bg-black object-contain p-1"
          />
          <div className="leading-none">
            <span className="block text-sm font-black text-white sm:text-base">{siteConfig.brandName}</span>
            <span className="mt-1 block text-xs text-gold-300">Praia Grande - SP</span>
          </div>
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Navegação principal">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-zinc-300 transition hover:text-gold-300"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={siteConfig.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
            aria-label="Abrir Instagram da Barbershop WS"
          >
            <Instagram size={18} />
            Instagram
          </a>
          <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-whatsapp">
            <WhatsAppIcon size={18} />
            Chamar no WhatsApp
          </a>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white lg:hidden"
          aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-white/10 bg-ink-950/95 px-5 pb-5 pt-3 backdrop-blur-xl lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-2" aria-label="Navegação mobile">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-white/5 hover:text-gold-300"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <a
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary mt-2"
              onClick={() => setIsOpen(false)}
            >
              <Instagram size={18} />
              Instagram
            </a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-whatsapp mt-2">
              <WhatsAppIcon size={18} />
              Chamar no WhatsApp
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
