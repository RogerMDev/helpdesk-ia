import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import PrivateRoute from './components/PrivateRoute.jsx'

import Login from './pages/auth/Login.jsx'
import Register from './pages/auth/Register.jsx'
import ForgotPassword from './pages/auth/ForgotPassword.jsx'
import ResetPassword from './pages/auth/ResetPassword.jsx'

// ⬇️ Stub de ejemplo para que /tickets no rompa (cámbialo por tu página real)
function Tickets() {
  return (
    <div className="min-h-screen grid place-items-center px-4 py-8 bg-slate-50">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-md ring-1 ring-black/5 p-6 sm:p-10">
        <h1 className="text-2xl font-semibold">Tickets</h1>
        <p className="text-slate-600 mt-2">Página protegida. ¡Ya puedes enchufar tu lista real aquí!</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* protegidas */}
        <Route element={<PrivateRoute />}>
          <Route path="/tickets" element={<Tickets />} />
          {/* añade aquí más protegidas: /tickets/:id, /users, etc. */}
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}
