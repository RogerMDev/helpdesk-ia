import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import AvatarInitials from '../../components/AvatarInitials.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { updateUser, fetchUserById } from '../../api/users.js'

function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('es-ES')
}

export default function Profile() {
  const { user, token, updateSessionUser } = useAuth()
  const navigate = useNavigate()

  const initialData = useMemo(
    () => ({
      name: user?.name || '',
      lastName: user?.lastName || user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      roleId:
        user?.roleId ??
        user?.user_roles_id_fk ??
        user?.user_role_id_pk ??
        user?.role ??
        user?.user_role,
      createdAt: formatDate(user?.createdAt || user?.created_at),
    }),
    [user]
  )

  const [form, setForm] = useState(initialData)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [loadingProfile, setLoadingProfile] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id || !token) return
      setLoadingProfile(true)
      try {
        const data = await fetchUserById(user.id, token)
        const rawCreatedAt = data.createdAt || data.created_at || user?.createdAt || user?.created_at || null
        const next = {
          name: data.name || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          roleId: data.roleId ?? data.role_id ?? data.role_id_pk ?? initialData.roleId,
          createdAt: formatDate(rawCreatedAt),
        }
        setForm(next)
      } catch (err) {
        setError(err.message || 'No se pudo cargar el perfil')
      } finally {
        setLoadingProfile(false)
      }
    }
    loadProfile()
  }, [user?.id, token, initialData.roleId, initialData.createdAt])

  useEffect(() => {
    setForm(initialData)
  }, [initialData])

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!user?.id) {
      setError('No hay usuario en sesión')
      return
    }
    try {
      setSaving(true)
      const payload = {
        name: form.name.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      }
      const updated = await updateUser(user.id, payload, token)
      updateSessionUser({
        name: updated.name,
        lastName: updated.lastName,
        email: updated.email,
        phone: updated.phone,
        roleId: updated.roleId ?? updated.role_id ?? updated.role_id_pk ?? form.roleId,
        createdAt: updated.createdAt || updated.created_at || user?.createdAt || user?.created_at,
      })
    } catch (err) {
      setError(err.message || 'No se pudo guardar el perfil')
    } finally {
      setSaving(false)
    }
  }

  const roleLabel = useMemo(() => {
    const roleVal = form.roleId?.toString() || ''
    if (roleVal === '1' || (user?.roleName || '').toLowerCase() === 'admin') return 'Admin'
    return 'User'
  }, [form.roleId, user?.roleName])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="w-full bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 shadow-sm flex items-center justify-center">
              <span className="text-white text-sm font-semibold">H</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">Helpia · Sistema de tickets</span>
              <span className="text-xs text-slate-500">Perfil de usuario</span>
            </div>
          </div>

          <Button variant="ghost" onClick={() => navigate('/tickets')} className="px-4 py-2">
            Volver
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-10">
            <div className="flex flex-col items-center gap-3">
              <AvatarInitials
                name={form.name}
                lastName={form.lastName}
                email={form.email}
                size={96}
                className="text-3xl"
              />
              <div className="text-center">
                <h2 className="text-xl font-semibold text-slate-900">Perfil de Usuario</h2>
                <p className="text-sm text-slate-500">
                  {form.name} {form.lastName}
                </p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="mt-8 space-y-6">
              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Nombre" name="name" value={form.name} onChange={onChange} />
                <Input label="Apellidos" name="lastName" value={form.lastName} onChange={onChange} />
                <Input label="Email" name="email" type="email" value={form.email} onChange={onChange} />
                <Input label="Telefono" name="phone" value={form.phone} onChange={onChange} />
                <Input label="Rol" name="role" value={roleLabel} disabled />
                <Input
                  label="Fecha de registro"
                  name="createdAt"
                  value={form.createdAt}
                  onChange={onChange}
                  disabled
                />
              </div>

              <div className="h-px bg-slate-200" />

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 border border-slate-200 text-slate-700"
                  onClick={() => navigate('/tickets')}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
