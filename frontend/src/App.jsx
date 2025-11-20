// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import './index.css'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import TicketsHome from './pages/tickets/TicketsHome.jsx'
import NewTicket from './pages/tickets/NewTicket.jsx'
import Profile from './pages/account/Profile.jsx'
import RequireAuth from './router/RequireAuth.jsx'
import RequireAdmin from './router/RequireAdmin.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'

export default function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      {/* RUTAS PUBLICAS */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* RUTAS PROTEGIDAS */}
      <Route
        path="/account"
        element={
          <RequireAuth>
            <Profile />
          </RequireAuth>
        }
      />
      <Route
        path="/tickets"
        element={
          <RequireAuth>
            <TicketsHome />
          </RequireAuth>
        }
      />
      <Route
        path="/tickets/new"
        element={
          <RequireAuth>
            <NewTicket />
          </RequireAuth>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminDashboard />
          </RequireAdmin>
        }
      />

      {/* RUTA RAIZ: siempre arranca en login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* CUALQUIER OTRA COSA -> login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
