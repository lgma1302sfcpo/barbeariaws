import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, access } from 'node:fs/promises'
import { businessSchema, pageMetadata, renderHead, renderSitemap, serializeJsonLd } from '../src/lib/seo.js'
import { siteConfig, whatsappUrl } from '../src/data/business.js'
import { publicPageHtml } from '../server/lib/publicSeo.js'

const home = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8')
const template = await readFile(new URL('../dist/_seo/template.html', import.meta.url), 'utf8')

test('HTML inicial contém conteúdo local e exatamente um H1, title, canonical e JSON-LD', () => {
  for (const pattern of [/<h1\b/g, /<title>/g, /rel="canonical"/g, /type="application\/ld\+json"/g]) assert.equal([...home.matchAll(pattern)].length, 1)
  assert.match(home, /Barbearia em.*Praia Grande/)
  assert.match(home, /Duque de Caxias, 1026/)
  assert.match(home, /Corte \+ barba/)
  assert.match(home, /Perguntas frequentes/)
  assert.match(home, /https:\/\/barbeariaws\.vercel\.app\//)
  assert.doesNotMatch(home, /content="noindex/)
})

test('schema usa os dados disponíveis, sem inventar horários, CEP, coordenadas ou avaliações', () => {
  const schema = businessSchema()
  assert.equal(schema['@type'], 'HairSalon')
  assert.equal(schema.address.addressLocality, 'Praia Grande')
  assert.equal(schema.address.addressRegion, 'SP')
  assert.equal(schema.telephone, `+${siteConfig.whatsappNumber}`)
  assert.deepEqual(schema.sameAs, [siteConfig.instagramUrl])
  for (const key of ['geo', 'openingHoursSpecification', 'priceRange', 'aggregateRating', 'review']) assert.equal(schema[key], undefined)
  assert.equal(schema.address.postalCode, undefined)
  assert.deepEqual(JSON.parse(home.match(/<script type="application\/ld\+json" data-seo>(.*?)<\/script>/s)[1]), schema)
})

test('páginas internas têm títulos únicos e noindex no HTML inicial', async () => {
  const titles = []
  for (const route of ['/admin', '/login', '/cadastro']) {
    const html = await readFile(new URL(`../dist${route}.html`, import.meta.url), 'utf8')
    assert.match(html, /content="noindex, follow"/)
    assert.doesNotMatch(html, /Barbearia em Praia Grande<\/h1>/)
    assert.match(html, new RegExp(`rel="canonical" href="https://barbeariaws.vercel.app${route}"`))
    titles.push(html.match(/<title>(.*?)<\/title>/)[1])
  }
  assert.equal(new Set(titles).size, 3)
})

test('Open Graph e Twitter usam URL e imagem absolutas', () => {
  const head = renderHead(pageMetadata('/'))
  for (const name of ['og:title', 'og:description', 'og:image', 'og:url', 'og:type', 'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) assert.ok(head.includes(`="${name}"`))
  assert.match(head, /og:image" content="https:\/\/barbeariaws.vercel.app\/assets\/og-barbershop-ws.jpg/)
})

test('metadados e HTML de produto escapam conteúdo malicioso e preservam a identidade da URL', () => {
  const product = { id: 'gel-fixador', name: '<script>alert(1)</script>', description: '" onload="alert(1)', image: '/assets/products/gel-fixador.webp', currency: 'brl', priceCents: 1000 }
  const html = publicPageHtml(template, '/produto/gel-fixador', product)
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/)
  assert.match(html, /&lt;script&gt;/)
  assert.match(html, /canonical" href="https:\/\/barbeariaws.vercel.app\/produto\/gel-fixador/)
  assert.match(html, /content="index, follow/)
  assert.equal([...html.matchAll(/<title>/g)].length, 1)
  assert.equal([...html.matchAll(/<h1\b/g)].length, 1)
  assert.doesNotMatch(serializeJsonLd({ text: '</script><script>alert(1)</script>' }), /<\/script>/)
})

test('404 contém noindex e não reutiliza canonical nem conteúdo da home', () => {
  const html = publicPageHtml(template, '/404')
  assert.match(html, /Página não encontrada/)
  assert.match(html, /content="noindex, follow"/)
  assert.doesNotMatch(html, /rel="canonical"/)
  assert.doesNotMatch(html, /application\/ld\+json/)
})

test('sitemap contém somente home e produtos públicos ativos, sem duplicatas', () => {
  const sitemap = renderSitemap([{id:'gel-fixador',active:true},{id:'gel-fixador',active:true},{id:'inativo',active:false}])
  assert.equal([...sitemap.matchAll(/<loc>/g)].length, 2)
  assert.match(sitemap, /produto\/gel-fixador/)
  assert.doesNotMatch(sitemap, /login|cadastro|admin|api|inativo/)
})

test('robots permite home/assets e anuncia o sitemap; não impede a leitura do noindex interno', async () => {
  const robots = await readFile(new URL('../dist/robots.txt', import.meta.url), 'utf8')
  assert.match(robots, /Allow: \//)
  assert.match(robots, /Disallow: \/api\//)
  assert.match(robots, /Sitemap: https:\/\/barbeariaws.vercel.app\/sitemap.xml/)
  assert.doesNotMatch(robots, /Disallow: \/(?:$|assets|login|admin|cadastro)/m)
})

test('todas as imagens e assets locais no HTML pré-renderizado existem; âncoras são válidas', async () => {
  for (const [, path] of home.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)) await access(new URL(`../dist${path}`, import.meta.url))
  for (const [, id] of home.matchAll(/href="#([^"]+)"/g)) assert.ok(home.includes(`id="${id}"`), `Âncora ausente: ${id}`)
  for (const [, attrs] of home.matchAll(/<img\b([^>]+)>/g)) {
    assert.match(attrs, /alt="[^"]+"/)
    assert.match(attrs, /width="\d+"/)
    assert.match(attrs, /height="\d+"/)
  }
})

test('WhatsApp tem telefone e mensagem válidos, sem números divergentes', () => {
  const url = new URL(whatsappUrl)
  assert.equal(url.hostname, 'wa.me')
  assert.equal(url.pathname, `/${siteConfig.whatsappNumber}`)
  assert.match(url.searchParams.get('text'), /ordem de chegada/)
  assert.match(home, /sem agendamento/)
  assert.doesNotMatch(home, /Agendar pelo WhatsApp|Agende seu corte/)
  assert.equal([...new Set([...home.matchAll(/https:\/\/wa.me\/(\d+)/g)].map((match) => match[1]))].length, 1)
})
