const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    const msg = data?.message || `Error ${res.status}`
    throw new Error(msg)
  }
  return data
}

// Ajusta la ruta según tu backend: /auth/login, /users/login, etc.
export function loginRequest(email, password) {
  return apiFetch('/auth/login', { method: 'POST', body: { email, password } })
}
