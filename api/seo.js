import { readProducts, readProductById } from '../server/lib/products.js'
import { publicPageHtml, readSeoTemplate, productPath } from '../server/lib/publicSeo.js'
import { renderSitemap } from '../src/lib/seo.js'

export default async function handler(req, res) {
  try {
    if (req.query.route === 'sitemap') {
      res.setHeader('Content-Type', 'application/xml; charset=utf-8')
      res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300')
      return res.status(200).send(renderSitemap(await readProducts()))
    }
    const template = await readSeoTemplate()
    if (req.query.route === 'product' && typeof req.query.productId === 'string' && req.query.productId.length <= 120) {
      const product = await readProductById(req.query.productId)
      if (product) {
        res.setHeader('X-Robots-Tag', 'index, follow')
        res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60')
        return res.status(200).send(publicPageHtml(template, productPath(product.id), product))
      }
    }
    res.setHeader('X-Robots-Tag', 'noindex, follow')
    return res.status(404).send(publicPageHtml(template, '/404'))
  } catch {
    res.setHeader('X-Robots-Tag', 'noindex, follow')
    return res.status(503).send('Página temporariamente indisponível. Tente novamente em instantes.')
  }
}
