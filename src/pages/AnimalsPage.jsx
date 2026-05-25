import { useEffect, useMemo, useState } from 'react'
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { LayoutGrid, List, Plus, Sprout } from 'lucide-react'
import AnimalCard from '../components/animals/AnimalCard'
import AnimalDetail from '../components/animals/AnimalDetail'
import AnimalFilters from '../components/animals/AnimalFilters'
import AnimalForm from '../components/animals/AnimalForm'
import AnimalTable from '../components/animals/AnimalTable'
import ConfirmDeleteModal from '../components/animals/ConfirmDeleteModal'
import { animals as mockAnimals } from '../data/animals'

const initialFilters = {
  query: '',
  estado: 'Todos',
  especie: 'Todos',
  raza: 'Todos',
  ubicacion: 'Todos',
}

function uniqueValues(items, key) {
  return [...new Set(items.map((item) => item[key]).filter(Boolean))].toSorted((a, b) => a.localeCompare(b))
}

function AnimalsList({ animals, filters, onFiltersChange, isLoading }) {
  const [viewMode, setViewMode] = useState('cards')

  const options = useMemo(
    () => ({
      estados: uniqueValues(animals, 'estado'),
      especies: uniqueValues(animals, 'especie'),
      razas: uniqueValues(animals, 'raza'),
      ubicaciones: uniqueValues(animals, 'ubicacion'),
    }),
    [animals],
  )

  const filteredAnimals = useMemo(() => {
    const query = filters.query.trim().toLowerCase()
    return animals.filter((animal) => {
      const matchesQuery = !query || animal.identificador.toLowerCase().includes(query)
      const matchesEstado = filters.estado === 'Todos' || animal.estado === filters.estado
      const matchesEspecie = filters.especie === 'Todos' || animal.especie === filters.especie
      const matchesRaza = filters.raza === 'Todos' || animal.raza === filters.raza
      const matchesUbicacion = filters.ubicacion === 'Todos' || animal.ubicacion === filters.ubicacion
      return matchesQuery && matchesEstado && matchesEspecie && matchesRaza && matchesUbicacion
    })
  }, [animals, filters])

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="inline-flex min-h-8 items-center gap-2 rounded-full bg-[#4CAF50]/12 px-3 text-xs font-bold uppercase tracking-[0.14em] text-[#07612d]">
            <Sprout size={16} />
            Inventario ganadero
          </span>
          <h1 className="mt-4 text-3xl font-bold text-[#07612d] md:text-4xl">Gestión Ganadera</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#1d1d1b]/70">
            Administra animales registrados, busca por identificador y filtra por estado, especie, raza o ubicación.
          </p>
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
          <Link className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#07612d] px-5 text-sm font-bold text-white shadow-[0_10px_22px_rgba(7,97,45,0.2)] sm:w-auto" to="/animales/nuevo">
            <Plus size={18} /> Registrar Animal
          </Link>
        </div>
      </div>

      <AnimalFilters filters={filters} onChange={onFiltersChange} options={options} />

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div className="min-h-80 animate-pulse rounded-2xl bg-white shadow-[0_12px_28px_rgba(29,29,27,0.05)]" key={item} />
          ))}
        </div>
      ) : null}

      {!isLoading && filteredAnimals.length > 0 && viewMode === 'cards' ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredAnimals.map((animal) => (
            <AnimalCard animal={animal} key={animal.id} />
          ))}
        </div>
      ) : null}

      {!isLoading && filteredAnimals.length > 0 && viewMode === 'table' ? <AnimalTable animals={filteredAnimals} /> : null}

      {!isLoading && filteredAnimals.length === 0 ? (
        <section className="rounded-2xl border border-[#98a287]/18 bg-white p-8 text-center shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
          <h2 className="text-2xl font-bold text-[#07612d]">Sin animales registrados</h2>
          <p className="mt-2 text-sm text-[#1d1d1b]/70">No hay animales que coincidan con la búsqueda o filtros actuales.</p>
          <Link className="mt-5 inline-flex min-h-11 items-center justify-center rounded-2xl bg-[#07612d] px-5 text-sm font-bold text-white" to="/animales/nuevo">
            Registrar Animal
          </Link>
        </section>
      ) : null}
    </section>
  )
}

function NewAnimal({ onCreate }) {
  const navigate = useNavigate()

  function handleSubmit(payload) {
    const newAnimal = {
      ...payload,
      id: Date.now(),
      estado: 'Activo',
      nombre: payload.nombre || payload.identificador,
    }
    onCreate(newAnimal)
    navigate(`/animales/${newAnimal.id}`, { replace: true })
  }

  return (
    <section className="grid gap-5">
      <div>
        <h1 className="text-3xl font-bold text-[#07612d]">Registrar Animal</h1>
        <p className="mt-2 text-sm text-[#1d1d1b]/70">Captura la información principal del animal para integrarlo al inventario ganadero.</p>
      </div>
      <AnimalForm onSubmit={handleSubmit} submitLabel="Registrar Animal" />
    </section>
  )
}

function EditAnimal({ animals, onUpdate }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const animal = animals.find((item) => item.id === Number(id))

  if (!animal) {
    return (
      <section className="rounded-2xl border border-[#98a287]/18 bg-white p-6 text-center shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
        <h1 className="text-2xl font-bold text-[#07612d]">Animal no encontrado</h1>
        <button className="mt-5 rounded-2xl bg-[#07612d] px-5 py-3 text-sm font-bold text-white" onClick={() => navigate('/animales')} type="button">
          Volver
        </button>
      </section>
    )
  }

  function handleSubmit(payload) {
    const lockedStatus = ['Vendido', 'Fallecido'].includes(animal.estado)
    const updatedAnimal = { ...animal, ...payload, estado: lockedStatus ? animal.estado : payload.estado, nombre: payload.nombre || payload.identificador }
    onUpdate(updatedAnimal)
    navigate(`/animales/${animal.id}`, { replace: true })
  }

  return (
    <section className="grid gap-5">
      <div>
        <h1 className="text-3xl font-bold text-[#07612d]">Editar Animal</h1>
        <p className="mt-2 text-sm text-[#1d1d1b]/70">Actualiza los datos de {animal.identificador} sin perder su historial.</p>
      </div>
      <AnimalForm initialAnimal={animal} onSubmit={handleSubmit} submitLabel="Guardar cambios" />
    </section>
  )
}

function AnimalsPage() {
  const [animals, setAnimals] = useState([])
  const [filters, setFilters] = useState(initialFilters)
  const [animalToDelete, setAnimalToDelete] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAnimals(mockAnimals)
      setIsLoading(false)
    }, 350)

    return () => window.clearTimeout(timer)
  }, [])

  function createAnimal(animal) {
    setAnimals((current) => [animal, ...current])
  }

  function updateAnimal(updatedAnimal) {
    setAnimals((current) => current.map((animal) => (animal.id === updatedAnimal.id ? { ...animal, ...updatedAnimal } : animal)))
  }

  function changeAnimalStatus(estado) {
    if (!animalToDelete) return
    if (animalToDelete.estado !== 'Activo') {
      setAnimalToDelete(null)
      return
    }
    setAnimals((current) => current.map((animal) => (animal.id === animalToDelete.id ? { ...animal, estado } : animal)))
    setAnimalToDelete(null)
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <Routes>
          <Route index element={<AnimalsList animals={animals} filters={filters} isLoading={isLoading} onFiltersChange={setFilters} />} />
          <Route path="nuevo" element={<NewAnimal onCreate={createAnimal} />} />
          <Route path=":id" element={<AnimalDetail animals={animals} onRequestDelete={setAnimalToDelete} />} />
          <Route path=":id/editar" element={<EditAnimal animals={animals} onUpdate={updateAnimal} />} />
        </Routes>
      </div>

      <ConfirmDeleteModal animal={animalToDelete} onClose={() => setAnimalToDelete(null)} onConfirm={changeAnimalStatus} />
    </>
  )
}

export default AnimalsPage
