import TarjetaReporte from './ReportCard';
import { mxn } from '../expenses/expenseUtils';

function ResumenGananciasPerdidas({ totalIngresos: totalIngresos, totalGastos: totalGastos, balance: balance }) {
  const maximo = Math.max(totalIngresos, totalGastos, 1);
  const anchoIngresos = Math.round(totalIngresos / maximo * 100);
  const anchoGastos = Math.round(totalGastos / maximo * 100);

  return (
    <TarjetaReporte title="Ganancias vs pérdidas" subtitle="Comparación visual entre ingresos y egresos.">
      <div className="grid gap-5">
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="font-bold text-[#2f8f36]">Ingresos</span>
            <span className="break-words font-bold text-[#1d1d1b]">{mxn.format(totalIngresos)}</span>
          </div>
          <div className="h-10 overflow-hidden rounded-xl bg-[#F4F4F4]">
            <div className="h-full rounded-xl bg-[#4CAF50]" style={{ width: `${anchoIngresos}%` }} />
          </div>
        </div>
        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="font-bold text-[#D32F2F]">Gastos y pérdidas</span>
            <span className="break-words font-bold text-[#1d1d1b]">{mxn.format(totalGastos)}</span>
          </div>
          <div className="h-10 overflow-hidden rounded-xl bg-[#F4F4F4]">
            <div className="h-full rounded-xl bg-[#D32F2F]" style={{ width: `${anchoGastos}%` }} />
          </div>
        </div>
        <div className={`rounded-2xl p-4 ${balance >= 0 ? 'bg-[#4CAF50]/12 text-[#2f8f36]' : 'bg-[#D32F2F]/10 text-[#D32F2F]'}`}>
          <p className="text-xs font-bold uppercase">Balance general</p>
          <p className="mt-1 break-words text-xl font-bold md:text-2xl">{mxn.format(balance)}</p>
        </div>
      </div>
    </TarjetaReporte>);

}

export default ResumenGananciasPerdidas;
