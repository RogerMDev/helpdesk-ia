import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'
import AvatarInitials from '../../components/AvatarInitials.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { fetchTickets, updateTicketStatus, updateTicketAssignee, updateTicket } from '../../api/tickets.js'
import { fetchUsers } from '../../api/users.js'
import { getStatusMeta, STATUS_OPTIONS } from '../../utils/status.js'

const CATEGORY_LABELS = ['Red', 'Accesos', 'Licencias', 'Hardware', 'Software', 'Otro']

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user, logout, token } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_LABELS[0])
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [userMap, setUserMap] = useState({})
  const [showAssignedOnly, setShowAssignedOnly] = useState(false)
  const menuRef = useRef(null)
  const [statusMenuTicketId, setStatusMenuTicketId] = useState(null)
  const [changingStatusId, setChangingStatusId] = useState(null)
  const [assigningId, setAssigningId] = useState(null)
  const [releasingId, setReleasingId] = useState(null)
  const statusMenuRef = useRef(null)

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
    const handler = (e) => {
      if (statusMenuTicketId && statusMenuRef.current && !statusMenuRef.current.contains(e.target)) {
        setStatusMenuTicketId(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [statusMenuTicketId])

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

  const openTickets = useMemo(
    () => (tickets || []).filter((t) => {
      const statusId = t.statusId || t.status_id_fk || t.status_id_pk
      const isAssignedToMe =
        (t.assigneeId || t.assignee_id_fk || t.assignee_id_pk)?.toString() === (user?.id?.toString() || '')
      return statusId !== 3 && statusId !== 4 && (!showAssignedOnly || isAssignedToMe)
    }),
    [tickets, showAssignedOnly, user?.id]
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

  const handleChangeStatus = async (ticketId, statusId) => {
    if (!ticketId || !statusId || changingStatusId) return
    try {
      setChangingStatusId(ticketId)
      const updated = await updateTicketStatus(ticketId, statusId, token)
      const meta = getStatusMeta(updated?.statusId ?? statusId ?? updated?.status)
      setTickets((prev) =>
        (prev || []).map((t) =>
          (t.id?.toString() ?? t.ticket_id_pk?.toString()) === ticketId.toString()
            ? { ...t, statusId: meta.id, status: meta.label }
            : t
        )
      )
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el estado')
    } finally {
      setStatusMenuTicketId(null)
      setChangingStatusId(null)
    }
  }

  const handleAssignToMe = async (ticketId) => {
    if (!ticketId || assigningId) return
    try {
      setAssigningId(ticketId)
      setError('')
      const updated = await updateTicketAssignee(ticketId, user?.id, token)
      const assigneeName =
        updated?.assigneeName || updated?.assignee || user?.name || user?.email || `Usuario ${user?.id ?? ''}`
      setTickets((prev) =>
        (prev || []).map((t) =>
          (t.id?.toString() ?? t.ticket_id_pk?.toString()) === ticketId.toString()
            ? { ...t, assignee: assigneeName, assigneeId: user?.id }
            : t
        )
      )
    } catch (err) {
      setError(err.message || 'No se pudo asignar el ticket')
    } finally {
      setAssigningId(null)
    }
  }

  const handleRelease = async (ticketId) => {
    if (!ticketId || releasingId) return
    try {
      setReleasingId(ticketId)
      setError('')
      const updated = await updateTicketAssignee(ticketId, null, token)
      const isSame = (tId) => (tId?.toString() ?? '') === ticketId.toString()
      setTickets((prev) =>
        (prev || []).map((t) =>
          isSame(t.id) ? { ...t, assignee: 'Sin asignar', assigneeId: null } : t
        )
      )
    } catch (err) {
      setError(err.message || 'No se pudo liberar el ticket')
    } finally {
      setReleasingId(null)
    }
  }

  const nameForUser = (id, fallback) => userMap[id?.toString()] || fallback

  const formatDateTime = (value) => {
    if (!value) return ''
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    const d = date.toLocaleDateString('es-ES')
    const t = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    return `${d} | ${t}`
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
              <span className="text-sm font-semibold text-slate-900">Helpia · Panel admin</span>
              <span className="text-xs text-slate-500">Gestion de tickets y usuarios</span>
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
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAssignedOnly((v) => !v)}
                    className={
                      'rounded-lg border px-3 py-1.5 text-xs font-semibold transition ' +
                      (showAssignedOnly
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50')
                    }
                  >
                    Mostrar asignados a mí
                  </button>
                  <span className="text-xs text-slate-500">
                    {ticketsBySelected.length} resultado(s)
                  </span>
                </div>
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
                  const statusMeta = getStatusMeta(statusId || t.status)
                  const topic = t.category || t.topic || selectedCategory
                  const createdId = t.createdById || t.created_by_id || t.created_by_id_pk
                  const assigneeId = t.assigneeId || t.assignee_id_fk || t.assignee_id_pk
                  const requester = nameForUser(createdId, t.requester || t.createdByName || `Usuario ${t.createdById ?? ''}`)
                  const assignee = nameForUser(assigneeId, t.assignee || t.assigneeName || (assigneeId ? `Asignado (${assigneeId})` : 'Sin asignar'))
                  const date = formatDateTime(t.createdAt || t.created_at || '')
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
                      <p className="text-xs text-slate-500">Asignado a: {assignee}</p>
                      <p className="text-xs text-slate-500">Tipologia: {topic}</p>
                      <p className="text-xs text-slate-500 mt-1">Fecha: {date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative" ref={statusMenuTicketId === t.id ? statusMenuRef : undefined}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setStatusMenuTicketId((curr) => (curr === t.id ? null : t.id))
                          }}
                          disabled={Boolean(changingStatusId)}
                          className={
                            'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border transition hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 ' +
                            statusMeta.classes
                          }
                        >
                          {statusMeta.label} <span className="ml-1 text-[10px]">▾</span>
                        </button>
                        {statusMenuTicketId === t.id && (
                          <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white shadow-lg py-1 z-10">
                            {STATUS_OPTIONS.map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleChangeStatus(t.id, opt.id)
                                }}
                                disabled={changingStatusId === t.id}
                                className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 ${opt.id === statusMeta.id ? 'bg-slate-50' : ''}`}
                              >
                                <span
                                  className={
                                    'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold border leading-none ' +
                                    opt.classes
                                  }
                                >
                                  {opt.label}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {!t.assigneeId && (
                        <Button
                          type="button"
                          variant="ghost"
                          className="px-3 py-2 text-xs border border-slate-200 text-slate-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAssignToMe(t.id)
                          }}
                          disabled={assigningId === t.id}
                        >
                          {assigningId === t.id ? 'Asignando...' : 'Tomar ticket'}
                        </Button>
                      )}
                      {t.assigneeId && t.assigneeId.toString() === (user?.id?.toString() || '') && (
                        <Button
                          type="button"
                          variant="ghost"
                          className="px-3 py-2 text-xs border border-slate-200 text-rose-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRelease(t.id)
                          }}
                          disabled={releasingId === t.id}
                        >
                          {releasingId === t.id ? 'Liberando...' : 'Liberar ticket'}
                        </Button>
                      )}
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
