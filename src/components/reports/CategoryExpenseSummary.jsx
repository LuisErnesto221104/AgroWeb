import ReportCard from './ReportCard'
import { getCategoryTotals, mxn } from '../expenses/expenseUtils'

function CategoryExpenseSummary({ expenses }) {
  const totals = Object.entries(getCategoryTotals(expenses)).sort((a, b) => b[1] - a[1])
  const total = totals.reduce((sum, [, value]) => sum + value, 0)

  return (
    <ReportCard title="Gastos por categoría" subtitle="Peso de cada categoría dentro de la inversión.">
      {totals.length ? (
        <div className="grid gap-4">
          {totals.map(([category, value]) => {
            const percent = total > 0 ? Math.round((value / total) * 100) : 0
            return (
              <div key={category}>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-bold text-[#1d1d1b]">{category}</span>
                  <span className="font-bold text-[#07612d]">{mxn.format(value)}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-[#F4F4F4]">
                  <div className="h-full rounded-full bg-[#07612d]" style={{ width: `${percent}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm font-semibold text-[#1d1d1b]/70">No hay gastos para mostrar.</p>
      )}
    </ReportCard>
  )
}

export default CategoryExpenseSummary
