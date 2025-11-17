import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Alert from '../../components/Alert.jsx'
import logo_helpdesk from '../../assets/logo_helpdesk.png'

import { createUser } from '../../api/users'

export default function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const validate = () => {
    if (!form.name.trim()) return 'El nombre es obligatorio.'
    if (!form.lastName.trim()) return 'Los apellidos son obligatorios.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Email no válido.'
    if (!form.phone.trim()) return 'El teléfono es obligatorio.'
    if (form.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.'
    if (form.password !== form.confirm) return 'Las contraseñas no coinciden.'
    return ''
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const v = validate()
    if (v) return setError(v)

    setError('')
    setLoading(true)
    try {
      // Ajusta las keys si tu backend usa otros nombres (p. ej. last_name, phoneNumber…)
      await createUser({
        name: form.name.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
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
          <img
            src={logo_helpdesk}
            alt="Helpdesk IT"
            className="mx-auto h-16 w-16 rounded-xl shadow-sm object-contain"
          />
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
          <Input
            label="Apellidos"
            name="lastName"
            placeholder="Tus apellidos"
            value={form.lastName}
            onChange={onChange}
            required
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
          <Input
            label="Teléfono"
            name="phone"
            placeholder="+34 600 000 000"
            value={form.phone}
            onChange={onChange}
            required
          />

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

          <div className="flex gap-3 mt-2">
            <Button variant="ghost" type="button" className="flex-1" onClick={() => navigate('/login')}>
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
