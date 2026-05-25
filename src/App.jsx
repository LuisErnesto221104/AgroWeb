import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AnimalsPage from './pages/AnimalsPage'
import ExpensesPage from './pages/ExpensesPage'
import FeedingPage from './pages/FeedingPage'
import HealthPage from './pages/HealthPage'
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'
import ProtectedRoute from './routes/ProtectedRoute'
import Layout from './components/Layout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Home />} />
            <Route path="/animales/*" element={<AnimalsPage />} />
            <Route path="/sanidad/*" element={<HealthPage />} />
            <Route path="/calendario-sanitario" element={<HealthPage calendarOnly />} />
            <Route path="/sanitario" element={<Navigate to="/sanidad" replace />} />
            <Route path="/gastos/*" element={<ExpensesPage />} />
            <Route path="/costos" element={<Navigate to="/gastos" replace />} />
            <Route path="/reportes" element={<ReportsPage />} />
            <Route path="/alimentacion/*" element={<FeedingPage />} />
            <Route path="/configuracion" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
