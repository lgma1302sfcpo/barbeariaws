export function apiUrl(path) {
  const baseUrl = String(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
  return `${baseUrl}${path}`
}

export async function readApiJson(response, fallbackMessage) {
  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  await response.text().catch(() => '')
  throw new Error(fallbackMessage)
}
