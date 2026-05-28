import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function RutaProtegida() {
  const { user: usuario } = useAuth();
  const ubicacion = useLocation();

  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: ubicacion }} />;
  }

  return <Outlet />;
}

export default RutaProtegida;
