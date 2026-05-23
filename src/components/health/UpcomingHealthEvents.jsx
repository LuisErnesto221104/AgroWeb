import { AlertTriangle, CalendarClock } from 'lucide-react'
import HealthStatusBadge from './HealthStatusBadge'

function UpcomingHealthEvents({ events }) {
  return (
    <section className="rounded-2xl border border-[#98a287]/18 bg-white p-5 shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFA000]/14 text-[#9b6300]">
          <CalendarClock size={23} />
        </span>
        <div>
          <h2 className="text-xl font-bold text-[#07612d]">Próximas aplicaciones</h2>
          <p className="text-sm text-[#98a287]">Eventos pendientes o vencidos que requieren atención.</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {events.length ? (
          events.map((event) => (
            <article className={`rounded-2xl p-4 ${event.estado === 'Vencido' ? 'bg-[#D32F2F]/8' : 'bg-[#F4F4F4]'}`} key={event.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle className={event.estado === 'Vencido' ? 'text-[#D32F2F]' : 'text-[#FFA000]'} size={19} />
                  <div>
                    <p className="text-sm font-bold text-[#1d1d1b]">
                      {event.tipo} - {event.animalIdentificador}
                    </p>
                    <p className="text-xs text-[#98a287]">Próxima: {event.proximaAplicacion || event.fecha}</p>
                  </div>
                </div>
                <HealthStatusBadge estado={event.estado} />
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-2xl bg-[#F4F4F4] p-4 text-sm font-semibold text-[#1d1d1b]/70">No hay aplicaciones pendientes.</p>
        )}
      </div>
    </section>
  )
}

export default UpcomingHealthEvents
