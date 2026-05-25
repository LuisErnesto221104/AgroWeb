import { useMemo, useState } from 'react'
import { Camera, FileText, ImagePlus, Save, Upload } from 'lucide-react'

const identificationDocuments = ['INE', 'Pasaporte', 'Licencia de conducir', 'Cédula profesional', 'Cartilla militar', 'Documento interno']

const mexicanStates = [
  'Aguascalientes',
  'Baja California',
  'Baja California Sur',
  'Campeche',
  'Chiapas',
  'Chihuahua',
  'Ciudad de México',
  'Coahuila',
  'Colima',
  'Durango',
  'Estado de México',
  'Guanajuato',
  'Guerrero',
  'Hidalgo',
  'Jalisco',
  'Michoacán',
  'Morelos',
  'Nayarit',
  'Nuevo León',
  'Oaxaca',
  'Puebla',
  'Querétaro',
  'Quintana Roo',
  'San Luis Potosí',
  'Sinaloa',
  'Sonora',
  'Tabasco',
  'Tamaulipas',
  'Tlaxcala',
  'Veracruz',
  'Yucatán',
  'Zacatecas',
]

function getStatusOptions(currentStatus = 'Activo') {
  if (currentStatus === 'Activo') {
    return [
      { value: 'Activo', label: 'Activo' },
      { value: 'Vendido', label: 'Vendido' },
      { value: 'Fallecido', label: 'Muerto / Fallecido' },
    ]
  }

  if (currentStatus === 'Vendido') return [{ value: 'Vendido', label: 'Vendido' }]
  if (currentStatus === 'Fallecido') return [{ value: 'Fallecido', label: 'Muerto / Fallecido' }]

  return [{ value: currentStatus, label: currentStatus }]
}

const emptyPreviousOwner = {
  nombre: '',
  documentoIdentificacion: 'INE',
  rfc: '',
  rancho: '',
  ciudad: '',
  estado: 'Jalisco',
  documentoPdf: null,
}

const emptyAnimal = {
  identificador: '',
  nombre: '',
  especie: 'Bovino',
  raza: '',
  peso: '',
  duenosAnteriores: emptyPreviousOwner,
  fechaIngreso: '',
  estado: 'Activo',
  fotografia: '',
  ubicacion: '',
  observaciones: '',
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function normalizeAnimal(animal) {
  if (!animal) return emptyAnimal

  const previousOwner =
    typeof animal.duenosAnteriores === 'string'
      ? { ...emptyPreviousOwner, nombre: animal.duenosAnteriores }
      : { ...emptyPreviousOwner, ...animal.duenosAnteriores }

  return {
    ...emptyAnimal,
    ...animal,
    duenosAnteriores: previousOwner,
  }
}

function AnimalForm({ initialAnimal, onSubmit, submitLabel = 'Guardar animal' }) {
  const isNewAnimal = !initialAnimal
  const initialStatus = initialAnimal?.estado ?? 'Activo'
  const [form, setForm] = useState({ ...normalizeAnimal(initialAnimal), estado: isNewAnimal ? 'Activo' : initialStatus })
  const [preview, setPreview] = useState(initialAnimal?.fotografia ?? '')
  const [pdfName, setPdfName] = useState(form.duenosAnteriores.documentoPdf?.name ?? '')
  const statusOptions = getStatusOptions(initialStatus)

  const canSubmit = useMemo(() => {
    return Boolean(form.identificador.trim() && form.especie.trim() && form.raza.trim() && Number(form.peso) > 0 && form.fechaIngreso && form.estado && form.ubicacion.trim())
  }, [form])

  function updateField(event) {
    const { name, value } = event.target
    if (name === 'estado' && isNewAnimal) return
    setForm((current) => ({ ...current, [name]: value }))
  }

  function updatePreviousOwner(event) {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      duenosAnteriores: {
        ...current.duenosAnteriores,
        [name]: value,
      },
    }))
  }

  async function handleImage(event) {
    const file = event.target.files?.[0]
    if (!file) return

    const dataUrl = await fileToDataUrl(file)
    setPreview(dataUrl)
    setForm((current) => ({ ...current, fotografia: dataUrl }))
  }

  async function handleOwnerPdf(event) {
    const file = event.target.files?.[0]
    if (!file) return

    const dataUrl = await fileToDataUrl(file)
    setPdfName(file.name)
    setForm((current) => ({
      ...current,
      duenosAnteriores: {
        ...current.duenosAnteriores,
        documentoPdf: {
          name: file.name,
          dataUrl,
        },
      },
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!canSubmit) return
    onSubmit({ ...form, peso: Number(form.peso), arete: form.identificador })
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <section className="grid gap-5 rounded-2xl border border-[#98a287]/18 bg-white p-5 shadow-[0_12px_28px_rgba(29,29,27,0.07)] lg:grid-cols-2">
        {[
          ['identificador', 'Identificador único', 'BOV-001'],
          ['nombre', 'Nombre del animal', 'Luna'],
          ['raza', 'Raza', 'Angus'],
          ['peso', 'Peso (kg)', '450'],
          ['ubicacion', 'Ubicación', 'Corral 1'],
        ].map(([name, label, placeholder]) => (
          <label className="block" key={name}>
            <span className="text-sm font-bold text-[#1d1d1b]">{label}</span>
            <input
              className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none transition focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10"
              inputMode={name === 'peso' ? 'decimal' : undefined}
              min={name === 'peso' ? '0' : undefined}
              name={name}
              onChange={updateField}
              placeholder={placeholder}
              type={name === 'peso' ? 'number' : 'text'}
              value={form[name]}
            />
          </label>
        ))}

        <label className="block">
          <span className="text-sm font-bold text-[#1d1d1b]">Especie</span>
          <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="especie" onChange={updateField} value={form.especie}>
            {['Bovino', 'Ovino', 'Caprino', 'Equino', 'Porcino'].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-bold text-[#1d1d1b]">Estado</span>
          {isNewAnimal ? (
            <div className="mt-2 flex h-12 w-full items-center rounded-2xl border border-[#4CAF50]/25 bg-[#4CAF50]/10 px-4 text-sm font-bold text-[#2f8f36]">
              Activo
            </div>
          ) : (
            <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="estado" onChange={updateField} value={form.estado}>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
          {isNewAnimal ? <p className="mt-2 text-xs font-semibold text-[#98a287]">Todo animal nuevo se registra primero como activo.</p> : null}
          {!isNewAnimal && statusOptions.length === 1 ? <p className="mt-2 text-xs font-semibold text-[#98a287]">Este estado ya no permite cambiar a otro.</p> : null}
        </label>

        <label className="block">
          <span className="text-sm font-bold text-[#1d1d1b]">Fecha de ingreso</span>
          <input className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none transition focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="fechaIngreso" onChange={updateField} type="date" value={form.fechaIngreso} />
        </label>
      </section>

      <section className="rounded-2xl border border-[#98a287]/18 bg-white p-5 shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
        <div>
          <h2 className="text-base font-bold text-[#07612d]">Dueño anterior</h2>
          <p className="mt-1 text-sm leading-6 text-[#1d1d1b]/65">Registra la procedencia del animal y datos de identificación del propietario previo.</p>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {[
            ['nombre', 'Nombre del dueño anterior', 'Carlos Mendoza'],
            ['rfc', 'RFC', 'MECG780415K92'],
            ['rancho', 'Rancho donde es', 'Rancho La Esperanza'],
            ['ciudad', 'Ciudad', 'Tepatitlan'],
          ].map(([name, label, placeholder]) => (
            <label className="block" key={name}>
              <span className="text-sm font-bold text-[#1d1d1b]">{label}</span>
              <input
                className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none transition focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10"
                name={name}
                onChange={updatePreviousOwner}
                placeholder={placeholder}
                value={form.duenosAnteriores[name]}
              />
            </label>
          ))}

          <label className="block">
            <span className="text-sm font-bold text-[#1d1d1b]">Documento de identificación</span>
            <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="documentoIdentificacion" onChange={updatePreviousOwner} value={form.duenosAnteriores.documentoIdentificacion}>
              {identificationDocuments.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-bold text-[#1d1d1b]">Estado de la República</span>
            <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="estado" onChange={updatePreviousOwner} value={form.duenosAnteriores.estado}>
              {mexicanStates.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 rounded-2xl border border-dashed border-[#07612d]/25 bg-[#F4F4F4] p-4">
          <span className="text-sm font-bold text-[#1d1d1b]">Documento del dueño anterior en PDF</span>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex min-h-11 min-w-0 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#1d1d1b]/70">
              <FileText size={18} className="shrink-0 text-[#07612d]" />
              <span className="min-w-0 break-words">{pdfName || 'Sin PDF cargado'}</span>
            </div>
            <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#07612d] px-4 text-sm font-bold text-white">
              <Upload size={18} /> Subir PDF
              <input accept="application/pdf,.pdf" className="sr-only" onChange={handleOwnerPdf} type="file" />
            </label>
          </div>
        </div>
      </section>

      <section className="grid gap-5 rounded-2xl border border-[#98a287]/18 bg-white p-5 shadow-[0_12px_28px_rgba(29,29,27,0.07)] lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 className="text-base font-bold text-[#07612d]">Fotografía del animal</h2>
          <div className="mt-4 grid gap-3">
            <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#07612d] px-4 text-sm font-bold text-white">
              <Camera size={19} /> Tomar fotografía
              <input accept="image/*" capture="environment" className="sr-only" onChange={handleImage} type="file" />
            </label>
            <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#07612d]/25 bg-white px-4 text-sm font-bold text-[#07612d]">
              <ImagePlus size={19} /> Seleccionar imagen
              <input accept="image/*" className="sr-only" onChange={handleImage} type="file" />
            </label>
          </div>
        </div>
        <div className="flex min-h-56 items-center justify-center overflow-hidden rounded-2xl border border-[#98a287]/18 bg-[#F4F4F4] text-sm font-semibold text-[#98a287]">
          {preview ? <img alt="Vista previa del animal" className="h-56 w-full object-cover" src={preview} /> : 'Sin fotografía capturada'}
        </div>
      </section>

      <label className="block rounded-2xl border border-[#98a287]/18 bg-white p-5 shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
        <span className="text-sm font-bold text-[#1d1d1b]">Observaciones</span>
        <textarea className="mt-2 min-h-32 w-full resize-y rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] p-4 text-sm outline-none transition focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="observaciones" onChange={updateField} value={form.observaciones} />
      </label>

      <button className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-[#07612d] px-5 text-base font-bold text-white shadow-[0_10px_22px_rgba(7,97,45,0.2)] disabled:cursor-not-allowed disabled:bg-[#98a287]" disabled={!canSubmit} type="submit">
        <Save size={19} /> {submitLabel}
      </button>
    </form>
  )
}

export default AnimalForm
