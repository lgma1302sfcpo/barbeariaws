import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { build } from 'vite'
import { pageMetadata, renderHead } from '../src/lib/seo.js'
import { siteConfig } from '../src/data/business.js'

await build({ build: { ssr: 'src/entry-server.jsx', outDir: 'output/seo-ssr', emptyOutDir: true } })
const { render } = await import('../output/seo-ssr/entry-server.js')
const template = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8')
const documentFor = (pathname, body = '') => template
  .replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, () => `<!--seo:start-->\n${renderHead(pageMetadata(pathname))}\n<!--seo:end-->`)
  .replace('<div id="root"></div>', () => `<div id="root">${body}</div>`)

await mkdir(new URL('../dist/_seo/', import.meta.url), { recursive: true })
await writeFile(new URL('../dist/_seo/template.html', import.meta.url), documentFor('/_seo/template.html'))
await writeFile(new URL('../dist/index.html', import.meta.url), documentFor('/', render('/')))
for (const pathname of ['/admin', '/login', '/cadastro']) {
  await writeFile(new URL(`../dist${pathname}.html`, import.meta.url), documentFor(pathname))
}
await writeFile(new URL('../dist/404.html', import.meta.url), documentFor('/404', render('/404')))
await writeFile(new URL('../dist/robots.txt', import.meta.url), `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /_seo/\n\n# Login/admin usam noindex no HTML e no cabeçalho HTTP; mantemos o rastreamento para o Google ler a diretiva.\nSitemap: ${siteConfig.siteUrl}/sitemap.xml\n`)
console.log('SEO: início pré-renderizado, páginas internas noindex, 404, robots e sitemap gerados.')
