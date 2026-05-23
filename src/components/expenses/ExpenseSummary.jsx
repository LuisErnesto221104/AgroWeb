import { getCategoryTotals, getTopEntry, mxn } from './expenseUtils'

function ExpenseSummary({ expenses }) {
  const categoryTotals = getCategoryTotals(expenses)
  const topCategory = getTopEntry(Object.entries(categoryTotals))
  const total = expenses.reduce((sum, expense) => sum + Number(expense.precio), 0)

  return (
    <section className="rounded-2xl border border-[#98a287]/18 bg-white p-4 shadow-[0_12px_28px_rgba(29,29,27,0.07)] md:p-5">
      <h2 className="text-xl font-bold text-[#07612d]">Resumen por categoría</h2>
      <p className="mt-1 text-sm text-[#98a287]">Distribución de la inversión registrada.</p>

      <div className="mt-5 grid gap-3">
        {Object.entries(categoryTotals).map(([category, value]) => {
          const percent = total > 0 ? Math.round((value / total) * 100) : 0
          return (
            <div key={category}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-semibold text-[#1d1d1b]">{category}</span>
                <span className="font-bold text-[#07612d]">{mxn.format(value)}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-[#F4F4F4]">
                <div className="h-full rounded-full bg-[#07612d]" style={{ width: `${percent}%` }} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-5 rounded-2xl bg-[#F4F4F4] p-4">
        <p className="text-xs font-bold uppercase text-[#98a287]">Categoría con mayor gasto</p>
        <p className="mt-2 break-words text-base font-bold text-[#1d1d1b] md:text-lg">{topCategory ? `${topCategory[0]} - ${mxn.format(topCategory[1])}` : 'Sin gastos'}</p>
      </div>
    </section>
  )
}

export default ExpenseSummary
