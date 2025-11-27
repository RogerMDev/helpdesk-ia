const STATUS_OPTIONS = [
  { id: 1, key: 'OPEN', label: 'Abierto', classes: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
  { id: 2, key: 'IN PROGRESS', label: 'En progreso', classes: 'bg-amber-100 text-amber-700 border border-amber-200' },
  { id: 3, key: 'RESOLVED', label: 'Resuelto', classes: 'bg-blue-100 text-blue-700 border border-blue-200' },
  { id: 4, key: 'CLOSED', label: 'Cerrado', classes: 'bg-rose-100 text-rose-700 border border-rose-200' },
]

function detectKey(raw) {
  const value = (raw ?? '').toString().toLowerCase()
  if (value.includes('progress') || value.includes('progreso')) return 'IN PROGRESS'
  if (value.includes('resolv') || value.includes('resu')) return 'RESOLVED'
  if (value.includes('close') || value.includes('cerr')) return 'CLOSED'
  if (value.includes('open') || value.includes('abier')) return 'OPEN'
  return null
}

export function getStatusMeta(idOrName) {
  const num = Number(idOrName)
  if (!Number.isNaN(num) && STATUS_OPTIONS[num - 1]) {
    return STATUS_OPTIONS[num - 1]
  }

  const key = detectKey(idOrName) || 'OPEN'
  const found = STATUS_OPTIONS.find((o) => o.key === key)
  return found || STATUS_OPTIONS[0]
}

export { STATUS_OPTIONS }
