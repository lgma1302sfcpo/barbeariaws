import crypto from 'node:crypto'
import { promisify } from 'node:util'
import { prisma } from './prisma.js'

const scrypt = promisify(crypto.scrypt)

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error('AUTH_SECRET nao configurado')
  }

  return secret
}

function base64UrlEncode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

function base64UrlDecode(value) {
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf-8'))
}

function sign(value) {
  return crypto.createHmac('sha256', getAuthSecret()).update(value).digest('base64url')
}

export function serializeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt,
  }
}

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const derivedKey = await scrypt(password, salt, 64)
  return `scrypt:${salt}:${derivedKey.toString('hex')}`
}

export async function verifyPassword(password, passwordHash) {
  const [algorithm, salt, storedHash] = String(passwordHash).split(':')
  if (algorithm !== 'scrypt' || !salt || !storedHash) return false

  const derivedKey = await scrypt(password, salt, 64)
  const storedBuffer = Buffer.from(storedHash, 'hex')

  return storedBuffer.length === derivedKey.length && crypto.timingSafeEqual(storedBuffer, derivedKey)
}

export function createAuthToken(user) {
  const payload = {
    sub: user.id,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
  }
  const encodedPayload = base64UrlEncode(payload)
  return `${encodedPayload}.${sign(encodedPayload)}`
}

export async function getUserFromToken(token) {
  if (!token) return null

  const [encodedPayload, signature] = token.split('.')
  if (!encodedPayload || !signature || sign(encodedPayload) !== signature) return null

  const payload = base64UrlDecode(encodedPayload)
  if (!payload.sub || payload.exp < Math.floor(Date.now() / 1000)) return null

  const user = await prisma.user.findUnique({ where: { id: payload.sub } })
  return user ? serializeUser(user) : null
}

export async function getUserFromRequest(req) {
  const header = req.header('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  return getUserFromToken(token)
}

export async function requireUser(req, res, next) {
  try {
    const user = await getUserFromRequest(req)
    if (!user) {
      return res.status(401).json({ error: 'Login necessario' })
    }

    req.user = user
    return next()
  } catch (error) {
    return next(error)
  }
}
