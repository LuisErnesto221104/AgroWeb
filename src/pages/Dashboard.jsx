import { useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  AlertTriangle,
  BarChart3,
  Bell,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  FileBarChart,
  HeartPulse,
  Home,
  LogOut,
  Menu,
  PackageCheck,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Stethoscope,
  Syringe,
  TrendingUp,
  WalletCards,
  Wifi,
  X,
} from 'lucide-react'
import { useDashboard } from '../hooks/useDashboard'
import { useAuth } from '../hooks/useAuth'
import { fetchDashboard, toggleTaskStatus } from '../store/dashboardSlice'
import { useAppDispatch } from '../store/hooks'

const toneStyles = {
  primary: { text: 'text-[#07612d]', bg: 'bg-[#07612d]/10', border: 'border-[#07612d]/20' },
  success: { text: 'text-[#4CAF50]', bg: 'bg-[#4CAF50]/10', border: 'border-[#4CAF50]/20' },
  warning: { text: 'text-[#FFA000]', bg: 'bg-[#FFA000]/10', border: 'border-[#FFA000]/25' },
  danger: { text: 'text-[#D32F2F]', bg: 'bg-[#D32F2F]/10', border: 'border-[#D32F2F]/20' },
  muted: { text: 'text-[#98a287]', bg: 'bg-[#F4F4F4]', border: 'border-[#98a287]/20' },
}

const priorityTone = {
  Urgente: 'danger',
  Próximo: 'warning',
  Normal: 'primary',
  Completado: 'success',
}

const statIcons = {
  'Animales activos': PackageCheck,
  'En observación': Stethoscope,
  'Eventos próximos': Syringe,
  'Gastos del mes': CircleDollarSign,
  'Tareas pendientes': ClipboardList,
  'Alertas urgentes': AlertTriangle,
}

const healthIcons = {
  'Vacunas pendientes': Syringe,
  'Desparasitaciones próximas': ShieldCheck,
  'Revisiones clínicas': Stethoscope,
  'Animales en observación': HeartPulse,
  'Historial reciente': CheckCircle2,
}

const navItems = [
  { label: 'Inicio', to: '/', icon: Home },
  { label: 'Animales', to: '/animales', icon: PackageCheck },
  { label: 'Sanitario', to: '/sanitario', icon: HeartPulse },
  { label: 'Costos', to: '/costos', icon: WalletCards },
  { label: 'Reportes', to: '/reportes', icon: FileBarChart },
  { label: 'Notificaciones', to: '/', icon: Bell },
  { label: 'Configuración', to: '/', icon: Settings },
]

const quickActions = [
  { title: 'Registrar animal', description: 'Alta rápida con arete o SINIGA', icon: PackageCheck },
  { title: 'Evento sanitario', description: 'Vacuna, revisión o tratamiento', icon: HeartPulse },
  { title: 'Registrar gasto', description: 'Captura costos del rancho', icon: WalletCards },
  { title: 'Generar reporte', description: 'Resumen operativo y costos', icon: BarChart3 },
]

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })

function StatusBadge({ label }) {
  const tone = priorityTone[label] ?? (label === 'Tratamiento' || label === 'Observación' ? 'warning' : 'primary')
  const styles = toneStyles[tone]

  return <span className={`inline-flex min-h-7 items-center rounded-full border px-3 py-1 text-xs font-semibold ${styles.bg} ${styles.text} ${styles.border}`}>{label}</span>
}

function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {isOpen ? <button aria-label="Cerrar menú" className="fixed inset-0 z-30 bg-[#1d1d1b]/30 lg:hidden" onClick={onClose} type="button" /> : null}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-[#98a287]/18 bg-white px-4 py-5 shadow-[0_16px_40px_rgba(29,29,27,0.12)] transition-transform lg:translate-x-0 lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[#07612d] text-lg font-bold text-white">A</div>
            <div>
              <p className="text-base font-bold text-[#07612d]">AgroWeb</p>
              <p className="text-xs text-[#98a287]">Gestión ganadera</p>
            </div>
          </div>
          <button className="rounded-xl p-2 text-[#07612d] lg:hidden" onClick={onClose} type="button" aria-label="Cerrar menú">
            <X size={22} />
          </button>
        </div>

        <nav className="mt-8 space-y-2">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              className={({ isActive }) =>
                `flex min-h-12 w-full items-center gap-3 rounded-2xl px-4 text-sm font-semibold transition ${
                  isActive ? 'bg-[#07612d] text-white shadow-[0_10px_24px_rgba(7,97,45,0.2)]' : 'text-[#1d1d1b] hover:bg-[#F4F4F4]'
                }`
              }
              end={to === '/'}
              key={label}
              onClick={onClose}
              to={to}
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} className={isActive ? 'text-white' : 'text-[#98a287]'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}

function Dashboard() {
  const dispatch = useAppDispatch()
  const { logout, user } = useAuth()
  const { stats, animals, tasks, costs, healthSummary, status, error } = useDashboard()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredAnimals = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return animals

    return animals.filter((animal) =>
      [animal.id, animal.name, animal.type, animal.status, animal.last, animal.next].some((value) => value.toLowerCase().includes(query)),
    )
  }, [animals, searchTerm])

  const attentionAnimals = animals.filter((animal) => animal.priority === 'Urgente' || animal.status === 'Tratamiento' || animal.status === 'Observación')

  return (
    <div className="min-h-screen bg-[#F4F4F4] font-['Poppins',sans-serif] text-[#1d1d1b]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-[#98a287]/18 bg-white/95 px-4 py-4 shadow-[0_6px_22px_rgba(29,29,27,0.05)] backdrop-blur md:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              <button className="flex size-11 items-center justify-center rounded-2xl border border-[#98a287]/25 bg-white text-[#07612d] lg:hidden" onClick={() => setIsSidebarOpen(true)} type="button" aria-label="Abrir menú">
                <Menu size={22} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-[#07612d] md:text-3xl">Dashboard ganadero</h1>
                <p className="text-sm text-[#98a287]">Sesión activa: {user?.name}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <label className="relative min-w-0 md:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98a287]" size={18} />
                <input
                  className="h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] pl-10 pr-4 text-sm text-[#1d1d1b] outline-none transition placeholder:text-[#98a287] focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10"
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Buscar animal, arete o evento..."
                  value={searchTerm}
                />
              </label>
              <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#07612d]/25 bg-white px-5 text-sm font-semibold text-[#07612d]" onClick={() => dispatch(fetchDashboard())} type="button">
                <RefreshCw size={17} /> Sincronizar
              </button>
              <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#07612d] px-5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(7,97,45,0.2)]" onClick={logout} type="button">
                <LogOut size={17} /> Salir
              </button>
              <span className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl bg-[#4CAF50]/10 px-4 text-sm font-semibold text-[#4CAF50]">
                <Wifi size={17} /> API
              </span>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 md:px-6">
          {status === 'loading' ? <div className="rounded-2xl bg-white p-5 text-sm font-semibold text-[#07612d]">Cargando datos desde Node...</div> : null}
          {error ? <div className="rounded-2xl border border-[#D32F2F]/20 bg-[#D32F2F]/10 p-5 text-sm font-semibold text-[#D32F2F]">{error}</div> : null}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat) => {
              const Icon = statIcons[stat.title] ?? BarChart3
              const styles = toneStyles[stat.tone]
              return (
                <article className="rounded-2xl border border-[#98a287]/18 bg-white p-5 text-left shadow-[0_10px_30px_rgba(29,29,27,0.07)]" key={stat.title}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-[#98a287]">{stat.title}</p>
                      <strong className="mt-2 block text-3xl font-bold text-[#1d1d1b]">{stat.value}</strong>
                    </div>
                    <span className={`rounded-2xl p-3 ${styles.bg} ${styles.text}`}>
                      <Icon size={28} strokeWidth={2.2} />
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-[#1d1d1b]/75">{stat.detail}</p>
                </article>
              )
            })}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
            <div className="rounded-2xl bg-white p-5 shadow-[0_10px_30px_rgba(29,29,27,0.07)]">
              <h2 className="text-xl font-bold text-[#07612d]">Acciones rápidas</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {quickActions.map(({ title, description, icon: Icon }) => (
                  <button className="group flex min-h-28 w-full items-center gap-4 rounded-2xl border border-[#98a287]/18 bg-white p-4 text-left shadow-[0_8px_24px_rgba(29,29,27,0.06)] transition hover:border-[#07612d]/35" key={title} type="button">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#07612d]/10 text-[#07612d] transition group-hover:bg-[#07612d] group-hover:text-white">
                      <Icon size={24} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-[#1d1d1b]">{title}</span>
                      <span className="mt-1 block text-xs leading-5 text-[#98a287]">{description}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-[0_10px_30px_rgba(29,29,27,0.07)]">
              <h2 className="text-xl font-bold text-[#07612d]">Próximas tareas</h2>
              <div className="mt-4 space-y-4">
                {['Hoy', 'Mañana', 'Esta semana'].map((group) => (
                  <div key={group}>
                    <p className="mb-2 text-sm font-bold text-[#1d1d1b]">{group}</p>
                    <div className="space-y-2">
                      {tasks
                        .filter((task) => task.group === group)
                        .map((task) => (
                          <div className="flex items-start gap-3 rounded-2xl bg-[#F4F4F4] p-3" key={task.id}>
                            <button
                              className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border ${task.completed ? 'border-[#4CAF50] bg-[#4CAF50] text-white' : 'border-[#98a287]/45 bg-white text-[#98a287]'}`}
                              onClick={() => dispatch(toggleTaskStatus(task.id))}
                              type="button"
                              aria-label="Marcar tarea como completada"
                            >
                              <CheckCircle2 size={17} />
                            </button>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-semibold text-[#98a287]">{task.date}</span>
                                <StatusBadge label={task.completed ? 'Completado' : task.priority} />
                              </div>
                              <p className={`mt-1 text-sm font-semibold ${task.completed ? 'text-[#98a287] line-through' : 'text-[#1d1d1b]'}`}>{task.task}</p>
                              <p className="text-xs text-[#98a287]">{task.module}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-[0_10px_30px_rgba(29,29,27,0.07)]">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#07612d]">Animales que requieren atención</h2>
                <p className="text-sm text-[#98a287]">Casos priorizados por fecha y criticidad</p>
              </div>
              <span className="text-sm font-semibold text-[#07612d]">{attentionAnimals.length} casos</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left text-sm">
                <thead>
                  <tr className="text-xs font-semibold uppercase text-[#98a287]">
                    <th className="px-3 py-2">Arete/SINIGA</th>
                    <th className="px-3 py-2">Nombre</th>
                    <th className="px-3 py-2">Estado</th>
                    <th className="px-3 py-2">Última actividad</th>
                    <th className="px-3 py-2">Próxima tarea</th>
                    <th className="px-3 py-2">Prioridad</th>
                  </tr>
                </thead>
                <tbody>
                  {attentionAnimals.map((animal) => (
                    <tr className="bg-[#F4F4F4]" key={animal.id}>
                      <td className="rounded-l-2xl px-3 py-3 font-semibold text-[#07612d]">{animal.id}</td>
                      <td className="px-3 py-3 font-semibold">{animal.name}</td>
                      <td className="px-3 py-3"><StatusBadge label={animal.status} /></td>
                      <td className="px-3 py-3">{animal.last}</td>
                      <td className="px-3 py-3">{animal.next}</td>
                      <td className="rounded-r-2xl px-3 py-3"><StatusBadge label={animal.priority} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 shadow-[0_10px_30px_rgba(29,29,27,0.07)]">
              <h2 className="text-xl font-bold text-[#07612d]">Resumen sanitario</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {healthSummary.map((item) => {
                  const Icon = healthIcons[item.label] ?? HeartPulse
                  const styles = toneStyles[item.tone]
                  return (
                    <div className="flex items-center gap-3 rounded-2xl bg-[#F4F4F4] p-4" key={item.label}>
                      <span className={`flex size-11 items-center justify-center rounded-2xl ${styles.bg} ${styles.text}`}>
                        <Icon size={22} />
                      </span>
                      <div>
                        <p className="text-2xl font-bold text-[#1d1d1b]">{item.value}</p>
                        <p className="text-xs font-medium text-[#98a287]">{item.label}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-[0_10px_30px_rgba(29,29,27,0.07)]">
              <h2 className="text-xl font-bold text-[#07612d]">Resumen de costos</h2>
              <div className="mt-5 space-y-4">
                {costs.map((cost) => (
                  <div key={cost.label}>
                    <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                      <span className="font-semibold text-[#1d1d1b]">{cost.label}</span>
                      <span className="text-[#98a287]">{money.format(cost.value)}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-[#F4F4F4]">
                      <div className="h-full rounded-full bg-[#07612d]" style={{ width: `${cost.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-[0_10px_30px_rgba(29,29,27,0.07)]">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#07612d]">Inventario reciente</h2>
                <p className="text-sm text-[#98a287]">Búsqueda activa por arete, nombre, estado o evento</p>
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#07612d]">
                <TrendingUp size={18} /> {filteredAnimals.length} resultados
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[840px] border-separate border-spacing-y-2 text-left text-sm">
                <thead>
                  <tr className="text-xs font-semibold uppercase text-[#98a287]">
                    <th className="px-3 py-2">Arete/SINIGA</th>
                    <th className="px-3 py-2">Nombre</th>
                    <th className="px-3 py-2">Tipo</th>
                    <th className="px-3 py-2">Edad</th>
                    <th className="px-3 py-2">Estado</th>
                    <th className="px-3 py-2">Última actividad</th>
                    <th className="px-3 py-2">Próxima tarea</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAnimals.map((animal) => (
                    <tr className="bg-[#F4F4F4]" key={animal.id}>
                      <td className="rounded-l-2xl px-3 py-3 font-semibold text-[#07612d]">{animal.id}</td>
                      <td className="px-3 py-3 font-semibold">{animal.name}</td>
                      <td className="px-3 py-3">{animal.type}</td>
                      <td className="px-3 py-3">{animal.age}</td>
                      <td className="px-3 py-3"><StatusBadge label={animal.status} /></td>
                      <td className="px-3 py-3">{animal.last}</td>
                      <td className="rounded-r-2xl px-3 py-3">{animal.next}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
