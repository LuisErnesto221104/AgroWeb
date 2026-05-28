import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import InsigniaEstadoSanidad from './HealthStatusBadge';

const opcionesEstado = ['Completado', 'Pendiente', 'Vencido'];

function TablaEventoSanitario({ events: eventos, onStatusChange: alCambiarEstado }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#98a287]/18 bg-white shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
      <table className="w-full min-w-[960px] border-separate border-spacing-y-2 p-3 text-left text-sm">
        <thead>
          <tr className="text-xs font-bold uppercase text-[#98a287]">
            <th className="px-3 py-2">Animal</th>
            <th className="px-3 py-2">Tipo</th>
            <th className="px-3 py-2">Fecha</th>
            <th className="px-3 py-2">Producto</th>
            <th className="px-3 py-2">Responsable</th>
            <th className="px-3 py-2">Próxima aplicación</th>
            <th className="px-3 py-2">Estado</th>
            <th className="px-3 py-2">Detalle</th>
          </tr>
        </thead>
        <tbody>
          {eventos.map((evento) =>
          <tr className="bg-[#F4F4F4]" key={evento.id}>
              <td className="rounded-l-2xl px-3 py-3 font-bold text-[#07612d]">{evento.animalIdentificador}</td>
              <td className="px-3 py-3 font-semibold">{evento.tipo}</td>
              <td className="px-3 py-3">{evento.fecha}</td>
              <td className="px-3 py-3">{evento.producto}</td>
              <td className="px-3 py-3">{evento.responsable}</td>
              <td className="px-3 py-3">{evento.proximaAplicacion || 'Sin fecha'}</td>
              <td className="px-3 py-3">
                {alCambiarEstado ?
              <select className="h-9 rounded-xl border border-[#98a287]/25 bg-white px-3 text-xs font-bold text-[#1d1d1b] outline-none focus:border-[#07612d]" onChange={(elemento) => alCambiarEstado(evento.id, elemento.target.value)} value={evento.estado}>
                    {opcionesEstado.map((status) =>
                <option key={status} value={status}>
                        {status}
                      </option>
                )}
                  </select> :

              <InsigniaEstadoSanidad estado={evento.estado} />
              }
              </td>
              <td className="rounded-r-2xl px-3 py-3">
                <Link aria-label="Ver evento sanitario" className="inline-flex size-9 items-center justify-center rounded-xl bg-white text-[#07612d]" to={`/sanidad/${evento.id}`}>
                  <Eye size={17} />
                </Link>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>);

}

export default TablaEventoSanitario;
