import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import logo_helpdesk from '../../assets/logo_helpdesk.png'
import { loginRequest } from '../../lib/api.js'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (!email || !password) throw new Error('Rellena todos los campos')

      const data = await loginRequest(email, password)

      // ✅ Navegamos solo si el backend confirma login (ej. devuelve token)
      if (data?.token) {
        localStorage.setItem('token', data.token)
        navigate('/tickets')
      } else {
        throw new Error('Credenciales incorrectas')
      }
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión')
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
          <h1 className="text-2xl font-semibold tracking-tight">¡Bienvenido a Helpia!</h1>
        </div>

        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="usuario@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!error}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!error}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert" aria-live="polite">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60"
          >
            {loading ? 'Entrando…' : 'Iniciar Sesión'}
          </button>

          <div className="flex flex-col items-center gap-1 text-center">
            <Link className="text-sm text-blue-700 hover:underline" to="/register">
              ¿No tienes cuenta? <span className="font-semibold">¡Regístrate!</span>
            </Link>
            <Link className="text-sm text-blue-700 hover:underline" to="/forgot-password">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
