import { Link } from 'react-router-dom';
import { Edit3, Eye } from 'lucide-react';
import InsigniaEstadoAnimal from './AnimalStatusBadge';

function TablaAnimal({ animals: animales }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#98a287]/18 bg-white shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
      <table className="w-full min-w-[920px] border-separate border-spacing-y-2 p-3 text-left text-sm">
        <thead>
          <tr className="text-xs font-bold uppercase text-[#98a287]">
            <th className="px-3 py-2">Identificador</th>
            <th className="px-3 py-2">Especie</th>
            <th className="px-3 py-2">Raza</th>
            <th className="px-3 py-2">Peso</th>
            <th className="px-3 py-2">Ubicación</th>
            <th className="px-3 py-2">Estado</th>
            <th className="px-3 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {animales.map((animal) =>
          <tr className="bg-[#F4F4F4]" key={animal.id}>
              <td className="rounded-l-2xl px-3 py-3 font-bold text-[#07612d]">{animal.identificador}</td>
              <td className="px-3 py-3 font-semibold">{animal.especie}</td>
              <td className="px-3 py-3">{animal.raza}</td>
              <td className="px-3 py-3">{animal.peso} kg</td>
              <td className="px-3 py-3">{animal.ubicacion}</td>
              <td className="px-3 py-3">
                <InsigniaEstadoAnimal estado={animal.estado} />
              </td>
              <td className="rounded-r-2xl px-3 py-3">
                <div className="flex gap-2">
                  <Link className="inline-flex size-9 items-center justify-center rounded-xl bg-white text-[#07612d]" to={`/animales/${animal.id}`} aria-label="Ver detalle">
                    <Eye size={17} />
                  </Link>
                  <Link className="inline-flex size-9 items-center justify-center rounded-xl bg-white text-[#1f7a8c]" to={`/animales/${animal.id}/editar`} aria-label="Editar animal">
                    <Edit3 size={17} />
                  </Link>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>);

}

export default TablaAnimal;
