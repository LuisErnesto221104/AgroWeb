import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Beef, CircleDollarSign, HeartPulse, PackageCheck, Search, Settings, TrendingUp } from 'lucide-react'
import DashboardCard from '../components/DashboardCard'
import ModuleCard from '../components/ModuleCard'
import { animalCatalog } from '../data/animalCatalog'
import { animals } from '../data/animals'
import { expenses } from '../data/expenses'
import { feeding } from '../data/feeding'
import { healthEvents } from '../data/healthEvents'
import { readStorage } from '../utils/storage'

const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })

const modules = [
  {
    title: 'Gestión Ganadera',
    description: 'Inventario, registro de animales, estados productivos y seguimiento general del hato.',
    to: '/animales',
    icon: PackageCheck,
    area: 'Operación',
    accent: 'bg-[#07612d]/10 text-[#07612d]',
  },
  {
    title: 'Sanidad',
    description: 'Vacunas, tratamientos, revisiones clínicas y próximos eventos sanitarios.',
    to: '/sanidad',
    icon: HeartPulse,
    area: 'Salud',
    accent: 'bg-[#D32F2F]/10 text-[#D32F2F]',
  },
  {
    title: 'Gastos',
    description: 'Control de egresos por medicinas, mantenimiento, transporte y operación diaria.',
    to: '/gastos',
    icon: CircleDollarSign,
    area: 'Finanzas',
    accent: 'bg-[#FFA000]/14 text-[#9b6300]',
  },
  {
    title: 'Reporte de Inversión',
    description: 'Resumen financiero del rancho para analizar inversión, gastos y balance general.',
    to: '/reportes',
    icon: BarChart3,
    area: 'Finanzas',
    accent: 'bg-[#1f7a8c]/10 text-[#1f7a8c]',
  },
  {
    title: 'Control de Alimentación',
    description: 'Registro de alimento, raciones, costos y consumo por animal o grupo.',
    to: '/alimentacion',
    icon: Beef,
    area: 'Operación',
    accent: 'bg-[#4CAF50]/12 text-[#2f8f36]',
  },
  {
    title: 'Configuración',
    description: 'Usuarios, roles y permisos para controlar el acceso a las funciones del sistema.',
    to: '/configuracion',
    icon: Settings,
    area: 'Administración',
    accent: 'bg-[#1f7a8c]/10 text-[#1f7a8c]',
  },
]

const filters = ['Todos', 'Operación', 'Salud', 'Finanzas', 'Administración']

function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedArea, setSelectedArea] = useState('Todos')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSpecies, setSelectedSpecies] = useState('Bovino')

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 350)
    return () => window.clearTimeout(timer)
  }, [])

  const dashboardData = useMemo(() => {
    const currentAnimals = readStorage('agroweb.animals', animals)
    const currentExpenses = readStorage('agroweb.expenses', expenses)
    const currentFeeding = readStorage('agroweb.feeding', feeding)
    const currentHealthEvents = readStorage('agroweb.healthEvents', healthEvents)
    return { currentAnimals, currentExpenses, currentFeeding, currentHealthEvents }
  }, [])

  const typeSummaries = useMemo(
    () =>
      Object.entries(animalCatalog).map(([species, catalog]) => {
        const animalsBySpecies = dashboardData.currentAnimals.filter((animal) => animal.especie === species)
        const ids = new Set(animalsBySpecies.map((animal) => animal.id))
        const typeExpenses = dashboardData.currentExpenses.filter((expense) => ids.has(expense.animalId)).reduce((sum, expense) => sum + Number(expense.precio ?? 0), 0)
        const typeFeeding = dashboardData.currentFeeding.filter((item) => ids.has(item.animalId)).reduce((sum, item) => sum + Number(item.costo ?? item.costoAproximado ?? 0), 0)
        const typeHealth = dashboardData.currentHealthEvents.filter((event) => ids.has(event.animalId))
        return { species, catalog, count: animalsBySpecies.length, active: animalsBySpecies.filter((animal) => animal.estado === 'Activo').length, costs: typeExpenses + typeFeeding, events: typeHealth.length }
      }),
    [dashboardData],
  )

  const selectedSummary = typeSummaries.find((summary) => summary.species === selectedSpecies) ?? typeSummaries[0]

  const filteredModules = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return modules.filter((module) => {
      const matchesArea = selectedArea === 'Todos' || module.area === selectedArea
      const matchesQuery = [module.title, module.description, module.area].some((value) => value.toLowerCase().includes(query))
      return matchesArea && matchesQuery
    })
  }, [searchTerm, selectedArea])

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 md:px-6">
        <DashboardCard className="overflow-hidden">
          <section className="grid gap-6 p-4 md:p-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-center">
            <div>
              <span className="inline-flex min-h-8 items-center gap-2 rounded-full bg-[#4CAF50]/12 px-3 text-xs font-bold uppercase tracking-[0.14em] text-[#07612d]">
                <TrendingUp size={16} />
                Panel central del rancho
              </span>
              <h1 className="mt-5 text-3xl font-bold leading-tight text-[#07612d] md:text-5xl">AgroWeb</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#1d1d1b]/72 md:text-lg">
                Sistema web para la gestión ganadera, sanitaria, alimenticia y financiera del rancho
              </p>
              <div className="mt-7 grid gap-3 sm:flex sm:flex-wrap">
                {filters.map((filter) => (
                  <button
                    className={`min-h-10 rounded-full px-4 text-sm font-bold transition ${
                      selectedArea === filter ? 'bg-[#07612d] text-white shadow-[0_10px_22px_rgba(7,97,45,0.18)]' : 'bg-[#F4F4F4] text-[#1d1d1b]/70 hover:text-[#07612d]'
                    }`}
                    key={filter}
                    onClick={() => setSelectedArea(filter)}
                    type="button"
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <label className="relative mt-5 block max-w-xl">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98a287]" size={18} />
                <input
                  className="h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] pl-10 pr-4 text-sm outline-none transition placeholder:text-[#98a287] focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10"
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar módulo..."
                  value={searchTerm}
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#07612d] p-5 text-white">
                <p className="text-sm font-semibold text-white/75">Módulos activos</p>
                <strong className="mt-2 block text-4xl font-bold">{modules.length}</strong>
                <p className="mt-3 text-sm leading-6 text-white/78">Accesos principales del sistema disponibles desde este Home.</p>
              </div>
              <div className="rounded-2xl bg-[#F4F4F4] p-5">
                <p className="text-sm font-semibold text-[#98a287]">Alimentación registrada</p>
                <strong className="mt-2 block text-4xl font-bold text-[#1d1d1b]">{readStorage('agroweb.feeding', feeding).length}</strong>
                <p className="mt-3 text-sm leading-6 text-[#1d1d1b]/70">Registros mock usados para calcular costos del rancho.</p>
              </div>
            </div>
          </section>
        </DashboardCard>

        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-[#07612d]">Tipos de animales del rancho</h2>
            <p className="mt-1 text-sm text-[#98a287]">Selecciona una especie para ver inventario, sanidad, costos y recomendaciones.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {isLoading
              ? [1, 2, 3, 4].map((item) => <div className="min-h-56 animate-pulse rounded-2xl bg-white" key={item} />)
              : typeSummaries.map((summary) => (
                  <button className={`overflow-hidden rounded-2xl border bg-white text-left shadow-[0_12px_28px_rgba(29,29,27,0.07)] transition ${selectedSpecies === summary.species ? 'border-[#07612d]' : 'border-[#98a287]/18 hover:border-[#07612d]/35'}`} key={summary.species} onClick={() => setSelectedSpecies(summary.species)} type="button">
                    <div className="flex h-40 w-full items-center justify-center bg-[#F4F4F4] p-3">
                      <img alt={summary.species} className="max-h-full w-full object-contain" src={summary.catalog.image} />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-[#07612d]">{summary.species}</h3>
                      <p className="mt-1 text-sm font-semibold text-[#1d1d1b]/70">{summary.count} registrados · {summary.active} activos</p>
                    </div>
                  </button>
                ))}
          </div>

          {selectedSummary ? (
            <DashboardCard className="mt-6 p-5">
              <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
                <div className="flex min-h-72 items-center justify-center rounded-2xl bg-[#F4F4F4] p-4">
                  <img alt={selectedSummary.species} className="max-h-72 w-full object-contain" src={selectedSummary.catalog.image} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#07612d]">{selectedSummary.species}</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-[#F4F4F4] p-4"><p className="text-xs font-bold uppercase text-[#98a287]">Cantidad</p><p className="mt-2 text-2xl font-bold">{selectedSummary.count}</p></div>
                    <div className="rounded-2xl bg-[#F4F4F4] p-4"><p className="text-xs font-bold uppercase text-[#98a287]">Eventos sanitarios</p><p className="mt-2 text-2xl font-bold">{selectedSummary.events}</p></div>
                    <div className="rounded-2xl bg-[#F4F4F4] p-4"><p className="text-xs font-bold uppercase text-[#98a287]">Costos</p><p className="mt-2 break-words text-xl font-bold">{currency.format(selectedSummary.costs)}</p></div>
                  </div>
                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    <div className="rounded-2xl bg-[#F4F4F4] p-4">
                      <p className="text-xs font-bold uppercase text-[#98a287]">Razas comunes en México</p>
                      <p className="mt-2 text-sm leading-6 text-[#1d1d1b]/75">{selectedSummary.catalog.razas.join(', ')}</p>
                    </div>
                    <div className="rounded-2xl bg-[#F4F4F4] p-4">
                      <p className="text-xs font-bold uppercase text-[#98a287]">Nutrición recomendada</p>
                      <p className="mt-2 text-sm leading-6 text-[#1d1d1b]/75">{selectedSummary.catalog.nutricion}</p>
                    </div>
                  </div>
                  <div className="mt-3 rounded-2xl bg-[#07612d]/8 p-4">
                    <p className="text-xs font-bold uppercase text-[#07612d]">Recomendación profesional</p>
                    <p className="mt-2 text-sm leading-6 text-[#1d1d1b]/75">{selectedSummary.catalog.recomendaciones}</p>
                  </div>
                </div>
              </div>
            </DashboardCard>
          ) : null}
        </section>

        <section>
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#07612d]">Accesos rápidos</h2>
              <p className="mt-1 text-sm text-[#98a287]">Entra a cada módulo sin recargar la página usando React Router.</p>
            </div>
            <span className="text-sm font-bold text-[#07612d]">{filteredModules.length} módulos visibles</span>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredModules.map((module) => (
              <ModuleCard key={module.to} {...module} />
            ))}
          </div>

          {filteredModules.length === 0 ? (
            <DashboardCard className="mt-5 p-6 text-sm font-semibold text-[#1d1d1b]/70">
              No hay módulos que coincidan con "{searchTerm}" en el filtro {selectedArea}.
            </DashboardCard>
          ) : null}
        </section>
    </div>
  )
}

export default Home
