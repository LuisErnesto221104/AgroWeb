import { Link } from 'react-router-dom'
import { ArrowRight, CalendarClock, Scale, UserRound } from 'lucide-react'
import FeedingStatusBadge from './FeedingStatusBadge'
import { mxn } from '../expenses/expenseUtils'

const feedingStatusOptions = ['Registrado', 'Pendiente', 'Atrasado', 'Completado']

function FeedingCard({ record, onStatusChange }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-[#98a287]/18 bg-white p-5 shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#07612d]">{record.animalIdentificador}</p>
          <h3 className="mt-1 text-xl font-bold text-[#1d1d1b]">{record.tipoAlimento}</h3>
        </div>
        <FeedingStatusBadge estado={record.estado} />
      </div>

      {onStatusChange ? (
        <label className="mt-4 block">
          <span className="text-xs font-bold uppercase text-[#98a287]">Cambiar estado</span>
          <select className="mt-2 h-10 w-full rounded-xl border border-[#98a287]/25 bg-[#F4F4F4] px-3 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white" onChange={(item) => onStatusChange(record.id, item.target.value)} value={record.estado}>
            {feedingStatusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <div className="mt-4 grid gap-2 text-sm font-semibold text-[#1d1d1b]/70">
        <span className="inline-flex items-center gap-2">
          <Scale size={17} className="text-[#98a287]" /> {record.cantidad} {record.unidad}
        </span>
        <span className="inline-flex items-center gap-2">
          <CalendarClock size={17} className="text-[#98a287]" /> {record.fecha} - {record.hora}
        </span>
        <span className="inline-flex items-center gap-2">
          <UserRound size={17} className="text-[#98a287]" /> {record.responsable}
        </span>
      </div>

      <p className="mt-4 flex-1 text-sm leading-6 text-[#1d1d1b]/70">{record.observaciones}</p>
      {record.nutricion ? (
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-[#F4F4F4] p-3 text-xs font-bold text-[#1d1d1b]/70">
          <span>Proteína: {record.nutricion.proteina}%</span>
          <span>Fibra: {record.nutricion.fibra}%</span>
          <span>Energía: {record.nutricion.energia} Mcal/kg</span>
          <span>MS: {record.nutricion.materiaSeca}%</span>
        </div>
      ) : null}
      <strong className="mt-4 block text-lg text-[#07612d]">{mxn.format(record.costoAproximado)}</strong>
      <Link className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#07612d] px-4 text-sm font-bold text-white" to={`/alimentacion/${record.id}`}>
        Ver detalle <ArrowRight size={17} />
      </Link>
    </article>
  )
}

export default FeedingCard
