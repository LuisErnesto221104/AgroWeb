import { obtenerTotalesCategoria, mxn } from './expenseUtils';

function GraficaCategoriaGasto({ expenses: gastos }) {
  const totales = Object.entries(obtenerTotalesCategoria(gastos)).sort((a, b) => b[1] - a[1]);
  const maximo = totales[0]?.[1] ?? 0;

  return (
    <section className="rounded-2xl border border-[#98a287]/18 bg-white p-4 shadow-[0_12px_28px_rgba(29,29,27,0.07)] md:p-5">
      <h2 className="text-xl font-bold text-[#07612d]">Gasto por categoría</h2>
      <div className="mt-5 grid gap-3">
        {totales.map(([category, total]) =>
        <div className="grid gap-2" key={category}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-bold text-[#1d1d1b]/75">{category}</span>
              <span className="text-sm font-bold text-[#07612d]">{mxn.format(total)}</span>
            </div>
            <div className="h-9 overflow-hidden rounded-xl bg-[#F4F4F4]">
              <div className="h-full rounded-xl bg-[#4CAF50]" style={{ width: `${maximo ? Math.max(8, Math.round(total / maximo * 100)) : 0}%` }}>
                <span className="sr-only">{mxn.format(total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>);

}

export default GraficaCategoriaGasto;
