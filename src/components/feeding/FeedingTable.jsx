import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import InsigniaEstadoAlimentacion from './FeedingStatusBadge';
import { mxn } from '../expenses/expenseUtils';

const opcionesEstadoAlimentacion = ['Registrado', 'Pendiente', 'Atrasado', 'Completado'];

function TablaAlimentacion({ records: registros, onStatusChange: alCambiarEstado }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#98a287]/18 bg-white shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
      <table className="w-full min-w-[920px] border-separate border-spacing-y-2 p-3 text-left text-sm">
        <thead>
          <tr className="text-xs font-bold uppercase text-[#98a287]">
            <th className="px-3 py-2">Animal/Grupo</th>
            <th className="px-3 py-2">Alimento</th>
            <th className="px-3 py-2">Cantidad</th>
            <th className="px-3 py-2">Fecha</th>
            <th className="px-3 py-2">Responsable</th>
            <th className="px-3 py-2">Costo</th>
            <th className="px-3 py-2">Estado</th>
            <th className="px-3 py-2">Detalle</th>
          </tr>
        </thead>
        <tbody>
          {registros.map((registro) =>
          <tr className="bg-[#F4F4F4]" key={registro.id}>
              <td className="rounded-l-2xl px-3 py-3 font-bold text-[#07612d]">{registro.animalIdentificador}</td>
              <td className="px-3 py-3">{registro.tipoAlimento}</td>
              <td className="px-3 py-3">{registro.cantidad} {registro.unidad}</td>
              <td className="px-3 py-3">{registro.fecha} {registro.hora}</td>
              <td className="px-3 py-3">{registro.responsable}</td>
              <td className="px-3 py-3 font-bold">{mxn.format(registro.costoAproximado)}</td>
              <td className="px-3 py-3">
                {alCambiarEstado ?
              <select className="h-9 rounded-xl border border-[#98a287]/25 bg-white px-3 text-xs font-bold text-[#1d1d1b] outline-none focus:border-[#07612d]" onChange={(elemento) => alCambiarEstado(registro.id, elemento.target.value)} value={registro.estado}>
                    {opcionesEstadoAlimentacion.map((status) =>
                <option key={status} value={status}>
                        {status}
                      </option>
                )}
                  </select> :

              <InsigniaEstadoAlimentacion estado={registro.estado} />
              }
              </td>
              <td className="rounded-r-2xl px-3 py-3">
                <Link aria-label="Ver alimentación" className="inline-flex size-9 items-center justify-center rounded-xl bg-white text-[#07612d]" to={`/alimentacion/${registro.id}`}>
                  <Eye size={17} />
                </Link>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>);

}

export default TablaAlimentacion;
