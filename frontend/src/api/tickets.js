const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const defaultHeaders = (token) => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
})

export async function fetchTickets(token, query = {}) {
  const params = new URLSearchParams()
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value)
    }
  })
  const qs = params.toString()
  const url = qs ? `${API_URL}/tickets?${qs}` : `${API_URL}/tickets`

  const res = await fetch(url, {
    headers: defaultHeaders(token),
  })
  if (!res.ok) {
    const message = await safeMessage(res)
    throw new Error(message)
  }
  return res.json()
}

export async function fetchTicketById(id, token) {
  const res = await fetch(`${API_URL}/tickets/${id}`, {
    headers: defaultHeaders(token),
  })
  if (!res.ok) {
    const message = await safeMessage(res)
    throw new Error(message)
  }
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('Respuesta de ticket no es JSON')
  }
}

export async function createTicket(payload, token) {
  const res = await fetch(`${API_URL}/tickets`, {
    method: 'POST',
    headers: defaultHeaders(token),
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const message = await safeMessage(res)
    throw new Error(message)
  }
  return res.json()
}

export async function updateTicketStatus(id, statusId, token) {
  const res = await fetch(`${API_URL}/tickets/${id}/status`, {
    method: 'PATCH',
    headers: defaultHeaders(token),
    body: JSON.stringify({ statusId }),
  })
  if (!res.ok) {
    const message = await safeMessage(res)
    throw new Error(message)
  }
  const text = await res.text()
  if (!text) return { id, statusId }
  try {
    return JSON.parse(text)
  } catch {
    return { id, statusId }
  }
}

export async function updateTicketAssignee(id, assigneeId, token) {
  // Intentamos el endpoint específico de asignación; si no existe o falla, usamos PUT genérico.
  const payload = { assigneeId }
  const tryAssign = async () => {
    const res = await fetch(`${API_URL}/tickets/${id}/assign`, {
      method: 'PATCH',
      headers: defaultHeaders(token),
      body: JSON.stringify(payload),
    })
    return res
  }

  let res = await tryAssign()
  if (!res.ok && (res.status === 404 || res.status === 405)) {
    res = await fetch(`${API_URL}/tickets/${id}`, {
      method: 'PUT',
      headers: defaultHeaders(token),
      body: JSON.stringify(payload),
    })
  }

  if (!res.ok) {
    const message = await safeMessage(res)
    throw new Error(message)
  }
  const text = await res.text()
  if (!text) return { id, assigneeId }
  try {
    return JSON.parse(text)
  } catch {
    return { id, assigneeId }
  }
}

export async function updateTicket(id, payload, token) {
  const res = await fetch(`${API_URL}/tickets/${id}`, {
    method: 'PUT',
    headers: defaultHeaders(token),
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const message = await safeMessage(res)
    throw new Error(message)
  }
  const text = await res.text()
  if (!text) return { id, ...payload }
  try {
    return JSON.parse(text)
  } catch {
    return { id, ...payload }
  }
}

export async function deleteTicket(id, token) {
  const res = await fetch(`${API_URL}/tickets/${id}`, {
    method: 'DELETE',
    headers: defaultHeaders(token),
  })
  if (!res.ok) {
    const message = await safeMessage(res)
    throw new Error(message)
  }
  const text = await res.text()
  if (!text) return { success: true }
  try {
    return JSON.parse(text)
  } catch {
    return { success: true }
  }
}

async function safeMessage(res) {
  try {
    const data = await res.json()
    if (data?.message) return data.message
  } catch {
    // ignore
  }
  return 'No se pudo completar la operación'
}
