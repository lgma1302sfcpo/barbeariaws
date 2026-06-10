import 'dotenv/config'
import crypto from 'node:crypto'
import { promisify } from 'node:util'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const scrypt = promisify(crypto.scrypt)
const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase()
const adminPassword = process.env.ADMIN_PASSWORD
const resetAdminPassword = process.env.RESET_ADMIN_PASSWORD === 'true'

const products = [
  {
    id: 'gel-fixador',
    name: 'Gel fixador',
    description: 'Gel para finalizacao masculina com fixacao e brilho.',
    priceCents: 1000,
    currency: 'brl',
    image: '/assets/products/gel-fixador.webp',
    active: true,
    stripePriceId: '',
    weightKg: 0.3,
    widthCm: 8,
    heightCm: 8,
    lengthCm: 12,
  },
]

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const derivedKey = await scrypt(password, salt, 64)
  return `scrypt:${salt}:${derivedKey.toString('hex')}`
}

async function main() {
  if (adminEmail || adminPassword) {
    if (!adminEmail || !adminPassword) {
      throw new Error('Configure ADMIN_EMAIL e ADMIN_PASSWORD juntos para criar o admin.')
    }

    const adminPasswordHash = await hashPassword(adminPassword)

    await prisma.user.upsert({
      where: { email: adminEmail },
      create: {
        name: 'Administrador',
        email: adminEmail,
        phone: null,
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
      },
      update: {
        name: 'Administrador',
        role: 'ADMIN',
        ...(resetAdminPassword ? { passwordHash: adminPasswordHash } : {}),
      },
    })
  } else if (process.env.NODE_ENV === 'production') {
    throw new Error('ADMIN_EMAIL e ADMIN_PASSWORD sao obrigatorios no seed em producao.')
  } else {
    console.warn('ADMIN_EMAIL e ADMIN_PASSWORD nao configurados; seed nao criou admin.')
  }

  await prisma.user.updateMany({
    where: { email: 'admin@barbeariaws.local' },
    data: {
      passwordHash: await hashPassword(crypto.randomUUID()),
      role: 'CUSTOMER',
    },
  })

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      create: product,
      update: product,
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
