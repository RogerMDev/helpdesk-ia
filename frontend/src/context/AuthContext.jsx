// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { loginUser } from '../api/auth'   

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const isAuthenticated = !!user && !!token

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
        localStorage.removeItem('auth')
      }
    }
  }, [])

  const login = async (email, password) => {
    const data = await loginUser({ email, password })
    console.log('LOGIN RESPONSE:', data)

    const u = data.user || data

    const normalizedUser = {
      id: u.id ?? u.user_id_pk,
      name: u.name,
      lastName: u.lastName ?? u.last_name ?? null,
      email: u.email,
      phone: u.phone ?? null,
      // 👇 ajusta estos nombres según lo que devuelva tu backend
      roleId: u.user_roles_id_fk ?? u.roleId ?? null,
      roleName: u.roleName ?? u.role ?? null,
    }

    setUser(normalizedUser)
    setToken(data.token)
    localStorage.setItem(
      'auth',
      JSON.stringify({ user: normalizedUser, token: data.token })
    )

    return { user: normalizedUser, token: data.token }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth')
  }

  const value = { user, token, isAuthenticated, login, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return ctx
}
