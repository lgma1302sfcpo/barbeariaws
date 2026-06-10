import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Stripe from 'stripe'
import { z } from 'zod'
import { calculateFreight } from './lib/freight.js'
import {
  createProduct,
  deactivateProduct,
  findProductsByItems,
  readProductById,
  readProducts,
  updateProduct,
} from './lib/products.js'
import {
  attachStripeSession,
  createPendingOrder,
  listOrders,
  markOrderPaid,
  markOrderPaymentFailed,
  updateOrderStatus,
} from './lib/orders.js'
import { prisma } from './lib/prisma.js'
import {
  createAuthToken,
  getUserFromRequest,
  hashPassword,
  requireUser,
  serializeUser,
  verifyPassword,
} from './lib/auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const app = express()
const port = Number(process.env.PORT || 4242)
const appUrl = process.env.APP_URL || `http://localhost:${port}`
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null

const itemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(20),
})

const freightSchema = z.object({
  cep: z.string().min(8),
  items: z.array(itemSchema).min(1),
})

const checkoutSchema = freightSchema.extend({
  freightOptionId: z.string().min(1),
  customer: z
    .object({
      name: z.string().optional().nullable(),
      email: z.string().email().optional(),
      phone: z.string().optional().nullable(),
    })
    .optional(),
})

const orderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'PREPARING', 'READY_FOR_PICKUP', 'SHIPPED', 'DELIVERED', 'CANCELED']),
})

const registerSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  phone: z.string().trim().optional(),
  password: z.string().min(6),
})

const loginSchema = z.object({
  email: z.string().trim().min(1),
  password: z.string().min(1),
})

function createHttpError(statusCode, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

function normalizeLineItems(items) {
  const quantities = new Map()

  for (const item of items) {
    quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity)
  }

  return Array.from(quantities.entries()).map(([productId, quantity]) => {
    if (quantity > 20) {
      throw createHttpError(400, 'Quantidade maxima por produto e 20.')
    }

    return { productId, quantity }
  })
}

function createRateLimiter({ windowMs, max, message }) {
  const attempts = new Map()

  return (req, res, next) => {
    const now = Date.now()
    const key = `${req.ip}:${req.method}:${req.path}`
    const current = attempts.get(key)

    if (!current || current.resetAt <= now) {
      attempts.set(key, { count: 1, resetAt: now + windowMs })
      return next()
    }

    current.count += 1

    if (current.count > max) {
      res.set('Retry-After', String(Math.ceil((current.resetAt - now) / 1000)))
      return res.status(429).json({ error: message })
    }

    return next()
  }
}

function buildAllowedOrigins() {
  const origins = new Set([
    appUrl,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ])

  for (const origin of String(process.env.CORS_ORIGINS || '').split(',')) {
    const trimmed = origin.trim()
    if (trimmed) origins.add(trimmed)
  }

  return origins
}

const allowedOrigins = buildAllowedOrigins()
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
})
const checkoutLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  message: 'Muitas requisicoes. Aguarde um minuto e tente novamente.',
})

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true)
      }

      return callback(createHttpError(403, 'Origin nao permitida pelo CORS.'))
    },
  }),
)

async function requireAdmin(req, res, next) {
  try {
    const user = await getUserFromRequest(req)
    if (user?.role === 'ADMIN') {
      req.user = user
      return next()
    }

    return res.status(401).json({ error: 'Login administrativo necessario' })
  } catch (error) {
    return next(error)
  }
}

app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    if (!stripe) {
      return res.status(500).send('STRIPE_SECRET_KEY nao configurada')
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      return res.status(500).send('STRIPE_WEBHOOK_SECRET nao configurado')
    }

    const signature = req.header('stripe-signature')
    let event

    try {
      event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret)
    } catch (error) {
      return res.status(400).send(`Webhook invalido: ${error.message}`)
    }

    const session = event.data.object
    const orderId = session.metadata?.orderId
    const stripeSessionId = session.id
    const stripePaymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id

    const isPaidCheckout =
      event.type === 'checkout.session.async_payment_succeeded' ||
      (event.type === 'checkout.session.completed' && session.payment_status === 'paid')

    if (isPaidCheckout) {
      await markOrderPaid({
        orderId,
        stripeSessionId,
        stripePaymentIntentId,
        customer: session.customer_details,
        shipping: session.shipping_details,
      })
    }

    if (event.type === 'checkout.session.async_payment_failed' || event.type === 'checkout.session.expired') {
      await markOrderPaymentFailed({ orderId, stripeSessionId })
    }

    res.json({ received: true })
  } catch (error) {
    next(error)
  }
})

app.use(express.json({ limit: '12mb' }))

app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ ok: true, database: 'connected' })
  } catch (error) {
    res.status(503).json({ ok: false, database: 'disconnected', error: error.message })
  }
})

app.post('/api/auth/register', authLimiter, async (req, res, next) => {
  try {
    const payload = registerSchema.parse(req.body)
    const email = payload.email.toLowerCase()
    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser) {
      return res.status(409).json({ error: 'E-mail ja cadastrado' })
    }

    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email,
        phone: payload.phone || null,
        passwordHash: await hashPassword(payload.password),
      },
    })

    res.status(201).json({ user: serializeUser(user), token: createAuthToken(user) })
  } catch (error) {
    next(error)
  }
})

app.post('/api/auth/login', authLimiter, async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body)
    const email = payload.email.toLowerCase()
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !(await verifyPassword(payload.password, user.passwordHash))) {
      return res.status(401).json({ error: 'E-mail ou senha invalidos' })
    }

    res.json({ user: serializeUser(user), token: createAuthToken(user) })
  } catch (error) {
    next(error)
  }
})

app.post('/api/admin/uploads/product-image', requireAdmin, async (req, res, next) => {
  try {
    const payload = z
      .object({
        fileName: z.string().trim().min(1).max(180),
        dataUrl: z.string().min(1),
      })
      .parse(req.body)

    const match = payload.dataUrl.match(/^data:(image\/(?:png|jpe?g|webp|gif));base64,([a-zA-Z0-9+/=]+)$/)
    if (!match) {
      return res.status(400).json({ error: 'Envie uma imagem PNG, JPG, WEBP ou GIF.' })
    }

    const mimeType = match[1]
    const extensionByMime = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/webp': 'webp',
      'image/gif': 'gif',
    }
    const extension = extensionByMime[mimeType]
    const buffer = Buffer.from(match[2], 'base64')

    if (buffer.length > 8 * 1024 * 1024) {
      return res.status(400).json({ error: 'A imagem deve ter no maximo 8 MB.' })
    }

    const baseName =
      path
        .parse(payload.fileName)
        .name.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'produto'
    const fileName = `${Date.now()}-${baseName}.${extension}`
    const uploadDir = path.join(rootDir, 'public', 'assets', 'products')
    const filePath = path.join(uploadDir, fileName)

    await fs.mkdir(uploadDir, { recursive: true })
    await fs.writeFile(filePath, buffer)

    res.status(201).json({ url: `/assets/products/${fileName}` })
  } catch (error) {
    next(error)
  }
})

app.get('/api/auth/me', requireUser, (req, res) => {
  res.json({ user: req.user })
})

app.get('/api/products', async (_req, res, next) => {
  try {
    res.json(await readProducts())
  } catch (error) {
    next(error)
  }
})

app.get('/api/products/:id', async (req, res, next) => {
  try {
    const product = await readProductById(req.params.id)
    if (!product) {
      return res.status(404).json({ error: 'Produto nao encontrado' })
    }

    res.json(product)
  } catch (error) {
    next(error)
  }
})

app.get('/api/admin/products', requireAdmin, async (_req, res, next) => {
  try {
    res.json(await readProducts({ includeInactive: true }))
  } catch (error) {
    next(error)
  }
})

app.post('/api/admin/products', requireAdmin, async (req, res, next) => {
  try {
    if (!req.body.name || !Number(req.body.priceCents)) {
      return res.status(400).json({ error: 'Nome e preco sao obrigatorios' })
    }

    const product = await createProduct(req.body)
    res.status(201).json(product)
  } catch (error) {
    next(error)
  }
})

app.put('/api/admin/products/:id', requireAdmin, async (req, res, next) => {
  try {
    const product = await updateProduct(req.params.id, req.body)
    res.json(product)
  } catch (error) {
    next(error)
  }
})

app.delete('/api/admin/products/:id', requireAdmin, async (req, res, next) => {
  try {
    await deactivateProduct(req.params.id)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

app.get('/api/admin/orders', requireAdmin, async (_req, res, next) => {
  try {
    res.json(await listOrders())
  } catch (error) {
    next(error)
  }
})

app.put('/api/admin/orders/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const payload = orderStatusSchema.parse(req.body)
    res.json(await updateOrderStatus(req.params.id, payload.status))
  } catch (error) {
    next(error)
  }
})

app.post('/api/freight', checkoutLimiter, async (req, res, next) => {
  try {
    const payload = freightSchema.parse(req.body)
    payload.items = normalizeLineItems(payload.items)
    res.json(await calculateFreight(payload))
  } catch (error) {
    next(error)
  }
})

app.post('/api/checkout', checkoutLimiter, async (req, res, next) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'STRIPE_SECRET_KEY nao configurada' })
    }

    const payload = checkoutSchema.parse(req.body)
    payload.items = normalizeLineItems(payload.items)
    const user = await getUserFromRequest(req)
    if (user && !payload.customer) {
      payload.customer = {
        name: user.name,
        email: user.email,
        phone: user.phone || undefined,
      }
    }
    const selectedItems = await findProductsByItems(payload.items)
    const freight = await calculateFreight(payload)
    const freightOption = freight.options.find((option) => option.id === payload.freightOptionId)

    if (!freightOption) {
      return res.status(400).json({ error: 'Opcao de frete invalida para este CEP' })
    }

    const order = await createPendingOrder({ payload, selectedItems, freight, freightOption, userId: user?.id })

    const lineItems = selectedItems.map(({ product, quantity }) => {
      if (product.stripePriceId?.startsWith('price_')) {
        return { price: product.stripePriceId, quantity }
      }

      const productData = {
        name: product.name,
        ...(product.description ? { description: product.description } : {}),
        ...(product.image ? { images: [`${appUrl}${product.image}`] } : {}),
      }

      return {
        quantity,
        price_data: {
          currency: product.currency || process.env.STRIPE_CURRENCY || 'brl',
          product_data: productData,
          unit_amount: product.priceCents,
        },
      }
    })

    if (freightOption.amountCents > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: freightOption.currency,
          product_data: {
            name: `Frete - ${freightOption.label}`,
            ...(freightOption.deliveryEstimate ? { description: freightOption.deliveryEstimate } : {}),
          },
          unit_amount: freightOption.amountCents,
        },
      })
    }

    let session
    try {
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: lineItems,
        customer_email: payload.customer?.email,
        phone_number_collection: { enabled: true },
        ...(freightOption.type === 'pickup'
          ? {}
          : { shipping_address_collection: { allowed_countries: ['BR'] } }),
        success_url: `${appUrl}/?checkout=success&order=${order.id}`,
        cancel_url: `${appUrl}/?checkout=cancelled&order=${order.id}`,
        metadata: {
          orderId: order.id,
          cep: freight.destination.cep,
          cidade: freight.destination.city,
          estado: freight.destination.state,
          frete: freightOption.label,
          retirada_ou_entrega: freightOption.type,
        },
      })
    } catch (stripeError) {
      await prisma.order
        .update({
          where: { id: order.id },
          data: {
            status: 'CANCELED',
            paymentStatus: 'FAILED',
            notes: `Falha ao criar checkout Stripe: ${stripeError.message}`.slice(0, 1000),
          },
        })
        .catch(() => {})
      throw stripeError
    }

    await attachStripeSession({
      orderId: order.id,
      stripeSessionId: session.id,
      stripePaymentIntentId:
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id,
    })

    res.json({ url: session.url, orderId: order.id })
  } catch (error) {
    next(error)
  }
})

app.use('/assets/products', express.static(path.join(rootDir, 'public', 'assets', 'products')))
app.use(express.static(path.join(rootDir, 'dist')))
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(rootDir, 'dist/index.html'))
})

app.use((error, _req, res, _next) => {
  console.error(error)
  if (error instanceof z.ZodError) {
    return res.status(400).json({ error: 'Dados invalidos', details: error.flatten() })
  }

  if (error.statusCode) {
    return res.status(error.statusCode).json({ error: error.message })
  }

  if (error.code === 'P2002') {
    return res.status(409).json({ error: 'Registro ja cadastrado' })
  }

  if (error.code === 'P2025' || error.message === 'Produto nao encontrado') {
    return res.status(404).json({ error: 'Registro nao encontrado' })
  }

  if (error.message?.startsWith('Estoque insuficiente')) {
    return res.status(400).json({ error: error.message })
  }

  res.status(500).json({ error: error.message || 'Erro interno' })
})

app.listen(port, () => {
  console.log(`Backend rodando em http://localhost:${port}`)
})
