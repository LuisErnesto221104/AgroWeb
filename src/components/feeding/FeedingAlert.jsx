import { AlertTriangle } from 'lucide-react'
import FeedingStatusBadge from './FeedingStatusBadge'

function FeedingAlert({ records }) {
  const alerts = records.filter((record) => record.estado === 'Pendiente' || record.estado === 'Atrasado')

  return (
    <section className="rounded-2xl border border-[#98a287]/18 bg-white p-4 shadow-[0_12px_28px_rgba(29,29,27,0.07)] md:p-5">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFA000]/14 text-[#9b6300]">
          <AlertTriangle size={22} />
        </span>
        <div>
          <h2 className="text-xl font-bold text-[#07612d]">Alertas de alimentación</h2>
          <p className="text-sm text-[#98a287]">Pendientes y atrasadas.</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {alerts.length ? (
          alerts.map((record) => (
            <article className={`rounded-2xl p-4 ${record.estado === 'Atrasado' ? 'bg-[#D32F2F]/8' : 'bg-[#F4F4F4]'}`} key={record.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-[#1d1d1b]">{record.animalIdentificador}</p>
                  <p className="text-xs text-[#98a287]">{record.tipoAlimento} - {record.fecha} {record.hora}</p>
                </div>
                <FeedingStatusBadge estado={record.estado} />
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-2xl bg-[#F4F4F4] p-4 text-sm font-semibold text-[#1d1d1b]/70">No hay alimentación pendiente.</p>
        )}
      </div>
    </section>
  )
}

export default FeedingAlert
