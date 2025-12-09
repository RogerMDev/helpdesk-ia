const COLORS = ['#2563EB', '#059669', '#F59E0B', '#EC4899', '#10B981', '#8B5CF6', '#EF4444', '#14B8A6']

export function computeInitials(name, lastName, email) {
  const first = (name || '').trim().charAt(0)
  const second = (lastName || '').trim().charAt(0)
  const base = (first + second).replace(/\s+/g, '')
  if (base) return base.toUpperCase()
  const emailInitial = (email || '').trim().charAt(0)
  return (emailInitial || '?').toUpperCase()
}

export function colorFromText(text) {
  const str = (text || '').toString()
  let hash = 0
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  const idx = Math.abs(hash) % COLORS.length
  return COLORS[idx]
}
