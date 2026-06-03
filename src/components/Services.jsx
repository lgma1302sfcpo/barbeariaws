import { services } from '../data/siteContent.js'

export default function Services() {
  return (
    <section id="servicos" className="section-padding bg-ink-950">
      <div className="section-shell">
        <div data-reveal>
          <p className="section-eyebrow">Serviços e valores</p>
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <h2 className="section-title">Visual alinhado, finalização precisa e presença no detalhe.</h2>
              <p className="section-copy">
                Serviços essenciais para quem quer manter o estilo em dia, com atendimento direto e acabamento premium.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <article
                key={service.title}
                className="group premium-card relative flex min-h-[235px] flex-col overflow-hidden p-5 transition duration-300 hover:-translate-y-1 hover:scale-[1.015] hover:border-gold-300/45 hover:shadow-gold"
                data-reveal
                style={{ transitionDelay: `${index * 55}ms` }}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gold-line opacity-0 transition duration-300 group-hover:opacity-100" />
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-md border border-gold-300/25 bg-gold-300/10 text-gold-300 transition duration-300 group-hover:bg-gold-300 group-hover:text-black">
                  <Icon size={24} />
                </div>
                <div className="flex flex-1 flex-col">
                  <h3 className="text-lg font-black text-white">{service.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-zinc-300">{service.description}</p>
                  <div className="mt-auto pt-5">
                    <span className="inline-flex rounded-md border border-gold-300/35 bg-gold-300/10 px-3 py-2 text-lg font-black text-gold-100">
                      {service.price}
                    </span>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
