import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './layouts/AppLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AddPet from './pages/AddPet'
import PetDetail from './pages/PetDetail'
import './App.css'

function ComingSoon({ title }) {
  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 12,
    }}>
      <span style={{ fontSize: 40 }}>🚧</span>
      <p style={{ fontSize: 16, color: '#7A8A87', fontWeight: 500 }}>{title} — próximamente</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Públicas */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Privadas */}
          <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index                element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"    element={<Dashboard />} />
            <Route path="pets/add"     element={<AddPet />} />
            <Route path="pets/:id"    element={<PetDetail />} />
            <Route path="pets"         element={<ComingSoon title="Mascotas" />} />
            <Route path="appointments" element={<ComingSoon title="Citas" />} />
            <Route path="history"      element={<ComingSoon title="Historial" />} />
            <Route path="community"    element={<ComingSoon title="Comunidad" />} />
            <Route path="settings"     element={<ComingSoon title="Configuración" />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
