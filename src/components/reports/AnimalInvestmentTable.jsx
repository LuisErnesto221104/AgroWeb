import TarjetaReporte from './ReportCard';
import { mxn } from '../expenses/expenseUtils';

function TablaInversionAnimal({ rows: filas }) {
  return (
    <TarjetaReporte title="Resumen por animal" subtitle="Inversión, ingresos y balance individual.">
      {filas.length ?
      <>
          <div className="grid gap-3 md:hidden">
            {filas.map((fila) =>
          <article className="rounded-2xl bg-[#F4F4F4] p-4" key={fila.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-bold text-[#07612d]">{fila.identificador}</p>
                    <p className="mt-1 text-xs font-bold uppercase text-[#98a287]">{fila.estado}</p>
                  </div>
                  <strong className={`break-words text-sm ${fila.balance >= 0 ? 'text-[#2f8f36]' : 'text-[#D32F2F]'}`}>{mxn.format(fila.balance)}</strong>
                </div>
                <div className="mt-4 grid gap-2 text-sm">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="text-[#1d1d1b]/70">Gastos</span>
                    <strong>{mxn.format(fila.gastos)}</strong>
                  </div>
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="text-[#1d1d1b]/70">Alimentación</span>
                    <strong>{mxn.format(fila.alimentacion)}</strong>
                  </div>
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="text-[#1d1d1b]/70">Ingresos</span>
                    <strong>{mxn.format(fila.ingresos)}</strong>
                  </div>
                </div>
              </article>
          )}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left text-sm">
              <thead>
                <tr className="text-xs font-bold uppercase text-[#98a287]">
                  <th className="px-3 py-2">Animal</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="px-3 py-2">Gastos</th>
                  <th className="px-3 py-2">Alimentación</th>
                  <th className="px-3 py-2">Ingresos</th>
                  <th className="px-3 py-2">Balance</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((fila) =>
              <tr className="bg-[#F4F4F4]" key={fila.id}>
                    <td className="rounded-l-2xl px-3 py-3 font-bold text-[#07612d]">{fila.identificador}</td>
                    <td className="px-3 py-3">{fila.estado}</td>
                    <td className="px-3 py-3">{mxn.format(fila.gastos)}</td>
                    <td className="px-3 py-3">{mxn.format(fila.alimentacion)}</td>
                    <td className="px-3 py-3">{mxn.format(fila.ingresos)}</td>
                    <td className={`rounded-r-2xl px-3 py-3 font-bold ${fila.balance >= 0 ? 'text-[#2f8f36]' : 'text-[#D32F2F]'}`}>{mxn.format(fila.balance)}</td>
                  </tr>
              )}
              </tbody>
            </table>
          </div>
        </> :

      <p className="text-sm font-semibold text-[#1d1d1b]/70">No hay animales para el filtro seleccionado.</p>
      }
    </TarjetaReporte>);

}

export default TablaInversionAnimal;
