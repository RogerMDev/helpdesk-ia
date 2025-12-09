import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import Button from '../../components/ui/Button.jsx'
import AvatarInitials from '../../components/AvatarInitials.jsx'
import { fetchTickets } from '../../api/tickets.js'
import { fetchUsers } from '../../api/users.js'
import { getStatusMeta } from '../../utils/status.js'

const normalize = (t) => ({
  id: t.id?.toString() ?? t.ticket_id_pk?.toString() ?? '',
  title: t.title || '',
  requester: t.requester || t.createdByName || `Usuario ${t.createdById ?? ''}`,
  status: t.status || '',
  statusId: t.statusId || t.status_id_fk || t.status_id_pk,
  category: t.category || t.topic || '',
  date: t.createdAt || t.created_at || '',
})

const normalizeWithStatus = (t) => {
  const base = normalize(t)
  return {
    ...base,
    status: t.status || (base.statusId ? ['','Abierto','En progreso','Resuelto','Cerrado'][base.statusId] : ''),
  }
}

export default function AdminResolved() {
  const { user, logout, token } = useAuth()
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [userMap, setUserMap] = useState({})
  const menuRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (showMenu && menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showMenu])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [data, users] = await Promise.all([
          fetchTickets(),
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
    }
    load()
  }, [])

  const nameForUser = (id, fallback) => userMap[id?.toString()] || fallback

  const filtered = useMemo(() => {
    const closed = (tickets || []).filter((t) => {
      const statusId = t.statusId || t.status_id_fk || t.status_id_pk
      return statusId === 3 || statusId === 4
    }).map((t) => {
      const createdId = t.createdById || t.created_by_id || t.created_by_id_pk
      const assigneeId = t.assigneeId || t.assignee_id_fk || t.assignee_id_pk
      const base = normalizeWithStatus(t)
      const requester = nameForUser(createdId, t.requester || t.createdByName || `Usuario ${t.createdById ?? ''}`)
      const assignee = nameForUser(assigneeId, t.assignee || t.assigneeName || (assigneeId ? `Asignado (${assigneeId})` : 'Sin asignar'))
      return { ...base, requester, assignee }
    })
    const term = search.trim().toLowerCase()
    if (!term) return closed
    return closed.filter((t) =>
      t.id.toLowerCase().includes(term) ||
      t.title.toLowerCase().includes(term) ||
      t.requester.toLowerCase().includes(term) ||
      t.category.toLowerCase().includes(term)
    )
  }, [search, tickets, userMap])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="w-full bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 shadow-sm flex items-center justify-center">
              <span className="text-white text-sm font-semibold">H</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">Helpia · Tickets resueltos</span>
              <span className="text-xs text-slate-500">Estados RESOLVED / CLOSED</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate('/admin')} className="border border-slate-200 text-slate-700">
              Volver al panel
            </Button>
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
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false)
                      navigate('/account')
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Perfil
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false)
                      logout()
                      navigate('/login', { replace: true })
                    }}
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
        <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Tickets resueltos y cerrados</h1>
              <p className="text-sm text-slate-500">Filtros por id, titulo, solicitante o categoria.</p>
            </div>
            <div className="sm:w-72">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {loading && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                Cargando tickets...
              </div>
            )}

            {!loading && filtered.map((t) => {
              const statusMeta = getStatusMeta(t.statusId || t.status)
              return (
                <article
                  key={t.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl bg-white border border-slate-200 px-4 py-3 shadow-sm hover:shadow transition cursor-pointer"
                  onClick={() => navigate(`/tickets/${t.id}`)}
                >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-blue-700 font-semibold">{t.id}</span>
                    <span className="text-slate-400">·</span>
                    <span className="font-medium text-slate-900 truncate">{t.title}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t.category} · {t.requester} · {t.assignee} · {t.date}
                  </p>
                </div>
                  <span
                    className={
                      'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ' +
                      statusMeta.classes
                    }
                  >
                    {statusMeta.label}
                  </span>
                </article>
              )
            })}


            {!loading && filtered.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                No hay tickets con ese criterio.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
