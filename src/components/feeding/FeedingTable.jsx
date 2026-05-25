import { Link } from 'react-router-dom'
import { Eye } from 'lucide-react'
import FeedingStatusBadge from './FeedingStatusBadge'
import { mxn } from '../expenses/expenseUtils'

const feedingStatusOptions = ['Registrado', 'Pendiente', 'Atrasado', 'Completado']

function FeedingTable({ records, onStatusChange }) {
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
          {records.map((record) => (
            <tr className="bg-[#F4F4F4]" key={record.id}>
              <td className="rounded-l-2xl px-3 py-3 font-bold text-[#07612d]">{record.animalIdentificador}</td>
              <td className="px-3 py-3">{record.tipoAlimento}</td>
              <td className="px-3 py-3">{record.cantidad} {record.unidad}</td>
              <td className="px-3 py-3">{record.fecha} {record.hora}</td>
              <td className="px-3 py-3">{record.responsable}</td>
              <td className="px-3 py-3 font-bold">{mxn.format(record.costoAproximado)}</td>
              <td className="px-3 py-3">
                {onStatusChange ? (
                  <select className="h-9 rounded-xl border border-[#98a287]/25 bg-white px-3 text-xs font-bold text-[#1d1d1b] outline-none focus:border-[#07612d]" onChange={(item) => onStatusChange(record.id, item.target.value)} value={record.estado}>
                    {feedingStatusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                ) : (
                  <FeedingStatusBadge estado={record.estado} />
                )}
              </td>
              <td className="rounded-r-2xl px-3 py-3">
                <Link aria-label="Ver alimentación" className="inline-flex size-9 items-center justify-center rounded-xl bg-white text-[#07612d]" to={`/alimentacion/${record.id}`}>
                  <Eye size={17} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default FeedingTable
