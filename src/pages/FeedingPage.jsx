import { useEffect, useMemo, useState } from 'react'
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { CalendarClock, LayoutGrid, List, PackageCheck, Plus, Scale, Utensils, WalletCards } from 'lucide-react'
import StatCard from '../components/StatCard'
import FeedingAlert from '../components/feeding/FeedingAlert'
import FeedingFilters from '../components/feeding/FeedingFilters'
import FeedingForm from '../components/feeding/FeedingForm'
import FeedingHistory from '../components/feeding/FeedingHistory'
import FeedingStatusBadge from '../components/feeding/FeedingStatusBadge'
import FeedingSummary from '../components/feeding/FeedingSummary'
import { normalizeFeedingStatus } from '../components/feeding/feedingUtils'
import { mxn } from '../components/expenses/expenseUtils'
import { animals as mockAnimals } from '../data/animals'
import { feeding as mockFeeding } from '../data/feeding'
import { readStorage, writeStorage } from '../utils/storage'

const initialFilters = {
  query: '',
  animalId: 'Todos',
  fecha: '',
  tipoAlimento: 'Todos',
}

const feedingStatusOptions = ['Registrado', 'Pendiente', 'Atrasado', 'Completado']

function FeedingDashboard({ animals, records, filters, onFiltersChange, isLoading, onStatusChange }) {
  const [viewMode, setViewMode] = useState('cards')

  const filteredRecords = useMemo(() => {
    const query = filters.query.trim().toLowerCase()
    return records.filter((record) => {
      const matchesQuery =
        !query ||
        [record.animalIdentificador, record.responsable, record.observaciones, record.grupo].some((value) => String(value ?? '').toLowerCase().includes(query))
      const matchesAnimal =
        filters.animalId === 'Todos' ||
        (filters.animalId === 'grupo' && record.animalId === null) ||
        record.animalId === Number(filters.animalId)
      const matchesFecha = !filters.fecha || record.fecha === filters.fecha
      const matchesFood = filters.tipoAlimento === 'Todos' || record.tipoAlimento === filters.tipoAlimento
      return matchesQuery && matchesAnimal && matchesFecha && matchesFood
    })
  }, [filters, records])

  const totalConsumption = records.reduce((sum, record) => sum + Number(record.cantidad), 0)
  const totalCost = records.reduce((sum, record) => sum + Number(record.costoAproximado), 0)
  const pending = records.filter((record) => record.estado === 'Pendiente' || record.estado === 'Atrasado')

  const stats = [
    { title: 'Total de registros', value: records.length, detail: 'Historial de alimentación', icon: PackageCheck, tone: 'primary' },
    { title: 'Consumo total', value: `${totalConsumption} unidades`, detail: 'Suma general de cantidades', icon: Scale, tone: 'success' },
    { title: 'Costo total de alimentación', value: mxn.format(totalCost), detail: 'Costo aproximado acumulado', icon: WalletCards, tone: 'warning' },
    { title: 'Alimentaciones pendientes', value: pending.length, detail: 'Pendientes o atrasadas', icon: CalendarClock, tone: pending.length ? 'danger' : 'success' },
  ]

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="inline-flex min-h-8 items-center gap-2 rounded-full bg-[#4CAF50]/12 px-3 text-xs font-bold uppercase tracking-[0.14em] text-[#2f8f36]">
            <Utensils size={16} />
            Nutrición del rancho
          </span>
          <h1 className="mt-4 text-3xl font-bold text-[#07612d] md:text-4xl">Control de Alimentación</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#1d1d1b]/70">Controla qué comen los animales, cuánto consumen y cuánto cuesta su alimentación.</p>
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
          <Link className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#07612d] px-5 text-sm font-bold text-white shadow-[0_10px_22px_rgba(7,97,45,0.2)] sm:w-auto" to="/alimentacion/nuevo">
            <Plus size={18} /> Registrar Alimentación
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <FeedingFilters animals={animals} filters={filters} onChange={onFiltersChange} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
        <div className="grid gap-5">
          {isLoading ? <div className="min-h-80 animate-pulse rounded-2xl bg-white shadow-[0_12px_28px_rgba(29,29,27,0.05)]" /> : null}
          {!isLoading ? <FeedingHistory onStatusChange={onStatusChange} records={filteredRecords} viewMode={viewMode} /> : null}
        </div>
        <FeedingAlert records={records} />
      </div>

      <FeedingSummary records={records} />
    </section>
  )
}

function NewFeeding({ animals, onCreate }) {
  const navigate = useNavigate()

  function handleSubmit(record) {
    onCreate(record)
    navigate(`/alimentacion/${record.id}`, { replace: true })
  }

  return (
    <section className="grid gap-5">
      <div>
        <h1 className="text-3xl font-bold text-[#07612d]">Registrar Alimentación</h1>
        <p className="mt-2 text-sm text-[#1d1d1b]/70">Captura alimento, cantidad, horario, responsable y costo aproximado.</p>
      </div>
      <FeedingForm animals={animals} onSubmit={handleSubmit} />
    </section>
  )
}

function FeedingDetail({ records, onStatusChange }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const record = records.find((item) => item.id === Number(id))

  if (!record) {
    return (
      <section className="rounded-2xl border border-[#98a287]/18 bg-white p-6 text-center shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
        <h1 className="text-2xl font-bold text-[#07612d]">Registro no encontrado</h1>
        <button className="mt-5 rounded-2xl bg-[#07612d] px-5 py-3 text-sm font-bold text-white" onClick={() => navigate('/alimentacion')} type="button">
          Volver a Alimentación
        </button>
      </section>
    )
  }

  return (
    <section className="grid gap-5">
      <button className="w-full rounded-2xl border border-[#07612d]/25 bg-white px-5 py-3 text-sm font-bold text-[#07612d] sm:w-fit" onClick={() => navigate('/alimentacion')} type="button">
        Volver
      </button>
      <article className="rounded-2xl border border-[#98a287]/18 bg-white p-4 shadow-[0_12px_28px_rgba(29,29,27,0.07)] md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[#4CAF50]">Registro #{record.id}</p>
            <h1 className="mt-2 break-words text-2xl font-bold text-[#07612d] md:text-3xl">{record.tipoAlimento}</h1>
            <p className="mt-2 text-sm text-[#1d1d1b]/70">{record.animalIdentificador}</p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <FeedingStatusBadge estado={record.estado} />
            <select className="h-11 rounded-2xl border border-[#98a287]/25 bg-white px-4 text-sm font-bold text-[#1d1d1b] outline-none focus:border-[#07612d]" onChange={(item) => onStatusChange(record.id, item.target.value)} value={record.estado}>
              {feedingStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            ['Cantidad', `${record.cantidad} ${record.unidad}`],
            ['Fecha y hora', `${record.fecha} ${record.hora}`],
            ['Responsable', record.responsable],
            ['Costo aproximado', mxn.format(record.costoAproximado)],
            ['Animal o grupo', record.animalIdentificador],
            ['Estado', record.estado],
          ].map(([label, value]) => (
            <div className="rounded-2xl bg-[#F4F4F4] p-4" key={label}>
              <p className="text-xs font-bold uppercase text-[#98a287]">{label}</p>
              <p className="mt-2 break-words text-sm font-semibold text-[#1d1d1b]">{value}</p>
            </div>
          ))}
        </div>

        {record.nutricion ? (
          <section className="mt-5 rounded-2xl bg-[#F4F4F4] p-4">
            <div>
              <p className="text-xs font-bold uppercase text-[#98a287]">Datos nutricionales</p>
              <h2 className="mt-1 text-xl font-bold text-[#07612d]">Perfil del alimento</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ['Proteína', `${record.nutricion.proteina}%`],
                ['Fibra', `${record.nutricion.fibra}%`],
                ['Energía', `${record.nutricion.energia} Mcal/kg`],
                ['Materia seca', `${record.nutricion.materiaSeca}%`],
              ].map(([label, value]) => (
                <div className="rounded-2xl bg-white p-4" key={label}>
                  <p className="text-xs font-bold uppercase text-[#98a287]">{label}</p>
                  <p className="mt-2 break-words text-sm font-semibold text-[#1d1d1b]">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-bold uppercase text-[#98a287]">Minerales / vitaminas</p>
                <p className="mt-2 text-sm leading-6 text-[#1d1d1b]/75">{record.nutricion.minerales || 'Sin datos registrados.'}</p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-bold uppercase text-[#98a287]">Notas nutricionales</p>
                <p className="mt-2 text-sm leading-6 text-[#1d1d1b]/75">{record.nutricion.notas || 'Sin notas registradas.'}</p>
              </div>
            </div>
          </section>
        ) : null}

        <div className="mt-5 rounded-2xl bg-[#F4F4F4] p-4">
          <p className="text-xs font-bold uppercase text-[#98a287]">Observaciones</p>
          <p className="mt-2 text-sm leading-6 text-[#1d1d1b]/75">{record.observaciones || 'Sin observaciones registradas.'}</p>
        </div>
      </article>
    </section>
  )
}

function FeedingPage() {
  const [animals, setAnimals] = useState([])
  const [records, setRecords] = useState([])
  const [filters, setFilters] = useState(initialFilters)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAnimals(readStorage('agroweb.animals', mockAnimals))
      setRecords(readStorage('agroweb.feeding', mockFeeding).map((record) => normalizeFeedingStatus(record)))
      setIsLoading(false)
    }, 350)

    return () => window.clearTimeout(timer)
  }, [])

  function createRecord(record) {
    setRecords((current) => {
      const nextRecords = [normalizeFeedingStatus(record), ...current]
      writeStorage('agroweb.feeding', nextRecords)
      return nextRecords
    })
  }

  function updateRecordStatus(recordId, estado) {
    setRecords((current) => {
      const nextRecords = current.map((record) => (record.id === recordId ? { ...record, estado } : record))
      writeStorage('agroweb.feeding', nextRecords)
      return nextRecords
    })
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 md:px-6 md:py-6">
        <Routes>
          <Route index element={<FeedingDashboard animals={animals} filters={filters} isLoading={isLoading} onFiltersChange={setFilters} onStatusChange={updateRecordStatus} records={records} />} />
          <Route path="nuevo" element={<NewFeeding animals={animals} onCreate={createRecord} />} />
          <Route path=":id" element={<FeedingDetail onStatusChange={updateRecordStatus} records={records} />} />
        </Routes>
    </div>
  )
}

export default FeedingPage
