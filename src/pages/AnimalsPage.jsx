import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { LayoutGrid, List, Plus, Sprout } from 'lucide-react';
import TarjetaAnimal from '../components/animals/AnimalCard';
import DetalleAnimal from '../components/animals/AnimalDetail';
import FiltrosAnimal from '../components/animals/AnimalFilters';
import FormularioAnimal from '../components/animals/AnimalForm';
import TablaAnimal from '../components/animals/AnimalTable';
import ModalConfirmarBaja from '../components/animals/ConfirmDeleteModal';
import { animales as mockAnimals } from '../data/animals';
import { leerAlmacenamiento, escribirAlmacenamiento } from '../utils/storage';

const filtrosIniciales = {
  query: '',
  estado: 'Todos',
  especie: 'Todos',
  raza: 'Todos',
  ubicacion: 'Todos'
};

function valoresUnicos(elementos, clave) {
  return [...new Set(elementos.map((elemento) => elemento[clave]).filter(Boolean))].toSorted((a, b) => a.localeCompare(b));
}

function ListaAnimales({ animals: animales, filters: filtros, onFiltersChange: alCambiarFiltros, isLoading: cargando }) {
  const [modoVista, setViewMode] = useState('cards');

  const opciones = useMemo(
    () => ({
      estados: valoresUnicos(animales, 'estado'),
      especies: valoresUnicos(animales, 'especie'),
      razas: valoresUnicos(animales, 'raza'),
      ubicaciones: valoresUnicos(animales, 'ubicacion')
    }),
    [animales]
  );

  const animalesFiltrados = useMemo(() => {
    const consulta = filtros.query.trim().toLowerCase();
    return animales.filter((animal) => {
      const coincideConsulta = !consulta || animal.identificador.toLowerCase().includes(consulta);
      const coincideEstado = filtros.estado === 'Todos' || animal.estado === filtros.estado;
      const coincideEspecie = filtros.especie === 'Todos' || animal.especie === filtros.especie;
      const coincideRaza = filtros.raza === 'Todos' || animal.raza === filtros.raza;
      const coincideUbicacion = filtros.ubicacion === 'Todos' || animal.ubicacion === filtros.ubicacion;
      return coincideConsulta && coincideEstado && coincideEspecie && coincideRaza && coincideUbicacion;
    });
  }, [animales, filtros]);

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
            <button className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold ${modoVista === 'cards' ? 'bg-[#07612d] text-white' : 'text-[#1d1d1b]/65'}`} onClick={() => setViewMode('cards')} type="button">
              <LayoutGrid size={17} /> Tarjetas
            </button>
            <button className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold ${modoVista === 'table' ? 'bg-[#07612d] text-white' : 'text-[#1d1d1b]/65'}`} onClick={() => setViewMode('table')} type="button">
              <List size={17} /> Tabla
            </button>
          </div>
          <Link className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#07612d] px-5 text-sm font-bold text-white shadow-[0_10px_22px_rgba(7,97,45,0.2)] sm:w-auto" to="/animales/nuevo">
            <Plus size={18} /> Registrar Animal
          </Link>
        </div>
      </div>

      <FiltrosAnimal filters={filtros} onChange={alCambiarFiltros} options={opciones} />

      {cargando ?
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((elemento) =>
        <div className="min-h-80 animate-pulse rounded-2xl bg-white shadow-[0_12px_28px_rgba(29,29,27,0.05)]" key={elemento} />
        )}
        </div> :
      null}

      {!cargando && animalesFiltrados.length > 0 && modoVista === 'cards' ?
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {animalesFiltrados.map((animal) =>
        <TarjetaAnimal animal={animal} key={animal.id} />
        )}
        </div> :
      null}

      {!cargando && animalesFiltrados.length > 0 && modoVista === 'table' ? <TablaAnimal animals={animalesFiltrados} /> : null}

      {!cargando && animalesFiltrados.length === 0 ?
      <section className="rounded-2xl border border-[#98a287]/18 bg-white p-8 text-center shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
          <h2 className="text-2xl font-bold text-[#07612d]">Sin animales registrados</h2>
          <p className="mt-2 text-sm text-[#1d1d1b]/70">No hay animales que coincidan con la búsqueda o filtros actuales.</p>
          <Link className="mt-5 inline-flex min-h-11 items-center justify-center rounded-2xl bg-[#07612d] px-5 text-sm font-bold text-white" to="/animales/nuevo">
            Registrar Animal
          </Link>
        </section> :
      null}
    </section>);

}

function NuevoAnimal({ onCreate: alCrear }) {
  const navigate = useNavigate();
  const [error, establecerError] = useState('');

  function manejarEnvio(datos) {
    const animalNuevo = {
      ...datos,
      id: Date.now(),
      estado: 'Activo',
      nombre: datos.nombre || datos.identificador
    };
    const creado = alCrear(animalNuevo);
    if (!creado) {
      establecerError('Ya existe un animal con ese arete SINIIGA/SINIDA. No puede estar registrado en dos ranchos.');
      return;
    }
    navigate(`/animales/${animalNuevo.id}`, { replace: true });
  }

  return (
    <section className="grid gap-5">
      <div>
        <h1 className="text-3xl font-bold text-[#07612d]">Registrar Animal</h1>
        <p className="mt-2 text-sm text-[#1d1d1b]/70">Captura la información principal del animal para integrarlo al inventario ganadero.</p>
      </div>
      {error ? <div className="rounded-2xl border border-[#D32F2F]/20 bg-[#D32F2F]/10 p-4 text-sm font-bold text-[#D32F2F]">{error}</div> : null}
      <FormularioAnimal onSubmit={manejarEnvio} submitLabel="Registrar Animal" />
    </section>);

}

function EditarAnimal({ animals: animales, onUpdate: alActualizar }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const animal = animales.find((elemento) => elemento.id === Number(id));

  if (!animal) {
    return (
      <section className="rounded-2xl border border-[#98a287]/18 bg-white p-6 text-center shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
        <h1 className="text-2xl font-bold text-[#07612d]">Animal no encontrado</h1>
        <button className="mt-5 rounded-2xl bg-[#07612d] px-5 py-3 text-sm font-bold text-white" onClick={() => navigate('/animales')} type="button">
          Volver
        </button>
      </section>);

  }

  function manejarEnvio(datos) {
    const estadoBloqueado = ['Vendido', 'Fallecido'].includes(animal.estado);
    const animalActualizado = { ...animal, ...datos, estado: estadoBloqueado ? animal.estado : datos.estado, nombre: datos.nombre || datos.identificador };
    alActualizar(animalActualizado);
    navigate(`/animales/${animal.id}`, { replace: true });
  }

  return (
    <section className="grid gap-5">
      <div>
        <h1 className="text-3xl font-bold text-[#07612d]">Editar Animal</h1>
        <p className="mt-2 text-sm text-[#1d1d1b]/70">Actualiza los datos de {animal.identificador} sin perder su historial.</p>
      </div>
      <FormularioAnimal initialAnimal={animal} onSubmit={manejarEnvio} submitLabel="Guardar cambios" />
    </section>);

}

function PaginaAnimales() {
  const [animales, establecerAnimales] = useState([]);
  const [filtros, setFilters] = useState(filtrosIniciales);
  const [animalABaja, setAnimalToDelete] = useState(null);
  const [cargando, establecerCargando] = useState(true);

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      establecerAnimales(leerAlmacenamiento('agroweb.animals', mockAnimals));
      establecerCargando(false);
    }, 350);

    return () => window.clearTimeout(temporizador);
  }, []);

  function crearAnimal(animal) {
    if (animales.some((elemento) => elemento.identificador === animal.identificador)) return false;
    establecerAnimales((actual) => {
      const animalesSiguientes = [animal, ...actual];
      escribirAlmacenamiento('agroweb.animals', animalesSiguientes);
      return animalesSiguientes;
    });
    return true;
  }

  function actualizarAnimal(animalActualizado) {
    establecerAnimales((actual) => {
      const animalesSiguientes = actual.map((animal) => animal.id === animalActualizado.id ? { ...animal, ...animalActualizado } : animal);
      escribirAlmacenamiento('agroweb.animals', animalesSiguientes);
      return animalesSiguientes;
    });
  }

  function cambiarEstadoAnimal(estado) {
    if (!animalABaja) return;
    if (animalABaja.estado !== 'Activo') {
      setAnimalToDelete(null);
      return;
    }
    establecerAnimales((actual) => {
      const animalesSiguientes = actual.map((animal) => animal.id === animalABaja.id ? { ...animal, estado } : animal);
      escribirAlmacenamiento('agroweb.animals', animalesSiguientes);
      return animalesSiguientes;
    });
    setAnimalToDelete(null);
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <Routes>
          <Route index element={<ListaAnimales animals={animales} filters={filtros} isLoading={cargando} onFiltersChange={setFilters} />} />
          <Route path="nuevo" element={<NuevoAnimal onCreate={crearAnimal} />} />
          <Route path=":id" element={<DetalleAnimal animals={animales} onRequestDelete={setAnimalToDelete} />} />
          <Route path=":id/editar" element={<EditarAnimal animals={animales} onUpdate={actualizarAnimal} />} />
        </Routes>
      </div>

      <ModalConfirmarBaja animal={animalABaja} onClose={() => setAnimalToDelete(null)} onConfirm={cambiarEstadoAnimal} />
    </>);

}

export default PaginaAnimales;
