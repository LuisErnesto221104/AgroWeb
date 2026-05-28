import { useContext } from 'react';
import { ContextoAutenticacion } from '../context/authContextValue';

export function useAuth() {
  const contexto = useContext(ContextoAutenticacion);
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.');
  }

  return contexto;
}
