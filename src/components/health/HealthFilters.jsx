function HealthFilters({ filters, animals, onChange }) {
  function updateField(event) {
    onChange({ ...filters, [event.target.name]: event.target.value })
  }

  return (
    <section className="rounded-2xl border border-[#98a287]/18 bg-white p-4 shadow-[0_12px_28px_rgba(29,29,27,0.07)] md:p-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <select className="h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="animalId" onChange={updateField} value={filters.animalId}>
          <option value="Todos">Animal: Todos</option>
          {animals.map((animal) => (
            <option key={animal.id} value={animal.id}>
              {animal.identificador}
            </option>
          ))}
        </select>
        <select className="h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="tipo" onChange={updateField} value={filters.tipo}>
          <option value="Todos">Tipo: Todos</option>
          {['Vacuna', 'Desparasitante', 'Revision', 'Tratamiento', 'Enfermedad', 'Otro'].map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
        <select className="h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="estado" onChange={updateField} value={filters.estado}>
          <option value="Todos">Estado: Todos</option>
          {['Completado', 'Pendiente', 'Vencido'].map((estado) => (
            <option key={estado} value={estado}>
              {estado}
            </option>
          ))}
        </select>
        <input className="h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="fecha" onChange={updateField} type="date" value={filters.fecha} />
      </div>
    </section>
  )
}

export default HealthFilters
