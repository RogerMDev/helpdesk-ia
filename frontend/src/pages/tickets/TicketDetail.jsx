import { useMemo, useRef, useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import Button from '../../components/ui/Button.jsx'

const MOCK_TICKETS = {
  'TKT-201': {
    id: 'TKT-201',
    title: 'VPN no conecta',
    description: 'El cliente no puede conectarse a la VPN corporativa desde su portatil.',
    requester: 'Laura Martin',
    assignee: 'Carlos Silva',
    priority: 'Alta',
    status: 'Abierto',
    openedAt: '20/11/2025 10:15',
    category: 'Red',
  },
  'TKT-205': {
    id: 'TKT-205',
    title: 'Portatil no enciende',
    description: 'Equipo Dell no enciende tras actualización. Se requiere revisión de hardware.',
    requester: 'Carlos Silva',
    assignee: 'Equipo IT',
    priority: 'Alta',
    status: 'En progreso',
    openedAt: '15/11/2025 09:40',
    category: 'Hardware',
  },
}

const MOCK_MESSAGES = [
  { id: 1, author: 'Laura Martin', text: 'Buenos días, sigue sin conectar.', timestamp: '20/11/2025 10:20' },
  { id: 2, author: 'Carlos Silva', text: 'Revisando logs de VPN.', timestamp: '20/11/2025 10:32' },
]

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

export default function TicketDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState(MOCK_MESSAGES)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  const ticket = useMemo(() => MOCK_TICKETS[id] || MOCK_TICKETS['TKT-201'], [id])
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

  const sendMessage = () => {
    if (!input.trim()) return
    const now = new Date()
    const stamp = now.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    setMessages((prev) => [
      ...prev,
      { id: prev.length + 1, author: user?.name || 'Usuario', text: input.trim(), timestamp: stamp },
    ])
    setInput('')
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
              <span className="text-sm font-semibold text-slate-900">Helpia · Ticket {ticket.id}</span>
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
        <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <p className="text-xs text-slate-500">{ticket.id}</p>
                  <h1 className="text-2xl font-semibold text-slate-900">{ticket.title}</h1>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={
                      'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ' +
                      priorityClasses(ticket.priority)
                    }
                  >
                    Prioridad {ticket.priority}
                  </span>
                  <span className="text-xs text-slate-500">Estado: {ticket.status}</span>
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
                  <p>{ticket.openedAt}</p>
                </div>
              </div>

              <div>
                <p className="font-semibold text-slate-900">Descripción</p>
                <p className="text-sm text-slate-700 mt-1">{ticket.description}</p>
              </div>
            </div>
          </div>

          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Conversación del ticket</h2>
              <span className="text-xs text-slate-500">{messages.length} mensajes</span>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-slate-800">{m.author}</span>
                    <span>{m.timestamp}</span>
                  </div>
                  <p className="text-sm text-slate-800 mt-1">{m.text}</p>
                </div>
              ))}
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
