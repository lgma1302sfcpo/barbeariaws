export const authStorageKey = 'barbershop-ws-auth'
export const authEventName = 'barbershop-auth-updated'

export function readAuth() {
  try {
    const auth = JSON.parse(window.localStorage.getItem(authStorageKey) || '{}')
    return auth && typeof auth === 'object' ? auth : {}
  } catch {
    return {}
  }
}

export function writeAuth(auth) {
  window.localStorage.setItem(authStorageKey, JSON.stringify(auth))
  window.dispatchEvent(new CustomEvent(authEventName, { detail: auth }))
}

export function clearAuth() {
  window.localStorage.removeItem(authStorageKey)
  window.dispatchEvent(new CustomEvent(authEventName))
}

export function authHeaders(extra = {}) {
  const token = readAuth().token
  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}
