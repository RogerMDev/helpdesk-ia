import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import logo_helpdesk from '../../assets/logo_helpdesk.png'
import { useAuth } from '../../context/AuthContext.jsx'
import Alert from '../../components/Alert.jsx'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')

  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated, user, isReady } = useAuth()

  useEffect(() => {
    const qs = new URLSearchParams(location.search)
    if (qs.get('registered') === '1') setOk('Cuenta creada. Ya puedes iniciar sesión.')
    if (qs.get('reset') === '1' || qs.get('changed') === '1') setOk('Contraseña cambiada correctamente.')
  }, [location.search])

  useEffect(() => {
    if (!isReady) return
    if (isAuthenticated) {
      const roleId =
        user?.roleId ??
        user?.user_roles_id_fk ??
        user?.user_role_id_pk ??
        user?.role ??
        user?.user_role
      const isAdmin = String(roleId) === '1' || user?.role === 'admin'
      navigate(isAdmin ? '/admin' : '/tickets', { replace: true })
    }
  }, [isAuthenticated, user, isReady, navigate])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setOk('')
    setLoading(true)
    try {
      if (!email || !password) throw new Error('Rellena todos los campos')
      const data = await login(email, password)
      const roleId =
        data?.user?.roleId ??
        data?.user?.user_roles_id_fk ??
        data?.user?.user_role_id_pk ??
        data?.user?.role ??
        data?.user?.user_role
      const isAdmin = String(roleId) === '1' || data?.user?.role === 'admin'
      const from = location.state?.from || (isAdmin ? '/admin' : '/tickets')
      navigate(from, { replace: true })
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

        {ok && (
          <div className="mt-4">
            <Alert type="success">{ok}</Alert>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 mt-4" role="alert" aria-live="polite">
            {error}
          </p>
        )}

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
              ¿Cambiar contraseña?
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
