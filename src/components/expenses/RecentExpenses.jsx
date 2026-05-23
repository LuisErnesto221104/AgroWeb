import { Clock3 } from 'lucide-react'
import { mxn } from './expenseUtils'

function RecentExpenses({ expenses }) {
  const recent = [...expenses].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 5)

  return (
    <section className="rounded-2xl border border-[#98a287]/18 bg-white p-5 shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-[#FFA000]/14 text-[#9b6300]">
          <Clock3 size={22} />
        </span>
        <div>
          <h2 className="text-xl font-bold text-[#07612d]">Gastos recientes</h2>
          <p className="text-sm text-[#98a287]">Últimas compras registradas.</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {recent.map((expense) => (
          <article className="rounded-2xl bg-[#F4F4F4] p-4" key={expense.id}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[#1d1d1b]">{expense.tipoCompra}</p>
                <p className="text-xs text-[#98a287]">
                  {expense.fecha} - {expense.animalIdentificador}
                </p>
              </div>
              <strong className="text-sm text-[#07612d]">{mxn.format(expense.precio)}</strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default RecentExpenses
