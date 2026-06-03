import { differentials } from '../data/siteContent.js'

export default function Differentials() {
  return (
    <section className="section-padding bg-ink-900">
      <div className="section-shell">
        <div data-reveal>
          <p className="section-eyebrow">Diferenciais</p>
          <h2 className="section-title">Experiência masculina premium do atendimento ao acabamento.</h2>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {differentials.map((item, index) => {
            const Icon = item.icon
            return (
              <article
                key={item.title}
                className="premium-card p-5 transition duration-300 hover:-translate-y-1 hover:border-gold-300/40"
                data-reveal
                style={{ transitionDelay: `${index * 60}ms` }}
              >
                <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-md border border-gold-300/25 bg-gold-300/10 text-gold-300">
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-black text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-300">{item.description}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
