import { useMemo, useState } from 'react'
import { FileText, Save, Upload } from 'lucide-react'
import FilePreview from '../FilePreview'
import { expenseCategories } from './expenseUtils'

function getInitialForm(defaultMovement = 'gasto') {
  const isSale = defaultMovement === 'venta'
  return {
    movimiento: defaultMovement,
    tipoCompra: isSale ? 'Venta de animal' : '',
    precio: '',
    fecha: '',
    animalId: 'general',
    categoria: isSale ? 'Venta de animal' : 'Alimentación',
    descripcion: '',
    comprobante: '',
  }
}

const today = new Date().toISOString().slice(0, 10)

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function ExpenseForm({ animals, onSubmit, defaultMovement = 'gasto', lockMovement = false }) {
  const [form, setForm] = useState(() => getInitialForm(defaultMovement))
  const [receiptName, setReceiptName] = useState('')
  const isSale = form.movimiento === 'venta'

  const canSubmit = useMemo(() => {
    const hasAnimal = !isSale || form.animalId !== 'general'
    const hasType = isSale || form.tipoCompra.trim()
    const validDate = form.fecha && form.fecha <= today
    return Boolean(hasAnimal && hasType && Number(form.precio) > 0 && validDate && form.categoria && form.descripcion.trim().length >= 5)
  }, [form, isSale])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => {
      const next = { ...current, [name]: value }
      if (name === 'movimiento' && value === 'venta') {
        next.tipoCompra = 'Venta de animal'
        next.categoria = 'Venta de animal'
      }
      if (name === 'movimiento' && value === 'gasto') {
        next.tipoCompra = ''
        next.categoria = 'Alimentación'
      }
      return next
    })
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
      esVenta: isSale,
      tipoCompra: isSale ? 'Venta de animal' : form.tipoCompra,
      categoria: isSale ? 'Venta de animal' : form.categoria,
      animalId: form.animalId === 'general' ? null : Number(form.animalId),
      animalIdentificador: animal?.identificador ?? 'Rancho general',
    })
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <section className="grid gap-5 rounded-2xl border border-[#98a287]/18 bg-white p-5 shadow-[0_12px_28px_rgba(29,29,27,0.07)] lg:grid-cols-2">
        {!lockMovement ? (
          <label className="block lg:col-span-2">
            <span className="text-sm font-bold text-[#1d1d1b]">Tipo de movimiento</span>
            <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="movimiento" onChange={updateField} value={form.movimiento}>
              <option value="gasto">Registrar gasto</option>
              <option value="venta">Registrar venta de animal</option>
            </select>
          </label>
        ) : null}

        <label className="block">
          <span className="text-sm font-bold text-[#1d1d1b]">{isSale ? 'Tipo de ingreso' : 'Tipo de compra'}</span>
          <input className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" disabled={isSale} name="tipoCompra" onChange={updateField} placeholder="Vacuna, Forraje, Traslado..." value={isSale ? 'Venta de animal' : form.tipoCompra} />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-[#1d1d1b]">{isSale ? 'Monto de venta' : 'Precio de compra'}</span>
          <input className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" inputMode="decimal" min="0" name="precio" onChange={updateField} placeholder="1250" type="number" value={form.precio} />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-[#1d1d1b]">Fecha del gasto</span>
          <input className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" max={today} name="fecha" onChange={updateField} type="date" value={form.fecha} />
          {form.fecha > today ? <p className="mt-2 text-xs font-semibold text-[#D32F2F]">La fecha no puede ser futura.</p> : null}
        </label>

        <label className="block">
          <span className="text-sm font-bold text-[#1d1d1b]">Animal relacionado</span>
          <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="animalId" onChange={updateField} value={form.animalId}>
            <option value="general">{isSale ? 'Selecciona animal vendido' : 'Rancho general'}</option>
            {animals.filter((animal) => !isSale || animal.estado === 'Activo').map((animal) => (
              <option key={animal.id} value={animal.id}>
                {animal.identificador} - {animal.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="block lg:col-span-2">
          <span className="text-sm font-bold text-[#1d1d1b]">{isSale ? 'Categoría del ingreso' : 'Categoría del gasto'}</span>
          <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" disabled={isSale} name="categoria" onChange={updateField} value={form.categoria}>
            {(isSale ? ['Venta de animal'] : expenseCategories).map((category) => (
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
          {form.descripcion && form.descripcion.trim().length < 5 ? <p className="mt-2 text-xs font-semibold text-[#D32F2F]">Agrega una descripción de al menos 5 caracteres.</p> : null}
        </label>

        <div className="mt-5 rounded-2xl border border-dashed border-[#07612d]/25 bg-[#F4F4F4] p-4">
          <span className="text-sm font-bold text-[#1d1d1b]">Comprobante opcional</span>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex min-h-11 min-w-0 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#1d1d1b]/70 sm:flex-1">
              <FileText size={18} className="text-[#07612d]" />
              <span className="min-w-0 break-words">{receiptName || 'Sin comprobante cargado'}</span>
            </div>
            <label className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#07612d] px-4 text-sm font-bold text-white sm:w-auto">
              <Upload size={18} /> Subir comprobante
              <input accept="image/*,application/pdf,.pdf" className="sr-only" onChange={handleReceipt} type="file" />
            </label>
          </div>
          <FilePreview file={form.comprobante} title="Previsualización del comprobante" />
        </div>
      </section>

      <button className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-[#07612d] px-5 text-base font-bold text-white shadow-[0_10px_22px_rgba(7,97,45,0.2)] disabled:cursor-not-allowed disabled:bg-[#98a287]" disabled={!canSubmit} type="submit">
        <Save size={19} /> {isSale ? 'Registrar Venta' : 'Registrar Gasto'}
      </button>
    </form>
  )
}

export default ExpenseForm
