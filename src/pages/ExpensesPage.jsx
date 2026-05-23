import { useEffect, useMemo, useState } from 'react'
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { BadgeDollarSign, CalendarClock, ChartPie, LayoutGrid, List, Plus, ReceiptText, Trophy } from 'lucide-react'
import StatCard from '../components/StatCard'
import ExpenseCard from '../components/expenses/ExpenseCard'
import ExpenseCategoryChart from '../components/expenses/ExpenseCategoryChart'
import ExpenseFilters from '../components/expenses/ExpenseFilters'
import ExpenseForm from '../components/expenses/ExpenseForm'
import ExpenseSummary from '../components/expenses/ExpenseSummary'
import ExpenseTable from '../components/expenses/ExpenseTable'
import RecentExpenses from '../components/expenses/RecentExpenses'
import { getCategoryTotals, getTopEntry, mxn } from '../components/expenses/expenseUtils'
import { animals as mockAnimals } from '../data/animals'
import { expenses as mockExpenses } from '../data/expenses'

const initialFilters = {
  query: '',
  animalId: 'Todos',
  fecha: '',
  categoria: 'Todos',
  tipoCompra: '',
}

function getAnimalInvestment(expenses) {
  const animalTotals = expenses.reduce((totals, expense) => {
    const key = expense.animalIdentificador || 'Rancho general'
    totals[key] = (totals[key] ?? 0) + Number(expense.precio)
    return totals
  }, {})

  return getTopEntry(Object.entries(animalTotals))
}

function ExpensesDashboard({ animals, expenses, filters, onFiltersChange, isLoading }) {
  const [viewMode, setViewMode] = useState('cards')

  const filteredExpenses = useMemo(() => {
    const query = filters.query.trim().toLowerCase()
    const tipo = filters.tipoCompra.trim().toLowerCase()

    return expenses.filter((expense) => {
      const matchesQuery =
        !query ||
        [expense.tipoCompra, expense.descripcion, expense.categoria, expense.animalIdentificador].some((value) => String(value).toLowerCase().includes(query))
      const matchesAnimal =
        filters.animalId === 'Todos' ||
        (filters.animalId === 'general' && expense.animalId === null) ||
        expense.animalId === Number(filters.animalId)
      const matchesFecha = !filters.fecha || expense.fecha === filters.fecha
      const matchesCategoria = filters.categoria === 'Todos' || expense.categoria === filters.categoria
      const matchesTipo = !tipo || expense.tipoCompra.toLowerCase().includes(tipo)
      return matchesQuery && matchesAnimal && matchesFecha && matchesCategoria && matchesTipo
    })
  }, [expenses, filters])

  const stats = useMemo(() => {
    const total = expenses.reduce((sum, expense) => sum + Number(expense.precio), 0)
    const monthTotal = expenses.filter((expense) => expense.fecha.startsWith('2026-05')).reduce((sum, expense) => sum + Number(expense.precio), 0)
    const topCategory = getTopEntry(Object.entries(getCategoryTotals(expenses)))
    const topAnimal = getAnimalInvestment(expenses)

    return [
      { title: 'Total gastado', value: mxn.format(total), detail: 'Inversión acumulada registrada', icon: BadgeDollarSign, tone: 'primary' },
      { title: 'Gastos del mes', value: mxn.format(monthTotal), detail: 'Compras registradas en mayo 2026', icon: CalendarClock, tone: 'warning' },
      { title: 'Categoría con mayor gasto', value: topCategory?.[0] ?? 'Sin datos', detail: topCategory ? mxn.format(topCategory[1]) : 'Sin gastos', icon: ChartPie, tone: 'success' },
      { title: 'Animal con mayor inversión', value: topAnimal?.[0] ?? 'Sin datos', detail: topAnimal ? mxn.format(topAnimal[1]) : 'Sin gastos', icon: Trophy, tone: 'info' },
    ]
  }, [expenses])

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="inline-flex min-h-8 items-center gap-2 rounded-full bg-[#FFA000]/14 px-3 text-xs font-bold uppercase tracking-[0.14em] text-[#9b6300]">
            <ReceiptText size={16} />
            Control financiero
          </span>
          <h1 className="mt-4 text-3xl font-bold text-[#07612d] md:text-4xl">Gastos</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#1d1d1b]/70">Controla compras, comprobantes e inversión económica por animal y por categoría del rancho.</p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
          <div className="grid w-full grid-cols-2 gap-2 rounded-2xl bg-white p-1 shadow-[0_10px_24px_rgba(29,29,27,0.06)] sm:w-auto">
            <button className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold ${viewMode === 'cards' ? 'bg-[#07612d] text-white' : 'text-[#1d1d1b]/65'}`} onClick={() => setViewMode('cards')} type="button">
              <LayoutGrid size={17} /> Tarjetas
            </button>
            <button className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold ${viewMode === 'table' ? 'bg-[#07612d] text-white' : 'text-[#1d1d1b]/65'}`} onClick={() => setViewMode('table')} type="button">
              <List size={17} /> Tabla
            </button>
          </div>
          <Link className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#07612d] px-5 text-sm font-bold text-white shadow-[0_10px_22px_rgba(7,97,45,0.2)] sm:w-auto" to="/gastos/nuevo">
            <Plus size={18} /> Registrar Gasto
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <ExpenseFilters animals={animals} filters={filters} onChange={onFiltersChange} />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <div className="grid gap-5">
          {isLoading ? <div className="min-h-80 animate-pulse rounded-2xl bg-white shadow-[0_12px_28px_rgba(29,29,27,0.05)]" /> : null}

          {!isLoading && filteredExpenses.length > 0 && viewMode === 'cards' ? (
            <div className="grid gap-5 md:grid-cols-2">
              {filteredExpenses.map((expense) => (
                <ExpenseCard expense={expense} key={expense.id} />
              ))}
            </div>
          ) : null}

          {!isLoading && filteredExpenses.length > 0 && viewMode === 'table' ? <ExpenseTable expenses={filteredExpenses} /> : null}

          {!isLoading && filteredExpenses.length === 0 ? (
            <section className="rounded-2xl border border-[#98a287]/18 bg-white p-8 text-center shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
              <h2 className="text-2xl font-bold text-[#07612d]">No hay gastos registrados</h2>
              <p className="mt-2 text-sm text-[#1d1d1b]/70">No se encontraron compras con los filtros actuales.</p>
            </section>
          ) : null}
        </div>

        <RecentExpenses expenses={expenses} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ExpenseSummary expenses={expenses} />
        <ExpenseCategoryChart expenses={expenses} />
      </div>
    </section>
  )
}

function NewExpense({ animals, onCreate }) {
  const navigate = useNavigate()

  function handleSubmit(expense) {
    onCreate(expense)
    navigate(`/gastos/${expense.id}`, { replace: true })
  }

  return (
    <section className="grid gap-5">
      <div>
        <h1 className="text-3xl font-bold text-[#07612d]">Registrar Gasto</h1>
        <p className="mt-2 text-sm text-[#1d1d1b]/70">Captura compras del rancho y relaciónalas con un animal específico cuando aplique.</p>
      </div>
      <ExpenseForm animals={animals} onSubmit={handleSubmit} />
    </section>
  )
}

function ExpenseDetail({ expenses }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const expense = expenses.find((item) => item.id === Number(id))

  if (!expense) {
    return (
      <section className="rounded-2xl border border-[#98a287]/18 bg-white p-6 text-center shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
        <h1 className="text-2xl font-bold text-[#07612d]">Gasto no encontrado</h1>
        <button className="mt-5 rounded-2xl bg-[#07612d] px-5 py-3 text-sm font-bold text-white" onClick={() => navigate('/gastos')} type="button">
          Volver a Gastos
        </button>
      </section>
    )
  }

  return (
    <section className="grid gap-5">
      <button className="w-fit rounded-2xl border border-[#07612d]/25 bg-white px-5 py-3 text-sm font-bold text-[#07612d]" onClick={() => navigate('/gastos')} type="button">
        Volver
      </button>
      <article className="rounded-2xl border border-[#98a287]/18 bg-white p-4 shadow-[0_12px_28px_rgba(29,29,27,0.07)] md:p-6">
        <p className="text-sm font-bold text-[#4CAF50]">Gasto #{expense.id}</p>
        <h1 className="mt-2 text-3xl font-bold text-[#07612d]">{expense.tipoCompra}</h1>
        <strong className="mt-4 block break-words text-3xl font-bold text-[#1d1d1b] md:text-4xl">{mxn.format(expense.precio)}</strong>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            ['Fecha', expense.fecha],
            ['Animal relacionado', expense.animalIdentificador],
            ['Categoría', expense.categoria],
            ['Comprobante', expense.comprobante ? expense.comprobante.name || 'Cargado' : 'Sin comprobante'],
            ['ID del gasto', expense.id],
          ].map(([label, value]) => (
            <div className="rounded-2xl bg-[#F4F4F4] p-4" key={label}>
              <p className="text-xs font-bold uppercase text-[#98a287]">{label}</p>
              <p className="mt-2 text-sm font-semibold text-[#1d1d1b]">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-2xl bg-[#F4F4F4] p-4">
          <p className="text-xs font-bold uppercase text-[#98a287]">Descripción</p>
          <p className="mt-2 text-sm leading-6 text-[#1d1d1b]/75">{expense.descripcion}</p>
        </div>
        {expense.comprobante?.dataUrl ? (
          <a className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[#07612d] px-4 text-sm font-bold text-white" href={expense.comprobante.dataUrl} rel="noreferrer" target="_blank">
            Ver comprobante
          </a>
        ) : null}
      </article>
    </section>
  )
}

function ExpensesPage() {
  const [animals, setAnimals] = useState([])
  const [expenses, setExpenses] = useState([])
  const [filters, setFilters] = useState(initialFilters)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAnimals(mockAnimals)
      setExpenses(mockExpenses)
      setIsLoading(false)
    }, 350)

    return () => window.clearTimeout(timer)
  }, [])

  function createExpense(expense) {
    setExpenses((current) => [expense, ...current])
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <Routes>
          <Route index element={<ExpensesDashboard animals={animals} expenses={expenses} filters={filters} isLoading={isLoading} onFiltersChange={setFilters} />} />
          <Route path="nuevo" element={<NewExpense animals={animals} onCreate={createExpense} />} />
          <Route path=":id" element={<ExpenseDetail expenses={expenses} />} />
        </Routes>
    </div>
  )
}

export default ExpensesPage
