import { useEffect, useState } from 'react'
import { Instagram, LogOut, Menu, ShoppingCart, UserCircle, X } from 'lucide-react'
import { navItems, siteConfig, whatsappUrl } from '../data/siteContent.js'
import { authEventName, clearAuth, readAuth } from '../lib/auth.js'
import { clearCart, openCartMenu } from '../lib/cart.js'
import HeaderCart from './HeaderCart.jsx'
import WhatsAppIcon from './shared/WhatsAppIcon.jsx'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [auth, setAuth] = useState(() => readAuth())
  const isHome = window.location.pathname === '/'
  const homeHref = (href) => (isHome ? href : `/${href}`)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24)
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const syncAuth = () => setAuth(readAuth())

    window.addEventListener(authEventName, syncAuth)

    return () => {
      window.removeEventListener(authEventName, syncAuth)
    }
  }, [])

  const logout = () => {
    clearAuth()
    clearCart()
    setAuth({})
    setIsOpen(false)
  }

  const openCartFromMenu = () => {
    setIsOpen(false)
    openCartMenu()
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition duration-300 ${
        scrolled
          ? 'border-b border-white/10 bg-ink-950/90 shadow-2xl backdrop-blur-xl'
          : 'bg-gradient-to-b from-black/70 to-transparent'
      }`}
    >
      <div className="section-shell flex h-20 items-center justify-between gap-4">
        <a href={homeHref('#topo')} className="flex items-center gap-3" aria-label="Ir para o topo">
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

        <nav className="hidden items-center gap-7 xl:flex" aria-label="Navegacao principal">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={homeHref(item.href)}
              className="text-sm font-semibold text-zinc-300 transition hover:text-gold-300"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <HeaderCart homeHref={homeHref} buttonClassName="hidden xl:inline-flex btn-secondary px-4" />

        <div className="hidden items-center gap-3 xl:flex">
          {auth.user?.role === 'ADMIN' && (
            <a href="/admin" className="btn-secondary px-4">
              Admin
            </a>
          )}

          {auth.user ? (
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2">
              <UserCircle size={18} className="text-gold-300" />
              <span className="max-w-28 truncate text-sm font-bold text-white">{auth.user.name}</span>
              <button type="button" className="text-zinc-400 transition hover:text-white" onClick={logout} aria-label="Sair">
                <LogOut size={17} />
              </button>
            </div>
          ) : (
            <a href="/login" className="btn-secondary px-4">
              <UserCircle size={18} />
              Entrar
            </a>
          )}

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
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white xl:hidden"
          aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isOpen && (
        <div className="max-h-[calc(100vh-80px)] overflow-auto border-t border-white/10 bg-ink-950/95 px-5 pb-5 pt-3 backdrop-blur-xl xl:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-2" aria-label="Navegacao mobile">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={homeHref(item.href)}
                className="rounded-md px-3 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-white/5 hover:text-gold-300"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}

            <button type="button" className="btn-secondary mt-2 justify-center" onClick={openCartFromMenu}>
              <ShoppingCart size={18} />
              Carrinho
            </button>

            {auth.user ? (
              <div className="flex items-center justify-between rounded-md border border-white/10 bg-black/20 px-3 py-3 text-sm">
                <span className="font-bold text-white">{auth.user.name}</span>
                <button type="button" className="font-bold text-zinc-400" onClick={logout}>
                  Sair
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <a href="/login" className="btn-secondary" onClick={() => setIsOpen(false)}>
                  Entrar
                </a>
                <a href="/cadastro" className="btn-primary" onClick={() => setIsOpen(false)}>
                  Cadastrar
                </a>
              </div>
            )}

            {auth.user?.role === 'ADMIN' && (
              <a href="/admin" className="btn-secondary" onClick={() => setIsOpen(false)}>
                Admin
              </a>
            )}

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
