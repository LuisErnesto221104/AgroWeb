const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'No se pudo procesar la respuesta del servidor.' }))
    throw new Error(error.message ?? 'Ocurrió un error al consumir la API.')
  }

  return response.json()
}
