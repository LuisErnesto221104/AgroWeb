import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Beef, CalendarClock, CircleDollarSign, HeartPulse, PackageCheck, Scale, Search, Settings, ShieldCheck, TrendingUp, WalletCards } from 'lucide-react'
import DashboardCard from '../components/DashboardCard'
import ModuleCard from '../components/ModuleCard'
import StatCard from '../components/StatCard'
import { animals } from '../data/animals'
import { expenses } from '../data/expenses'
import { feeding } from '../data/feeding'
import { healthEvents } from '../data/healthEvents'

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

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 350)
    return () => window.clearTimeout(timer)
  }, [])

  const stats = useMemo(() => {
    const animalesActivos = animals.filter((animal) => animal.estado === 'Activo')
    const totalGastos = expenses.reduce((acc, gasto) => acc + gasto.precio, 0)
    const totalAlimentacion = feeding.reduce((acc, registro) => acc + registro.costo, 0)
    const proximosEventos = healthEvents.filter((event) => event.estado === 'Pendiente' || event.estado === 'Programado')
    const balanceGeneral = 125000 - totalGastos - totalAlimentacion

    return [
      { title: 'Total de animales', value: animals.length, detail: 'Cabezas registradas en inventario', icon: PackageCheck, tone: 'primary' },
      { title: 'Animales activos', value: animalesActivos.length, detail: 'Listos para producción o seguimiento', icon: ShieldCheck, tone: 'success' },
      { title: 'Gastos totales', value: currency.format(totalGastos + totalAlimentacion), detail: 'Gastos operativos y alimentación', icon: WalletCards, tone: 'warning' },
      { title: 'Próximos eventos sanitarios', value: proximosEventos.length, detail: 'Vacunas, revisiones y tratamientos', icon: CalendarClock, tone: 'danger' },
      { title: 'Balance general del rancho', value: currency.format(balanceGeneral), detail: 'Estimación con ingresos simulados', icon: Scale, tone: 'info' },
    ]
  }, [])

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
                <strong className="mt-2 block text-4xl font-bold text-[#1d1d1b]">{feeding.length}</strong>
                <p className="mt-3 text-sm leading-6 text-[#1d1d1b]/70">Registros mock usados para calcular costos del rancho.</p>
              </div>
            </div>
          </section>
        </DashboardCard>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {isLoading
            ? stats.map((stat) => (
                <div className="min-h-40 animate-pulse rounded-2xl bg-white shadow-[0_12px_28px_rgba(29,29,27,0.05)]" key={stat.title} />
              ))
            : stats.map((stat) => <StatCard key={stat.title} {...stat} />)}
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
