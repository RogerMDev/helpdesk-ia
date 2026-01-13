import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import Alert from '../../components/Alert.jsx'
import logo_helpdesk from '../../assets/logo_helpdesk.png'
import { changePassword } from '../../lib/api.js'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const validate = () => {
    if (!email || !email.includes('@')) return 'Correo invalido.'
    if (!currentPassword) return 'La contrasena actual es obligatoria.'
    if (newPassword.length < 8) return 'La contrasena nueva debe tener al menos 8 caracteres.'
    if (newPassword !== confirm) return 'Las contrasenas no coinciden.'
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
      await changePassword({ email, currentPassword, newPassword })
      setDone(true)
      setTimeout(() => navigate('/login?changed=1'), 1200)
    } catch (err) {
      setError(err?.message || 'No se pudo cambiar la contrasena.')
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
          <h1 className="text-2xl font-semibold tracking-tight">Cambiar contrasena</h1>
          <p className="text-sm text-slate-600">
            Escribe tu correo, tu contrasena actual y la nueva contrasena.
          </p>
        </div>

        {error && (
          <div className="mt-4">
            <Alert type="error">{error}</Alert>
          </div>
        )}
        {done && (
          <div className="mt-4">
            <Alert type="success">Contrasena cambiada correctamente.</Alert>
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <Input
            label="Correo"
            name="email"
            type="email"
            placeholder="tu-correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading || done}
          />
          <Input
            label="Contrasena actual"
            name="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            disabled={loading || done}
          />
          <Input
            label="Nueva contrasena"
            name="newPassword"
            type="password"
            placeholder="Minimo 8 caracteres"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={loading || done}
          />
          <Input
            label="Confirmar nueva contrasena"
            name="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            disabled={loading || done}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 pt-2">
            <Button
              variant="ghost"
              type="button"
              className="flex-1"
              onClick={() => navigate('/login')}
              disabled={loading}
            >
              Volver al login
            </Button>
            <Button type="submit" className="flex-1" disabled={loading || done}>
              {loading ? 'Guardando...' : 'Cambiar contrasena'}
            </Button>
          </div>

          <div className="text-center">
            <Link to="/login" className="text-sm text-blue-700 hover:underline">
              Volver al inicio de sesion
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
