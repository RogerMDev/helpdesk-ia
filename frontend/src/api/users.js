// src/api/users.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const defaultHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
})

export async function createUser(payload) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: defaultHeaders(),
    body: JSON.stringify(payload),
  })

  // Si falla, intentamos sacar el mensaje del backend
  if (!res.ok) {
    let message = 'No se pudo crear la cuenta.'
    try {
      const data = await res.json()
      if (data?.message) message = data.message
    } catch {
      // si no hay JSON, dejamos el mensaje genérico
    }
    throw new Error(message)
  }

  // Si va bien, devolvemos el body (UserResponse)
  return res.json()
}
export async function loginUser(payload) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: defaultHeaders(),
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    let message = 'No se pudo iniciar sesión.'
    try {
      const data = await res.json()
      if (data?.message) message = data.message   // "Credenciales incorrectas", etc.
    } catch {
      // nada
    }
    throw new Error(message)
  }

  return res.json() // AuthResponse { token, user }
}

export async function fetchUsers(token) {
  const res = await fetch(`${API_URL}/users`, {
    headers: defaultHeaders(token),
  })
  if (!res.ok) throw new Error('No se pudieron cargar los usuarios')
  return res.json()
}

export async function fetchUserById(id, token) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    headers: defaultHeaders(token),
  })
  if (!res.ok) throw new Error('No se pudo cargar el usuario')
  return res.json()
}
