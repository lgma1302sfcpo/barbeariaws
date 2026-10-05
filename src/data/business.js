// Dados públicos existentes no projeto. Complete apenas com informações confirmadas.
export const siteConfig = {
  siteUrl: 'https://barbeariaws.vercel.app',
  brandName: 'Barbershop WS',
  logo: '/assets/optimized/logo-square.webp',
  heroImage: '/assets/optimized/barbershop-fachada.webp',
  socialImage: '/assets/og-barbershop-ws.jpg',
  video: '/assets/barbershop-video.mp4',
  whatsappNumber: '5513988235036',
  whatsappMessage: 'Olá! Encontrei a Barbershop WS pelo site e gostaria de consultar horários para agendar corte ou barba.',
  instagramUrl: 'https://www.instagram.com/barbershop_ws_013/',
  streetAddress: 'Duque de Caxias, 1026',
  neighborhood: 'Boqueirão',
  city: 'Praia Grande',
  region: 'SP',
  country: 'BR',
  postalCode: '', // Adicione o CEP confirmado da barbearia; o CEP de entrega não é prova do endereço.
  get address() {
    return `${this.streetAddress}, ${this.neighborhood}, ${this.city} - ${this.region}`
  },
  openHours: 'Abertura a partir das 09h',
  openingHoursSpecification: [], // Adicione dayOfWeek, opens e closes após confirmar os dias e horários.
  geo: null, // Opcional: latitude e longitude reais, conferidas no Maps.
  facebookUrl: '',
  tiktokUrl: '',
  priceRange: '', // Opcional: faixa real dos serviços, após confirmação.
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Duque%20de%20Caxias%2C%201026%2C%20Boqueir%C3%A3o%2C%20Praia%20Grande%20-%20SP',
  mapsEmbedUrl: 'https://www.google.com/maps?q=Duque%20de%20Caxias%2C%201026%2C%20Boqueir%C3%A3o%2C%20Praia%20Grande%20-%20SP&output=embed',
}

export const displayPhone = `(${siteConfig.whatsappNumber.slice(2, 4)}) ${siteConfig.whatsappNumber.slice(4, 9)}-${siteConfig.whatsappNumber.slice(9)}`
export const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(siteConfig.whatsappMessage)}`

export const faqItems = [
  { question: 'Onde fica a Barbershop WS em Praia Grande?', answer: `A barbearia fica na ${siteConfig.streetAddress}, no ${siteConfig.neighborhood}, em ${siteConfig.city} – ${siteConfig.region}, na Baixada Santista, no estado de São Paulo. Use o botão Como chegar para abrir a localização no Google Maps.` },
  { question: 'Quais serviços a barbearia oferece?', answer: 'O site apresenta corte masculino, barba, corte + barba, corte com alisante, luzes, platinado ou pigmentação, pezinho, sobrancelha e escova penteado. A galeria mostra também cortes degradê (fade) e desenhos laterais. Consulte os valores na seção de serviços.' },
  { question: 'Como consultar horários e agendar pelo WhatsApp?', answer: 'Toque em Agendar pelo WhatsApp para falar diretamente com a Barbershop WS. Informe o serviço desejado e consulte os horários disponíveis com a equipe.' },
  { question: 'A barbearia está aberta hoje?', answer: `A informação disponível é: ${siteConfig.openHours.toLowerCase()}. Confirme pelo WhatsApp os dias de atendimento, o fechamento e a disponibilidade de hoje antes de sair.` },
]
