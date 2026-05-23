import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Beef, CircleDollarSign, FileBarChart, PackageCheck, RefreshCw, TrendingDown, TrendingUp, WalletCards } from 'lucide-react'
import StatCard from '../components/StatCard'
import AnimalInvestmentTable from '../components/reports/AnimalInvestmentTable'
import CategoryExpenseSummary from '../components/reports/CategoryExpenseSummary'
import ExportReportButton from '../components/reports/ExportReportButton'
import MonthlyReport from '../components/reports/MonthlyReport'
import ProfitLossSummary from '../components/reports/ProfitLossSummary'
import ReportCard from '../components/reports/ReportCard'
import ReportFilters from '../components/reports/ReportFilters'
import { mxn } from '../components/expenses/expenseUtils'
import { animals as mockAnimals } from '../data/animals'
import { expenses as mockExpenses } from '../data/expenses'
import { feeding as mockFeeding } from '../data/feeding'
import { healthEvents as mockHealthEvents } from '../data/healthEvents'
import { income as mockIncome } from '../data/income'

const initialFilters = {
  tipoReporte: 'general',
  animalId: 'Todos',
  desde: '',
  hasta: '',
}

function inDateRange(date, filters) {
  if (filters.desde && date < filters.desde) return false
  if (filters.hasta && date > filters.hasta) return false
  return true
}

function matchesAnimal(item, filters) {
  if (filters.animalId === 'Todos') return true
  if (filters.animalId === 'general') return item.animalId === null
  return item.animalId === Number(filters.animalId)
}

function monthKey(date) {
  return date?.slice(0, 7) ?? 'Sin fecha'
}

function buildMonthlyRows(expenses, feeding, income) {
  const months = new Map()

  function ensure(month) {
    if (!months.has(month)) months.set(month, { month, gastos: 0, alimentacion: 0, ingresos: 0, balance: 0 })
    return months.get(month)
  }

  expenses.forEach((expense) => {
    ensure(monthKey(expense.fecha)).gastos += Number(expense.precio)
  })

  feeding.forEach((item) => {
    ensure('2026-05').alimentacion += Number(item.costo)
  })

  income.forEach((item) => {
    ensure(monthKey(item.fecha)).ingresos += Number(item.monto)
  })

  return [...months.values()]
    .map((row) => ({ ...row, balance: row.ingresos - row.gastos - row.alimentacion }))
    .sort((a, b) => b.month.localeCompare(a.month))
}

function buildAnimalRows(animals, expenses, feeding, income) {
  return animals.map((animal) => {
    const gastos = expenses.filter((expense) => expense.animalId === animal.id).reduce((sum, expense) => sum + Number(expense.precio), 0)
    const alimentacion = feeding.filter((item) => item.animalId === animal.id).reduce((sum, item) => sum + Number(item.costo), 0)
    const ingresos = income.filter((item) => item.animalId === animal.id).reduce((sum, item) => sum + Number(item.monto), 0)

    return {
      id: animal.id,
      identificador: animal.identificador,
      estado: animal.estado,
      gastos,
      alimentacion,
      ingresos,
      balance: ingresos - gastos - alimentacion,
    }
  })
}

function ReportsPage() {
  const [animals, setAnimals] = useState([])
  const [expenses, setExpenses] = useState([])
  const [feeding, setFeeding] = useState([])
  const [healthEvents, setHealthEvents] = useState([])
  const [income, setIncome] = useState([])
  const [filters, setFilters] = useState(initialFilters)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAnimals(mockAnimals)
      setExpenses(mockExpenses)
      setFeeding(mockFeeding)
      setHealthEvents(mockHealthEvents)
      setIncome(mockIncome)
      setIsLoading(false)
    }, 350)

    return () => window.clearTimeout(timer)
  }, [])

  const filteredData = useMemo(() => {
    const filteredExpenses = expenses.filter((expense) => inDateRange(expense.fecha, filters) && matchesAnimal(expense, filters))
    const filteredIncome = income.filter((item) => inDateRange(item.fecha, filters) && matchesAnimal(item, filters))
    const filteredFeeding = feeding.filter((item) => matchesAnimal(item, filters))
    const filteredAnimals =
      filters.animalId === 'Todos' || filters.animalId === 'general'
        ? animals
        : animals.filter((animal) => animal.id === Number(filters.animalId))

    return { filteredExpenses, filteredIncome, filteredFeeding, filteredAnimals }
  }, [animals, expenses, feeding, filters, income])

  const analytics = useMemo(() => {
    const totalGastos = filteredData.filteredExpenses.reduce((acc, item) => acc + Number(item.precio), 0)
    const totalAlimentacion = filteredData.filteredFeeding.reduce((acc, item) => acc + Number(item.costo), 0)
    const totalIngresos = filteredData.filteredIncome.reduce((acc, item) => acc + Number(item.monto), 0)
    const perdidas = totalGastos + totalAlimentacion
    const ganancias = Math.max(totalIngresos - perdidas, 0)
    const balance = totalIngresos - perdidas
    const inversionPromedio = filteredData.filteredAnimals.length ? perdidas / filteredData.filteredAnimals.length : 0
    const animalRows = buildAnimalRows(filteredData.filteredAnimals, filteredData.filteredExpenses, filteredData.filteredFeeding, filteredData.filteredIncome)
    const monthlyRows = buildMonthlyRows(filteredData.filteredExpenses, filteredData.filteredFeeding, filteredData.filteredIncome)

    return {
      totalGastos,
      totalAlimentacion,
      totalIngresos,
      perdidas,
      ganancias,
      balance,
      inversionPromedio,
      animalRows,
      monthlyRows,
    }
  }, [filteredData])

  const stats = useMemo(
    () => [
      { title: 'Total de animales', value: animals.length, detail: 'Animales registrados en inventario', icon: PackageCheck, tone: 'primary' },
      { title: 'Animales activos', value: animals.filter((animal) => animal.estado === 'Activo').length, detail: 'Disponibles en operación', icon: Beef, tone: 'success' },
      { title: 'Animales vendidos', value: animals.filter((animal) => animal.estado === 'Vendido').length, detail: 'Con ingreso o historial de venta', icon: TrendingUp, tone: 'info' },
      { title: 'Animales fallecidos', value: animals.filter((animal) => animal.estado === 'Fallecido').length, detail: 'Registrados como pérdida operativa', icon: TrendingDown, tone: 'danger' },
      { title: 'Total de gastos', value: mxn.format(analytics.perdidas), detail: 'Gastos más alimentación', icon: WalletCards, tone: 'warning' },
      { title: 'Total de ingresos', value: mxn.format(analytics.totalIngresos), detail: 'Ventas e ingresos simulados', icon: CircleDollarSign, tone: 'success' },
      { title: 'Ganancias', value: mxn.format(analytics.ganancias), detail: 'Ingresos menos pérdidas si es positivo', icon: TrendingUp, tone: 'success' },
      { title: 'Balance general', value: mxn.format(analytics.balance), detail: 'Resultado económico del periodo', icon: BarChart3, tone: analytics.balance >= 0 ? 'primary' : 'danger' },
    ],
    [analytics, animals],
  )

  function exportReport() {
    setMessage(`Reporte "${filters.tipoReporte}" preparado para exportación PDF. La descarga real queda lista para integrar backend.`)
    window.setTimeout(() => setMessage(''), 4500)
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 md:px-6 md:py-6">
        <section className="grid gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex min-h-8 items-center gap-2 rounded-full bg-[#1f7a8c]/10 px-3 text-xs font-bold uppercase tracking-[0.14em] text-[#1f7a8c]">
                <FileBarChart size={16} />
                Análisis económico
              </span>
              <h1 className="mt-4 break-words text-2xl font-bold text-[#07612d] sm:text-3xl md:text-4xl">Reporte de Inversión</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#1d1d1b]/70">
                Visualiza cuánto invierte, gana o pierde el rancho con datos de animales, gastos, sanidad, alimentación e ingresos simulados.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <button className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#07612d] px-5 text-sm font-bold text-white shadow-[0_10px_22px_rgba(7,97,45,0.2)] sm:w-auto" type="button">
                <RefreshCw size={18} /> Generar Reporte
              </button>
              <ExportReportButton onExport={exportReport} />
            </div>
          </div>

          {message ? <div className="rounded-2xl border border-[#4CAF50]/20 bg-[#4CAF50]/10 p-4 text-sm font-bold text-[#2f8f36]">{message}</div> : null}

          <ReportFilters animals={animals} filters={filters} onChange={setFilters} />

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div className="min-h-40 animate-pulse rounded-2xl bg-white shadow-[0_12px_28px_rgba(29,29,27,0.05)]" key={item} />
              ))}
            </div>
          ) : null}

          {!isLoading ? (
            <>
              <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <StatCard key={stat.title} {...stat} />
                ))}
              </div>

              <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
                <ProfitLossSummary totalGastos={analytics.perdidas} totalIngresos={analytics.totalIngresos} balance={analytics.balance} />
                <ReportCard title="Estado del rancho" subtitle="Indicadores adicionales para toma de decisiones.">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-[#F4F4F4] p-4">
                      <p className="text-xs font-bold uppercase text-[#98a287]">Inversión promedio por animal</p>
                      <p className="mt-2 break-words text-xl font-bold text-[#07612d] md:text-2xl">{mxn.format(analytics.inversionPromedio)}</p>
                    </div>
                    <div className="rounded-2xl bg-[#F4F4F4] p-4">
                      <p className="text-xs font-bold uppercase text-[#98a287]">Eventos sanitarios</p>
                      <p className="mt-2 text-2xl font-bold text-[#07612d]">{healthEvents.length}</p>
                    </div>
                    <div className="rounded-2xl bg-[#F4F4F4] p-4">
                      <p className="text-xs font-bold uppercase text-[#98a287]">Pérdidas</p>
                      <p className="mt-2 break-words text-xl font-bold text-[#D32F2F] md:text-2xl">{mxn.format(analytics.perdidas)}</p>
                    </div>
                    <div className="rounded-2xl bg-[#F4F4F4] p-4">
                      <p className="text-xs font-bold uppercase text-[#98a287]">Ganancias netas</p>
                      <p className="mt-2 break-words text-xl font-bold text-[#2f8f36] md:text-2xl">{mxn.format(analytics.ganancias)}</p>
                    </div>
                  </div>
                </ReportCard>
              </div>

              <div className="grid min-w-0 gap-6 xl:grid-cols-2">
                <CategoryExpenseSummary expenses={filteredData.filteredExpenses} />
                <MonthlyReport rows={analytics.monthlyRows} />
              </div>

              <AnimalInvestmentTable rows={analytics.animalRows} />

              {filteredData.filteredExpenses.length === 0 && filteredData.filteredIncome.length === 0 ? (
                <section className="rounded-2xl border border-[#98a287]/18 bg-white p-8 text-center shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
                  <h2 className="text-2xl font-bold text-[#07612d]">No hay datos para el reporte</h2>
                  <p className="mt-2 text-sm text-[#1d1d1b]/70">Ajusta el periodo o selecciona otro animal para generar resultados.</p>
                </section>
              ) : null}
            </>
          ) : null}
        </section>
    </div>
  )
}

export default ReportsPage
