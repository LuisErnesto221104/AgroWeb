import { useMemo, useState } from 'react'
import { FileText, Save, Upload } from 'lucide-react'
import { expenseCategories } from './expenseUtils'

const initialForm = {
  tipoCompra: '',
  precio: '',
  fecha: '',
  animalId: 'general',
  categoria: 'Alimentación',
  descripcion: '',
  comprobante: '',
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function ExpenseForm({ animals, onSubmit }) {
  const [form, setForm] = useState(initialForm)
  const [receiptName, setReceiptName] = useState('')

  const canSubmit = useMemo(() => {
    return Boolean(form.tipoCompra.trim() && Number(form.precio) > 0 && form.fecha && form.categoria && form.descripcion.trim())
  }, [form])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleReceipt(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const dataUrl = await fileToDataUrl(file)
    setReceiptName(file.name)
    setForm((current) => ({
      ...current,
      comprobante: {
        name: file.name,
        dataUrl,
      },
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!canSubmit) return

    const animal = animals.find((item) => item.id === Number(form.animalId))
    onSubmit({
      ...form,
      id: Date.now(),
      precio: Number(form.precio),
      animalId: form.animalId === 'general' ? null : Number(form.animalId),
      animalIdentificador: animal?.identificador ?? 'Rancho general',
    })
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <section className="grid gap-5 rounded-2xl border border-[#98a287]/18 bg-white p-5 shadow-[0_12px_28px_rgba(29,29,27,0.07)] lg:grid-cols-2">
        <label className="block">
          <span className="text-sm font-bold text-[#1d1d1b]">Tipo de compra</span>
          <input className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="tipoCompra" onChange={updateField} placeholder="Vacuna, Forraje, Traslado..." value={form.tipoCompra} />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-[#1d1d1b]">Precio de compra</span>
          <input className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" inputMode="decimal" min="0" name="precio" onChange={updateField} placeholder="1250" type="number" value={form.precio} />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-[#1d1d1b]">Fecha del gasto</span>
          <input className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="fecha" onChange={updateField} type="date" value={form.fecha} />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-[#1d1d1b]">Animal relacionado</span>
          <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="animalId" onChange={updateField} value={form.animalId}>
            <option value="general">Rancho general</option>
            {animals.map((animal) => (
              <option key={animal.id} value={animal.id}>
                {animal.identificador} - {animal.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="block lg:col-span-2">
          <span className="text-sm font-bold text-[#1d1d1b]">Categoría del gasto</span>
          <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="categoria" onChange={updateField} value={form.categoria}>
            {expenseCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="rounded-2xl border border-[#98a287]/18 bg-white p-5 shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
        <label className="block">
          <span className="text-sm font-bold text-[#1d1d1b]">Descripción</span>
          <textarea className="mt-2 min-h-28 w-full resize-y rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] p-4 text-sm outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="descripcion" onChange={updateField} value={form.descripcion} />
        </label>

        <div className="mt-5 rounded-2xl border border-dashed border-[#07612d]/25 bg-[#F4F4F4] p-4">
          <span className="text-sm font-bold text-[#1d1d1b]">Comprobante opcional</span>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex min-h-11 min-w-0 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#1d1d1b]/70 sm:flex-1">
              <FileText size={18} className="text-[#07612d]" />
              <span className="truncate">{receiptName || 'Sin comprobante cargado'}</span>
            </div>
            <label className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#07612d] px-4 text-sm font-bold text-white sm:w-auto">
              <Upload size={18} /> Subir comprobante
              <input accept="image/*,application/pdf,.pdf" className="sr-only" onChange={handleReceipt} type="file" />
            </label>
          </div>
        </div>
      </section>

      <button className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-[#07612d] px-5 text-base font-bold text-white shadow-[0_10px_22px_rgba(7,97,45,0.2)] disabled:cursor-not-allowed disabled:bg-[#98a287]" disabled={!canSubmit} type="submit">
        <Save size={19} /> Registrar Gasto
      </button>
    </form>
  )
}

export default ExpenseForm
