const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const defaultHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
})

export async function listMessages(ticketId, token) {
  const res = await fetch(`${API_URL}/messages?ticketId=${ticketId}`, {
    headers: defaultHeaders(token),
  })
  if (!res.ok) {
    throw new Error(await safeMessage(res))
  }
  return res.json()
}

export async function createMessage({ ticketId, userId, content }, token) {
  const res = await fetch(`${API_URL}/messages`, {
    method: 'POST',
    headers: defaultHeaders(token),
    body: JSON.stringify({ ticketId, userId, content }),
  })
  if (!res.ok) {
    throw new Error(await safeMessage(res))
  }
  return res.json()
}

export async function deleteMessage(id, token) {
  const res = await fetch(`${API_URL}/messages/${id}`, {
    method: 'DELETE',
    headers: defaultHeaders(token),
  })
  if (!res.ok) {
    throw new Error(await safeMessage(res))
  }
  return true
}

async function safeMessage(res) {
  try {
    const data = await res.json()
    if (data?.message) return data.message
  } catch {
    /* ignore */
  }
  return 'No se pudo completar la operación'
}
