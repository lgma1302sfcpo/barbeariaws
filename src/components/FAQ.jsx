import { faqItems, whatsappUrl } from '../data/business.js'

export default function FAQ() {
  return (
    <section id="perguntas-frequentes" className="section-padding bg-ink-950" aria-labelledby="faq-title">
      <div className="section-shell">
        <p className="section-eyebrow">Dúvidas sobre sua visita</p>
        <h2 id="faq-title" className="section-title">Perguntas frequentes</h2>
        <div className="mt-8 space-y-3">
          {faqItems.map((item) => (
            <details key={item.question} className="premium-card p-5">
              <summary className="cursor-pointer text-base font-bold text-white">{item.question}</summary>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300">{item.answer}</p>
            </details>
          ))}
        </div>
        <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-whatsapp mt-6">Falar no WhatsApp</a>
      </div>
    </section>
  )
}
