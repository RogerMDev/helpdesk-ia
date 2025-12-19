import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Alert from '../../components/Alert.jsx'
import logo_helpdesk from '../../assets/logo_helpdesk.png'
import { resetPassword } from '../../lib/api.js'

export default function ResetPassword() {
  const navigate = useNavigate()
  const { search } = useLocation()
  const token = new URLSearchParams(search).get('token')
  const emailFromQuery = new URLSearchParams(search).get('email') || ''

  const [email, setEmail] = useState(emailFromQuery)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const validate = () => {
    if (!token) return 'Enlace invalido o caducado. Solicita uno nuevo.'
    if (!email) return 'Falta el correo. Copia el enlace completo o escribe tu correo.'
    if (!email.includes('@')) return 'Correo invalido.'
    if (password.length < 8) return 'La contrasena debe tener al menos 8 caracteres.'
    if (password !== confirm) return 'Las contrasenas no coinciden.'
    return ''
  }

  async function onSubmit(e) {
    e.preventDefault()
    const v = validate()
    if (v) {
      setError(v)
      return
    }
    setError('')
    setLoading(true)
    try {
      await resetPassword({ token, password })
      setDone(true)
      setTimeout(() => navigate('/login?reset=1'), 1200)
    } catch (err) {
      setError(err?.message || 'No se pudo restablecer la contrasena.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 py-8">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-md ring-1 ring-black/5 p-6 sm:p-10">
        <div className="text-center space-y-4">
          <img
            src={logo_helpdesk}
            alt="Helpdesk IT"
            className="mx-auto h-[110px] w-[110px] rounded-xl shadow-sm object-contain"
          />
          <h1 className="text-2xl font-semibold tracking-tight">Restablecer contrasena</h1>
          <p className="text-sm text-slate-600">Define una nueva contrasena para tu cuenta.</p>
        </div>

        {error && (
          <div className="mt-4">
            <Alert type="error">{error}</Alert>
          </div>
        )}
        {done && (
          <div className="mt-4">
            <Alert type="success">Listo. Redirigiendo al inicio de sesion...</Alert>
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <Input
            label="Correo"
            name="email"
            type="email"
            placeholder="tu-correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={!!emailFromQuery || loading || done}
          />
          <Input
            label="Nueva contrasena"
            name="password"
            type="password"
            placeholder="Minimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading || done}
          />
          <Input
            label="Confirmar contrasena"
            name="confirm"
            type="password"
            placeholder="Repite la contrasena"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            disabled={loading || done}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 pt-2">
            <Button variant="ghost" type="button" className="flex-1" onClick={() => navigate('/login')} disabled={loading}>
              Volver al login
            </Button>
            <Button type="submit" className="flex-1" disabled={loading || done}>
              {loading ? 'Guardando...' : 'Cambiar contrasena'}
            </Button>
          </div>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6">
          No recibiste el correo?{' '}
          <Link className="text-blue-700 hover:underline font-semibold" to="/forgot-password">
            Solicitar un nuevo enlace
          </Link>
        </p>
      </div>
    </div>
  )
}
