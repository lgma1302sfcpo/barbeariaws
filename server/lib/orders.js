import { prisma } from './prisma.js'

function resolveOrderWhere({ orderId, stripeSessionId }) {
  if (orderId) return { id: orderId }
  if (stripeSessionId) return { stripeSessionId }
  throw new Error('Pedido nao encontrado')
}

function buildStripeOrderData({ stripeSessionId, stripePaymentIntentId, customer, shipping, paidAt }) {
  const address = shipping?.address || customer?.address

  return {
    stripeSessionId,
    stripePaymentIntentId: stripePaymentIntentId || null,
    customerName: customer?.name || shipping?.name || undefined,
    customerEmail: customer?.email || undefined,
    customerPhone: customer?.phone || undefined,
    shippingName: shipping?.name || customer?.name || undefined,
    shippingLine1: address?.line1 || undefined,
    shippingLine2: address?.line2 || undefined,
    shippingCity: address?.city || undefined,
    shippingState: address?.state || undefined,
    shippingPostalCode: address?.postal_code || undefined,
    shippingCountry: address?.country || undefined,
    paidAt: paidAt || new Date(),
  }
}

function aggregateItemsByProduct(items) {
  const quantities = new Map()

  for (const item of items) {
    if (!item.productId) continue
    quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity)
  }

  return quantities
}

export function serializeOrder(order) {
  return {
    id: order.id,
    userId: order.userId,
    status: order.status,
    paymentStatus: order.paymentStatus,
    stripeSessionId: order.stripeSessionId,
    stripePaymentIntentId: order.stripePaymentIntentId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    destination: {
      cep: order.cep,
      city: order.city,
      state: order.state,
      street: order.street,
      neighborhood: order.neighborhood,
      shippingName: order.shippingName,
      shippingLine1: order.shippingLine1,
      shippingLine2: order.shippingLine2,
      shippingCity: order.shippingCity,
      shippingState: order.shippingState,
      shippingPostalCode: order.shippingPostalCode,
      shippingCountry: order.shippingCountry,
    },
    freight: {
      id: order.freightOptionId,
      type: order.freightType,
      label: order.freightLabel,
      amountCents: order.freightAmountCents,
      currency: order.freightCurrency,
      deliveryEstimate: order.freightEstimate,
    },
    subtotalCents: order.subtotalCents,
    totalCents: order.totalCents,
    notes: order.notes,
    paidAt: order.paidAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items:
      order.items?.map((item) => ({
        id: item.id,
        productId: item.productId,
        name: item.name,
        image: item.image,
        priceCents: item.priceCents,
        currency: item.currency,
        quantity: item.quantity,
      })) || [],
  }
}

export async function createPendingOrder({ payload, selectedItems, freight, freightOption, userId }) {
  const subtotalCents = selectedItems.reduce(
    (total, item) => total + item.product.priceCents * item.quantity,
    0,
  )
  const totalCents = subtotalCents + freightOption.amountCents

  const order = await prisma.order.create({
    data: {
      userId: userId || null,
      customerName: payload.customer?.name || null,
      customerEmail: payload.customer?.email || null,
      customerPhone: payload.customer?.phone || null,
      cep: freight.destination.cep,
      city: freight.destination.city,
      state: freight.destination.state,
      street: freight.destination.street || null,
      neighborhood: freight.destination.neighborhood || null,
      freightOptionId: freightOption.id,
      freightType: freightOption.type,
      freightLabel: freightOption.label,
      freightAmountCents: freightOption.amountCents,
      freightCurrency: freightOption.currency,
      freightEstimate: freightOption.deliveryEstimate,
      subtotalCents,
      totalCents,
      items: {
        create: selectedItems.map(({ product, quantity }) => ({
          productId: product.id,
          name: product.name,
          image: product.image,
          priceCents: product.priceCents,
          currency: product.currency,
          quantity,
        })),
      },
    },
    include: { items: true },
  })

  return serializeOrder(order)
}

export async function attachStripeSession({ orderId, stripeSessionId, stripePaymentIntentId }) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      stripeSessionId,
      stripePaymentIntentId: stripePaymentIntentId || null,
    },
    include: { items: true },
  })

  return serializeOrder(order)
}

export async function markOrderPaid({ orderId, stripeSessionId, stripePaymentIntentId, customer, shipping }) {
  const where = resolveOrderWhere({ orderId, stripeSessionId })

  const order = await prisma.$transaction(async (tx) => {
    const current = await tx.order.findUnique({
      where,
      include: { items: true },
    })

    if (!current) {
      throw new Error('Pedido nao encontrado')
    }

    const stripeData = buildStripeOrderData({
      stripeSessionId,
      stripePaymentIntentId,
      customer,
      shipping,
      paidAt: current.paidAt,
    })

    if (current.paymentStatus === 'PAID') {
      return tx.order.update({
        where: { id: current.id },
        data: stripeData,
        include: { items: true },
      })
    }

    const claimed = await tx.order.updateMany({
      where: {
        id: current.id,
        paymentStatus: { not: 'PAID' },
      },
      data: {
        status: 'PAID',
        paymentStatus: 'PAID',
        ...stripeData,
      },
    })

    if (claimed.count === 0) {
      return tx.order.findUnique({
        where: { id: current.id },
        include: { items: true },
      })
    }

    for (const [productId, quantity] of aggregateItemsByProduct(current.items)) {
      const product = await tx.product.findUnique({
        where: { id: productId },
        select: { stock: true, name: true },
      })

      if (!product) {
        throw new Error(`Produto nao encontrado: ${productId}`)
      }

      if (product.stock === null || product.stock === undefined) continue

      const updated = await tx.product.updateMany({
        where: {
          id: productId,
          stock: { gte: quantity },
        },
        data: { stock: { decrement: quantity } },
      })

      if (updated.count !== 1) {
        throw new Error(`Estoque insuficiente para ${product.name}`)
      }
    }

    return tx.order.findUnique({
      where: { id: current.id },
      include: { items: true },
    })
  })

  return serializeOrder(order)
}

export async function markOrderPaymentFailed({ orderId, stripeSessionId }) {
  const where = resolveOrderWhere({ orderId, stripeSessionId })
  const order = await prisma.$transaction(async (tx) => {
    const current = await tx.order.findUnique({
      where,
      include: { items: true },
    })

    if (!current) {
      throw new Error('Pedido nao encontrado')
    }

    if (current.paymentStatus === 'PAID') {
      return current
    }

    return tx.order.update({
      where: { id: current.id },
      data: {
        paymentStatus: 'FAILED',
      },
      include: { items: true },
    })
  })

  return serializeOrder(order)
}

export async function listOrders() {
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return orders.map(serializeOrder)
}

export async function updateOrderStatus(id, status) {
  const order = await prisma.order.update({
    where: { id },
    data: { status },
    include: { items: true },
  })

  return serializeOrder(order)
}
