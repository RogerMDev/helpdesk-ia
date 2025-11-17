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

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const validate = () => {
    if (!token) return 'Enlace inválido o caducado. Solicita uno nuevo.'
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.'
    if (password !== confirm) return 'Las contraseñas no coinciden.'
    return ''
  }

  async function onSubmit(e) {
    e.preventDefault()
    const v = validate()
    if (v) return setError(v)
    setError(''); setLoading(true)
    try {
      await resetPassword({ token, password }) // POST al backend
      navigate('/login?reset=1')
    } catch (err) {
      setError(err?.message || 'No se pudo restablecer la contraseña.')
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
          <h1 className="text-2xl font-semibold tracking-tight">Restablecer contraseña</h1>
          <p className="text-sm text-slate-600">Introduce tu nueva contraseña.</p>
        </div>

        {error && (
          <div className="mt-4">
            <Alert type="error">{error}</Alert>
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-8 grid grid-cols-1 gap-4">
          <Input
            label="Nueva contraseña"
            name="password"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            label="Confirmar contraseña"
            name="confirm"
            type="password"
            placeholder="••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          <div className="flex gap-3 mt-2">
            <Button variant="ghost" type="button" className="flex-1" onClick={() => navigate('/login')}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Guardando…' : 'Cambiar contraseña'}
            </Button>
          </div>
        </form>

        <p className="text-center text-sm text-slate-600 mt-6">
          ¿No recibiste el correo?{' '}
          <Link className="text-blue-700 hover:underline font-semibold" to="/forgot-password">
            Solicitar de nuevo
          </Link>
        </p>
      </div>
    </div>
  )
}
