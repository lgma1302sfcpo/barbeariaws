import { z } from 'zod'
import { prisma } from './prisma.js'

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const productSchema = z.object({
  id: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1200),
  priceCents: z.coerce.number().int().positive().max(1_000_000),
  currency: z.string().trim().toLowerCase().regex(/^[a-z]{3}$/),
  image: z.string().trim().min(1).max(500),
  active: z.boolean(),
  stripePriceId: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((value) => value || null)
    .refine((value) => !value || value.startsWith('price_'), {
      message: 'Stripe Price ID deve comecar com price_.',
    }),
  weightKg: z.coerce.number().positive().max(100),
  widthCm: z.coerce.number().positive().max(300),
  heightCm: z.coerce.number().positive().max(300),
  lengthCm: z.coerce.number().positive().max(300),
  stock: z
    .union([z.coerce.number().int().min(0).max(100_000), z.null()])
    .optional()
    .nullable()
    .transform((value) => value ?? null),
})

export function serializeProduct(product) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    priceCents: product.priceCents,
    currency: product.currency,
    image: product.image,
    active: product.active,
    stripePriceId: product.stripePriceId || '',
    weightKg: product.weightKg,
    stock: product.stock,
    dimensionsCm: {
      width: product.widthCm,
      height: product.heightCm,
      length: product.lengthCm,
    },
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }
}

export function normalizeProduct(input) {
  const product = {
    id: slugify(input.id || input.name),
    name: String(input.name || '').trim(),
    description: String(input.description || '').trim(),
    priceCents: Number(input.priceCents || 0),
    currency: String(input.currency || 'brl').toLowerCase(),
    image: String(input.image || '').trim(),
    active: input.active !== false,
    stripePriceId: String(input.stripePriceId || '').trim() || null,
    weightKg: Number(input.weightKg || 0.1),
    widthCm: Number(input.dimensionsCm?.width || input.widthCm || 10),
    heightCm: Number(input.dimensionsCm?.height || input.heightCm || 4),
    lengthCm: Number(input.dimensionsCm?.length || input.lengthCm || 16),
    stock:
      input.stock === null || input.stock === undefined || input.stock === ''
        ? null
        : Number(input.stock),
  }

  return productSchema.parse(product)
}

export async function readProducts({ includeInactive = false } = {}) {
  const products = await prisma.product.findMany({
    where: includeInactive ? undefined : { active: true },
    orderBy: { createdAt: 'desc' },
  })

  return products.map(serializeProduct)
}

export async function readProductById(id, { includeInactive = false } = {}) {
  const product = await prisma.product.findFirst({
    where: {
      id,
      ...(includeInactive ? {} : { active: true }),
    },
  })

  return product ? serializeProduct(product) : null
}

export async function createProduct(input) {
  const product = normalizeProduct(input)

  const created = await prisma.product.create({ data: product })
  return serializeProduct(created)
}

export async function updateProduct(id, input) {
  const current = await prisma.product.findUnique({ where: { id } })
  if (!current) {
    throw new Error('Produto nao encontrado')
  }

  const product = normalizeProduct({ ...serializeProduct(current), ...input, id })
  const updated = await prisma.product.update({
    where: { id },
    data: {
      name: product.name,
      description: product.description,
      priceCents: product.priceCents,
      currency: product.currency,
      image: product.image,
      active: product.active,
      stripePriceId: product.stripePriceId,
      weightKg: product.weightKg,
      widthCm: product.widthCm,
      heightCm: product.heightCm,
      lengthCm: product.lengthCm,
      stock: product.stock,
    },
  })

  return serializeProduct(updated)
}

export async function deactivateProduct(id) {
  const product = await prisma.product.update({
    where: { id },
    data: { active: false },
  })

  return serializeProduct(product)
}

export async function findProductsByItems(items) {
  const ids = items.map((item) => item.productId)
  const products = await prisma.product.findMany({
    where: {
      id: { in: ids },
      active: true,
    },
  })

  return items.map((item) => {
    const product = products.find((candidate) => candidate.id === item.productId)
    if (!product) {
      throw new Error(`Produto nao encontrado: ${item.productId}`)
    }

    if (product.stock !== null && product.stock !== undefined && item.quantity > product.stock) {
      throw new Error(`Estoque insuficiente para ${product.name}`)
    }

    return {
      product: serializeProduct(product),
      quantity: item.quantity,
    }
  })
}
