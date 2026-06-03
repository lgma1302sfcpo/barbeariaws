import { Star } from 'lucide-react'
import { testimonials } from '../data/siteContent.js'

export default function Testimonials() {
  return (
    <section className="section-padding bg-ink-950">
      <div className="section-shell">
        <div data-reveal>
          <p className="section-eyebrow">Depoimentos</p>
          <h2 className="section-title">Avaliações curtas de quem já saiu com o visual no ponto.</h2>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <article
              key={testimonial.name}
              className="premium-card p-6 transition duration-300 hover:-translate-y-1 hover:border-gold-300/40"
              data-reveal
              style={{ transitionDelay: `${index * 70}ms` }}
            >
              <div className="flex gap-1 text-gold-300" aria-label={`${testimonial.stars} estrelas`}>
                {Array.from({ length: testimonial.stars }).map((_, starIndex) => (
                  <Star key={starIndex} size={18} fill="currentColor" />
                ))}
              </div>
              <p className="mt-5 text-lg font-semibold leading-8 text-white">"{testimonial.text}"</p>
              <p className="mt-5 text-sm font-bold text-zinc-400">{testimonial.name}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
