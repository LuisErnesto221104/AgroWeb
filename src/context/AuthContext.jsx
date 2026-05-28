import { useCallback, useMemo, useReducer } from 'react';
import { solicitudApi } from '../services/api';
import { ContextoAutenticacion } from './authContextValue';

const sesionGuardada = JSON.parse(localStorage.getItem('agroweb-session') ?? 'null');

const estadoInicial = {
  user: sesionGuardada?.user ?? null,
  session: sesionGuardada?.session ?? null,
  status: 'idle',
  error: null
};

function reductorAutenticacion(estado, accion) {
  switch (accion.type) {
    case 'request':
      return { ...estado, status: 'loading', error: null };
    case 'success':
      return { user: accion.payload.user, session: accion.payload.session, status: 'authenticated', error: null };
    case 'failure':
      return { ...estado, status: 'failed', error: accion.payload };
    case 'logout':
      return { user: null, session: null, status: 'idle', error: null };
    default:
      return estado;
  }
}

export function ProveedorAutenticacion({ children: hijos }) {
  const [estado, despachar] = useReducer(reductorAutenticacion, estadoInicial);

  const autenticar = useCallback(async (ruta, credenciales) => {
    despachar({ type: 'request' });
    try {
      const datos = await solicitudApi(ruta, {
        method: 'POST',
        body: JSON.stringify(credenciales)
      });

      localStorage.setItem('agroweb-session', JSON.stringify(datos));
      despachar({ type: 'success', payload: datos });
      return datos;
    } catch (error) {
      despachar({ type: 'failure', payload: error.message });
      throw error;
    }
  }, []);

  const cerrarSesion = useCallback(async () => {
    const idSesion = estado.session?.id;
    localStorage.removeItem('agroweb-session');
    despachar({ type: 'logout' });

    if (idSesion) {
      await solicitudApi('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ sessionId: idSesion })
      }).catch(() => null);
    }
  }, [estado.session?.id]);

  const valor = useMemo(
    () => ({
      user: estado.user,
      session: estado.session,
      status: estado.status,
      error: estado.error,
      login: (credenciales) => autenticar('/auth/login', credenciales),
      register: (credenciales) => autenticar('/auth/register', credenciales),
      logout: cerrarSesion
    }),
    [autenticar, cerrarSesion, estado]
  );

  return <ContextoAutenticacion.Provider value={valor}>{hijos}</ContextoAutenticacion.Provider>;
}
