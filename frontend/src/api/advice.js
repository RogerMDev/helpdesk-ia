const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const defaultHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
})

export async function fetchAdvice(description, token) {
  const res = await fetch(`${API_URL}/advice`, {
    method: 'POST',
    headers: defaultHeaders(token),
    body: JSON.stringify({ description }),
  })
  if (!res.ok) {
    const message = await safeMessage(res)
    throw new Error(message)
  }
  return res.json()
}

async function safeMessage(res) {
  try {
    const data = await res.json()
    if (data?.message) return data.message
  } catch {
    // ignore
  }
  return 'No se pudo completar la operacion'
}
