// src/lib/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// Helper genérico
export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  // Soporta 204 No Content
  if (res.status === 204) return null

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const msg = data?.message || `Error ${res.status}`
    throw new Error(msg)
  }
  return data
}

// --- Auth ---
export function loginRequest(email, password) {
  // Ajusta la ruta si tu backend usa otra
  return apiFetch('/api/auth/login', { method: 'POST', body: { email, password } })
}

export function requestPasswordReset(email) {
  return apiFetch('/api/auth/forgot-password', { method: 'POST', body: { email } })
}

export function resetPassword({ token, password }) {
  return apiFetch('/api/auth/reset-password', {
    method: 'POST',
    body: { token, password },
  })
}

// (Opcional) registro centralizado
export function registerRequest({ name, lastName, email, phone, password }) {
  return apiFetch('/api/auth/register', {
    method: 'POST',
    body: { name, lastName, email, phone, password },
  })
}
