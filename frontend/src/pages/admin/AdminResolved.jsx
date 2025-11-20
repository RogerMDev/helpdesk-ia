import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import Button from '../../components/ui/Button.jsx'

const MOCK_CLOSED = [
  { id: 'TKT-206', title: 'Error en CRM', requester: 'Marta Lopez', priority: 'Media', status: 'Cerrado', category: 'Software', date: '14/11/2025' },
  { id: 'TKT-204', title: 'Licencia Office 365', requester: 'Ana Perez', priority: 'Baja', status: 'Resuelto', category: 'Licencias', date: '16/11/2025' },
  { id: 'TKT-210', title: 'VPN caducada', requester: 'Jorge Cano', priority: 'Media', status: 'Resuelto', category: 'Accesos', date: '18/11/2025' },
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

export default function AdminResolved() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
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

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return MOCK_CLOSED
    return MOCK_CLOSED.filter((t) =>
      t.id.toLowerCase().includes(term) ||
      t.title.toLowerCase().includes(term) ||
      t.requester.toLowerCase().includes(term) ||
      t.category.toLowerCase().includes(term)
    )
  }, [search])

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

          <div className="space-y-3">
            {filtered.map((t) => (
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
                    {t.category} · {t.requester} · {t.date}
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

            {filtered.length === 0 && (
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
