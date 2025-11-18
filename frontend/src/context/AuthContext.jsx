// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { loginUser } from '../api/users' 

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const isAuthenticated = !!user && !!token

  // Al cargar la app, intenta restaurar la sesión de localStorage
  useEffect(() => {
    const stored = localStorage.getItem('auth')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed?.user && parsed?.token) {
          setUser(parsed.user)
          setToken(parsed.token)
        }
      } catch {
        // Si está corrupto, lo limpiamos
        localStorage.removeItem('auth')
      }
    }
  }, [])

  // 👇 Esta es la función que usa tu Login.jsx
  const login = async (email, password) => {
    // Llamamos al backend
    const data = await loginUser({ email, password })
    // data = { token, user: { ... } } según tu AuthController

    setUser(data.user)
    setToken(data.token)
    localStorage.setItem('auth', JSON.stringify(data))
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth')
  }

  const value = {
    user,
    token,
    isAuthenticated,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return ctx
}
