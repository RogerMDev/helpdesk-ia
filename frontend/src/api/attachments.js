const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const defaultHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
})

const authHeaders = (token) => ({
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
})

export async function listAttachments(ticketId, token) {
  const res = await fetch(`${API_URL}/attachments?ticketId=${ticketId}`, {
    headers: defaultHeaders(token),
  })
  if (!res.ok) {
    throw new Error(await safeMessage(res))
  }
  return res.json()
}

export async function uploadAttachment(ticketId, file, token) {
  const body = new FormData()
  body.append('ticketId', ticketId)
  body.append('file', file)

  const res = await fetch(`${API_URL}/attachments/upload`, {
    method: 'POST',
    headers: authHeaders(token),
    body,
  })
  if (!res.ok) {
    throw new Error(await safeMessage(res))
  }
  return res.json()
}

async function safeMessage(res) {
  try {
    const data = await res.json()
    if (data?.message) return data.message
  } catch {
    /* ignore */
  }
  return 'No se pudo completar la operacion'
}
