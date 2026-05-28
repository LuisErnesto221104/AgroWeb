const URL_BASE_API = import.meta.env.VITE_API_URL ?? '/api';

export function leerAlmacenamiento(clave, respaldo) {
  try {
    const valorCrudo = window.localStorage.getItem(clave);
    return valorCrudo ? JSON.parse(valorCrudo) : respaldo;
  } catch {
    return respaldo;
  }
}

export function escribirAlmacenamiento(clave, valor) {
  window.localStorage.setItem(clave, JSON.stringify(valor));
  fetch(`${URL_BASE_API}/local-store/${encodeURIComponent(clave)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value: valor })
  }).catch(() => null);
}

export async function sincronizarAlmacenamientoDesdeApi() {
  try {
    const respuesta = await fetch(`${URL_BASE_API}/local-store`);
    if (!respuesta.ok) return;
    const datos = await respuesta.json();
    Object.entries(datos).forEach(([clave, valor]) => {
      window.localStorage.setItem(clave, JSON.stringify(valor));
    });
  } catch {



    // La app puede funcionar con datos locales si la API no está disponible.
  }}
