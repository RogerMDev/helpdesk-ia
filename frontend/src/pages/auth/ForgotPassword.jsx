import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo_helpdesk from '../../assets/logo_helpdesk.png'
import { requestPasswordReset } from '../../lib/api.js'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setDone(false)
    try {
      if (!email) throw new Error('Introduce tu correo')
      setLoading(true)
      await requestPasswordReset(email) // ajusta la ruta en api.js si tu backend usa otra
      setDone(true)
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
          <img
            src={logo_helpdesk}
            alt="Helpdesk IT"
            className="mx-auto h-[110px] w-[110px] rounded-xl shadow-sm object-contain" 
            />
          <h1 className="text-2xl font-semibold tracking-tight">¿Has olvidado tu contraseña?</h1>
          <p className="text-sm text-slate-600">
            Introduce tu correo y te enviaremos un enlace para cambiarla.
          </p>
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
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="usuario@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}

          {done && (
            <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
              Si el correo existe en nuestro sistema, te hemos enviado un enlace para restablecer tu contraseña.
              Revisa también tu carpeta de spam.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60"
          >
            {loading ? 'Enviando…' : 'Enviar enlace'}
          </button>

          <div className="text-center">
            <Link to="/login" className="text-sm text-blue-700 hover:underline">
              Volver al inicio de sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
