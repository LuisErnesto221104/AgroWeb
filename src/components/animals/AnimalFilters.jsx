import { Search } from 'lucide-react';
import { catalogoAnimal } from '../../data/animalCatalog';

function FiltrosAnimal({ filters: filtros, onChange: alCambiar, options: opciones }) {
  const razasDisponibles = filtros.especie !== 'Todos' ? catalogoAnimal[filtros.especie]?.razas ?? [] : opciones.razas;

  function actualizarCampo(evento) {
    const { name, value } = evento.target;
    const filtrosSiguientes = { ...filtros, [name]: value };
    if (name === 'especie') {
      const razasDeEspecie = value !== 'Todos' ? catalogoAnimal[value]?.razas ?? [] : opciones.razas;
      if (filtros.raza !== 'Todos' && !razasDeEspecie.includes(filtros.raza)) filtrosSiguientes.raza = 'Todos';
    }
    alCambiar(filtrosSiguientes);
  }

  return (
    <section className="rounded-2xl border border-[#98a287]/18 bg-white p-4 shadow-[0_12px_28px_rgba(29,29,27,0.07)] md:p-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[1.2fr_repeat(4,1fr)]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98a287]" size={18} />
          <input
            className="h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] pl-10 pr-4 text-sm outline-none transition placeholder:text-[#98a287] focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10"
            name="query"
            onChange={actualizarCampo}
            placeholder="Buscar por identificador..."
            value={filtros.query} />
          
        </label>

        {[
        ['estado', 'Estado', opciones.estados],
        ['especie', 'Especie', opciones.especies],
        ['raza', 'Raza', razasDisponibles],
        ['ubicacion', 'Ubicación', opciones.ubicaciones]].
        map(([name, etiqueta, valores]) =>
        <label className="block" key={name}>
            <select
            className="h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold text-[#1d1d1b] outline-none transition focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10"
            name={name}
            onChange={actualizarCampo}
            value={filtros[name]}
            aria-label={etiqueta}>
            
              <option value="Todos">{etiqueta}: Todos</option>
              {valores.map((valor) =>
            <option key={valor} value={valor}>
                  {valor}
                </option>
            )}
            </select>
          </label>
        )}
      </div>
    </section>);

}

export default FiltrosAnimal;
