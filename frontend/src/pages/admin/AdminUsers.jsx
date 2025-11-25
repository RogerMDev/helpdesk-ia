import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

const MOCK_USERS = [
  { id: 1, name: 'Laura', lastName: 'Martin', email: 'laura@empresa.com', phone: '600123456', roleId: 0 },
  { id: 2, name: 'Carlos', lastName: 'Ruiz', email: 'carlos@empresa.com', phone: '600123457', roleId: 1 },
  { id: 3, name: 'Ana', lastName: 'Perez', email: 'ana@empresa.com', phone: '600123458', roleId: 0 },
  { id: 4, name: 'Marta', lastName: 'Lopez', email: 'marta@empresa.com', phone: '600123459', roleId: 0 },
]

export default function AdminUsers() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState(MOCK_USERS)
  const [selected, setSelected] = useState(MOCK_USERS[0])
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
    if (!term) return users
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.lastName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    )
  }, [search, users])

  const selectUser = (u) => setSelected(u)

  const updateField = (name, value) => {
    setSelected((prev) => ({ ...prev, [name]: value }))
  }

  const saveUser = () => {
    setUsers((prev) => prev.map((u) => (u.id === selected.id ? selected : u)))
    // TODO: persistir via API
  }

  const deleteUser = (id) => {
    setUsers((prev) => prev.filter((u) => u.id !== id))
    if (selected?.id === id) setSelected(null)
    // TODO: eliminar via API
  }

  const toggleAdmin = (u) => {
    const nextRole = u.roleId === 1 ? 0 : 1
    const updated = { ...u, roleId: nextRole }
    setUsers((prev) => prev.map((item) => (item.id === u.id ? updated : item)))
    if (selected?.id === u.id) setSelected(updated)
    // TODO: persistir via API
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
              <span className="text-sm font-semibold text-slate-900">Helpia · Gestion de usuarios</span>
              <span className="text-xs text-slate-500">Busca, edita y asigna roles</span>
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
              <h1 className="text-2xl font-semibold text-slate-900">Usuarios</h1>
              <p className="text-sm text-slate-500">Busca por nombre, apellidos o correo. Edita y cambia roles.</p>
            </div>
            <div className="sm:w-72">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar usuario..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 space-y-2">
              {filtered.map((u) => (
                <div
                  key={u.id}
                  className={`rounded-xl border px-3 py-3 cursor-pointer transition ${
                    selected?.id === u.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50'
                  }`}
                  onClick={() => selectUser(u)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {u.name} {u.lastName}
                      </p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        u.roleId === 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {u.roleId === 1 ? 'Admin' : 'Usuario'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="mt-2 text-xs text-blue-700 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleAdmin(u)
                    }}
                  >
                    {u.roleId === 1 ? 'Quitar admin' : 'Hacer admin'}
                  </button>
                  <button
                    type="button"
                    className="mt-1 text-xs text-rose-600 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteUser(u.id)
                    }}
                  >
                    Eliminar usuario
                  </button>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">
                  Sin resultados
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              {selected ? (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-slate-900">Editar usuario</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Nombre"
                      name="name"
                      value={selected.name}
                      onChange={(e) => updateField('name', e.target.value)}
                    />
                    <Input
                      label="Apellidos"
                      name="lastName"
                      value={selected.lastName}
                      onChange={(e) => updateField('lastName', e.target.value)}
                    />
                    <Input
                      label="Correo"
                      name="email"
                      value={selected.email}
                      onChange={(e) => updateField('email', e.target.value)}
                    />
                    <Input
                      label="Telefono"
                      name="phone"
                      value={selected.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                    />
                    <Input
                      label="Rol"
                      name="roleId"
                      as="select"
                      value={selected.roleId}
                      onChange={(e) => updateField('roleId', Number(e.target.value))}
                    >
                      <option value={0}>Usuario</option>
                      <option value={1}>Admin</option>
                    </Input>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      className="border border-slate-200 text-slate-700"
                      onClick={() => setSelected(null)}
                    >
                      Cancelar
                    </Button>
                    <Button type="button" onClick={saveUser}>
                      Guardar cambios
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  Selecciona un usuario para editar.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
