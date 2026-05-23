import { Search } from 'lucide-react'

function AnimalFilters({ filters, onChange, options }) {
  function updateField(event) {
    onChange({ ...filters, [event.target.name]: event.target.value })
  }

  return (
    <section className="rounded-2xl border border-[#98a287]/18 bg-white p-4 shadow-[0_12px_28px_rgba(29,29,27,0.07)] md:p-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[1.2fr_repeat(4,1fr)]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98a287]" size={18} />
          <input
            className="h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] pl-10 pr-4 text-sm outline-none transition placeholder:text-[#98a287] focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10"
            name="query"
            onChange={updateField}
            placeholder="Buscar por identificador..."
            value={filters.query}
          />
        </label>

        {[
          ['estado', 'Estado', options.estados],
          ['especie', 'Especie', options.especies],
          ['raza', 'Raza', options.razas],
          ['ubicacion', 'Ubicación', options.ubicaciones],
        ].map(([name, label, values]) => (
          <label className="block" key={name}>
            <select
              className="h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold text-[#1d1d1b] outline-none transition focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10"
              name={name}
              onChange={updateField}
              value={filters[name]}
              aria-label={label}
            >
              <option value="Todos">{label}: Todos</option>
              {values.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </section>
  )
}

export default AnimalFilters
