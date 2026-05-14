import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  FileBarChart,
  HeartPulse,
  Home,
  Menu,
  PackageCheck,
  Plus,
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
import type { LucideIcon } from 'lucide-react'

type StatusTone = 'primary' | 'success' | 'warning' | 'danger' | 'muted'
type Priority = 'Urgente' | 'Proximo' | 'Normal' | 'Completado'

const toneStyles: Record<StatusTone, { text: string; bg: string; border: string; fill: string }> = {
  primary: {
    text: 'text-[#07612d]',
    bg: 'bg-[#07612d]/10',
    border: 'border-[#07612d]/20',
    fill: 'bg-[#07612d]',
  },
  success: {
    text: 'text-[#4CAF50]',
    bg: 'bg-[#4CAF50]/10',
    border: 'border-[#4CAF50]/20',
    fill: 'bg-[#4CAF50]',
  },
  warning: {
    text: 'text-[#FFA000]',
    bg: 'bg-[#FFA000]/10',
    border: 'border-[#FFA000]/25',
    fill: 'bg-[#FFA000]',
  },
  danger: {
    text: 'text-[#D32F2F]',
    bg: 'bg-[#D32F2F]/10',
    border: 'border-[#D32F2F]/20',
    fill: 'bg-[#D32F2F]',
  },
  muted: {
    text: 'text-[#98a287]',
    bg: 'bg-[#F4F4F4]',
    border: 'border-[#98a287]/20',
    fill: 'bg-[#98a287]',
  },
}

const priorityTone: Record<Priority, StatusTone> = {
  Urgente: 'danger',
  Proximo: 'warning',
  Normal: 'primary',
  Completado: 'success',
}

const navItems = [
  { label: 'Inicio', icon: Home, active: true },
  { label: 'Animales', icon: PackageCheck },
  { label: 'Sanitario', icon: HeartPulse },
  { label: 'Costos', icon: WalletCards },
  { label: 'Reportes', icon: FileBarChart },
  { label: 'Notificaciones', icon: Bell },
  { label: 'Configuracion', icon: Settings },
]

const stats = [
  { title: 'Animales activos', value: '128', detail: 'Inventario productivo', icon: PackageCheck, tone: 'primary' },
  { title: 'En observacion', value: '7', detail: 'Requieren seguimiento', icon: Stethoscope, tone: 'warning' },
  { title: 'Eventos proximos', value: '24', detail: 'Sanitario y manejo', icon: Syringe, tone: 'primary' },
  { title: 'Gastos del mes', value: '$22,000', detail: 'Actualizado hoy', icon: CircleDollarSign, tone: 'success' },
  { title: 'Tareas pendientes', value: '9', detail: 'Prioriza las de hoy', icon: ClipboardList, tone: 'warning' },
  { title: 'Alertas urgentes', value: '3', detail: 'Atencion inmediata', icon: AlertTriangle, tone: 'danger' },
] satisfies Array<{ title: string; value: string; detail: string; icon: LucideIcon; tone: StatusTone }>

const quickActions = [
  { title: 'Registrar animal', description: 'Alta rapida con arete o SINIGA', icon: Plus },
  { title: 'Evento sanitario', description: 'Vacuna, revision o tratamiento', icon: HeartPulse },
  { title: 'Registrar gasto', description: 'Captura costos del rancho', icon: WalletCards },
  { title: 'Ver calendario', description: 'Agenda sanitaria y tareas', icon: CalendarDays },
  { title: 'Generar reporte', description: 'Resumen operativo y costos', icon: BarChart3 },
  { title: 'Revisar alertas', description: 'Casos urgentes y proximos', icon: Bell },
]

const attentionAnimals = [
  { id: 'MX-1028', name: 'Luna', status: 'Observacion', reason: 'Revision postparto', nextDate: '13 mayo', priority: 'Urgente' },
  { id: 'MX-1044', name: 'Capitan', status: 'Tratamiento', reason: 'Dosis antibiotico', nextDate: '14 mayo', priority: 'Proximo' },
  { id: 'SIN-7782', name: 'Estrella', status: 'Activo', reason: 'Vacuna clostridial', nextDate: '16 mayo', priority: 'Normal' },
  { id: 'MX-1106', name: 'Norte', status: 'Completado', reason: 'Desparasitacion registrada', nextDate: 'Listo', priority: 'Completado' },
] satisfies Array<{ id: string; name: string; status: string; reason: string; nextDate: string; priority: Priority }>

const tasks = [
  { id: 1, group: 'Hoy', date: '13 mayo', task: 'Aplicar refuerzo a lote A', module: 'Sanitario', priority: 'Urgente' },
  { id: 2, group: 'Hoy', date: '13 mayo', task: 'Revisar animal MX-1028', module: 'Animales', priority: 'Urgente' },
  { id: 3, group: 'Mañana', date: '14 mayo', task: 'Registrar compra de alimento', module: 'Costos', priority: 'Normal' },
  { id: 4, group: 'Mañana', date: '14 mayo', task: 'Control de peso becerros', module: 'Animales', priority: 'Proximo' },
  { id: 5, group: 'Esta semana', date: '17 mayo', task: 'Reporte sanitario semanal', module: 'Reportes', priority: 'Normal' },
] satisfies Array<{ id: number; group: string; date: string; task: string; module: string; priority: Exclude<Priority, 'Completado'> }>

const healthSummary = [
  { label: 'Vacunas pendientes', value: '18', icon: Syringe, tone: 'warning' },
  { label: 'Desparasitaciones proximas', value: '11', icon: ShieldCheck, tone: 'primary' },
  { label: 'Revisiones clinicas', value: '6', icon: Stethoscope, tone: 'danger' },
  { label: 'Animales en observacion', value: '7', icon: HeartPulse, tone: 'warning' },
  { label: 'Historial reciente', value: '32', icon: Clock3, tone: 'success' },
] satisfies Array<{ label: string; value: string; icon: LucideIcon; tone: StatusTone }>

const costs = [
  { label: 'Alimento', value: '$12,800', percent: 58 },
  { label: 'Medicinas', value: '$4,200', percent: 19 },
  { label: 'Transporte', value: '$2,900', percent: 13 },
  { label: 'Mantenimiento', value: '$2,100', percent: 10 },
]

const inventory = [
  { id: 'MX-1028', name: 'Luna', type: 'Vaca', age: '4 años', status: 'Observacion', last: 'Revision postparto', next: 'Hoy' },
  { id: 'MX-1044', name: 'Capitan', type: 'Toro', age: '5 años', status: 'Tratamiento', last: 'Medicamento', next: 'Mañana' },
  { id: 'SIN-7782', name: 'Estrella', type: 'Vaca', age: '3 años', status: 'Activo', last: 'Vacuna registrada', next: '16 mayo' },
  { id: 'MX-1106', name: 'Norte', type: 'Becerro', age: '8 meses', status: 'Activo', last: 'Pesaje', next: '17 mayo' },
  { id: 'SIN-7801', name: 'Brisa', type: 'Novilla', age: '2 años', status: 'Activo', last: 'Alta inventario', next: 'Esta semana' },
]

function StatusBadge({ label }: { label: Priority | string }) {
  const normalized = label === 'Próximo' ? 'Proximo' : label
  const tone = priorityTone[normalized as Priority] ?? (label === 'Tratamiento' || label === 'Observacion' ? 'warning' : 'primary')
  const styles = toneStyles[tone]

  return (
    <span className={`inline-flex min-h-7 items-center rounded-full border px-3 py-1 text-xs font-semibold ${styles.bg} ${styles.text} ${styles.border}`}>
      {label === 'Proximo' ? 'Proximo' : label}
    </span>
  )
}

function StatCard({ title, value, detail, icon: Icon, tone }: (typeof stats)[number]) {
  const styles = toneStyles[tone]

  return (
    <article className="rounded-2xl border border-[#98a287]/18 bg-white p-5 text-left shadow-[0_10px_30px_rgba(29,29,27,0.07)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#98a287]">{title}</p>
          <strong className="mt-2 block text-3xl font-bold text-[#1d1d1b]">{value}</strong>
        </div>
        <span className={`rounded-2xl p-3 ${styles.bg} ${styles.text}`}>
          <Icon size={28} strokeWidth={2.2} />
        </span>
      </div>
      <p className="mt-3 text-sm text-[#1d1d1b]/75">{detail}</p>
      <button className={`mt-4 inline-flex items-center gap-2 text-sm font-semibold ${styles.text}`} type="button">
        Ver detalle <ChevronRight size={16} />
      </button>
    </article>
  )
}

function QuickActionCard({ title, description, icon: Icon }: (typeof quickActions)[number]) {
  return (
    <button
      type="button"
      className="group flex min-h-28 w-full items-center gap-4 rounded-2xl border border-[#98a287]/18 bg-white p-4 text-left shadow-[0_8px_24px_rgba(29,29,27,0.06)] transition hover:-translate-y-0.5 hover:border-[#07612d]/35 hover:shadow-[0_14px_34px_rgba(7,97,45,0.12)]"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#07612d]/10 text-[#07612d] transition group-hover:bg-[#07612d] group-hover:text-white">
        <Icon size={24} />
      </span>
      <span>
        <span className="block text-sm font-semibold text-[#1d1d1b]">{title}</span>
        <span className="mt-1 block text-xs leading-5 text-[#98a287]">{description}</span>
      </span>
    </button>
  )
}

function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <>
      {isOpen ? <button aria-label="Cerrar menu" className="fixed inset-0 z-30 bg-[#1d1d1b]/30 lg:hidden" onClick={onClose} type="button" /> : null}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-[#98a287]/18 bg-white px-4 py-5 shadow-[0_16px_40px_rgba(29,29,27,0.12)] transition-transform lg:translate-x-0 lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[#07612d] text-lg font-bold text-white">A</div>
            <div>
              <p className="text-base font-bold text-[#07612d]">AgroApp</p>
              <p className="text-xs text-[#98a287]">Gestion ganadera</p>
            </div>
          </div>
          <button className="rounded-xl p-2 text-[#07612d] lg:hidden" onClick={onClose} type="button" aria-label="Cerrar menu">
            <X size={22} />
          </button>
        </div>

        <nav className="mt-8 space-y-2">
          {navItems.map(({ label, icon: Icon, active }) => (
            <button
              className={`flex min-h-12 w-full items-center gap-3 rounded-2xl px-4 text-sm font-semibold transition ${
                active ? 'bg-[#07612d] text-white shadow-[0_10px_24px_rgba(7,97,45,0.2)]' : 'text-[#1d1d1b] hover:bg-[#F4F4F4]'
              }`}
              key={label}
              type="button"
            >
              <Icon size={20} className={active ? 'text-white' : 'text-[#98a287]'} />
              {label}
            </button>
          ))}
        </nav>
      </aside>
    </>
  )
}

function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [completedTasks, setCompletedTasks] = useState<number[]>([])

  const filteredInventory = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return inventory

    return inventory.filter((animal) =>
      [animal.id, animal.name, animal.type, animal.status, animal.last, animal.next].some((value) => value.toLowerCase().includes(query)),
    )
  }, [searchTerm])

  const toggleTask = (taskId: number) => {
    setCompletedTasks((current) => (current.includes(taskId) ? current.filter((id) => id !== taskId) : [...current, taskId]))
  }

  return (
    <div className="min-h-screen bg-[#F4F4F4] font-['Poppins',sans-serif] text-[#1d1d1b]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-[#98a287]/18 bg-white/95 px-4 py-4 shadow-[0_6px_22px_rgba(29,29,27,0.05)] backdrop-blur md:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              <button
                className="flex size-11 items-center justify-center rounded-2xl border border-[#98a287]/25 bg-white text-[#07612d] lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
                type="button"
                aria-label="Abrir menu"
              >
                <Menu size={22} />
              </button>
              <div className="hidden size-12 items-center justify-center rounded-2xl bg-[#07612d] text-lg font-bold text-white sm:flex">A</div>
              <div>
                <h1 className="text-2xl font-bold text-[#07612d] md:text-3xl">Dashboard ganadero</h1>
                <p className="text-sm text-[#98a287]">Resumen general de tu rancho</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <label className="relative min-w-0 md:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#98a287]" size={18} />
                <input
                  className="h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] pl-10 pr-4 text-sm text-[#1d1d1b] outline-none transition placeholder:text-[#98a287] focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10"
                  placeholder="Buscar animal, arete o evento..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </label>
              <button className="min-h-12 rounded-2xl bg-[#07612d] px-5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(7,97,45,0.2)]" type="button">
                Nuevo registro
              </button>
              <button className="min-h-12 rounded-2xl border border-[#07612d]/25 bg-white px-5 text-sm font-semibold text-[#07612d]" type="button">
                Sincronizar datos
              </button>
              <span className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl bg-[#4CAF50]/10 px-4 text-sm font-semibold text-[#4CAF50]">
                <Wifi size={17} /> Online
              </span>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 md:px-6">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
            <div className="rounded-3xl bg-white p-5 shadow-[0_10px_30px_rgba(29,29,27,0.07)]">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-[#07612d]">Acciones rapidas</h2>
                  <p className="text-sm text-[#98a287]">Operaciones frecuentes para trabajo en campo</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {quickActions.map((action) => (
                  <QuickActionCard key={action.title} {...action} />
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-[0_10px_30px_rgba(29,29,27,0.07)]">
              <h2 className="text-xl font-bold text-[#07612d]">Proximas tareas</h2>
              <p className="text-sm text-[#98a287]">Hoy primero, despues el resto de la semana</p>
              <div className="mt-4 space-y-4">
                {['Hoy', 'Mañana', 'Esta semana'].map((group) => (
                  <div key={group}>
                    <p className="mb-2 text-sm font-bold text-[#1d1d1b]">{group}</p>
                    <div className="space-y-2">
                      {tasks
                        .filter((task) => task.group === group)
                        .map((task) => {
                          const completed = completedTasks.includes(task.id)
                          return (
                            <div className="flex items-start gap-3 rounded-2xl bg-[#F4F4F4] p-3" key={task.id}>
                              <button
                                className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border ${
                                  completed ? 'border-[#4CAF50] bg-[#4CAF50] text-white' : 'border-[#98a287]/45 bg-white text-[#98a287]'
                                }`}
                                onClick={() => toggleTask(task.id)}
                                type="button"
                                aria-label="Marcar tarea como completada"
                              >
                                <CheckCircle2 size={17} />
                              </button>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-semibold text-[#98a287]">{task.date}</span>
                                  <StatusBadge label={completed ? 'Completado' : task.priority} />
                                </div>
                                <p className={`mt-1 text-sm font-semibold ${completed ? 'text-[#98a287] line-through' : 'text-[#1d1d1b]'}`}>{task.task}</p>
                                <p className="text-xs text-[#98a287]">{task.module}</p>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-[0_10px_30px_rgba(29,29,27,0.07)]">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#07612d]">Animales que requieren atencion</h2>
                <p className="text-sm text-[#98a287]">Casos priorizados por fecha y criticidad</p>
              </div>
              <button className="min-h-11 rounded-2xl bg-[#07612d] px-4 text-sm font-semibold text-white" type="button">
                Ver alertas
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-separate border-spacing-y-2 text-left text-sm">
                <thead>
                  <tr className="text-xs font-semibold uppercase text-[#98a287]">
                    <th className="px-3 py-2">Arete/SINIGA</th>
                    <th className="px-3 py-2">Nombre</th>
                    <th className="px-3 py-2">Estado</th>
                    <th className="px-3 py-2">Motivo</th>
                    <th className="px-3 py-2">Fecha proxima</th>
                    <th className="px-3 py-2">Prioridad</th>
                    <th className="px-3 py-2">Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {attentionAnimals.map((animal) => (
                    <tr className="bg-[#F4F4F4]" key={animal.id}>
                      <td className="rounded-l-2xl px-3 py-3 font-semibold text-[#07612d]">{animal.id}</td>
                      <td className="px-3 py-3 font-semibold">{animal.name}</td>
                      <td className="px-3 py-3">{animal.status}</td>
                      <td className="px-3 py-3">{animal.reason}</td>
                      <td className="px-3 py-3">{animal.nextDate}</td>
                      <td className="px-3 py-3"><StatusBadge label={animal.priority} /></td>
                      <td className="rounded-r-2xl px-3 py-3">
                        <button className="rounded-xl border border-[#07612d]/25 bg-white px-3 py-2 text-xs font-semibold text-[#07612d]" type="button">Ver animal</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-3xl bg-white p-5 shadow-[0_10px_30px_rgba(29,29,27,0.07)]">
              <h2 className="text-xl font-bold text-[#07612d]">Resumen sanitario</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {healthSummary.map(({ label, value, icon: Icon, tone }) => {
                  const styles = toneStyles[tone]
                  return (
                    <div className="flex items-center gap-3 rounded-2xl bg-[#F4F4F4] p-4" key={label}>
                      <span className={`flex size-11 items-center justify-center rounded-2xl ${styles.bg} ${styles.text}`}>
                        <Icon size={22} />
                      </span>
                      <div>
                        <p className="text-2xl font-bold text-[#1d1d1b]">{value}</p>
                        <p className="text-xs font-medium text-[#98a287]">{label}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-[0_10px_30px_rgba(29,29,27,0.07)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#07612d]">Resumen de costos</h2>
                  <p className="text-sm text-[#98a287]">Total gastado este mes</p>
                </div>
                <div className="rounded-2xl bg-[#4CAF50]/10 px-4 py-3 text-right">
                  <p className="text-2xl font-bold text-[#4CAF50]">$22,000</p>
                  <p className="text-xs text-[#1d1d1b]/65">Mayo</p>
                </div>
              </div>
              <div className="mt-5 space-y-4">
                {costs.map((cost) => (
                  <div key={cost.label}>
                    <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                      <span className="font-semibold text-[#1d1d1b]">{cost.label}</span>
                      <span className="text-[#98a287]">{cost.value}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-[#F4F4F4]">
                      <div className="h-full rounded-full bg-[#07612d]" style={{ width: `${cost.percent}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-5 shadow-[0_10px_30px_rgba(29,29,27,0.07)]">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#07612d]">Inventario reciente</h2>
                <p className="text-sm text-[#98a287]">Busqueda activa por arete, nombre, estado o evento</p>
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#07612d]">
                <TrendingUp size={18} /> {filteredInventory.length} resultados
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
                    <th className="px-3 py-2">Ultima actividad</th>
                    <th className="px-3 py-2">Proxima tarea</th>
                    <th className="px-3 py-2">Accion</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((animal) => (
                    <tr className="bg-[#F4F4F4]" key={animal.id}>
                      <td className="rounded-l-2xl px-3 py-3 font-semibold text-[#07612d]">{animal.id}</td>
                      <td className="px-3 py-3 font-semibold">{animal.name}</td>
                      <td className="px-3 py-3">{animal.type}</td>
                      <td className="px-3 py-3">{animal.age}</td>
                      <td className="px-3 py-3"><StatusBadge label={animal.status} /></td>
                      <td className="px-3 py-3">{animal.last}</td>
                      <td className="px-3 py-3">{animal.next}</td>
                      <td className="rounded-r-2xl px-3 py-3">
                        <button className="rounded-xl border border-[#07612d]/25 bg-white px-3 py-2 text-xs font-semibold text-[#07612d]" type="button">Ver detalle</button>
                      </td>
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
