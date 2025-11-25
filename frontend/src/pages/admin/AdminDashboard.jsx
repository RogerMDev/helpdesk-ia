import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { fetchTickets } from '../../api/tickets.js'

const CATEGORY_LABELS = ['Red', 'Accesos', 'Licencias', 'Hardware', 'Software', 'Otro']

function priorityClasses(priority) {
  switch (priority) {
    case 'Alta':
      return 'bg-rose-100 text-rose-700'
    case 'Media':
      return 'bg-amber-100 text-amber-700'
    case 'Baja':
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

function statusLabelFromId(id) {
  switch (Number(id)) {
    case 1:
      return 'Abierto'
    case 2:
      return 'En progreso'
    case 3:
      return 'Resuelto'
    case 4:
      return 'Cerrado'
    default:
      return 'Abierto'
  }
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_LABELS[0])
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  const avatarInitial = (user?.name || user?.email || '?').charAt(0).toUpperCase()

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
        const data = await fetchTickets()
        setTickets(data || [])
      } catch (err) {
        setError(err.message || 'No se pudieron cargar los tickets')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const openTickets = useMemo(
    () => (tickets || []).filter((t) => {
      const statusId = t.statusId || t.status_id_fk || t.status_id_pk
      return statusId !== 3 && statusId !== 4
    }),
    [tickets]
  )

  const countsByCategory = useMemo(() => {
    const counts = {}
    CATEGORY_LABELS.forEach((c) => {
      counts[c] = openTickets.filter((t) => {
        const topic = t.category || t.topic || ''
        return topic.toLowerCase() === c.toLowerCase()
      }).length
    })
    return counts
  }, [openTickets])

  const ticketsBySelected = useMemo(
    () => openTickets.filter((t) => {
      const topic = t.category || t.topic || ''
      return topic.toLowerCase() === selectedCategory.toLowerCase()
    }),
    [openTickets, selectedCategory]
  )

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="w-full bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 shadow-sm flex items-center justify-center">
              <span className="text-white text-sm font-semibold">H</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">Helpia · Panel admin</span>
              <span className="text-xs text-slate-500">Gestion de tickets y usuarios</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setShowMenu((v) => !v)}
                className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-semibold text-slate-700 hover:bg-slate-200 transition"
                title="Menu de usuario"
              >
                {avatarInitial}
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
        <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigate('/admin/resolved')}
              className="sm:w-auto"
            >
              Ver tickets resueltos / cerrados
            </Button>
            <Button
              onClick={() => navigate('/admin/users')}
              variant="ghost"
              className="sm:w-auto border border-slate-200 text-slate-700"
            >
              Gestion de usuarios
            </Button>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Tickets abiertos por tipologia</h2>
                <p className="text-sm text-slate-500">Agrupa las incidencias por carpeta de tipologia.</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {CATEGORY_LABELS.map((cat) => {
                const isSelected = selectedCategory === cat
                const base = 'border-slate-200 bg-white text-slate-800 hover:border-blue-200 hover:bg-blue-50'
                const selectedStyles = 'border-blue-500 bg-blue-600 text-white shadow-sm'

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-xl border px-3 py-3 text-left transition ${isSelected ? selectedStyles : base}`}
                  >
                    <div className="text-sm font-semibold">{cat}</div>
                    <div className={`text-xs ${isSelected ? 'text-white/90' : 'text-slate-500'}`}>
                      Abiertos: {countsByCategory[cat] || 0}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">
                  Tickets en {selectedCategory} (no cerrados)
                </h3>
                <span className="text-xs text-slate-500">
                  {ticketsBySelected.length} resultado(s)
                </span>
              </div>

              {loading && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  Cargando tickets...
                </div>
              )}

              {!loading && ticketsBySelected.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  No hay tickets abiertos en esta tipologia.
                </div>
              ) : (
                ticketsBySelected.map((t) => {
                  const statusId = t.statusId || t.status_id_fk || t.status_id_pk
                  const statusLabel = statusLabelFromId(statusId)
                  const priority = t.priority || 'N/A'
                  const topic = t.category || t.topic || selectedCategory
                  const requester = t.requester || t.createdByName || `Usuario ${t.createdById ?? ''}`
                  const date = t.createdAt || t.created_at || ''
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
                      <p className="text-xs text-slate-500 mt-0.5">Solicitado por {requester}</p>
                      <p className="text-xs text-slate-500">Tipologia: {topic}</p>
                      <p className="text-xs text-slate-500">Fecha: {date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ' +
                          priorityClasses(priority)
                        }
                      >
                        {priority}
                      </span>
                      <span className="text-xs text-slate-500">{statusLabel}</span>
                    </div>
                  </article>
                  )
                })
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
