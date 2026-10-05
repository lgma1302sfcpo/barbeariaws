import { Instagram } from 'lucide-react'
import { displayPhone, siteConfig, whatsappUrl } from '../data/business.js'
import WhatsAppIcon from './shared/WhatsAppIcon.jsx'

export default function Footer() {
  return (
    <footer className="bg-ink-950">
      <div className="section-shell border-t border-white/10 py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center" data-reveal>
          <div>
            <p className="section-eyebrow">Fale com a Barbershop WS</p>
            <h2 className="text-3xl font-black text-white sm:text-4xl">Corte e barba por ordem de chegada.</h2>
            <p className="mt-4 max-w-xl text-zinc-300">
              Venha à Barbershop WS: atendemos por ordem de chegada, sem agendamento. Fale no WhatsApp para tirar dúvidas sobre serviços e funcionamento.
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
            <img src={siteConfig.logo} alt={`Logo ${siteConfig.brandName}`} width="256" height="256" loading="lazy" className="h-10 w-10 rounded-md object-contain" />
            <span>{siteConfig.brandName}</span>
          </div>
          <div>
            <address className="not-italic">{siteConfig.address}</address>
            <a href={`tel:+${siteConfig.whatsappNumber}`} className="mt-1 inline-block py-2">{displayPhone}</a>
            <p>{siteConfig.openHours} · Consulte os dias e o fechamento pelo WhatsApp.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
