import { findProductsByItems } from './products.js'

const currency = process.env.STRIPE_CURRENCY || 'brl'
const cepTimeoutMs = Number(process.env.CEP_TIMEOUT_MS || 5000)
const freightTimeoutMs = Number(process.env.FREIGHT_TIMEOUT_MS || 7000)
const defaultFallbackRates = {
  SP: 1800,
  RJ: 2800,
  MG: 3000,
  PR: 2600,
  SC: 3200,
  RS: 3600,
  default: 4500,
}

function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '')
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    })
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Tempo limite excedido ao consultar servico externo')
    }

    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

async function readJsonOrText(response) {
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

async function getMelhorEnvioAccessToken() {
  if (process.env.MELHOR_ENVIO_TOKEN) {
    return process.env.MELHOR_ENVIO_TOKEN
  }

  const refreshToken = process.env.MELHOR_ENVIO_REFRESH_TOKEN
  const clientId = process.env.MELHOR_ENVIO_CLIENT_ID
  const clientSecret = process.env.MELHOR_ENVIO_CLIENT_SECRET
  if (!refreshToken || !clientId || !clientSecret) {
    return null
  }

  const baseUrl = process.env.MELHOR_ENVIO_BASE_URL || 'https://www.melhorenvio.com.br'
  const response = await fetchWithTimeout(
    `${baseUrl}/oauth/token`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': process.env.MELHOR_ENVIO_USER_AGENT || 'BarbershopWS (barbershopws13@gmail.com)',
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
      }),
    },
    freightTimeoutMs,
  )

  const data = await readJsonOrText(response)
  if (!response.ok) {
    throw new Error(`Erro ao renovar token Melhor Envio: ${typeof data === 'string' ? data : JSON.stringify(data)}`)
  }

  return data.access_token
}

async function fetchCep(cep) {
  const cleanCep = onlyDigits(cep)
  if (cleanCep.length !== 8) {
    throw new Error('CEP invalido')
  }

  const response = await fetchWithTimeout(`https://viacep.com.br/ws/${cleanCep}/json/`, {}, cepTimeoutMs)
  if (!response.ok) {
    throw new Error('Nao foi possivel consultar o CEP')
  }

  const data = await response.json()
  if (data.erro) {
    throw new Error('CEP nao encontrado')
  }

  return {
    cep: cleanCep,
    city: data.localidade,
    state: data.uf,
    street: data.logradouro,
    neighborhood: data.bairro,
  }
}

function getFallbackRates() {
  try {
    return {
      ...defaultFallbackRates,
      ...JSON.parse(process.env.FREIGHT_FALLBACK_RATES_JSON || '{}'),
    }
  } catch {
    return defaultFallbackRates
  }
}

function buildPackage(selectedItems) {
  const total = selectedItems.reduce(
    (acc, item) => {
      const quantity = item.quantity
      const dimensions = item.product.dimensionsCm
      return {
        weightKg: acc.weightKg + item.product.weightKg * quantity,
        width: Math.max(acc.width, dimensions.width),
        height: acc.height + dimensions.height * quantity,
        length: Math.max(acc.length, dimensions.length),
        insuranceValue:
          acc.insuranceValue + (item.product.priceCents / 100) * quantity,
      }
    },
    { weightKg: 0, width: 0, height: 0, length: 0, insuranceValue: 0 },
  )

  return {
    weightKg: Math.max(total.weightKg, 0.1),
    width: Math.max(total.width, 11),
    height: Math.max(total.height, 2),
    length: Math.max(total.length, 16),
    insuranceValue: Math.max(total.insuranceValue, 1),
  }
}

async function calculateWithMelhorEnvio({ cep, selectedItems }) {
  const token = await getMelhorEnvioAccessToken()
  if (!token) return []

  const pkg = buildPackage(selectedItems)
  const originCep = onlyDigits(process.env.ORIGIN_CEP)
  if (originCep.length !== 8) {
    throw new Error('ORIGIN_CEP nao configurado ou invalido')
  }

  const baseUrl = process.env.MELHOR_ENVIO_BASE_URL || 'https://www.melhorenvio.com.br'
  const response = await fetchWithTimeout(
    `${baseUrl}/api/v2/me/shipment/calculate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': process.env.MELHOR_ENVIO_USER_AGENT || 'BarbershopWS (barbershopws13@gmail.com)',
      },
      body: JSON.stringify({
        from: { postal_code: originCep },
        to: { postal_code: onlyDigits(cep) },
        products: [
          {
            id: 'cart',
            width: pkg.width,
            height: pkg.height,
            length: pkg.length,
            weight: pkg.weightKg,
            insurance_value: pkg.insuranceValue,
            quantity: 1,
          },
        ],
        options: {
          receipt: false,
          own_hand: false,
          collect: false,
        },
      }),
    },
    freightTimeoutMs,
  )

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Erro no Melhor Envio: ${text}`)
  }

  const rates = await response.json()
  return rates
    .filter((rate) => !rate.error && rate.price)
    .slice(0, 4)
    .map((rate) => ({
      id: `carrier-${rate.id}`,
      type: 'carrier',
      label: `${rate.company?.name || 'Transportadora'} - ${rate.name}`,
      amountCents: Math.round(Number(rate.price) * 100),
      currency,
      deliveryEstimate: rate.delivery_time
        ? `${rate.delivery_time} dia(s) uteis`
        : 'Prazo informado pela transportadora',
      provider: 'melhor-envio',
      providerServiceId: rate.id,
    }))
}

export async function calculateFreight({ cep, items }) {
  const selectedItems = await findProductsByItems(items)
  const destination = await fetchCep(cep)
  const localCity = process.env.LOCAL_DELIVERY_CITY || 'Praia Grande'
  let providerWarning = null

  const options = [
    {
      id: 'pickup',
      type: 'pickup',
      label: 'Retirada na barbearia',
      amountCents: 0,
      currency,
      deliveryEstimate: 'Retirada combinada no WhatsApp',
    },
  ]

  if (destination.city.toLowerCase() === localCity.toLowerCase()) {
    options.push({
      id: 'local-delivery',
      type: 'local_delivery',
      label: `Delivery ${localCity}`,
      amountCents: Number(process.env.LOCAL_DELIVERY_FEE_CENTS || 1000),
      currency,
      deliveryEstimate: 'Entrega local em Praia Grande',
    })
  }

  try {
    const carrierOptions = await calculateWithMelhorEnvio({ cep, selectedItems })
    options.push(...carrierOptions)
  } catch (error) {
    providerWarning = error.message
    console.warn(error.message)
  }

  if (!options.some((option) => option.type === 'carrier')) {
    const fallbackRates = getFallbackRates()
    const amountCents = Number(fallbackRates[destination.state] || fallbackRates.default || 4500)

    if (destination.city.toLowerCase() !== localCity.toLowerCase()) {
      options.push({
        id: `shipping-${destination.state.toLowerCase()}`,
        type: 'fallback_shipping',
        label: `Envio para ${destination.state}`,
        amountCents,
        currency,
        deliveryEstimate: 'Frete estimado. Confirme prazo pelo WhatsApp.',
      })
    }
  }

  return { destination, options, providerWarning }
}
