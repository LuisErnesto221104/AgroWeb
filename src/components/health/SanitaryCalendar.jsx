import { CalendarDays } from 'lucide-react'
import HealthStatusBadge from './HealthStatusBadge'

function SanitaryCalendar({ events }) {
  const calendarEvents = [...events]
    .filter((event) => event.proximaAplicacion || event.fecha)
    .sort((a, b) => (a.proximaAplicacion || a.fecha).localeCompare(b.proximaAplicacion || b.fecha))

  return (
    <section className="rounded-2xl border border-[#98a287]/18 bg-white p-4 shadow-[0_12px_28px_rgba(29,29,27,0.07)] md:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-[#07612d]/10 text-[#07612d]">
          <CalendarDays size={23} />
        </span>
        <div>
          <h2 className="text-xl font-bold text-[#07612d]">Calendario sanitario</h2>
          <p className="text-sm text-[#98a287]">Ordenado por fecha de próxima aplicación.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {calendarEvents.map((event) => (
          <article className="rounded-2xl bg-[#F4F4F4] p-4" key={event.id}>
            <p className="text-xs font-bold uppercase text-[#98a287]">{event.proximaAplicacion || event.fecha}</p>
            <h3 className="mt-2 text-base font-bold text-[#1d1d1b]">{event.tipo}</h3>
            <p className="mt-1 text-sm text-[#1d1d1b]/70">{event.animalIdentificador}</p>
            <div className="mt-3">
              <HealthStatusBadge estado={event.estado} />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default SanitaryCalendar
