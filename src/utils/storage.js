const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

export function readStorage(key, fallback) {
  try {
    const rawValue = window.localStorage.getItem(key)
    return rawValue ? JSON.parse(rawValue) : fallback
  } catch {
    return fallback
  }
}

export function writeStorage(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
  fetch(`${API_BASE_URL}/local-store/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value }),
  }).catch(() => null)
}

export async function syncStorageFromApi() {
  try {
    const response = await fetch(`${API_BASE_URL}/local-store`)
    if (!response.ok) return
    const payload = await response.json()
    Object.entries(payload).forEach(([key, value]) => {
      window.localStorage.setItem(key, JSON.stringify(value))
    })
  } catch {
    // La app puede funcionar con datos locales si la API no está disponible.
  }
}
