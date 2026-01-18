import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import { createTicket } from '../../api/tickets.js'
import { fetchAdvice } from '../../api/advice.js'
import { uploadAttachment } from '../../api/attachments.js'
import { useAuth } from '../../context/AuthContext.jsx'
import logo_helpdesk from '../../assets/logo_helpdesk.png'
import muneco_ticket from '../../assets/muneco.ticket.png'

const CATEGORIES = ['Red', 'Accesos', 'Licencias', 'Hardware', 'Software', 'Otro']

export default function NewTicket() {
  const navigate = useNavigate()
  const { user, token } = useAuth()
  const [form, setForm] = useState({
    category: '',
    title: '',
    description: '',
    file: null,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [adviceText, setAdviceText] = useState('')
  const [adviceOpen, setAdviceOpen] = useState(false)
  const [pendingPayload, setPendingPayload] = useState(null)

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (name === 'description') {
      setAdviceText('')
      setAdviceOpen(false)
      setPendingPayload(null)
    }
  }

  const onFileChange = (e) => {
    const file = e.target.files?.[0] || null
    setForm((prev) => ({ ...prev, file }))
  }

  const clearFile = () => {
    setForm((prev) => ({ ...prev, file: null }))
  }

  const buildPayload = () => ({
    createdById: user?.id,
    assigneeId: null,
    statusId: 1,
    title: form.title.trim(),
    description: form.description,
    topic: form.category,
  })

  const createTicketFlow = async (payload) => {
    const created = await createTicket(payload, token)
    if (form.file) {
      await uploadAttachment(created?.id ?? created?.ticket_id_pk, form.file, token)
    }
    navigate(`/tickets/${created?.id ?? created?.ticket_id_pk ?? ''}`)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.title.trim() || !form.category) {
      setError('Completa titulo y tipologia para crear el ticket.')
      return
    }
    if (!form.description.trim()) {
      setError('Completa la descripcion para que la IA pueda ayudarte.')
      return
    }
    setLoading(true)
    const payload = buildPayload()
    try {
      const response = await fetchAdvice(form.description, token)
      const text = response?.advice?.trim()
      setAdviceText(text || 'No se pudo generar una sugerencia automatica.')
      setPendingPayload(payload)
      setAdviceOpen(true)
      return
    } catch (err) {
      setError(err.message || 'No se pudo consultar el consejo automatico.')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="w-full bg-white border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={logo_helpdesk}
              alt="Helpia"
              className="h-9 w-9 rounded-xl shadow-sm object-contain"
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">Helpia · Sistema de tickets</span>
              <span className="text-xs text-slate-500">Crear nuevo ticket</span>
            </div>
          </div>

          <Button variant="ghost" onClick={() => navigate('/tickets')} className="px-4 py-2">
            Volver
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-10">
            <div className="relative">
              <div className="space-y-1 max-w-2xl pr-32 sm:pr-44 pb-4">
                <h1 className="text-2xl font-semibold text-slate-900">Crear Nuevo Ticket</h1>
                <p className="text-sm text-slate-600">Completa la informacion del ticket</p>
              </div>
              <img
                src={muneco_ticket}
                alt="Muneco tickets"
                className="absolute right-10 top-0 h-32 w-32 sm:h-40 sm:w-40 object-contain"
              />
            </div>

            <form onSubmit={onSubmit} className="mt-0 space-y-6">
              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Tipologia"
                  name="category"
                  as="select"
                  required
                  value={form.category}
                  onChange={onChange}
                  placeholder="Seleccionar tipologia"
                >
                  <option value="">Seleccionar tipologia</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Input>

              </div>

              <Input
                label="Titulo del ticket"
                name="title"
                placeholder="Breve descripcion del problema"
                required
                value={form.title}
                onChange={onChange}
              />

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">Descripcion detallada</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  placeholder="Describe el problema con el mayor detalle posible..."
                  className="min-h-[140px] w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">Adjuntar archivos</label>
                <label className="block rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center cursor-pointer hover:border-blue-200 hover:bg-blue-50 transition">
                  <input
                    type="file"
                    className="hidden"
                    accept=".png,.jpg,.jpeg,.pdf"
                    onChange={onFileChange}
                    onClick={(e) => {
                      e.target.value = null
                    }}
                  />
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    <div className="h-12 w-12 rounded-full border border-slate-200 flex items-center justify-center text-xl">
                      ↑
                    </div>
                    <div className="text-sm">
                      <p>Arrastra archivos aqui</p>
                      <p>o haz clic para seleccionar</p>
                    </div>
                    <p className="text-xs text-slate-400">PNG, JPG, PDF (max. 10MB)</p>
                  </div>
                </label>
                {form.file && (
                  <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                    <span className="truncate">{form.file.name}</span>
                    <button
                      type="button"
                      className="text-rose-600 text-xs font-semibold hover:underline"
                      onClick={clearFile}
                    >
                      Quitar
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 border border-slate-200 text-slate-700"
                  onClick={() => navigate('/tickets')}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? 'Creando...' : 'Crear Ticket'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {adviceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">Consejo rapido</h2>
            <p className="mt-3 whitespace-pre-line text-sm text-slate-700">{adviceText}</p>
            <p className="mt-4 text-sm text-slate-600">
              Quieres seguir abriendo el ticket?
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="ghost"
                className="flex-1 border border-slate-200 text-slate-700"
                onClick={() => {
                  setAdviceOpen(false)
                  setAdviceText('')
                  setPendingPayload(null)
                }}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={async () => {
                  if (!pendingPayload) return
                  setAdviceOpen(false)
                  setLoading(true)
                  try {
                    await createTicketFlow(pendingPayload)
                  } catch (err) {
                    setError(err.message || 'No se pudo crear el ticket')
                  } finally {
                    setLoading(false)
                    setAdviceText('')
                    setPendingPayload(null)
                  }
                }}
              >
                Seguir y crear
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
