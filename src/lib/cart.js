export const cartStorageKey = 'barbershop-ws-cart'
export const cartEventName = 'barbershop-cart-updated'
export const cartOpenEventName = 'barbershop-cart-open'

export function readCart() {
  try {
    const cart = JSON.parse(window.localStorage.getItem(cartStorageKey) || '{}')
    return cart && typeof cart === 'object' ? cart : {}
  } catch {
    return {}
  }
}

export function writeCart(cart) {
  window.localStorage.setItem(cartStorageKey, JSON.stringify(cart))
  window.dispatchEvent(new CustomEvent(cartEventName, { detail: cart }))
}

export function clearCart() {
  window.localStorage.removeItem(cartStorageKey)
  window.dispatchEvent(new CustomEvent(cartEventName, { detail: {} }))
}

export function maxProductQuantity(product) {
  if (product?.stock === null || product?.stock === undefined) return 20
  return Math.max(0, Math.min(20, product.stock))
}

export function setProductQuantity(product, quantity) {
  const maxQuantity = maxProductQuantity(product)
  const nextQuantity = Math.max(0, Math.min(maxQuantity, Number(quantity) || 0))
  const nextCart = { ...readCart() }

  if (nextQuantity <= 0) {
    delete nextCart[product.id]
  } else {
    nextCart[product.id] = nextQuantity
  }

  writeCart(nextCart)
  return nextCart
}

export function addProductToCart(product, quantity = 1) {
  const current = readCart()[product.id] || 0
  return setProductQuantity(product, current + quantity)
}

export function openCartMenu() {
  window.dispatchEvent(new CustomEvent(cartOpenEventName))
}
