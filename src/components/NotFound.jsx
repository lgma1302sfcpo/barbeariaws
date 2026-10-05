import { whatsappUrl } from '../data/business.js'

export default function NotFound() {
  return (
    <main id="conteudo" className="section-shell min-h-screen py-24">
      <p className="section-eyebrow">Erro 404</p>
      <h1 className="section-title">Página não encontrada</h1>
      <p className="section-copy">O endereço solicitado não está disponível. Consulte nossos serviços ou fale com a Barbershop WS.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a href="/" className="btn-primary">Voltar ao início</a>
        <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-whatsapp">Falar no WhatsApp</a>
      </div>
    </main>
  )
}
