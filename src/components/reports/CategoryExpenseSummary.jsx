import TarjetaReporte from './ReportCard';
import { obtenerTotalesCategoria, mxn } from '../expenses/expenseUtils';

function ResumenGastoCategoria({ expenses: gastos }) {
  const totales = Object.entries(obtenerTotalesCategoria(gastos)).sort((a, b) => b[1] - a[1]);
  const total = totales.reduce((suma, [, valor]) => suma + valor, 0);

  return (
    <TarjetaReporte title="Gastos por categoría" subtitle="Peso de cada categoría dentro de la inversión.">
      {totales.length ?
      <div className="grid gap-4">
          {totales.map(([category, valor]) => {
          const porcentaje = total > 0 ? Math.round(valor / total * 100) : 0;
          return (
            <div key={category}>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-bold text-[#1d1d1b]">{category}</span>
                  <span className="font-bold text-[#07612d]">{mxn.format(valor)}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-[#F4F4F4]">
                  <div className="h-full rounded-full bg-[#07612d]" style={{ width: `${porcentaje}%` }} />
                </div>
              </div>);

        })}
        </div> :

      <p className="text-sm font-semibold text-[#1d1d1b]/70">No hay gastos para mostrar.</p>
      }
    </TarjetaReporte>);

}

export default ResumenGastoCategoria;
