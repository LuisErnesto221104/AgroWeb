import { useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import InsigniaEstadoSanidad from './HealthStatusBadge';

function obtenerFechaEvento(evento) {
  return evento.proximaAplicacion || evento.fecha;
}

function crearDiasCalendario(monthDate) {
  const anio = monthDate.getFullYear();
  const mes = monthDate.getMonth();
  const firstDay = new Date(anio, mes, 1);
  const daysInMonth = new Date(anio, mes + 1, 0).getDate();
  const startOffset = firstDay.getDay();

  return [
  ...Array.from({ length: startOffset }, (_, indice) => ({ key: `empty-${indice}`, empty: true })),
  ...Array.from({ length: daysInMonth }, (_, indice) => {
    const dia = indice + 1;
    const fecha = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    return { key: fecha, day: dia, date: fecha };
  })];

}

function CalendarioSanitario({ events: eventos }) {
  const firstEventDate = eventos.find((evento) => obtenerFechaEvento(evento))?.proximaAplicacion || eventos.find((evento) => obtenerFechaEvento(evento))?.fecha || '2026-05-01';
  const [visibleDate, establecerFechaVisible] = useState(() => {
    const [anio, mes] = firstEventDate.split('-').map(Number);
    return new Date(anio, mes - 1, 1);
  });
  const [fechaSeleccionada, establecerFechaSeleccionada] = useState(firstEventDate);

  const calendarDays = useMemo(() => crearDiasCalendario(visibleDate), [visibleDate]);
  const eventosPorFecha = useMemo(() => {
    return eventos.reduce((grouped, evento) => {
      const fecha = obtenerFechaEvento(evento);
      if (!fecha) return grouped;
      grouped[fecha] = [...(grouped[fecha] ?? []), evento];
      return grouped;
    }, {});
  }, [eventos]);

  const eventosSeleccionados = eventosPorFecha[fechaSeleccionada] ?? [];
  const monthLabel = visibleDate.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });

  function cambiarMes(cantidad) {
    establecerFechaVisible((actual) => new Date(actual.getFullYear(), actual.getMonth() + cantidad, 1));
  }

  return (
    <section className="rounded-2xl border border-[#98a287]/18 bg-white p-4 shadow-[0_12px_28px_rgba(29,29,27,0.07)] md:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-[#07612d]/10 text-[#07612d]">
            <CalendarDays size={23} />
          </span>
          <div>
            <h2 className="text-xl font-bold text-[#07612d]">Calendario sanitario</h2>
            <p className="text-sm text-[#98a287]">Presiona un día para ver sus eventos programados.</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#F4F4F4] p-2 sm:w-fit">
          <button aria-label="Mes anterior" className="flex size-10 items-center justify-center rounded-xl bg-white text-[#07612d]" onClick={() => cambiarMes(-1)} type="button">
            <ChevronLeft size={19} />
          </button>
          <strong className="min-w-36 text-center text-sm capitalize text-[#1d1d1b]">{monthLabel}</strong>
          <button aria-label="Mes siguiente" className="flex size-10 items-center justify-center rounded-xl bg-white text-[#07612d]" onClick={() => cambiarMes(1)} type="button">
            <ChevronRight size={19} />
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase text-[#98a287]">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((dia) =>
        <span key={dia}>{dia}</span>
        )}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-2">
        {calendarDays.map((dia) =>
        dia.empty ?
        <div className="min-h-16 rounded-2xl bg-[#F4F4F4]/50" key={dia.key} /> :

        <button
          className={`min-h-16 rounded-2xl border p-2 text-left transition ${
          fechaSeleccionada === dia.date ? 'border-[#07612d] bg-[#07612d] text-white' : 'border-[#98a287]/18 bg-[#F4F4F4] text-[#1d1d1b] hover:border-[#07612d]/35'}`
          }
          key={dia.key}
          onClick={() => establecerFechaSeleccionada(dia.date)}
          type="button">
          
              <span className="text-sm font-bold">{dia.day}</span>
              {eventosPorFecha[dia.date]?.length ?
          <span className={`mt-2 flex size-6 items-center justify-center rounded-full text-xs font-bold ${fechaSeleccionada === dia.date ? 'bg-white text-[#07612d]' : 'bg-[#07612d] text-white'}`}>
                  {eventosPorFecha[dia.date].length}
                </span> :
          null}
            </button>

        )}
      </div>

      <div className="mt-5 rounded-2xl bg-[#F4F4F4] p-4">
        <h3 className="text-base font-bold text-[#07612d]">Eventos del {fechaSeleccionada}</h3>
        {eventosSeleccionados.length ?
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {eventosSeleccionados.map((evento) =>
          <article className="rounded-2xl bg-white p-4" key={evento.id}>
                <p className="text-xs font-bold uppercase text-[#98a287]">{evento.animalIdentificador}</p>
                <h4 className="mt-2 text-base font-bold text-[#1d1d1b]">{evento.tipo}</h4>
                <p className="mt-1 break-words text-sm text-[#1d1d1b]/70">{evento.producto || 'Sin producto registrado'}</p>
                <div className="mt-3">
                  <InsigniaEstadoSanidad estado={evento.estado} />
                </div>
              </article>
          )}
          </div> :

        <p className="mt-3 text-sm text-[#1d1d1b]/70">No hay eventos programados para este día.</p>
        }
      </div>
    </section>);

}

export default CalendarioSanitario;
