import test from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import { prisma } from '../server/lib/prisma.js'
import handler from '../api/seo.js'
import { fallbackProducts } from '../src/data/fallbackProducts.js'

// Catálogo público em memória: nenhuma consulta, compra ou escrita no banco real.
const product = { ...fallbackProducts[0] }
prisma.product.findMany = async () => [product]
prisma.product.findFirst = async ({ where }) => where.id === product.id ? product : null

function response() {
  return { headers: {}, statusCode: 200, setHeader(key, value) { this.headers[key] = value }, status(code) { this.statusCode = code; return this }, send(body) { this.body = body; return this } }
}

test('função Vercel serve produto com status 200 e metadados presentes sem JavaScript', async () => {
  const res = response()
  await handler({ query: { route: 'product', productId: product.id } }, res)
  assert.equal(res.statusCode, 200)
  assert.match(res.body, /<title>Gel fixador \| Barbershop WS em Praia Grande<\/title>/)
  assert.match(res.body, /<h1[^>]*>Gel fixador<\/h1>/)
  assert.match(res.body, /content="index, follow/)
  assert.equal(res.headers['X-Robots-Tag'], 'index, follow')
})

test('função Vercel retorna 404/noindex para produto inexistente e página desconhecida', async () => {
  for (const query of [{route:'product',productId:'inexistente'},{route:'notfound'},{route:'product',productId:'x'.repeat(121)}]) {
    const res = response()
    await handler({query}, res)
    assert.equal(res.statusCode, 404)
    assert.equal(res.headers['X-Robots-Tag'], 'noindex, follow')
    assert.match(res.body, /Página não encontrada/)
  }
})

test('sitemap dinâmico Vercel inclui o catálogo público atual e tem tipo XML', async () => {
  const res = response()
  await handler({query:{route:'sitemap'}}, res)
  assert.equal(res.statusCode, 200)
  assert.equal(res.headers['Content-Type'], 'application/xml; charset=utf-8')
  assert.match(res.body, /produto\/gel-fixador/)
  assert.doesNotMatch(res.body, /login|cadastro|admin|api/)
})

test('API existente mantém catálogo/autenticação e exclui indexação; endpoint desconhecido é 404', async () => {
  process.env.VERCEL = '1'
  const { app } = await import('../server/index.js')
  const server = http.createServer(app)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const base = `http://127.0.0.1:${server.address().port}`
  try {
    const catalog = await fetch(`${base}/api/products`)
    assert.equal(catalog.status, 200)
    assert.equal((await catalog.json())[0].id, product.id)
    assert.equal(catalog.headers.get('x-robots-tag'), 'noindex, follow')
    for (const route of ['/api/admin/products', '/api/auth/me']) {
      const res = await fetch(`${base}${route}`)
      assert.equal(res.status, 401)
      await res.arrayBuffer()
    }
    const missing = await fetch(`${base}/api/inexistente`)
    assert.equal(missing.status, 404)
    assert.deepEqual(await missing.json(), { error: 'Endpoint não encontrado.' })
  } finally {
    await new Promise((resolve) => server.close(resolve))
    await prisma.$disconnect()
  }
})
