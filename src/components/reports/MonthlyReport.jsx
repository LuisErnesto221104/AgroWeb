import TarjetaReporte from './ReportCard';
import { mxn } from '../expenses/expenseUtils';

function ReporteMensual({ rows: filas }) {
  return (
    <TarjetaReporte title="Resumen mensual" subtitle="Ingresos, gastos y alimentación agrupados por mes.">
      {filas.length ?
      <div className="grid gap-3">
          {filas.map((fila) =>
        <article className="rounded-2xl bg-[#F4F4F4] p-4" key={fila.month}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-base font-bold text-[#07612d]">{fila.month}</h3>
                <strong className={`break-words ${fila.balance >= 0 ? 'text-[#2f8f36]' : 'text-[#D32F2F]'}`}>{mxn.format(fila.balance)}</strong>
              </div>
              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                <span className="break-words">Ingresos: <strong>{mxn.format(fila.ingresos)}</strong></span>
                <span className="break-words">Gastos: <strong>{mxn.format(fila.gastos)}</strong></span>
                <span className="break-words">Alimentación: <strong>{mxn.format(fila.alimentacion)}</strong></span>
              </div>
            </article>
        )}
        </div> :

      <p className="text-sm font-semibold text-[#1d1d1b]/70">No hay datos mensuales disponibles.</p>
      }
    </TarjetaReporte>);

}

export default ReporteMensual;
