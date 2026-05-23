import { Search } from 'lucide-react'
import { foodTypes } from './feedingUtils'

function FeedingFilters({ filters, animals, onChange }) {
  function updateField(event) {
    onChange({ ...filters, [event.target.name]: event.target.value })
  }

  return (
    <section className="rounded-2xl border border-[#98a287]/18 bg-white p-4 shadow-[0_12px_28px_rgba(29,29,27,0.07)] md:p-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[1.2fr_repeat(3,1fr)]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98a287]" size={18} />
          <input className="h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] pl-10 pr-4 text-sm outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="query" onChange={updateField} placeholder="Buscar responsable o grupo..." value={filters.query} />
        </label>
        <select className="h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="animalId" onChange={updateField} value={filters.animalId}>
          <option value="Todos">Animal/Grupo: Todos</option>
          <option value="grupo">Grupos</option>
          {animals.map((animal) => (
            <option key={animal.id} value={animal.id}>
              {animal.identificador}
            </option>
          ))}
        </select>
        <input className="h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="fecha" onChange={updateField} type="date" value={filters.fecha} />
        <select className="h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="tipoAlimento" onChange={updateField} value={filters.tipoAlimento}>
          <option value="Todos">Alimento: Todos</option>
          {foodTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
    </section>
  )
}

export default FeedingFilters
