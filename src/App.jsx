import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import PaginaAnimales from './pages/AnimalsPage';
import PaginaGastos from './pages/ExpensesPage';
import PaginaAlimentacion from './pages/FeedingPage';
import PaginaSanidad from './pages/HealthPage';
import Inicio from './pages/Home';
import Ingreso from './pages/Login';
import NoEncontrado from './pages/NotFound';
import PaginaReportes from './pages/ReportsPage';
import PaginaConfiguracion from './pages/SettingsPage';
import RutaProtegida from './routes/ProtectedRoute';
import Estructura from './components/Layout';

function Aplicacion() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Ingreso />} />
        <Route element={<RutaProtegida />}>
          <Route element={<Estructura />}>
            <Route path="/" element={<Inicio />} />
            <Route path="/dashboard" element={<Inicio />} />
            <Route path="/animales/*" element={<PaginaAnimales />} />
            <Route path="/sanidad/*" element={<PaginaSanidad />} />
            <Route path="/calendario-sanitario" element={<PaginaSanidad calendarOnly />} />
            <Route path="/sanitario" element={<Navigate to="/sanidad" replace />} />
            <Route path="/gastos/*" element={<PaginaGastos />} />
            <Route path="/costos" element={<Navigate to="/gastos" replace />} />
            <Route path="/reportes" element={<PaginaReportes />} />
            <Route path="/alimentacion/*" element={<PaginaAlimentacion />} />
            <Route path="/configuracion" element={<PaginaConfiguracion />} />
            <Route path="*" element={<NoEncontrado />} />
          </Route>
        </Route>
        <Route path="*" element={<NoEncontrado />} />
      </Routes>
    </BrowserRouter>);

}

export default Aplicacion;
