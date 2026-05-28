import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import { mxn } from './expenseUtils';

function TablaGasto({ expenses: gastos }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#98a287]/18 bg-white shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
      <table className="w-full min-w-[920px] border-separate border-spacing-y-2 p-3 text-left text-sm">
        <thead>
          <tr className="text-xs font-bold uppercase text-[#98a287]">
            <th className="px-3 py-2">Tipo</th>
            <th className="px-3 py-2">Categoría</th>
            <th className="px-3 py-2">Animal</th>
            <th className="px-3 py-2">Fecha</th>
            <th className="px-3 py-2">Precio</th>
            <th className="px-3 py-2">Comprobante</th>
            <th className="px-3 py-2">Detalle</th>
          </tr>
        </thead>
        <tbody>
          {gastos.map((gasto) =>
          <tr className="bg-[#F4F4F4]" key={gasto.id}>
              <td className="rounded-l-2xl px-3 py-3 break-words font-bold text-[#07612d]">{gasto.tipoCompra}</td>
              <td className="px-3 py-3 break-words font-semibold">{gasto.categoria}</td>
              <td className="px-3 py-3 break-words">{gasto.animalIdentificador}</td>
              <td className="px-3 py-3 break-words">{gasto.fecha}</td>
              <td className="px-3 py-3 break-words font-bold">{mxn.format(gasto.precio)}</td>
              <td className="px-3 py-3 break-words">{gasto.comprobante ? 'Cargado' : 'Sin archivo'}</td>
              <td className="rounded-r-2xl px-3 py-3">
                <Link aria-label="Ver gasto" className="inline-flex size-9 items-center justify-center rounded-xl bg-white text-[#07612d]" to={`/gastos/${gasto.id}`}>
                  <Eye size={17} />
                </Link>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>);

}

export default TablaGasto;
