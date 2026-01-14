import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import AvatarInitials from '../../components/AvatarInitials.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { fetchUsers, updateUser, deleteUser as deleteUserApi, updateUserPassword } from '../../api/users.js'
import logo_helpdesk from '../../assets/logo_helpdesk.png'

const ADMIN_ROLE_ID = 1
const USER_ROLE_ID = 3

export default function AdminUsers() {
  const navigate = useNavigate()
  const { user, logout, token } = useAuth()
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [showAdminsOnly, setShowAdminsOnly] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  const normalizeUser = useCallback((u) => {
    const roleRaw =
      u?.roleId ??
      u?.user_roles_id_fk ??
      u?.role_id_fk ??
      u?.role_id ??
      u?.role

    let roleId = null
    if (roleRaw === 'admin') roleId = ADMIN_ROLE_ID
    else if (roleRaw === 'user') roleId = USER_ROLE_ID
    else if (roleRaw !== undefined && roleRaw !== null && !Number.isNaN(Number(roleRaw))) roleId = Number(roleRaw)

    return {
      id: u?.id ?? u?.user_id_pk ?? u?.user_id ?? null,
      name: u?.name ?? '',
      lastName: u?.lastName ?? u?.last_name ?? '',
      email: u?.email ?? '',
      phone: u?.phone ?? '',
      roleId,
      roleName: u?.roleName ?? u?.role_name ?? u?.role ?? '',
    }
  }, [])

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchUsers(token)
      const parsed = (data || []).map(normalizeUser)
      setUsers(parsed)
      setSelected((prev) => {
        if (!parsed.length) return null
        if (!prev) return parsed[0]
        const match = parsed.find((u) => u.id === prev.id)
        return match || parsed[0]
      })
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los usuarios')
    } finally {
      setLoading(false)
    }
  }, [normalizeUser, token])

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
    loadUsers()
  }, [loadUsers])

  useEffect(() => {
    setNewPassword('')
    setConfirmPassword('')
  }, [selected?.id])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    const base = showAdminsOnly ? users.filter((u) => u.roleId === ADMIN_ROLE_ID) : users
    if (!term) return base
    return base.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.lastName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
    )
  }, [search, users, showAdminsOnly])

  const selectUser = (u) => setSelected(u)

  const updateField = (name, value) => {
    setSelected((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleChange = (e) => {
    const next = Number(e.target.value)
    if (selected?.roleId !== ADMIN_ROLE_ID && next === ADMIN_ROLE_ID) {
      const confirmAdmin = window.confirm('¿Seguro que quieres convertir este usuario en administrador?')
      if (!confirmAdmin) return
    }
    updateField('roleId', next)
  }

  const saveUser = async () => {
    if (!selected?.id || saving) return
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const roleId = selected.roleId ?? USER_ROLE_ID
      const updated = await updateUser(
        selected.id,
        {
          name: selected.name,
          lastName: selected.lastName,
          email: selected.email,
          phone: selected.phone,
          roleId,
        },
        token
      )
      const normalized = normalizeUser(updated)
      setUsers((prev) => prev.map((u) => (u.id === normalized.id ? normalized : u)))
      setSelected(normalized)
    } catch (err) {
      setError(err.message || 'No se pudieron guardar los cambios')
    } finally {
      setSaving(false)
    }
  }

  const deleteUser = async (id) => {
    if (!id || saving) return
    const confirmed = window.confirm('¿Quieres eliminar este usuario? Esta acción es irreversible.')
    if (!confirmed) return
    setSaving(true)
    setError('')
    setNotice('')
    try {
      await deleteUserApi(id, token)
      setUsers((prev) => prev.filter((u) => u.id !== id))
      if (selected?.id === id) setSelected(null)
    } catch (err) {
      setError(err.message || 'No se pudo eliminar el usuario')
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    if (!selected?.id || savingPassword) return
    setError('')
    setNotice('')
    if (!newPassword.trim()) {
      setError('La nueva contraseña es obligatoria')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    setSavingPassword(true)
    try {
      await updateUserPassword(selected.id, newPassword.trim(), token)
      setNotice('Contraseña actualizada')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err.message || 'No se pudo actualizar la contraseña')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="min-h-screen h-screen overflow-hidden bg-slate-50 flex flex-col">
      <header className="w-full bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={logo_helpdesk}
              alt="Helpia"
              className="h-9 w-9 rounded-xl shadow-sm object-contain"
            />
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

      <main className="flex-1 overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-6 space-y-6 h-full overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Usuarios</h1>
              <p className="text-sm text-slate-500">Busca por nombre, apellidos o correo. Edita y cambia roles.</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-end">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={showAdminsOnly}
                  onChange={(e) => setShowAdminsOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                />
                Solo admins
              </label>
              <div className="sm:w-64">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar usuario..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
          {notice && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {notice}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 space-y-2 max-h-[75vh] overflow-y-auto pr-1">
              {loading && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">
                  Cargando usuarios...
                </div>
              )}
              {!loading && filtered.map((u) => (
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
                        u.roleId === ADMIN_ROLE_ID ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {u.roleId === ADMIN_ROLE_ID ? 'Admin' : 'Usuario'}
                    </span>
                  </div>
                </div>
              ))}
              {!loading && filtered.length === 0 && (
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
                      value={selected.roleId ?? USER_ROLE_ID}
                      onChange={handleRoleChange}
                      disabled={saving}
                    >
                      <option value={USER_ROLE_ID}>Usuario</option>
                      <option value={ADMIN_ROLE_ID}>Admin</option>
                    </Input>
                  </div>
                  <div className="border-t border-slate-200 pt-4">
                    <h3 className="text-sm font-semibold text-slate-800">Cambiar contraseña</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                      <Input
                        label="Nueva contraseña"
                        name="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={savingPassword}
                      />
                      <Input
                        label="Confirmar contraseña"
                        name="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={savingPassword}
                      />
                    </div>
                    <div className="mt-3">
                      <Button
                        type="button"
                        variant="ghost"
                        className="border border-slate-200 text-slate-700"
                        onClick={changePassword}
                        disabled={savingPassword || !selected?.id}
                      >
                        {savingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      className="border border-slate-200 text-slate-700"
                      onClick={() => setSelected(null)}
                      disabled={saving}
                    >
                      Cancelar
                    </Button>
                    <Button type="button" onClick={saveUser} disabled={saving}>
                      {saving ? 'Guardando...' : 'Guardar cambios'}
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => selected?.id && deleteUser(selected.id)}
                      disabled={saving || !selected?.id}
                      className="ml-auto"
                    >
                      {saving ? 'Procesando...' : 'Borrar usuario'}
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
