// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import './index.css';
import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import TicketsHome from './pages/tickets/TicketsHome.jsx'
// importa otras páginas si las tienes
import RequireAuth from './router/RequireAuth.jsx'

export default function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      {/* RUTAS PÚBLICAS */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* /forgot-password también debería ser pública si la tienes */}
      {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}

      {/* RUTAS PROTEGIDAS */}
      <Route
        path="/tickets"
        element={
          <RequireAuth>
            <TicketsHome />
          </RequireAuth>
        }
      />
      {/* Ejemplo para nueva incidencia */}
      {/* <Route
        path="/tickets/new"
        element={
          <RequireAuth>
            <NewTicketPage />
          </RequireAuth>
        }
      /> */}

      {/* RUTA RAÍZ: decide login vs tickets según esté logueado */}
      <Route
        path="/"
        element={
          <Navigate
            to={isAuthenticated ? '/tickets' : '/login'}
            replace
          />
        }
      />

      {/* CUALQUIER OTRA COSA → redirige también */}
      <Route
        path="*"
        element={
          <Navigate
            to={isAuthenticated ? '/tickets' : '/login'}
            replace
          />
        }
      />
    </Routes>
  )
}
