import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import RegistrarAnimal from './pages/RegistrarAnimal'
import ProtectedRoute from './routes/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/animales" element={<Dashboard />} />
          <Route path="/animales/nuevo" element={<RegistrarAnimal />} />
          <Route path="/sanitario" element={<Dashboard />} />
          <Route path="/costos" element={<Dashboard />} />
          <Route path="/reportes" element={<Dashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
