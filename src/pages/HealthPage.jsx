import { useEffect, useMemo, useState } from 'react'
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { CalendarDays, HeartPulse, LayoutGrid, List, Plus, Stethoscope, Syringe, TriangleAlert } from 'lucide-react'
import StatCard from '../components/StatCard'
import HealthEventCard from '../components/health/HealthEventCard'
import HealthEventForm from '../components/health/HealthEventForm'
import HealthEventTable from '../components/health/HealthEventTable'
import HealthFilters from '../components/health/HealthFilters'
import HealthStatusBadge from '../components/health/HealthStatusBadge'
import SanitaryCalendar from '../components/health/SanitaryCalendar'
import UpcomingHealthEvents from '../components/health/UpcomingHealthEvents'
import { animals as mockAnimals } from '../data/animals'
import { healthEvents as mockHealthEvents } from '../data/healthEvents'

const today = '2026-05-23'

const initialFilters = {
  animalId: 'Todos',
  tipo: 'Todos',
  estado: 'Todos',
  fecha: '',
}

function isOverdue(event) {
  const targetDate = event.proximaAplicacion || event.fecha
  return event.estado !== 'Completado' && targetDate && targetDate < today
}

function isUpcoming(event) {
  const targetDate = event.proximaAplicacion || event.fecha
  return event.estado === 'Pendiente' && targetDate && targetDate >= today
}

function sanitizeStatus(event) {
  return isOverdue(event) ? { ...event, estado: 'Vencido' } : event
}

const healthStatusOptions = ['Completado', 'Pendiente', 'Vencido']

function HealthDetail({ events, onStatusChange }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const event = events.find((item) => item.id === Number(id))

  if (!event) {
    return (
      <section className="rounded-2xl border border-[#98a287]/18 bg-white p-6 text-center shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
        <h1 className="text-2xl font-bold text-[#07612d]">Evento no encontrado</h1>
        <p className="mt-2 text-sm text-[#1d1d1b]/70">El registro sanitario solicitado no existe.</p>
        <button className="mt-5 rounded-2xl bg-[#07612d] px-5 py-3 text-sm font-bold text-white" onClick={() => navigate('/sanidad')} type="button">
          Volver a Sanidad
        </button>
      </section>
    )
  }

  return (
    <section className="grid gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#07612d]/25 bg-white px-4 text-sm font-bold text-[#07612d]" onClick={() => navigate('/sanidad')} type="button">
          Volver
        </button>
        <div className="flex flex-col gap-2 sm:items-end">
          <HealthStatusBadge estado={event.estado} />
          <select className="h-11 rounded-2xl border border-[#98a287]/25 bg-white px-4 text-sm font-bold text-[#1d1d1b] outline-none focus:border-[#07612d]" onChange={(item) => onStatusChange(event.id, item.target.value)} value={event.estado}>
            {healthStatusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <article className="rounded-2xl border border-[#98a287]/18 bg-white p-4 shadow-[0_12px_28px_rgba(29,29,27,0.07)] md:p-6">
        <p className="text-sm font-bold text-[#4CAF50]">{event.animalIdentificador}</p>
        <h1 className="mt-2 break-words text-2xl font-bold text-[#07612d] md:text-3xl">{event.tipo}</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            ['Fecha del evento', event.fecha],
            ['Producto aplicado', event.producto],
            ['Dosis', event.dosis],
            ['Responsable', event.responsable],
            ['Próxima aplicación', event.proximaAplicacion || 'Sin fecha'],
            ['ID del evento', event.id],
          ].map(([label, value]) => (
            <div className="rounded-2xl bg-[#F4F4F4] p-4" key={label}>
              <p className="text-xs font-bold uppercase text-[#98a287]">{label}</p>
              <p className="mt-2 text-sm font-semibold text-[#1d1d1b]">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-2xl bg-[#F4F4F4] p-4">
          <p className="text-xs font-bold uppercase text-[#98a287]">Observaciones</p>
          <p className="mt-2 text-sm leading-6 text-[#1d1d1b]/75">{event.observaciones || 'Sin observaciones registradas.'}</p>
        </div>
      </article>
    </section>
  )
}

function NewHealthEvent({ animals, onCreate }) {
  const navigate = useNavigate()

  function handleSubmit(event) {
    onCreate(event)
    navigate(`/sanidad/${event.id}`, { replace: true })
  }

  return (
    <section className="grid gap-5">
      <div>
        <h1 className="text-3xl font-bold text-[#07612d]">Registrar Evento Sanitario</h1>
        <p className="mt-2 text-sm text-[#1d1d1b]/70">Captura vacunas, desparasitantes, tratamientos, revisiones, enfermedades u otros eventos.</p>
      </div>
      <HealthEventForm animals={animals} onSubmit={handleSubmit} />
    </section>
  )
}

function HealthDashboard({ animals, events, filters, onFiltersChange, isLoading, onStatusChange }) {
  const [viewMode, setViewMode] = useState('cards')
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesAnimal = filters.animalId === 'Todos' || event.animalId === Number(filters.animalId)
      const matchesTipo = filters.tipo === 'Todos' || event.tipo === filters.tipo
      const matchesEstado = filters.estado === 'Todos' || event.estado === filters.estado
      const matchesFecha = !filters.fecha || event.fecha === filters.fecha || event.proximaAplicacion === filters.fecha
      return matchesAnimal && matchesTipo && matchesEstado && matchesFecha
    })
  }, [events, filters])

  const upcomingEvents = useMemo(() => events.filter((event) => event.estado === 'Vencido' || isUpcoming(event)), [events])

  const stats = useMemo(
    () => [
      { title: 'Total de eventos', value: events.length, detail: 'Historial sanitario registrado', icon: HeartPulse, tone: 'primary' },
      { title: 'Próximas vacunas', value: events.filter((event) => event.tipo === 'Vacuna' && isUpcoming(event)).length, detail: 'Aplicaciones pendientes', icon: Syringe, tone: 'warning' },
      { title: 'Eventos vencidos', value: events.filter((event) => event.estado === 'Vencido').length, detail: 'Requieren atención inmediata', icon: TriangleAlert, tone: 'danger' },
      { title: 'Tratamientos activos', value: events.filter((event) => event.tipo === 'Tratamiento' && event.estado === 'Pendiente').length, detail: 'Seguimiento veterinario', icon: Stethoscope, tone: 'info' },
    ],
    [events],
  )

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="inline-flex min-h-8 items-center gap-2 rounded-full bg-[#D32F2F]/10 px-3 text-xs font-bold uppercase tracking-[0.14em] text-[#D32F2F]">
            <HeartPulse size={16} />
            Control sanitario
          </span>
          <h1 className="mt-4 text-3xl font-bold text-[#07612d] md:text-4xl">Sanidad</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#1d1d1b]/70">Controla historial médico, vacunas, desparasitantes, tratamientos y próximas aplicaciones del rancho.</p>
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
          <Link className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[#07612d]/25 bg-white px-5 text-sm font-bold text-[#07612d] sm:w-auto" to="/calendario-sanitario">
            <CalendarDays size={18} /> Calendario
          </Link>
          <Link className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#07612d] px-5 text-sm font-bold text-white shadow-[0_10px_22px_rgba(7,97,45,0.2)] sm:w-auto" to="/sanidad/nuevo">
            <Plus size={18} /> Registrar Evento Sanitario
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <HealthFilters animals={animals} filters={filters} onChange={onFiltersChange} />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <div className="grid gap-5">
          {isLoading ? (
            <div className="min-h-80 animate-pulse rounded-2xl bg-white shadow-[0_12px_28px_rgba(29,29,27,0.05)]" />
          ) : null}

          {!isLoading && filteredEvents.length > 0 && viewMode === 'cards' ? (
            <div className="grid gap-5 md:grid-cols-2">
              {filteredEvents.map((event) => (
                <HealthEventCard event={event} key={event.id} onStatusChange={onStatusChange} />
              ))}
            </div>
          ) : null}

          {!isLoading && filteredEvents.length > 0 && viewMode === 'table' ? <HealthEventTable events={filteredEvents} onStatusChange={onStatusChange} /> : null}

          {!isLoading && filteredEvents.length === 0 ? (
            <section className="rounded-2xl border border-[#98a287]/18 bg-white p-8 text-center shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
              <h2 className="text-2xl font-bold text-[#07612d]">No hay eventos sanitarios registrados</h2>
              <p className="mt-2 text-sm text-[#1d1d1b]/70">No se encontraron eventos con los filtros actuales.</p>
            </section>
          ) : null}
        </div>

        <UpcomingHealthEvents events={upcomingEvents} />
      </div>

      <SanitaryCalendar events={events} />
    </section>
  )
}

function HealthPage({ calendarOnly = false }) {
  const [animals, setAnimals] = useState([])
  const [events, setEvents] = useState([])
  const [filters, setFilters] = useState(initialFilters)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAnimals(mockAnimals)
      setEvents(mockHealthEvents.map(sanitizeStatus))
      setIsLoading(false)
    }, 350)

    return () => window.clearTimeout(timer)
  }, [])

  function createEvent(event) {
    setEvents((current) => [sanitizeStatus(event), ...current])
  }

  function updateEventStatus(eventId, estado) {
    setEvents((current) => current.map((event) => (event.id === eventId ? { ...event, estado } : event)))
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        {calendarOnly ? (
          <section className="grid gap-5">
            <div>
              <h1 className="text-3xl font-bold text-[#07612d]">Calendario sanitario</h1>
              <p className="mt-2 text-sm text-[#1d1d1b]/70">Consulta próximas aplicaciones y eventos médicos programados.</p>
            </div>
            <SanitaryCalendar events={events} />
          </section>
        ) : (
          <Routes>
            <Route index element={<HealthDashboard animals={animals} events={events} filters={filters} isLoading={isLoading} onFiltersChange={setFilters} onStatusChange={updateEventStatus} />} />
            <Route path="nuevo" element={<NewHealthEvent animals={animals} onCreate={createEvent} />} />
            <Route path=":id" element={<HealthDetail events={events} onStatusChange={updateEventStatus} />} />
          </Routes>
        )}
    </div>
  )
}

export default HealthPage
