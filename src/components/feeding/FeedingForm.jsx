import { useMemo, useState } from 'react'
import { Save } from 'lucide-react'
import { foodNutritionProfiles, foodTypes, units } from './feedingUtils'

const initialForm = {
  target: 'animal',
  animalId: '',
  grupo: '',
  tipoAlimento: 'Forraje',
  cantidad: '',
  unidad: 'kg',
  fecha: '',
  hora: '',
  responsable: '',
  costoAproximado: '',
  nutricion: foodNutritionProfiles.Forraje,
  observaciones: '',
  estado: 'Registrado',
}

function FeedingForm({ animals, onSubmit }) {
  const [form, setForm] = useState(initialForm)

  const canSubmit = useMemo(() => {
    const hasTarget = form.target === 'grupo' ? form.grupo.trim() : form.animalId
    return Boolean(hasTarget && form.tipoAlimento && Number(form.cantidad) > 0 && form.unidad && form.fecha && form.hora && form.responsable.trim() && Number(form.costoAproximado) >= 0)
  }, [form])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => {
      if (name === 'tipoAlimento') {
        return {
          ...current,
          tipoAlimento: value,
          nutricion: foodNutritionProfiles[value],
        }
      }

      return { ...current, [name]: value }
    })
  }

  function updateNutrition(event) {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      nutricion: {
        ...current.nutricion,
        [name]: value,
      },
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!canSubmit) return

    const animal = animals.find((item) => item.id === Number(form.animalId))
    const isGroup = form.target === 'grupo'
    onSubmit({
      ...form,
      id: Date.now(),
      animalId: isGroup ? null : Number(form.animalId),
      animalIdentificador: isGroup ? form.grupo : animal?.identificador ?? 'Sin identificador',
      tipoAlimento: form.tipoAlimento,
      alimento: form.tipoAlimento,
      cantidad: Number(form.cantidad),
      costoAproximado: Number(form.costoAproximado),
      costo: Number(form.costoAproximado),
      nutricion: {
        ...form.nutricion,
        proteina: form.nutricion.proteina === '' ? '' : Number(form.nutricion.proteina),
        fibra: form.nutricion.fibra === '' ? '' : Number(form.nutricion.fibra),
        energia: form.nutricion.energia === '' ? '' : Number(form.nutricion.energia),
        materiaSeca: form.nutricion.materiaSeca === '' ? '' : Number(form.nutricion.materiaSeca),
      },
      grupo: isGroup ? form.grupo : '',
    })
  }

  return (
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <section className="grid gap-5 rounded-2xl border border-[#98a287]/18 bg-white p-5 shadow-[0_12px_28px_rgba(29,29,27,0.07)] lg:grid-cols-2">
        <div className="lg:col-span-2">
          <span className="text-sm font-bold text-[#1d1d1b]">Seleccionar animal o grupo</span>
          <div className="mt-2 grid grid-cols-2 gap-2 rounded-2xl bg-[#F4F4F4] p-1">
            {[
              ['animal', 'Animal'],
              ['grupo', 'Grupo'],
            ].map(([value, label]) => (
              <button className={`min-h-11 rounded-xl text-sm font-bold ${form.target === value ? 'bg-[#07612d] text-white' : 'text-[#1d1d1b]/70'}`} key={value} onClick={() => setForm((current) => ({ ...current, target: value }))} type="button">
                {label}
              </button>
            ))}
          </div>
        </div>

        {form.target === 'animal' ? (
          <label className="block">
            <span className="text-sm font-bold text-[#1d1d1b]">Animal relacionado</span>
            <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="animalId" onChange={updateField} value={form.animalId}>
              <option value="">Selecciona animal</option>
              {animals.map((animal) => (
                <option key={animal.id} value={animal.id}>
                  {animal.identificador} - {animal.nombre}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label className="block">
            <span className="text-sm font-bold text-[#1d1d1b]">Nombre del grupo</span>
            <input className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="grupo" onChange={updateField} placeholder="Grupo Corral 1" value={form.grupo} />
          </label>
        )}

        <label className="block">
          <span className="text-sm font-bold text-[#1d1d1b]">Tipo de alimento</span>
          <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="tipoAlimento" onChange={updateField} value={form.tipoAlimento}>
            {foodTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>

        <section className="rounded-2xl border border-[#07612d]/12 bg-[#F4F4F4] p-4 lg:col-span-2">
          <div>
            <h2 className="text-base font-bold text-[#07612d]">Datos nutricionales del alimento</h2>
            <p className="mt-1 text-sm leading-6 text-[#1d1d1b]/65">Estos valores ayudan a controlar proteína, fibra, energía y materia seca de la ración.</p>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['proteina', 'Proteína (%)', '16'],
              ['fibra', 'Fibra (%)', '32'],
              ['energia', 'Energía Mcal/kg', '2.4'],
              ['materiaSeca', 'Materia seca (%)', '88'],
            ].map(([name, label, placeholder]) => (
              <label className="block" key={name}>
                <span className="text-sm font-bold text-[#1d1d1b]">{label}</span>
                <input
                  className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-white px-4 text-sm outline-none focus:border-[#07612d] focus:ring-4 focus:ring-[#07612d]/10"
                  inputMode="decimal"
                  min="0"
                  name={name}
                  onChange={updateNutrition}
                  placeholder={placeholder}
                  type="number"
                  value={form.nutricion[name]}
                />
              </label>
            ))}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <label className="block">
              <span className="text-sm font-bold text-[#1d1d1b]">Minerales / vitaminas</span>
              <input className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-white px-4 text-sm outline-none focus:border-[#07612d] focus:ring-4 focus:ring-[#07612d]/10" name="minerales" onChange={updateNutrition} value={form.nutricion.minerales} />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-[#1d1d1b]">Notas nutricionales</span>
              <input className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-white px-4 text-sm outline-none focus:border-[#07612d] focus:ring-4 focus:ring-[#07612d]/10" name="notas" onChange={updateNutrition} value={form.nutricion.notas} />
            </label>
          </div>
        </section>

        <label className="block">
          <span className="text-sm font-bold text-[#1d1d1b]">Cantidad</span>
          <input className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" inputMode="decimal" min="0" name="cantidad" onChange={updateField} type="number" value={form.cantidad} />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-[#1d1d1b]">Unidad de medida</span>
          <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="unidad" onChange={updateField} value={form.unidad}>
            {units.map((unit) => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </label>

        {[
          ['fecha', 'Fecha', 'date'],
          ['hora', 'Hora', 'time'],
          ['responsable', 'Responsable', 'text'],
          ['costoAproximado', 'Costo aproximado', 'number'],
        ].map(([name, label, type]) => (
          <label className="block" key={name}>
            <span className="text-sm font-bold text-[#1d1d1b]">{label}</span>
            <input className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" inputMode={type === 'number' ? 'decimal' : undefined} min={type === 'number' ? '0' : undefined} name={name} onChange={updateField} type={type} value={form[name]} />
          </label>
        ))}

        <label className="block">
          <span className="text-sm font-bold text-[#1d1d1b]">Estado</span>
          <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="estado" onChange={updateField} value={form.estado}>
            {['Registrado', 'Pendiente', 'Atrasado'].map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>
      </section>

      <label className="block rounded-2xl border border-[#98a287]/18 bg-white p-5 shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
        <span className="text-sm font-bold text-[#1d1d1b]">Observaciones</span>
        <textarea className="mt-2 min-h-28 w-full resize-y rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] p-4 text-sm outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="observaciones" onChange={updateField} value={form.observaciones} />
      </label>

      <button className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-[#07612d] px-5 text-base font-bold text-white shadow-[0_10px_22px_rgba(7,97,45,0.2)] disabled:cursor-not-allowed disabled:bg-[#98a287]" disabled={!canSubmit} type="submit">
        <Save size={19} /> Registrar Alimentación
      </button>
    </form>
  )
}

export default FeedingForm
