import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { loginRequest } from '../lib/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('token')
    if (stored) setToken(stored)
    setLoading(false)
  }, [])

  async function login(email, password) {
    const data = await loginRequest(email, password)
    if (!data?.token) throw new Error('Credenciales incorrectas')
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(data.user ?? null)
  }

  function logout() {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    if (!location.pathname.startsWith('/login')) location.assign('/login')
  }

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated: !!token,
    login,
    logout,
    loading,
  }), [token, user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
