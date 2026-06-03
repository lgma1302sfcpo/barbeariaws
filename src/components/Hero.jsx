import { ChevronRight, MapPin } from 'lucide-react'
import CountUp from './shared/CountUp.jsx'
import { siteConfig, stats, whatsappUrl } from '../data/siteContent.js'
import WhatsAppIcon from './shared/WhatsAppIcon.jsx'

export default function Hero() {
  return (
    <section id="topo" className="relative flex min-h-[92svh] items-end overflow-hidden pb-12 pt-28 sm:pb-16 lg:pb-20">
      <img
        src={siteConfig.heroImage}
        alt="Fachada moderna da Barbershop WS"
        className="absolute inset-0 h-full w-full object-cover object-[50%_30%]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/72 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-black/35" />

      <div className="section-shell relative z-10">
        <div className="max-w-4xl" data-reveal>
          <p className="mb-4 inline-flex items-center gap-2 rounded-md border border-gold-300/35 bg-black/40 px-3 py-2 text-sm font-semibold text-gold-100 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-gold-300" />
            {siteConfig.openHours}
          </p>
          <h1 className="text-4xl font-black leading-[1.08] text-white sm:text-6xl sm:leading-[1.02] lg:text-7xl">
            Seu estilo <span className="gold-text block sm:inline">começa aqui</span>
          </h1>
          <p className="mt-6 max-w-[20rem] break-words text-lg leading-8 text-zinc-200 sm:max-w-2xl sm:text-xl">
            Cortes, barba e cuidado masculino com qualidade e personalidade.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-whatsapp w-full sm:w-auto">
              <WhatsAppIcon size={19} />
              Chamar no WhatsApp
            </a>
            <a href="#localizacao" className="btn-secondary w-full sm:w-auto">
              <MapPin size={19} />
              Ver localização
            </a>
          </div>
        </div>

        <div className="mt-12 grid gap-3 sm:grid-cols-3 lg:max-w-3xl" data-reveal>
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-white/10 bg-black/35 p-4 backdrop-blur">
              <div className="flex items-end gap-1 text-3xl font-black text-white">
                <CountUp value={stat.value} />
                <span className="text-gold-300">{stat.suffix}</span>
              </div>
              <p className="mt-1 text-sm text-zinc-300">{stat.label}</p>
            </div>
          ))}
        </div>

        <a
          href="#servicos"
          className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-zinc-300 transition hover:text-gold-300"
        >
          Conheça os serviços
          <ChevronRight size={18} />
        </a>
      </div>
    </section>
  )
}
