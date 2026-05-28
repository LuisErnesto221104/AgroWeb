const URL_BASE_API = import.meta.env.VITE_API_URL ?? '/api';

export async function solicitudApi(ruta, opciones = {}) {
  const respuesta = await fetch(`${URL_BASE_API}${ruta}`, {
    headers: {
      'Content-Type': 'application/json',
      ...opciones.headers
    },
    ...opciones
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({ message: 'No se pudo procesar la respuesta del servidor.' }));
    throw new Error(error.message ?? 'Ocurrió un error al consumir la API.');
  }

  return respuesta.json();
}
