import { siteConfig } from '../data/business.js'

export const homeTitle = 'Barbearia em Praia Grande | Corte e Barba | Barbershop WS'
export const homeDescription = 'Corte masculino, degradê e barba no Boqueirão, em Praia Grande – SP. Conheça os serviços e valores da Barbershop WS e consulte horários pelo WhatsApp.'
export const absoluteUrl = (path = '/') => new URL(path, `${siteConfig.siteUrl}/`).href
export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
export const serializeJsonLd = (value) => JSON.stringify(value).replace(/</g, '\\u003c')

export function businessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    '@id': absoluteUrl('/#barbearia'),
    name: siteConfig.brandName,
    description: homeDescription,
    url: absoluteUrl(),
    logo: absoluteUrl(siteConfig.logo),
    image: absoluteUrl(siteConfig.heroImage),
    knowsAbout: ['Corte masculino', 'Barba', 'Corte degradê (fade)', 'Corte e barba'],
    telephone: `+${siteConfig.whatsappNumber}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${siteConfig.streetAddress}, ${siteConfig.neighborhood}`,
      addressLocality: siteConfig.city,
      addressRegion: siteConfig.region,
      addressCountry: siteConfig.country,
      ...(siteConfig.postalCode ? { postalCode: siteConfig.postalCode } : {}),
    },
    hasMap: siteConfig.mapsUrl,
    sameAs: [siteConfig.instagramUrl, siteConfig.facebookUrl, siteConfig.tiktokUrl].filter(Boolean),
    ...(siteConfig.openingHoursSpecification.length ? { openingHoursSpecification: siteConfig.openingHoursSpecification } : {}),
    ...(siteConfig.geo ? { geo: { '@type': 'GeoCoordinates', ...siteConfig.geo } } : {}),
    ...(siteConfig.priceRange ? { priceRange: siteConfig.priceRange } : {}),
  }
}

export function pageMetadata(pathname = '/', product = null) {
  const internalTitles = { '/admin': 'Painel administrativo', '/login': 'Entrar na conta', '/cadastro': 'Criar conta' }
  if (pathname === '/') return { title: homeTitle, description: homeDescription, canonical: absoluteUrl(), image: absoluteUrl(siteConfig.socialImage), robots: 'index, follow, max-image-preview:large', schema: businessSchema() }
  if (product) return {
    title: `${product.name} | ${siteConfig.brandName} em Praia Grande`,
    description: `${product.name} na ${siteConfig.brandName}. ${product.description || 'Confira o produto e as opções de entrega ou retirada.'}`.slice(0, 160),
    canonical: absoluteUrl(`/produto/${encodeURIComponent(product.id)}`),
    image: /^data:/i.test(product.image) ? absoluteUrl(siteConfig.socialImage) : absoluteUrl(product.image || siteConfig.socialImage),
    robots: 'index, follow, max-image-preview:large',
    imageAlt: product.name,
  }
  return {
    title: `${internalTitles[pathname] || (pathname.startsWith('/produto/') ? 'Consultar produto' : 'Página não encontrada')} | ${siteConfig.brandName}`,
    description: internalTitles[pathname] ? 'Acesse sua conta na Barbershop WS.' : 'Consulte os serviços e produtos da Barbershop WS em Praia Grande.',
    canonical: internalTitles[pathname] ? absoluteUrl(pathname) : '',
    image: absoluteUrl(siteConfig.socialImage),
    robots: 'noindex, follow',
  }
}

export function renderHead(metadata) {
  const meta = (name, content, property = false) => `<meta ${property ? 'property' : 'name'}="${name}" content="${escapeHtml(content)}" data-seo />`
  return [
    `<title>${escapeHtml(metadata.title)}</title>`,
    meta('description', metadata.description), meta('robots', metadata.robots),
    metadata.canonical && `<link rel="canonical" href="${escapeHtml(metadata.canonical)}" data-seo />`,
    meta('og:title', metadata.title, true), meta('og:description', metadata.description, true),
    meta('og:type', 'website', true), meta('og:site_name', siteConfig.brandName, true), meta('og:locale', 'pt_BR', true),
    metadata.canonical && meta('og:url', metadata.canonical, true),
    meta('og:image', metadata.image, true), meta('og:image:alt', metadata.imageAlt || 'Barbershop WS, barbearia no Boqueirão em Praia Grande', true),
    metadata.image === absoluteUrl(siteConfig.socialImage) && meta('og:image:width', '1200', true),
    metadata.image === absoluteUrl(siteConfig.socialImage) && meta('og:image:height', '630', true),
    meta('twitter:card', 'summary_large_image'), meta('twitter:title', metadata.title),
    meta('twitter:description', metadata.description), meta('twitter:image', metadata.image),
    meta('twitter:image:alt', metadata.imageAlt || 'Fachada da Barbershop WS em Praia Grande'),
    metadata.schema && `<script type="application/ld+json" data-seo>${serializeJsonLd(metadata.schema)}</script>`,
  ].filter(Boolean).join('\n')
}

export function applyMetadata(metadata) {
  document.head.querySelectorAll('[data-seo], title, meta[name="description"], meta[name="robots"], link[rel="canonical"]').forEach((element) => element.remove())
  const template = document.createElement('template')
  template.innerHTML = renderHead(metadata)
  document.head.append(template.content)
}

export function renderSitemap(products = []) {
  const urls = [absoluteUrl(), ...products.filter((product) => product.active !== false).map((product) => absoluteUrl(`/produto/${encodeURIComponent(product.id)}`))]
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...new Set(urls)].map((url) => `<url><loc>${escapeHtml(url)}</loc></url>`).join('\n')}\n</urlset>\n`
}
