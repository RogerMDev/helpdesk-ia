// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import './index.css'
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import ForgotPassword from './pages/auth/ForgotPassword.jsx'
import TicketsHome from './pages/tickets/TicketsHome.jsx'
import NewTicket from './pages/tickets/NewTicket.jsx'
import Profile from './pages/account/Profile.jsx'
import TicketDetail from './pages/tickets/TicketDetail.jsx'
import RequireAuth from './router/RequireAuth.jsx'
import RequireAdmin from './router/RequireAdmin.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminResolved from './pages/admin/AdminResolved.jsx'
import AdminUsers from './pages/admin/AdminUsers.jsx'

export default function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      {/* RUTAS PUBLICAS */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<Navigate to="/forgot-password" replace />} />

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
        path="/tickets/:id"
        element={
          <RequireAuth>
            <TicketDetail />
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
      <Route
        path="/admin/resolved"
        element={
          <RequireAdmin>
            <AdminResolved />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/users"
        element={
          <RequireAdmin>
            <AdminUsers />
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
