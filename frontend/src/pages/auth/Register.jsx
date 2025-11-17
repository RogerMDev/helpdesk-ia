import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// ⬇️ Rutas de imports corregidas (desde /src/pages/auth → subir 2 niveles)
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Select from '../../components/ui/Select.jsx'
import Alert from '../../components/Alert.jsx'

import { createUser, getRoles } from '../../api/users'

export default function Register() {
  const navigate = useNavigate()

  const [roles, setRoles] = useState([{ value: '', label: 'Seleccionar rol' }])
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    roleId: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        const data = await getRoles() // adapta al formato real
        const opts = [{ value: '', label: 'Seleccionar rol' }].concat(
          (data ?? []).map((r) => ({
            value: r.user_roles_id_pk ?? r.id,
            label: r.name,
          }))
        )
        setRoles(opts)
      } catch {
        // Si no hay endpoint de roles, dejamos “USER” como defecto (ajusta ID real)
        setRoles([{ value: 3, label: 'USER' }])
      }
    })()
  }, [])

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const validate = () => {
    if (!form.name.trim()) return 'El nombre es obligatorio.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Email no válido.'
    if (form.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.'
    if (form.password !== form.confirm) return 'Las contraseñas no coinciden.'
    if (!form.roleId) return 'Selecciona un rol.'
    return ''
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const v = validate()
    if (v) return setError(v)
    setError('')
    setLoading(true)
    try {
      await createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        roleId: Number(form.roleId),
      })
      navigate('/login?registered=1')
    } catch (err) {
      setError(err?.message || 'No se pudo crear la cuenta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-md ring-1 ring-black/5 p-6 sm:p-10">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Crear cuenta</h1>
          <p className="text-sm text-slate-600">Completa los siguientes campos</p>
        </div>

        {error && (
          <div className="mt-4">
            <Alert type="error">{error}</Alert>
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-8 grid grid-cols-1 gap-4">
          <Input
            label="Nombre"
            name="name"
            placeholder="Tu nombre"
            value={form.name}
            onChange={onChange}
            required
          />

          {/* UI opcional (no se envía) */}
          <Input
            label="Apellidos (opcional)"
            name="lastName"
            placeholder="Apellidos"
            onChange={onChange}
          />

          <Input
            label="Correo electrónico"
            name="email"
            type="email"
            placeholder="usuario@ejemplo.com"
            value={form.email}
            onChange={onChange}
            required
          />

          {/* UI opcional (no se envía) */}
          <Input label="Teléfono (opcional)" name="phone" placeholder="+34 600 000 000" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contraseña"
              name="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={onChange}
              required
            />
            <Input
              label="Confirmar contraseña"
              name="confirm"
              type="password"
              placeholder="••••••"
              value={form.confirm}
              onChange={onChange}
              required
            />
          </div>

          <Select
            label="Rol"
            value={form.roleId}
            onChange={onChange}
            name="roleId"
            options={roles}
            required
          />

          {/* UI opcional (no se envía) */}
          <Select
            label="Departamento (opcional)"
            value=""
            onChange={() => {}}
            options={[
              { value: '', label: 'Seleccionar departamento' },
              { value: 'it', label: 'IT' },
              { value: 'hr', label: 'RRHH' },
            ]}
          />

          <div className="flex gap-3 mt-2">
            <Button variant="ghost" type="button" className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Creando…' : 'Registrarse'}
            </Button>
          </div>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link className="text-blue-700 hover:underline font-semibold" to="/login">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
