import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, ReceiptText, Tag } from 'lucide-react'
import { mxn } from './expenseUtils'

function ExpenseCard({ expense }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-[#98a287]/18 bg-white p-5 shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words text-sm font-bold text-[#07612d]">{expense.animalIdentificador}</p>
          <h3 className="mt-1 break-words text-xl font-bold text-[#1d1d1b]">{expense.tipoCompra}</h3>
        </div>
        <strong className="max-w-full break-words rounded-full bg-[#FFA000]/14 px-3 py-1 text-sm text-[#9b6300]">{mxn.format(expense.precio)}</strong>
      </div>

      <div className="mt-4 grid gap-2 text-sm font-semibold text-[#1d1d1b]/70">
        <span className="inline-flex min-w-0 items-start gap-2">
          <Tag size={17} className="mt-0.5 shrink-0 text-[#98a287]" /> <span className="break-words">{expense.categoria}</span>
        </span>
        <span className="inline-flex min-w-0 items-start gap-2">
          <CalendarDays size={17} className="mt-0.5 shrink-0 text-[#98a287]" /> <span className="break-words">{expense.fecha}</span>
        </span>
        <span className="inline-flex min-w-0 items-start gap-2">
          <ReceiptText size={17} className="mt-0.5 shrink-0 text-[#98a287]" /> <span className="break-words">{expense.comprobante ? 'Con comprobante' : 'Sin comprobante'}</span>
        </span>
      </div>

      <p className="mt-4 flex-1 break-words text-sm leading-6 text-[#1d1d1b]/70">{expense.descripcion}</p>
      <Link className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#07612d] px-4 text-sm font-bold text-white" to={`/gastos/${expense.id}`}>
        Ver detalle <ArrowRight size={17} />
      </Link>
    </article>
  )
}

export default ExpenseCard
