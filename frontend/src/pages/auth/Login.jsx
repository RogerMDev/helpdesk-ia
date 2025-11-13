import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo_helpdesk from "../../assets/logo_helpdesk.png"
import { loginRequest } from "../../lib/api.js"

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
      if (data?.token) localStorage.setItem('token', data.token)
      navigate('/tickets') // cámbialo cuando tengas la página
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 py-8">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-md ring-1 ring-black/5 p-6 sm:p-10">
        <div className="text-center space-y-4">
          <img src={logo_helpdesk} alt="Helpdesk IT" className="mx-auto h-[110px] w-[110px] rounded-xl shadow-sm object-contain" />
          <h1 className="text-2xl font-semibold tracking-tight">Sistema de Tickets</h1>
        </div>

        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Nombre de usuario
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="usuario@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60"
          >
            {loading ? 'Entrando…' : 'Iniciar Sesión'}
          </button>

          <div className="text-center">
            <a className="text-sm text-blue-700 hover:underline" href="#recuperar">
              ¿Olvidé mi contraseña?
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
