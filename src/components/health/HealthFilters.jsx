import { catalogoAnimal } from '../../data/animalCatalog';

function FiltrosSanidad({ filters: filtros, animals: animales, onChange: alCambiar }) {
  const especies = Object.keys(catalogoAnimal);
  const razasDisponibles = filtros.especie !== 'Todos' ? catalogoAnimal[filtros.especie]?.razas ?? [] : Object.values(catalogoAnimal).flatMap((catalogo) => catalogo.razas).toSorted((a, b) => a.localeCompare(b));

  function actualizarCampo(evento) {
    const { name, value: valor } = evento.target;
    const filtrosSiguientes = { ...filtros, [name]: valor };
    if (name === 'especie') {
      const razasDeEspecie = valor !== 'Todos' ? catalogoAnimal[valor]?.razas ?? [] : Object.values(catalogoAnimal).flatMap((catalogo) => catalogo.razas);
      if (filtros.raza !== 'Todos' && !razasDeEspecie.includes(filtros.raza)) filtrosSiguientes.raza = 'Todos';
    }
    alCambiar(filtrosSiguientes);
  }

  return (
    <section className="rounded-2xl border border-[#98a287]/18 bg-white p-4 shadow-[0_12px_28px_rgba(29,29,27,0.07)] md:p-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <select className="h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="animalId" onChange={actualizarCampo} value={filtros.animalId}>
          <option value="Todos">Animal: Todos</option>
          {animales.map((animal) =>
          <option key={animal.id} value={animal.id}>
              {animal.identificador} - {animal.nombre}
            </option>
          )}
        </select>
        <select className="h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="especie" onChange={actualizarCampo} value={filtros.especie}>
          <option value="Todos">Especie: Todas</option>
          {especies.map((especie) =>
          <option key={especie} value={especie}>
              {especie}
            </option>
          )}
        </select>
        <select className="h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="raza" onChange={actualizarCampo} value={filtros.raza}>
          <option value="Todos">Raza: Todas</option>
          {razasDisponibles.map((raza) =>
          <option key={raza} value={raza}>
              {raza}
            </option>
          )}
        </select>
        <select className="h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="tipo" onChange={actualizarCampo} value={filtros.tipo}>
          <option value="Todos">Tipo: Todos</option>
          {['Vacuna', 'Desparasitante', 'Revision', 'Tratamiento', 'Enfermedad', 'Otro'].map((tipo) =>
          <option key={tipo} value={tipo}>
              {tipo}
            </option>
          )}
        </select>
        <select className="h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="estado" onChange={actualizarCampo} value={filtros.estado}>
          <option value="Todos">Estado: Todos</option>
          {['Completado', 'Pendiente', 'Vencido'].map((estado) =>
          <option key={estado} value={estado}>
              {estado}
            </option>
          )}
        </select>
        <input className="h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="fecha" onChange={actualizarCampo} type="date" value={filtros.fecha} />
      </div>
    </section>);

}

export default FiltrosSanidad;
