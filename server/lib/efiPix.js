import https from 'node:https'

const productionBaseUrl = 'https://pix.api.efipay.com.br'
const sandboxBaseUrl = 'https://pix-h.api.efipay.com.br'

let cachedToken = null

function isEnabled() {
  return process.env.EFI_PIX_ENABLED === 'true'
}

function getBaseUrl() {
  return process.env.EFI_PIX_BASE_URL || (process.env.EFI_ENV === 'homologation' ? sandboxBaseUrl : productionBaseUrl)
}

function getConfig() {
  const config = {
    clientId: process.env.EFI_CLIENT_ID,
    clientSecret: process.env.EFI_CLIENT_SECRET,
    certificateBase64: process.env.EFI_PIX_CERTIFICATE_BASE64,
    certificatePassphrase: process.env.EFI_PIX_CERTIFICATE_PASSPHRASE || undefined,
    pixKey: process.env.EFI_PIX_KEY,
    expiresSeconds: Number(process.env.EFI_PIX_EXPIRES_SECONDS || 1800),
  }

  if (!isEnabled()) {
    throw new Error('Pix não está habilitado.')
  }

  for (const [key, value] of Object.entries(config)) {
    if (key !== 'certificatePassphrase' && !value) {
      throw new Error(`Configuração Pix ausente: ${key}`)
    }
  }

  return config
}

function requestJson(pathname, { method = 'GET', body, token } = {}) {
  const config = getConfig()
  const url = new URL(pathname, getBaseUrl())
  const bodyText = body ? JSON.stringify(body) : ''

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || 443,
        path: `${url.pathname}${url.search}`,
        method,
        pfx: Buffer.from(config.certificateBase64, 'base64'),
        passphrase: config.certificatePassphrase,
        headers: {
          Accept: 'application/json',
          ...(body ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(bodyText) } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      (res) => {
        const chunks = []
        res.on('data', (chunk) => chunks.push(chunk))
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8')
          let data = null

          try {
            data = text ? JSON.parse(text) : null
          } catch {
            data = text
          }

          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data)
            return
          }

          reject(new Error(`Efí Pix retornou ${res.statusCode}: ${typeof data === 'string' ? data : JSON.stringify(data)}`))
        })
      },
    )

    req.on('error', reject)
    if (bodyText) req.write(bodyText)
    req.end()
  })
}

async function getAccessToken() {
  if (cachedToken?.expiresAt > Date.now() + 60_000) {
    return cachedToken.token
  }

  const config = getConfig()
  const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64')
  const authData = await new Promise((resolve, reject) => {
    const url = new URL('/oauth/token', getBaseUrl())
    const bodyText = JSON.stringify({ grant_type: 'client_credentials' })
    const req = https.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'POST',
        pfx: Buffer.from(config.certificateBase64, 'base64'),
        passphrase: config.certificatePassphrase,
        headers: {
          Authorization: `Basic ${credentials}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(bodyText),
        },
      },
      (res) => {
        const chunks = []
        res.on('data', (chunk) => chunks.push(chunk))
        res.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8')
          const parsed = text ? JSON.parse(text) : null
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed)
            return
          }
          reject(new Error(`Efí Auth retornou ${res.statusCode}: ${text}`))
        })
      },
    )

    req.on('error', reject)
    req.write(bodyText)
    req.end()
  })

  cachedToken = {
    token: authData.access_token,
    expiresAt: Date.now() + Number(authData.expires_in || 3600) * 1000,
  }
  return cachedToken.token
}

function formatAmount(cents) {
  return (Number(cents || 0) / 100).toFixed(2)
}

export function buildPixTxid(orderId) {
  return `BWS${String(orderId).replace(/[^a-zA-Z0-9]/g, '')}`.slice(0, 35)
}

export function orderIdFromPixTxid(txid) {
  return String(txid || '').startsWith('BWS') ? String(txid).slice(3) : ''
}

export async function createPixCharge({ order, customer }) {
  const config = getConfig()
  const token = await getAccessToken()
  const txid = buildPixTxid(order.id)
  const expiresSeconds = Math.min(Math.max(config.expiresSeconds, 300), 86400)
  const charge = await requestJson(`/v2/cob/${txid}`, {
    method: 'PUT',
    token,
    body: {
      calendario: { expiracao: expiresSeconds },
      valor: { original: formatAmount(order.totalCents) },
      chave: config.pixKey,
      solicitacaoPagador: `Pedido ${order.id.slice(0, 8)} - Barbershop WS`,
    },
  })

  if (!charge?.loc?.id) {
    throw new Error('A Efí não retornou o QR Code do Pix.')
  }

  const qrCode = await requestJson(`/v2/loc/${charge.loc.id}/qrcode`, { token })
  return {
    txid,
    qrCode: qrCode?.qrcode,
    qrCodeImage: qrCode?.imagemQrcode,
    expiresSeconds,
    charge,
  }
}

export async function configurePixWebhook(webhookUrl) {
  if (!webhookUrl) return null
  const config = getConfig()
  const token = await getAccessToken()
  return requestJson(`/v2/webhook/${encodeURIComponent(config.pixKey)}`, {
    method: 'PUT',
    token,
    body: { webhookUrl },
  })
}
