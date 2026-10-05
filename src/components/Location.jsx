import { Clock, ExternalLink, MapPin, Navigation, Phone } from 'lucide-react'
import { displayPhone, siteConfig, whatsappUrl } from '../data/business.js'

export default function Location() {
  return (
    <section id="localizacao" className="section-padding bg-ink-900">
      <div className="section-shell">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
          <div data-reveal>
            <p className="section-eyebrow">Horário e localização</p>
            <h2 className="section-title">Barbearia no Boqueirão, em Praia Grande – SP.</h2>
            <p className="section-copy">
              A Barbershop WS fica no Boqueirão, em Praia Grande, na Baixada Santista. Confira o endereço e abra a rota no Google Maps para planejar sua visita.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex gap-4 rounded-lg border border-white/10 bg-white/[0.045] p-4">
                <MapPin className="mt-1 shrink-0 text-gold-300" size={23} />
                <div>
                  <p className="text-sm font-bold uppercase text-zinc-400">Endereço</p>
                  <address className="mt-1 font-semibold not-italic leading-7 text-white">{siteConfig.address}</address>
                </div>
              </div>
              <div className="flex gap-4 rounded-lg border border-white/10 bg-white/[0.045] p-4">
                <Clock className="mt-1 shrink-0 text-gold-300" size={23} />
                <div>
                  <p className="text-sm font-bold uppercase text-zinc-400">Horário</p>
                  <p className="mt-1 font-semibold leading-7 text-white">{siteConfig.openHours}</p>
                  <p className="mt-1 text-sm leading-6 text-zinc-300">Confirme pelo WhatsApp os dias de atendimento e o horário de fechamento.</p>
                </div>
              </div>
              <div className="flex gap-4 rounded-lg border border-white/10 bg-white/[0.045] p-4">
                <Phone className="mt-1 shrink-0 text-gold-300" size={23} />
                <div>
                  <p className="text-sm font-bold uppercase text-zinc-400">Telefone e WhatsApp</p>
                  <a href={`tel:+${siteConfig.whatsappNumber}`} className="mt-1 inline-block py-2 font-semibold text-white">{displayPhone}</a>
                  <a href={whatsappUrl} target="_blank" rel="noreferrer" className="block py-2 text-sm font-bold text-gold-100">Consultar horários pelo WhatsApp</a>
                </div>
              </div>
            </div>

            <a href={siteConfig.mapsUrl} target="_blank" rel="noreferrer" className="btn-primary mt-7">
              <Navigation size={19} />
              Como chegar
            </a>
          </div>

          <div className="premium-card relative min-h-[420px] overflow-hidden p-0" data-reveal>
            <iframe
              title="Mapa da Barbershop WS"
              src={siteConfig.mapsEmbedUrl}
              className="h-full min-h-[420px] w-full border-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            <div className="absolute inset-x-4 bottom-4 flex flex-col gap-3 sm:inset-x-5 sm:bottom-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-sm rounded-lg border border-gold-300/25 bg-black/70 p-5 backdrop-blur">
                <MapPin size={34} className="text-gold-300" />
                <p className="mt-4 text-2xl font-black text-white">Boqueirão</p>
                <p className="mt-2 text-sm leading-6 text-zinc-300">{siteConfig.address}</p>
              </div>
              <a
                href={siteConfig.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit items-center gap-2 rounded-md border border-white/10 bg-black/70 px-4 py-3 text-sm font-bold text-white backdrop-blur transition hover:border-gold-300/60 hover:text-gold-300"
              >
                Ver rota
                <ExternalLink size={17} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
