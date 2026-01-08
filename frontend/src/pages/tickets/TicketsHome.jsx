import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import Button from '../../components/ui/Button.jsx'
import AvatarInitials from '../../components/AvatarInitials.jsx'
import { fetchTickets } from '../../api/tickets.js'
import { fetchUsers } from '../../api/users.js'
import { getStatusMeta, STATUS_OPTIONS } from '../../utils/status.js'

function formatDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const d = date.toLocaleDateString('es-ES')
  const t = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  return `${d} | ${t}`
}

export default function TicketsHome() {
  const { user, logout, isReady, isAuthenticated, token } = useAuth()
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilters, setStatusFilters] = useState([1, 2]) // Abierto + En progreso por defecto
  const [showMenu, setShowMenu] = useState(false)
  const [userMap, setUserMap] = useState({})
  const [seenStatus, setSeenStatus] = useState({})
  const menuRef = useRef(null)
  const allStatusIds = useMemo(() => STATUS_OPTIONS.map((s) => s.id), [])

  const displayName = user?.name || 'Usuario'

  const roleId =
    user?.roleId ??
    user?.user_roles_id_fk ??
    user?.user_role_id_pk ??
    user?.role ??
    user?.user_role
  const isAdmin = String(roleId) === '1' || user?.role === 'admin'
  const seenKey = user?.id ? `ticketStatusSeen:${user.id}` : null

  const persistSeenStatus = (next) => {
    setSeenStatus(next)
    if (seenKey) {
      localStorage.setItem(seenKey, JSON.stringify(next))
    }
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showMenu && menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  useEffect(() => {
    if (!seenKey) return
    try {
      const raw = localStorage.getItem(seenKey)
      const parsed = raw ? JSON.parse(raw) : {}
      setSeenStatus(parsed && typeof parsed === 'object' ? parsed : {})
    } catch {
      setSeenStatus({})
    }
  }, [seenKey])

  useEffect(() => {
    if (!isReady) return
    if (isAuthenticated && isAdmin) {
      navigate('/admin', { replace: true })
    }
  }, [isAdmin, isAuthenticated, isReady, navigate])

  const loadTickets = useCallback(async () => {
    if (!isReady || !isAuthenticated || !user?.id) return
    setLoading(true)
    setError('')
    try {
      const [data, users] = await Promise.all([
        fetchTickets(token, { mine: true, userId: user?.id }),
        fetchUsers(token).catch(() => []),
      ])
      setTickets(data || [])
      const map = {}
      ;(users || []).forEach((u) => {
        if (u?.id) map[u.id.toString()] = u.name || u.email || ''
      })
      setUserMap(map)
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los tickets')
    } finally {
      setLoading(false)
    }
  }, [isReady, isAuthenticated, user?.id, token])

  useEffect(() => {
    loadTickets()
  }, [loadTickets])

  useEffect(() => {
    if (isAdmin) return
    if (!isReady || !isAuthenticated || !user?.id) return
    const id = setInterval(() => {
      loadTickets()
    }, 15000)
    return () => clearInterval(id)
  }, [isAdmin, isReady, isAuthenticated, user?.id, loadTickets])

  const nameForUser = (id, fallback) => userMap[id?.toString()] || fallback

  const normalized = useMemo(() => {
    return (tickets || []).map((t) => {
      const statusMeta = getStatusMeta(t.statusId || t.status_id_fk || t.status_id_pk || t.status)
      const created = t.createdAt || t.created_at || ''
      const formattedDate = formatDateTime(created)
      const createdId = t.createdById || t.created_by_id || t.created_by_id_pk || t.created_by_fk
      const assigneeId = t.assigneeId || t.assignee_id_fk || t.assignee_id_pk
      return {
        id: t.id?.toString() ?? t.ticket_id_pk?.toString() ?? '',
        title: t.title || '',
        requester: nameForUser(createdId, t.requester || t.createdByName || `Usuario ${t.createdById ?? ''}`),
        assignee: nameForUser(assigneeId, t.assignee || t.assigneeName || (t.assigneeId ? `Asignado (${t.assigneeId})` : 'Sin asignar')),
        status: statusMeta.label,
        statusClasses: statusMeta.classes,
        statusId: statusMeta.id,
        date: formattedDate,
        createdById: createdId || null,
        assigneeId: assigneeId || null,
      }
    })
  }, [tickets, userMap])

  useEffect(() => {
    if (!user?.id || isAdmin || !seenKey) return
    if (!normalized.length) return
    setSeenStatus((prev) => {
      let next = prev
      let changed = false
      normalized.forEach((ticket) => {
        if (!ticket?.id) return
        if (ticket.statusId == null) return
        if (next[ticket.id] == null) {
          if (next === prev) next = { ...prev }
          next[ticket.id] = ticket.statusId
          changed = true
        }
      })
      if (changed && seenKey) {
        localStorage.setItem(seenKey, JSON.stringify(next))
      }
      return changed ? next : prev
    })
  }, [normalized, user?.id, isAdmin, seenKey])

  const filteredTickets = useMemo(() => {
    const term = search.trim().toLowerCase()
    let base = normalized.filter((t) => t.createdById === user?.id)

    if (Array.isArray(statusFilters) && statusFilters.length > 0) {
      base = base.filter((t) => statusFilters.includes(t.statusId))
    }

    if (!term) return base
    return base.filter((t) => {
      return (
        t.id.toLowerCase().includes(term) ||
        t.title.toLowerCase().includes(term) ||
        t.requester.toLowerCase().includes(term)
      )
    })
  }, [search, normalized, user?.id, statusFilters])

  const handleNewTicket = () => navigate('/tickets/new')
  const handleOpenTicket = (ticket) => {
    if (!ticket?.id) return
    if (
      !isAdmin &&
      ticket.statusId != null &&
      seenKey
    ) {
      const next = { ...seenStatus, [ticket.id]: ticket.statusId }
      persistSeenStatus(next)
    }
    navigate(`/tickets/${ticket.id}`)
  }

  const handleProfile = () => {
    setShowMenu(false)
    navigate('/account')
  }

  const handleLogout = () => {
    setShowMenu(false)
    logout()
    navigate('/login', { replace: true })
  }

  const handleToggleStatus = (id) => {
    setStatusFilters((prev) => {
      if (!prev) return [id]
      return prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    })
  }

  const handleSelectAll = () => setStatusFilters(allStatusIds)
  const handleOnlyOpen = () => setStatusFilters([1, 2])
  const handleClear = () => setStatusFilters([])

  const hasStatusUpdate = (ticket) => {
    if (!ticket?.id || isAdmin) return false
    const prevStatus = seenStatus?.[ticket.id]
    if (prevStatus == null) return false
    return Number(prevStatus) !== Number(ticket.statusId)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="w-full bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 shadow-sm flex items-center justify-center">
              <span className="text-white text-sm font-semibold">H</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">
                Helpia · Sistema de tickets
              </span>
              <span className="text-xs text-slate-500">Panel principal</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setShowMenu((v) => !v)}
                className="rounded-full border border-slate-200 hover:bg-slate-100 transition p-0.5"
                title="Menu de usuario"
              >
                <AvatarInitials
                  name={user?.name}
                  lastName={user?.lastName}
                  email={user?.email}
                  size={38}
                  className="border border-white"
                />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-200 bg-white shadow-lg py-1">
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false)
                        navigate('/admin')
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Panel admin
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleProfile}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Perfil
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">
                Hola, <span className="font-semibold text-slate-800">{displayName}</span>
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">Tus tickets</h2>
              <p className="text-sm text-slate-500">
                Revisa el estado de tus incidencias y crea nuevas solicitudes.
              </p>
            </div>

            <Button onClick={handleNewTicket} className="self-start sm:self-auto">
              + Nuevo ticket
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar tickets por ID, titulo o usuario..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400 text-xs">
                🔍
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 w-full sm:w-auto">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-slate-600">Estados:</span>
                {STATUS_OPTIONS.map((opt) => {
                  const checked = statusFilters.includes(opt.id)
                  return (
                    <label
                      key={opt.id}
                      className="flex items-center gap-1 text-sm text-slate-700 border border-slate-200 rounded-lg px-2 py-1 bg-white shadow-sm"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleStatus(opt.id)}
                        className="accent-blue-600"
                      />
                      {opt.label}
                    </label>
                  )
                })}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs"
                  onClick={handleOnlyOpen}
                >
                  Solo abiertos
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs"
                  onClick={handleSelectAll}
                >
                  Todos
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs"
                  onClick={handleClear}
                >
                  Limpiar
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <section className="space-y-3">
            {loading && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                Cargando tickets...
              </div>
            )}

            {!loading && filteredTickets.map((ticket) => (
              <article
                key={ticket.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl bg-white shadow-sm border border-slate-200 px-4 py-3 cursor-pointer hover:shadow-md transition relative"
                onClick={() => handleOpenTicket(ticket)}
              >
                {hasStatusUpdate(ticket) && (
                  <span
                    className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500"
                    title="Estado actualizado"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-blue-700 font-semibold hover:underline">{ticket.id}</span>
                    <span className="text-slate-400">·</span>
                    <span className="font-medium text-slate-900 truncate">{ticket.title}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Creado por: {ticket.requester}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Asignado a: <span className="font-medium text-slate-700">{ticket.assignee}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 sm:pl-3">
                  <span
                    className={
                      'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium border ' +
                      ticket.statusClasses
                    }
                  >
                    {ticket.status}
                  </span>
                  <span className="ml-auto text-xs text-slate-500 whitespace-nowrap pl-4">{ticket.date}</span>
                </div>
              </article>
            ))}

            {!loading && filteredTickets.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                No se han encontrado tickets con ese criterio.
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
