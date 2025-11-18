import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import Button from '../../components/ui/Button.jsx'

// TODO: Sustituir esto por datos reales del backend cuando tengas /api/tickets
const MOCK_TICKETS = [
  {
    id: 'TKT-001',
    title: 'Error en login',
    requester: 'Ana García',
    assignee: 'Carlos Ruiz',
    priority: 'Alta',
    status: 'Abierto',
    date: '15/10/2025',
  },
  {
    id: 'TKT-002',
    title: 'Problema con reportes',
    requester: 'Carlos Ruiz',
    assignee: 'Laura Martín',
    priority: 'Media',
    status: 'En Progreso',
    date: '14/10/2025',
  },
  {
    id: 'TKT-003',
    title: 'Solicitud de acceso',
    requester: 'María López',
    assignee: 'Tú mismo',
    priority: 'Baja',
    status: 'Abierto',
    date: '13/10/2025',
  },
  {
    id: 'TKT-004',
    title: 'Bug en dashboard',
    requester: 'Juan Pérez',
    assignee: 'Equipo Front',
    priority: 'Alta',
    status: 'Abierto',
    date: '12/10/2025',
  },
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

function statusClasses(status) {
  switch (status) {
    case 'En Progreso':
      return 'bg-blue-100 text-blue-700'
    case 'Pendiente':
      return 'bg-amber-100 text-amber-700'
    case 'Cerrado':
      return 'bg-emerald-100 text-emerald-700'
    case 'Abierto':
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

export default function TicketsHome() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const displayName = user?.name || 'Usuario'

  const avatarInitial = (user?.name || user?.email || '?')
    .charAt(0)
    .toUpperCase()

  // Filtro simple por ID, título o requester
  const filteredTickets = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return MOCK_TICKETS
    return MOCK_TICKETS.filter((t) => {
      return (
        t.id.toLowerCase().includes(term) ||
        t.title.toLowerCase().includes(term) ||
        t.requester.toLowerCase().includes(term)
      )
    })
  }, [search])

  const handleNewTicket = () => {
    // Más adelante aquí navegas al formulario real de creación
    navigate('/tickets/new')
  }

  const handleOpenTicket = (id) => {
    // Navegar al detalle cuando exista
    navigate(`/tickets/${id}`)
  }

  const handleProfile = () => {
    // Pantalla de usuario / ajustes
    navigate('/account')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header superior */}
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
              <span className="text-xs text-slate-500">
                Panel principal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Aquí podrías poner un icono de notificaciones en el futuro */}
            <button
              type="button"
              onClick={handleProfile}
              className="h-9 w-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-sm font-semibold text-slate-700 hover:bg-slate-200 transition"
              title="Ver perfil"
            >
              {avatarInitial}
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
          {/* Hola + CTA nuevo ticket */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">
                Hola, <span className="font-semibold text-slate-800">{displayName}</span> 👋
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                Tus tickets
              </h2>
              <p className="text-sm text-slate-500">
                Revisa el estado de tus incidencias y crea nuevas solicitudes.
              </p>
            </div>

            <Button onClick={handleNewTicket} className="self-start sm:self-auto">
              + Nuevo ticket
            </Button>
          </div>

          {/* Barra de búsqueda + filtros */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar tickets por ID, título o usuario…"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400 text-xs">
                ⌕
              </span>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="ghost"
                className="border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              >
                Filtros
              </Button>
            </div>
          </div>

          {/* Lista de tickets */}
          <section className="space-y-3">
            {filteredTickets.map((ticket) => (
              <article
                key={ticket.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl bg-white shadow-sm border border-slate-200 px-4 py-3 cursor-pointer hover:shadow-md transition"
                onClick={() => handleOpenTicket(ticket.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-blue-700 font-semibold hover:underline">
                      {ticket.id}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="font-medium text-slate-900 truncate">
                      {ticket.title}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Creado por: {ticket.requester}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Asignado a: <span className="font-medium text-slate-700">{ticket.assignee}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3 sm:pl-3">
                  <span
                    className={
                      'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ' +
                      priorityClasses(ticket.priority)
                    }
                  >
                    {ticket.priority}
                  </span>
                  <span
                    className={
                      'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ' +
                      statusClasses(ticket.status)
                    }
                  >
                    {ticket.status}
                  </span>
                  <span className="ml-auto text-xs text-slate-500 whitespace-nowrap">
                    {ticket.date}
                  </span>
                </div>
              </article>
            ))}

            {filteredTickets.length === 0 && (
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
