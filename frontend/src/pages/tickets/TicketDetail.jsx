import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import Button from '../../components/ui/Button.jsx'
import AvatarInitials from '../../components/AvatarInitials.jsx'
import { fetchTicketById, deleteTicket, updateTicketStatus, updateTicketAssignee } from '../../api/tickets.js'
import { listMessages, createMessage, deleteMessage, updateMessage } from '../../api/messages.js'
import { listAttachments } from '../../api/attachments.js'
import { getStatusMeta, STATUS_OPTIONS } from '../../utils/status.js'
import { fetchUserById } from '../../api/users.js'

function formatDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const d = date.toLocaleDateString('es-ES')
  const t = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  return `${d} | ${t}`
}

export default function TicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, logout, token } = useAuth()
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [attachments, setAttachments] = useState([])
  const [attachmentsError, setAttachmentsError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [statusMenuOpen, setStatusMenuOpen] = useState(false)
  const [changingStatus, setChangingStatus] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [releasing, setReleasing] = useState(false)
  const [userMap, setUserMap] = useState({})
  const menuRef = useRef(null)
  const statusMenuRef = useRef(null)

  const upsertUsersById = async (ids = []) => {
    const unique = Array.from(new Set(ids.filter(Boolean).map((val) => val?.toString?.()))).filter(Boolean)
    if (unique.length === 0) return
    const entries = await Promise.all(
      unique.map(async (uid) => {
        try {
          const data = await fetchUserById(uid, token)
          return [
            uid,
            {
              name: data?.name || '',
              lastName: data?.lastName || data?.last_name || '',
              email: data?.email || '',
            },
          ]
        } catch {
          return [uid, { name: `Usuario ${uid}`, lastName: '', email: '' }]
        }
      })
    )
    setUserMap((prev) => {
      const next = { ...prev }
      entries.forEach(([uid, info]) => {
        if (uid) {
          next[uid] = info
        }
      })
      return next
    })
  }

  const userInfoFor = (id) => {
    const key = id?.toString?.()
    const info = key ? userMap[key] : null
    const isCurrentUser = key && user?.id?.toString?.() === key

    const name = info?.name || (isCurrentUser ? user?.name : '') || ''
    const lastName =
      info?.lastName ||
      info?.last_name ||
      (isCurrentUser ? user?.lastName || user?.last_name : '') ||
      ''
    const email = info?.email || (isCurrentUser ? user?.email : '') || ''
    const displayName = [name, lastName].filter(Boolean).join(' ') || email || (key ? `Usuario ${key}` : '')

    return { name: name || displayName, lastName, email, displayName }
  }

  const roleId =
    user?.roleId ??
    user?.user_roles_id_fk ??
    user?.user_role_id_pk ??
    user?.role ??
    user?.user_role
  const isAdmin = String(roleId) === '1' || user?.role === 'admin'
  const seenKey = user?.id ? `ticketStatusSeen:${user.id}` : null
  const adminSeenKey = user?.id ? `adminTicketSeen:${user.id}` : null
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8080'

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
      if (statusMenuOpen && statusMenuRef.current && !statusMenuRef.current.contains(e.target)) {
        setStatusMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [statusMenuOpen])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      setAttachmentsError('')
      setAttachments([])
      try {
        const [data, msgs] = await Promise.all([
          fetchTicketById(id, token),
          listMessages(id, token),
        ])
        const payload = Array.isArray(data) ? data[0] : data
        if (!payload) throw new Error('Ticket no encontrado')
        const statusId = payload.statusId || payload.status_id_fk || payload.status_id_pk
        const statusMeta = getStatusMeta(statusId || payload.status)
        const requesterId = payload.createdById || payload.created_by_id || payload.created_by_id_pk
        const assigneeId = payload.assigneeId || payload.assignee_id_fk || payload.assignee_id_pk
        let requesterName = payload.requester || payload.createdByName || (requesterId ? `Usuario ${requesterId}` : 'Desconocido')
        let assigneeName = payload.assignee || payload.assigneeName || (assigneeId ? `Asignado (${assigneeId})` : 'Sin asignar')

        try {
          const [reqUser, assUser] = await Promise.all([
            requesterId ? fetchUserById(requesterId, token).catch(() => null) : Promise.resolve(null),
            assigneeId ? fetchUserById(assigneeId, token).catch(() => null) : Promise.resolve(null),
          ])
          if (reqUser?.name) requesterName = reqUser.name
          if (assUser?.name) assigneeName = assUser.name
        } catch {
          // ignoramos errores y usamos los fallback
        }
        await upsertUsersById([requesterId, assigneeId, ...(msgs || []).map((m) => m.userId)])

        setTicket({
          id: payload.id?.toString() ?? payload.ticket_id_pk?.toString() ?? id,
          title: payload.title || `Ticket ${id}`,
          description: payload.description || 'Sin descripción',
          requester: requesterName,
          assignee: assigneeName,
          assigneeId,
          status: statusMeta.label,
          statusId: statusMeta.id,
          openedAt: payload.createdAt || payload.created_at || '',
          category: payload.topic || payload.category || '',
        })
        setMessages(
          (msgs || []).map((m) => ({
            id: m.id,
            userId: m.userId,
            ticketId: m.ticketId,
            content: m.content,
            createdAt: m.createdAt,
          }))
        )
        try {
          const attachmentList = await listAttachments(id, token)
          setAttachments(
            (attachmentList || []).map((a) => ({
              id: a.id ?? a.attachment_id_pk ?? '',
              filename: a.filename || a.fileName || a.name || 'Adjunto',
              filepath: a.filepath || a.filePath || a.path || '',
              uploadedAt: a.uploadedAt || a.uploaded_at || '',
            }))
          )
        } catch (err) {
          setAttachments([])
          setAttachmentsError(err.message || 'No se pudieron cargar los adjuntos')
        }
        console.log('Ticket detail cargado:', payload)
      } catch (err) {
        setError(err.message || 'No se pudo cargar el ticket')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    if (!ticket || isAdmin || !seenKey) return
    if (ticket.assigneeId?.toString() !== user?.id?.toString()) return
    if (ticket.statusId == null || !ticket.id) return
    try {
      const raw = localStorage.getItem(seenKey)
      const parsed = raw ? JSON.parse(raw) : {}
      const next = { ...(parsed && typeof parsed === 'object' ? parsed : {}) }
      next[ticket.id] = ticket.statusId
      localStorage.setItem(seenKey, JSON.stringify(next))
    } catch {
      // ignore localStorage errors
    }
  }, [ticket, user?.id, isAdmin, seenKey])

  useEffect(() => {
    if (!isAdmin || !adminSeenKey || !ticket?.id) return
    try {
      const raw = localStorage.getItem(adminSeenKey)
      const parsed = raw ? JSON.parse(raw) : {}
      const next = { ...(parsed && typeof parsed === 'object' ? parsed : {}) }
      next[ticket.id.toString()] = true
      localStorage.setItem(adminSeenKey, JSON.stringify(next))
    } catch {
      // ignore localStorage errors
    }
  }, [isAdmin, adminSeenKey, ticket?.id])

  const sendMessage = async () => {
    if (!input.trim() || !user?.id) return
    try {
      const saved = await createMessage(
        { ticketId: Number(id), userId: user.id, content: input.trim() },
        token
      )
      setMessages((prev) => [
        ...prev,
        {
          id: saved.id,
          userId: saved.userId,
          ticketId: saved.ticketId,
          content: saved.content,
          createdAt: saved.createdAt ?? new Date().toISOString(),
        },
      ])
      setInput('')
    } catch (err) {
      setError(err.message || 'No se pudo enviar el mensaje')
    }
  }

  const handleDelete = async (messageId) => {
    try {
      await deleteMessage(messageId, token)
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
    } catch (err) {
      setError(err.message || 'No se pudo borrar el mensaje')
    }
  }

  const handleStartEdit = (message) => {
    setError('')
    setEditingId(message.id)
    setEditText(message.content)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  const handleSaveEdit = async () => {
    if (!editingId || !editText.trim()) return
    try {
      setSavingEdit(true)
      setError('')
      const updated = await updateMessage(editingId, { content: editText.trim() }, token)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === editingId ? { ...m, content: updated?.content ?? editText.trim() } : m
        )
      )
      setEditingId(null)
      setEditText('')
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el mensaje')
    } finally {
      setSavingEdit(false)
    }
  }


  const handleChangeStatus = async (statusId) => {
    if (changingStatus || !statusId) return
    try {
      setChangingStatus(true)
      setError('')
      const updated = await updateTicketStatus(id, statusId, token)
      const meta = getStatusMeta(updated?.statusId ?? statusId ?? updated?.status)
      setTicket((prev) =>
        prev
          ? {
              ...prev,
              status: meta.label,
              statusId: meta.id,
            }
          : prev
      )
    } catch (err) {
      setError(err.message || 'No se pudo actualizar el estado')
    } finally {
      setStatusMenuOpen(false)
      setChangingStatus(false)
    }
  }

  const handleAssignToMe = async () => {
    if (!isAdmin || assigning) return
    try {
      setAssigning(true)
      setError('')
      const updated = await updateTicketAssignee(id, user?.id, token)
      const assigneeName = updated?.assigneeName || updated?.assignee || user?.name || user?.email || `Usuario ${user?.id ?? ''}`
      setTicket((prev) => (prev ? { ...prev, assignee: assigneeName, assigneeId: user?.id } : prev))
    } catch (err) {
      setError(err.message || 'No se pudo asignar el ticket')
    } finally {
      setAssigning(false)
    }
  }

  const handleRelease = async () => {
    if (!isAdmin || releasing) return
    try {
      setReleasing(true)
      setError('')
      await updateTicketAssignee(id, null, token)
      setTicket((prev) => (prev ? { ...prev, assignee: 'Sin asignar', assigneeId: null } : prev))
    } catch (err) {
      setError(err.message || 'No se pudo liberar el ticket')
    } finally {
      setReleasing(false)
    }
  }

  const handleDeleteTicket = async () => {
    if (deleting) return
    const firstConfirm = window.confirm('¿Quieres borrar este ticket?')
    if (!firstConfirm) return
    const secondConfirm = window.confirm('Esta acción eliminará el ticket y todos sus mensajes de forma permanente. ¿Confirmas?')
    if (!secondConfirm) return

    try {
      setError('')
      setDeleting(true)
      await deleteTicket(id, token)
      navigate('/tickets')
    } catch (err) {
      setError(err.message || 'No se pudo borrar el ticket')
    } finally {
      setDeleting(false)
    }
  }

  const statusMeta = ticket ? getStatusMeta(ticket.statusId || ticket.status) : null

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
                Helpia · Ticket {ticket?.id ?? id}
              </span>
              <span className="text-xs text-slate-500">Detalle y conversación</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate('/tickets')} className="border border-slate-200 text-slate-700">
              Volver
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
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {!ticket && loading && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              Cargando ticket...
            </div>
          )}

          {!ticket && !loading && !error && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              No se encontró el ticket.
            </div>
          )}

          {ticket && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="text-xs text-slate-500">{ticket.id}</p>
                    <h1 className="text-2xl font-semibold text-slate-900">{ticket.title}</h1>
                  </div>
                  <div className="flex items-center gap-3">
                    {isAdmin && (!ticket.assigneeId || ticket.assigneeId === user?.id) && (
                      <Button
                        variant="ghost"
                        className="px-3 py-2 text-xs border border-slate-200 text-slate-700"
                        onClick={ticket.assigneeId ? handleRelease : handleAssignToMe}
                        disabled={assigning || releasing}
                      >
                        {assigning || releasing
                          ? ticket.assigneeId
                            ? 'Liberando...'
                            : 'Asignando...'
                          : ticket.assigneeId
                            ? 'Liberar ticket'
                            : 'Tomar ticket'}
                      </Button>
                    )}
                    <div className="relative" ref={statusMenuRef}>
                      <button
                        type="button"
                        disabled={!isAdmin || changingStatus}
                        onClick={() => isAdmin && setStatusMenuOpen((v) => !v)}
                        className={
                          'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border transition ' +
                          (statusMeta?.classes || '') +
                          (isAdmin ? ' hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500' : '')
                        }
                        title={isAdmin ? 'Cambiar estado' : undefined}
                      >
                        <span>Estado: {statusMeta?.label}</span>
                        {isAdmin && <span className="ml-1 text-[10px]">▾</span>}
                      </button>
                      {isAdmin && statusMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white shadow-lg py-1 z-10">
                          {STATUS_OPTIONS.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleChangeStatus(opt.id)}
                              disabled={changingStatus}
                              className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 ${opt.id === ticket.statusId ? 'bg-slate-50' : ''}`}
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
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
                  <div>
                    <p className="font-semibold text-slate-900">Asignado a</p>
                    <p>{ticket.assignee}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Solicitante</p>
                    <p>{ticket.requester}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Tipologia</p>
                    <p>{ticket.category}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Fecha de apertura</p>
                    <p>{formatDateTime(ticket.openedAt)}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">Descripción</p>
                    <p className="text-sm text-slate-700 mt-1">{ticket.description}</p>
                  </div>
                  <Button
                    variant="danger"
                    onClick={handleDeleteTicket}
                    disabled={deleting}
                    className="self-start px-4 py-2 text-sm font-semibold border border-rose-700/60"
                  >
                    {deleting ? 'Borrando...' : 'Borrar ticket'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {ticket && (
            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Adjuntos</h2>
                <span className="text-xs text-slate-500">{attachments.length} archivos</span>
              </div>

              {attachmentsError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {attachmentsError}
                </div>
              )}

              {attachments.length > 0 ? (
                <div className="space-y-2">
                  {attachments.map((file) => {
                    const label = file.filename || file.filepath || 'Adjunto'
                    const href =
                      file.filepath &&
                      (file.filepath.startsWith('http')
                        ? file.filepath
                        : `${apiBase}${file.filepath.startsWith('/') ? '' : '/'}${file.filepath}`)
                    const hasLink = Boolean(href)
                    return (
                      <div
                        key={file.id || `${label}-${file.filepath}`}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between gap-3"
                      >
                        <div className="flex flex-col">
                          {hasLink ? (
                            <a
                              href={href}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-semibold text-blue-700 hover:underline break-all"
                            >
                              {label}
                            </a>
                          ) : (
                            <span className="text-sm font-semibold text-slate-800 break-all">
                              {label}
                            </span>
                          )}
                          {file.uploadedAt && (
                            <span className="text-xs text-slate-500">
                              {formatDateTime(file.uploadedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                  No hay adjuntos para este ticket.
                </div>
              )}
            </section>
          )}

          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Conversación del ticket</h2>
              <span className="text-xs text-slate-500">{messages.length} mensajes</span>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {messages.map((m) => {
                const author = userInfoFor(m.userId)
                const isOwnMessage = m.userId?.toString?.() === user?.id?.toString?.()
                const authorLabel =
                  (isOwnMessage && ([user?.name, user?.lastName].filter(Boolean).join(' ') || author.displayName)) ||
                  author.displayName ||
                  (m.userId ? `Usuario ${m.userId}` : 'Usuario')

                return (
                  <div
                    key={m.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <AvatarInitials
                          name={author.name}
                          lastName={author.lastName}
                          email={author.email}
                          size={28}
                          className="text-[11px]"
                        />
                        <span className="font-semibold text-slate-800">
                          {authorLabel}
                        </span>
                      </div>
                      <span>{formatDateTime(m.createdAt) || 'Sin fecha'}</span>
                    </div>
                    {editingId === m.id ? (
                      <div className="space-y-2 mt-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={3}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                            onClick={handleCancelEdit}
                            disabled={savingEdit}
                          >
                            Cancelar
                          </button>
                          <Button
                            onClick={handleSaveEdit}
                            disabled={!editText.trim() || savingEdit}
                            className="px-4 py-2 text-xs"
                          >
                            {savingEdit ? 'Guardando...' : 'Guardar'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-slate-800 mt-1">{m.content}</p>
                        {(isOwnMessage || isAdmin) && (
                          <div className="flex justify-end mt-2 gap-3">
                            <button
                              type="button"
                              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                              onClick={() => handleStartEdit(m)}
                            >
                              Editar mensaje
                            </button>
                            <button
                              type="button"
                              className="text-xs text-rose-600 hover:text-rose-700 font-semibold"
                              onClick={() => handleDelete(m.id)}
                            >
                              Borrar mensaje
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
              {messages.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                  No hay mensajes aún. Escribe el primero.
                </div>
              )}
            </div>

            <div className="space-y-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                rows={3}
              />
              <div className="flex justify-end">
                <Button onClick={sendMessage} disabled={!input.trim()}>
                  Enviar mensaje
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
