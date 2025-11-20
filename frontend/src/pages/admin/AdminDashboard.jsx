import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const CATEGORY_LABELS = ['Red', 'Accesos', 'Licencias', 'Hardware', 'Software', 'Otro']

const MOCK_TICKETS = [
  { id: 'TKT-201', title: 'VPN no conecta', requester: 'Laura Martin', priority: 'Alta', statusId: 1, status: 'Abierto', category: 'Red', date: '20/11/2025' },
  { id: 'TKT-202', title: 'Pantalla parpadea', requester: 'Mario Ruiz', priority: 'Media', statusId: 2, status: 'En progreso', category: 'Hardware', date: '19/11/2025' },
  { id: 'TKT-203', title: 'Crear usuario SAP', requester: 'Paula Gomez', priority: 'Alta', statusId: 1, status: 'Abierto', category: 'Accesos', date: '18/11/2025' },
  { id: 'TKT-204', title: 'Licencia Office 365', requester: 'Ana Perez', priority: 'Baja', statusId: 3, status: 'Resuelto', category: 'Licencias', date: '16/11/2025' },
  { id: 'TKT-205', title: 'Portatil no enciende', requester: 'Carlos Silva', priority: 'Alta', statusId: 1, status: 'Abierto', category: 'Hardware', date: '15/11/2025' },
  { id: 'TKT-206', title: 'Error en CRM', requester: 'Marta Lopez', priority: 'Media', statusId: 4, status: 'Cerrado', category: 'Software', date: '14/11/2025' },
  { id: 'TKT-207', title: 'Clave VPN caducada', requester: 'Jorge Cano', priority: 'Media', statusId: 2, status: 'En progreso', category: 'Accesos', date: '13/11/2025' },
  { id: 'TKT-208', title: 'Consulta general', requester: 'Lucia Rios', priority: 'Baja', statusId: 1, status: 'Abierto', category: 'Otro', date: '12/11/2025' },
]

const MOCK_USERS = [
  { id: 1, name: 'Laura Martin', email: 'laura@empresa.com', role: 0 },
  { id: 2, name: 'Carlos Ruiz', email: 'carlos@empresa.com', role: 1 },
  { id: 3, name: 'Ana Perez', email: 'ana@empresa.com', role: 0 },
  { id: 4, name: 'Marta Lopez', email: 'marta@empresa.com', role: 0 },
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

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_LABELS[0])
  const [users, setUsers] = useState(MOCK_USERS)

  const openTickets = useMemo(
    () => MOCK_TICKETS.filter((t) => t.statusId !== 3 && t.statusId !== 4),
    []
  )
  const closedTickets = useMemo(
    () => MOCK_TICKETS.filter((t) => t.statusId === 3 || t.statusId === 4),
    []
  )

  const countsByCategory = useMemo(() => {
    const counts = {}
    CATEGORY_LABELS.forEach((c) => {
      counts[c] = openTickets.filter((t) => t.category === c).length
    })
    return counts
  }, [openTickets])

  const ticketsBySelected = useMemo(
    () => openTickets.filter((t) => t.category === selectedCategory),
    [openTickets, selectedCategory]
  )

  const toggleAdmin = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, role: u.role === 1 ? 0 : 1 }
          : u
      )
    )
    // TODO: llamada al backend para persistir
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

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Admin: {user?.name || 'Admin'}</span>
            <Button variant="ghost" onClick={() => navigate('/tickets')} className="px-4 py-2">
              Volver a tickets
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Tickets abiertos por tipologia</h2>
                <p className="text-sm text-slate-500">Agrupa las incidencias por carpeta de tipologia.</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {CATEGORY_LABELS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl border px-3 py-3 text-left transition ${
                    selectedCategory === cat
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-blue-200 hover:bg-blue-50'
                  }`}
                >
                  <div className="text-sm font-semibold">{cat}</div>
                  <div className="text-xs text-slate-500">Abiertos: {countsByCategory[cat] || 0}</div>
                </button>
              ))}
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

              {ticketsBySelected.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  No hay tickets abiertos en esta tipologia.
                </div>
              ) : (
                ticketsBySelected.map((t) => (
                  <article
                    key={t.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl bg-white border border-slate-200 px-4 py-3 shadow-sm hover:shadow transition"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-blue-700 font-semibold">{t.id}</span>
                        <span className="text-slate-400">·</span>
                        <span className="font-medium text-slate-900 truncate">{t.title}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Solicitado por {t.requester}</p>
                      <p className="text-xs text-slate-500">Fecha: {t.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ' +
                          priorityClasses(t.priority)
                        }
                      >
                        {t.priority}
                      </span>
                      <span className="text-xs text-slate-500">{t.status}</span>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Tickets resueltos / cerrados</h2>
              <p className="text-sm text-slate-500">Estados 3 y 4 (resolved o closed).</p>
            </div>
            {closedTickets.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                No hay tickets completados.
              </div>
            ) : (
              <div className="space-y-3">
                {closedTickets.map((t) => (
                  <article
                    key={t.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl bg-white border border-slate-200 px-4 py-3 shadow-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-blue-700 font-semibold">{t.id}</span>
                        <span className="text-slate-400">·</span>
                        <span className="font-medium text-slate-900 truncate">{t.title}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {t.category} · {t.requester}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500">{t.status}</span>
                    <span
                      className={
                        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ' +
                        priorityClasses(t.priority)
                      }
                    >
                      {t.priority}
                    </span>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Gestion de usuarios</h2>
              <p className="text-sm text-slate-500">Edita perfiles y cambia roles a admin.</p>
            </div>
            <div className="space-y-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{u.name}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      u.role === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {u.role === 1 ? 'Admin' : 'Usuario'}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="border border-slate-200 text-slate-700 px-3 py-2"
                      onClick={() => toggleAdmin(u.id)}
                    >
                      {u.role === 1 ? 'Quitar admin' : 'Hacer admin'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
