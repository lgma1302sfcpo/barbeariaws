import {
  Award,
  BadgeCheck,
  Brush,
  CheckCircle2,
  Droplets,
  Eye,
  Gem,
  Scissors,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  WandSparkles,
  Waves,
} from 'lucide-react'

export const siteConfig = {
  brandName: 'Barbershop WS',
  logo: '/assets/logo-square.png',
  heroImage: '/assets/barbershop-fachada.jpg',
  video: '/assets/barbershop-video.mp4',
  whatsappNumber: '5513988235036',
  whatsappMessage: 'Olá! Vim pelo site e quero saber mais sobre os serviços da Barbershop WS.',
  instagramUrl: 'https://www.instagram.com/barbershop_ws_013/',
  address: 'Duque de Caxias, 1026, Boqueirão, Praia Grande - SP',
  openHours: 'Aberto a partir das 09h',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Duque%20de%20Caxias%2C%201026%2C%20Boqueir%C3%A3o%2C%20Praia%20Grande%20-%20SP',
  mapsEmbedUrl:
    'https://www.google.com/maps?q=Duque%20de%20Caxias%2C%201026%2C%20Boqueir%C3%A3o%2C%20Praia%20Grande%20-%20SP&output=embed',
}

export const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(
  siteConfig.whatsappMessage,
)}`

export const navItems = [
  { label: 'Serviços', href: '#servicos' },
  { label: 'Antes e depois', href: '#antes-depois' },
  { label: 'Galeria', href: '#galeria' },
  { label: 'Localização', href: '#localizacao' },
]

export const stats = [
  { value: 1200, suffix: '+', label: 'clientes atendidos' },
  { value: 10, suffix: '', label: 'anos de experiência' },
  { value: 480, suffix: '+', label: 'avaliações positivas' },
]

export const services = [
  {
    title: 'Corte masculino',
    price: 'R$ 40',
    description: 'Corte alinhado ao seu rosto, rotina e estilo.',
    icon: Scissors,
  },
  {
    title: 'Barba',
    price: 'R$ 40',
    description: 'Desenho preciso, acabamento limpo e presença.',
    icon: UserRound,
  },
  {
    title: 'Corte + barba',
    price: 'R$ 70',
    description: 'Combo completo para sair com visual renovado.',
    icon: Sparkles,
  },
  {
    title: 'Corte + alisante',
    price: 'R$ 65',
    description: 'Corte com alinhamento dos fios e finalização controlada.',
    icon: Waves,
  },
  {
    title: 'Corte + luzes',
    price: 'R$ 80',
    description: 'Corte com pontos de luz para destacar textura e estilo.',
    icon: WandSparkles,
  },
  {
    title: 'Corte + platinado',
    price: 'R$ 140',
    description: 'Transformação marcante com acabamento premium.',
    icon: Gem,
  },
  {
    title: 'Corte + pigmentação',
    price: 'R$ 65',
    description: 'Preenchimento discreto para cabelo e barba.',
    icon: Droplets,
  },
  {
    title: 'Pezinho',
    price: 'R$ 15',
    description: 'Contorno, nuca e laterais sempre no ponto.',
    icon: CheckCircle2,
  },
  {
    title: 'Sobrancelha',
    price: 'R$ 7',
    description: 'Correção natural para valorizar a expressão.',
    icon: Eye,
  },
  {
    title: 'Escova penteado',
    price: 'R$ 15',
    description: 'Modelagem rápida para deixar o visual pronto.',
    icon: Brush,
  },
]

export const comparison = {
  beforeImage: '/assets/antes.jpeg',
  afterImage: '/assets/depois.jpeg',
  beforeLabel: 'Antes',
  afterLabel: 'Depois',
}

export const videoHighlight = {
  src: '/assets/barbershop-video.mp4',
  title: 'Passe na WS',
  description: '',
}

export const galleryItems = [
  {
    type: 'image',
    src: '/assets/cortes/corte-01.png',
    title: 'Degradê com risco',
    alt: 'Corte masculino degradê com risco lateral',
  },
  {
    type: 'image',
    src: '/assets/cortes/corte-02.png',
    title: 'Freestyle lateral',
    alt: 'Corte masculino com desenho freestyle lateral',
  },
  {
    type: 'image',
    src: '/assets/cortes/corte-03.png',
    title: 'Luzes no cacheado',
    alt: 'Corte cacheado com luzes e acabamento',
  },
  {
    type: 'image',
    src: '/assets/cortes/corte-04.png',
    title: 'Penteado alinhado',
    alt: 'Corte masculino penteado e alinhado',
  },
  {
    type: 'image',
    src: '/assets/barbershop-fachada.jpg',
    title: 'Fachada premium',
    alt: 'Fachada da Barbershop WS',
    className: 'object-[50%_22%]',
  },
]

export const differentials = [
  {
    title: 'Atendimento profissional',
    description: 'Técnica, pontualidade e conversa direta sobre o melhor resultado.',
    icon: Award,
  },
  {
    title: 'Ambiente confortável',
    description: 'Espaço escuro, climatizado e pensado para uma experiência tranquila.',
    icon: ShieldCheck,
  },
  {
    title: 'Estilo personalizado',
    description: 'Cada corte considera seu formato de rosto, cabelo e personalidade.',
    icon: Sparkles,
  },
  {
    title: 'Produtos de qualidade',
    description: 'Finalização com produtos selecionados para durabilidade e presença.',
    icon: BadgeCheck,
  },
]

export const testimonials = [
  {
    name: 'Rafael M.',
    text: 'Corte muito bem feito, atendimento rápido e ambiente de primeira.',
    stars: 5,
  },
  {
    name: 'Bruno S.',
    text: 'A barba ficou alinhada do jeito que eu queria. Recomendo.',
    stars: 5,
  },
  {
    name: 'Carlos A.',
    text: 'Barbearia com visual premium e profissionais cuidadosos.',
    stars: 5,
  },
]

export const ratingIcons = Array.from({ length: 5 }, (_, index) => ({
  id: index + 1,
  Icon: Star,
}))
