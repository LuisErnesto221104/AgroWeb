import { Search } from 'lucide-react';
import { categoriasGasto } from './expenseUtils';

function FiltrosGasto({ filters: filtros, animals: animales, onChange: alCambiar }) {
  function actualizarCampo(evento) {
    alCambiar({ ...filtros, [evento.target.name]: evento.target.value });
  }

  return (
    <section className="rounded-2xl border border-[#98a287]/18 bg-white p-4 shadow-[0_12px_28px_rgba(29,29,27,0.07)] md:p-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[1.2fr_repeat(4,1fr)]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98a287]" size={18} />
          <input className="h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] pl-10 pr-4 text-sm outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="query" onChange={actualizarCampo} placeholder="Buscar descripción o compra..." value={filtros.query} />
        </label>
        <select className="h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="animalId" onChange={actualizarCampo} value={filtros.animalId}>
          <option value="Todos">Animal: Todos</option>
          <option value="general">Rancho general</option>
          {animales.map((animal) =>
          <option key={animal.id} value={animal.id}>
              {animal.identificador}
            </option>
          )}
        </select>
        <input className="h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="fecha" onChange={actualizarCampo} type="date" value={filtros.fecha} />
        <select className="h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="categoria" onChange={actualizarCampo} value={filtros.categoria}>
          <option value="Todos">Categoría: Todas</option>
          {categoriasGasto.map((category) =>
          <option key={category} value={category}>
              {category}
            </option>
          )}
        </select>
        <input className="h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="tipoCompra" onChange={actualizarCampo} placeholder="Tipo de compra" value={filtros.tipoCompra} />
      </div>
    </section>);

}

export default FiltrosGasto;
