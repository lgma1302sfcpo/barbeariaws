import { Clock, ExternalLink, MapPin, Navigation } from 'lucide-react'
import { siteConfig } from '../data/siteContent.js'

export default function Location() {
  return (
    <section id="localizacao" className="section-padding bg-ink-900">
      <div className="section-shell">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
          <div data-reveal>
            <p className="section-eyebrow">Horário e localização</p>
            <h2 className="section-title">Passe na barbearia e renove o visual hoje.</h2>
            <p className="section-copy">
              Estamos no Boqueirão, em Praia Grande, com atendimento aberto a partir das 09h.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex gap-4 rounded-lg border border-white/10 bg-white/[0.045] p-4">
                <MapPin className="mt-1 shrink-0 text-gold-300" size={23} />
                <div>
                  <p className="text-sm font-bold uppercase text-zinc-400">Endereço</p>
                  <p className="mt-1 font-semibold leading-7 text-white">{siteConfig.address}</p>
                </div>
              </div>
              <div className="flex gap-4 rounded-lg border border-white/10 bg-white/[0.045] p-4">
                <Clock className="mt-1 shrink-0 text-gold-300" size={23} />
                <div>
                  <p className="text-sm font-bold uppercase text-zinc-400">Horário</p>
                  <p className="mt-1 font-semibold leading-7 text-white">{siteConfig.openHours}</p>
                </div>
              </div>
            </div>

            <a href={siteConfig.mapsUrl} target="_blank" rel="noreferrer" className="btn-primary mt-7">
              <Navigation size={19} />
              Abrir no Google Maps
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
                <p className="mt-2 text-sm leading-6 text-zinc-300">Duque de Caxias, 1026, Praia Grande - SP</p>
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
