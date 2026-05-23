import ReportCard from './ReportCard'
import { mxn } from '../expenses/expenseUtils'

function MonthlyReport({ rows }) {
  return (
    <ReportCard title="Resumen mensual" subtitle="Ingresos, gastos y alimentación agrupados por mes.">
      {rows.length ? (
        <div className="grid gap-3">
          {rows.map((row) => (
            <article className="rounded-2xl bg-[#F4F4F4] p-4" key={row.month}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-base font-bold text-[#07612d]">{row.month}</h3>
                <strong className={`break-words ${row.balance >= 0 ? 'text-[#2f8f36]' : 'text-[#D32F2F]'}`}>{mxn.format(row.balance)}</strong>
              </div>
              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                <span className="break-words">Ingresos: <strong>{mxn.format(row.ingresos)}</strong></span>
                <span className="break-words">Gastos: <strong>{mxn.format(row.gastos)}</strong></span>
                <span className="break-words">Alimentación: <strong>{mxn.format(row.alimentacion)}</strong></span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-sm font-semibold text-[#1d1d1b]/70">No hay datos mensuales disponibles.</p>
      )}
    </ReportCard>
  )
}

export default MonthlyReport
