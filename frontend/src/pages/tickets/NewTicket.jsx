import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'

const PRIORITIES = ['Baja', 'Media', 'Alta']

export default function NewTicket() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    priority: '',
    title: '',
    description: '',
    file: null,
  })

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onFileChange = (e) => {
    const file = e.target.files?.[0] || null
    setForm((prev) => ({ ...prev, file }))
  }

  const clearFile = () => {
    setForm((prev) => ({ ...prev, file: null }))
  }

  const onSubmit = (e) => {
    e.preventDefault()
    // TODO: integrar con API para crear ticket
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="w-full bg-white border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 shadow-sm flex items-center justify-center">
              <span className="text-white text-sm font-semibold">H</span>
            </div>
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
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-slate-900">Crear Nuevo Ticket</h1>
              <p className="text-sm text-slate-600">Completa la informacion del ticket</p>
              <p className="text-xs text-slate-500">La categoria y el departamento se asignan automaticamente.</p>
            </div>

            <form onSubmit={onSubmit} className="mt-8 space-y-6">
              <Input
                label="Prioridad"
                name="priority"
                as="select"
                value={form.priority}
                onChange={onChange}
                placeholder="Seleccionar prioridad"
              >
                <option value="">Seleccionar prioridad</option>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Input>

              <Input
                label="Titulo del ticket"
                name="title"
                placeholder="Breve descripcion del problema"
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
                <Button type="submit" className="flex-1">
                  Crear Ticket
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
