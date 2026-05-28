const hoy = new Date().toISOString().slice(0, 10);

function FiltrosReporte({ filters: filtros, animals: animales, onChange: alCambiar, errors = {} }) {
  const isAnimalReport = filtros.tipoReporte === 'animal';

  function actualizarCampo(evento) {
    const { name, value: valor } = evento.target;
    const filtrosSiguientes = { ...filtros, [name]: valor };

    if (name === 'tipoReporte' && valor !== 'animal') {
      filtrosSiguientes.animalId = 'Todos';
    }

    if (name === 'tipoReporte' && valor === 'animal' && filtros.animalId === 'general') {
      filtrosSiguientes.animalId = 'Todos';
    }

    if (name === 'desde' && filtros.hasta && valor && filtros.hasta < valor) {
      filtrosSiguientes.hasta = '';
    }

    alCambiar(filtrosSiguientes);
  }

  return (
    <section className="rounded-2xl border border-[#98a287]/18 bg-white p-4 shadow-[0_12px_28px_rgba(29,29,27,0.07)] md:p-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <select className="h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="tipoReporte" onChange={actualizarCampo} value={filtros.tipoReporte}>
          <option value="general">Reporte general</option>
          <option value="animal">Por animal</option>
          <option value="mensual">Mensual</option>
          <option value="categoria">Por categoría</option>
        </select>
        <select className="h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none disabled:cursor-not-allowed disabled:opacity-60 focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" disabled={!isAnimalReport} name="animalId" onChange={actualizarCampo} value={isAnimalReport ? filtros.animalId : 'Todos'}>
          <option value="Todos">Selecciona animal</option>
          {animales.map((animal) =>
          <option key={animal.id} value={animal.id}>
              {animal.identificador}
            </option>
          )}
        </select>
        <input className="h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" max={hoy} name="desde" onChange={actualizarCampo} type="date" value={filtros.desde} />
        <input className="h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60 focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" disabled={!filtros.desde} max={hoy} min={filtros.desde || undefined} name="hasta" onChange={actualizarCampo} type="date" value={filtros.hasta} />
      </div>
      <div className="mt-3 grid gap-2 text-sm font-semibold">
        {!isAnimalReport ? <p className="text-[#98a287]">El selector de animal solo se habilita cuando el tipo de reporte es “Por animal”.</p> : null}
        {Object.values(errors).map((error) =>
        <p className="text-[#D32F2F]" key={error}>
            {error}
          </p>
        )}
      </div>
    </section>);

}

export default FiltrosReporte;
