import { whatsappUrl } from '../data/siteContent.js'
import WhatsAppIcon from './shared/WhatsAppIcon.jsx'

export default function FloatingWhatsApp() {
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Chamar no WhatsApp"
      className="whatsapp-float bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-[#34af23] text-white shadow-2xl transition duration-300 hover:bg-[#2f9f20] focus:outline-none focus:ring-2 focus:ring-[#34af23] focus:ring-offset-2 focus:ring-offset-ink-950"
    >
      <WhatsAppIcon size={30} />
    </a>
  )
}
