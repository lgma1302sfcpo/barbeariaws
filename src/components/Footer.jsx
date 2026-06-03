import { Instagram } from 'lucide-react'
import { siteConfig, whatsappUrl } from '../data/siteContent.js'
import WhatsAppIcon from './shared/WhatsAppIcon.jsx'

export default function Footer() {
  return (
    <footer className="bg-ink-950">
      <div className="section-shell border-t border-white/10 py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center" data-reveal>
          <div>
            <p className="section-eyebrow">CTA final</p>
            <h2 className="text-3xl font-black text-white sm:text-4xl">Pronto para mudar o visual?</h2>
            <p className="mt-4 max-w-xl text-zinc-300">
              Chame no WhatsApp e fale direto com a barbearia para tirar dúvidas sobre serviços e horários.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <a href={siteConfig.instagramUrl} target="_blank" rel="noreferrer" className="btn-secondary">
              <Instagram size={19} />
              Instagram
            </a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-whatsapp">
              <WhatsAppIcon size={19} />
              Falar no WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <img src={siteConfig.logo} alt={`Logo ${siteConfig.brandName}`} className="h-10 w-10 rounded-md object-contain" />
            <span>{siteConfig.brandName}</span>
          </div>
          <span>{siteConfig.address}</span>
        </div>
      </div>
    </footer>
  )
}
