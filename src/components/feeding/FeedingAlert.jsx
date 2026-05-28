import { AlertTriangle } from 'lucide-react';
import InsigniaEstadoAlimentacion from './FeedingStatusBadge';

function AlertaAlimentacion({ records: registros }) {
  const alerts = registros.filter((registro) => registro.estado === 'Pendiente' || registro.estado === 'Atrasado');

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
        {alerts.length ?
        alerts.map((registro) =>
        <article className={`rounded-2xl p-4 ${registro.estado === 'Atrasado' ? 'bg-[#D32F2F]/8' : 'bg-[#F4F4F4]'}`} key={registro.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-[#1d1d1b]">{registro.animalIdentificador}</p>
                  <p className="text-xs text-[#98a287]">{registro.tipoAlimento} - {registro.fecha} {registro.hora}</p>
                </div>
                <InsigniaEstadoAlimentacion estado={registro.estado} />
              </div>
            </article>
        ) :

        <p className="rounded-2xl bg-[#F4F4F4] p-4 text-sm font-semibold text-[#1d1d1b]/70">No hay alimentación pendiente.</p>
        }
      </div>
    </section>);

}

export default AlertaAlimentacion;
