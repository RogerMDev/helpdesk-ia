import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import { useAuth } from '../../context/AuthContext.jsx'

function formatDate(value) {
  if (!value) return '01/01/2025'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('es-ES')
}

export default function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const initialData = useMemo(
    () => ({
      name: user?.name || 'Roger',
      lastName: user?.lastName || 'Martinez',
      email: user?.email || 'roger.martinez@empresa.com',
      phone: user?.phone || '+34 600 123 456',
      department: user?.department || 'Tecnologia',
      role: user?.role || 'Usuario',
      createdAt: formatDate(user?.createdAt || user?.created_at),
    }),
    [user]
  )

  const [form, setForm] = useState(initialData)

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = (e) => {
    e.preventDefault()
    // Guardado pendiente de API real
  }

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
              <div className="h-24 w-24 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                <span className="text-4xl">👤</span>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-semibold text-slate-900">Perfil de Usuario</h2>
                <p className="text-sm text-slate-500">
                  {form.name} {form.lastName}
                </p>
              </div>
              <Button type="button" variant="ghost" className="px-4 py-2">
                Cambiar foto
              </Button>
            </div>

            <form onSubmit={onSubmit} className="mt-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Nombre" name="name" value={form.name} onChange={onChange} />
                <Input label="Apellidos" name="lastName" value={form.lastName} onChange={onChange} />
                <Input label="Email" name="email" type="email" value={form.email} onChange={onChange} />
                <Input label="Telefono" name="phone" value={form.phone} onChange={onChange} />
                <Input label="Departamento" name="department" value={form.department} onChange={onChange} />
                <Input label="Rol" name="role" value={form.role} onChange={onChange} />
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
                <Button type="submit" className="flex-1">
                  Guardar cambios
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
