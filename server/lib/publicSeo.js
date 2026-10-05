import { readFile } from 'node:fs/promises'
import { siteConfig } from '../../src/data/business.js'
import { absoluteUrl, escapeHtml, pageMetadata, renderHead } from '../../src/lib/seo.js'

let templatePromise
export function readSeoTemplate() {
  if (!templatePromise) {
    templatePromise = readFile(new URL('../../dist/_seo/template.html', import.meta.url), 'utf8')
      .catch((error) => { templatePromise = null; throw error })
  }
  return templatePromise
}

export function publicPageHtml(template, pathname, product = null) {
  const metadata = pageMetadata(pathname, product)
  const price = product ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: product.currency.toUpperCase() }).format(product.priceCents / 100) : ''
  // Conteúdo verdadeiro para robôs sem JavaScript e compartilhamento; o React ativa a página completa.
  const body = product
    ? `<main id="conteudo" class="section-shell min-h-screen py-24"><p class="section-eyebrow">${escapeHtml(siteConfig.brandName)}</p><h1 class="section-title">${escapeHtml(product.name)}</h1><p class="section-copy">${escapeHtml(product.description)}</p><p class="mt-6 text-2xl font-bold">${escapeHtml(price)}</p><p class="section-copy">Confira as opções de entrega ou retirada na barbearia em ${escapeHtml(siteConfig.address)}.</p><a href="/#produtos" class="btn-secondary mt-6">Ver produtos</a></main>`
    : '<main id="conteudo" class="section-shell min-h-screen py-24"><h1 class="section-title">Página não encontrada</h1><p class="section-copy">O endereço solicitado não está disponível.</p><a href="/" class="btn-primary mt-6">Voltar ao início</a></main>'
  return template.replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, () => `<!--seo:start-->${renderHead(metadata)}<!--seo:end-->`)
    .replace('<div id="root"></div>', () => `<div id="root">${body}</div>`)
}

export function productPath(id) {
  return new URL(absoluteUrl(`/produto/${encodeURIComponent(id)}`)).pathname
}
