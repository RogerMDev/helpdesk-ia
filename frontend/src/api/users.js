// src/api/users.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export async function createUser(payload) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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
