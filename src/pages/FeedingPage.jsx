import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { CalendarClock, LayoutGrid, List, PackageCheck, Plus, Scale, Utensils, WalletCards } from 'lucide-react';
import TarjetaEstadistica from '../components/StatCard';
import AlertaAlimentacion from '../components/feeding/FeedingAlert';
import FiltrosAlimentacion from '../components/feeding/FeedingFilters';
import FormularioAlimentacion from '../components/feeding/FeedingForm';
import HistorialAlimentacion from '../components/feeding/FeedingHistory';
import InsigniaEstadoAlimentacion from '../components/feeding/FeedingStatusBadge';
import ResumenAlimentacion from '../components/feeding/FeedingSummary';
import { normalizarEstadoAlimentacion } from '../components/feeding/feedingUtils';
import { mxn } from '../components/expenses/expenseUtils';
import { animales as mockAnimals } from '../data/animals';
import { alimentacion as mockFeeding } from '../data/feeding';
import { leerAlmacenamiento, escribirAlmacenamiento } from '../utils/storage';

const filtrosIniciales = {
  query: '',
  animalId: 'Todos',
  fecha: '',
  tipoAlimento: 'Todos'
};

const opcionesEstadoAlimentacion = ['Registrado', 'Pendiente', 'Atrasado', 'Completado'];

function PanelAlimentacion({ animals: animales, records: registros, filters: filtros, onFiltersChange: alCambiarFiltros, isLoading: cargando, onStatusChange: alCambiarEstado }) {
  const [modoVista, setViewMode] = useState('cards');

  const registrosFiltrados = useMemo(() => {
    const consulta = filtros.query.trim().toLowerCase();
    return registros.filter((registro) => {
      const coincideConsulta =
      !consulta ||
      [registro.animalIdentificador, registro.responsable, registro.observaciones, registro.grupo].some((valor) => String(valor ?? '').toLowerCase().includes(consulta));
      const coincideAnimal =
      filtros.animalId === 'Todos' ||
      filtros.animalId === 'grupo' && registro.animalId === null ||
      registro.animalId === Number(filtros.animalId);
      const coincideFecha = !filtros.fecha || registro.fecha === filtros.fecha;
      const coincideAlimento = filtros.tipoAlimento === 'Todos' || registro.tipoAlimento === filtros.tipoAlimento;
      return coincideConsulta && coincideAnimal && coincideFecha && coincideAlimento;
    });
  }, [filtros, registros]);

  const consumoTotal = registros.reduce((suma, registro) => suma + Number(registro.cantidad), 0);
  const costoTotal = registros.reduce((suma, registro) => suma + Number(registro.costoAproximado), 0);
  const pendientes = registros.filter((registro) => registro.estado === 'Pendiente' || registro.estado === 'Atrasado');

  const estadisticas = [
  { title: 'Total de registros', value: registros.length, detail: 'Historial de alimentación', icon: PackageCheck, tone: 'primary' },
  { title: 'Consumo total', value: `${consumoTotal} unidades`, detail: 'Suma general de cantidades', icon: Scale, tone: 'success' },
  { title: 'Costo total de alimentación', value: mxn.format(costoTotal), detail: 'Costo aproximado acumulado', icon: WalletCards, tone: 'warning' },
  { title: 'Alimentaciones pendientes', value: pendientes.length, detail: 'Pendientes o atrasadas', icon: CalendarClock, tone: pendientes.length ? 'danger' : 'success' }];


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
            <button className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold ${modoVista === 'cards' ? 'bg-[#07612d] text-white' : 'text-[#1d1d1b]/65'}`} onClick={() => setViewMode('cards')} type="button">
              <LayoutGrid size={17} /> Tarjetas
            </button>
            <button className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold ${modoVista === 'table' ? 'bg-[#07612d] text-white' : 'text-[#1d1d1b]/65'}`} onClick={() => setViewMode('table')} type="button">
              <List size={17} /> Tabla
            </button>
          </div>
          <Link className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#07612d] px-5 text-sm font-bold text-white shadow-[0_10px_22px_rgba(7,97,45,0.2)] sm:w-auto" to="/alimentacion/nuevo">
            <Plus size={18} /> Registrar Alimentación
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {estadisticas.map((estadistica) =>
        <TarjetaEstadistica key={estadistica.title} {...estadistica} />
        )}
      </div>

      <FiltrosAlimentacion animals={animales} filters={filtros} onChange={alCambiarFiltros} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
        <div className="grid gap-5">
          {cargando ? <div className="min-h-80 animate-pulse rounded-2xl bg-white shadow-[0_12px_28px_rgba(29,29,27,0.05)]" /> : null}
          {!cargando ? <HistorialAlimentacion onStatusChange={alCambiarEstado} records={registrosFiltrados} viewMode={modoVista} /> : null}
        </div>
        <AlertaAlimentacion records={registros} />
      </div>

      <ResumenAlimentacion records={registros} />
    </section>);

}

function NuevaAlimentacion({ animals: animales, onCreate: alCrear }) {
  const navigate = useNavigate();

  function manejarEnvio(registro) {
    alCrear(registro);
    navigate(`/alimentacion/${registro.id}`, { replace: true });
  }

  return (
    <section className="grid gap-5">
      <div>
        <h1 className="text-3xl font-bold text-[#07612d]">Registrar Alimentación</h1>
        <p className="mt-2 text-sm text-[#1d1d1b]/70">Captura alimento, cantidad, horario, responsable y costo aproximado.</p>
      </div>
      <FormularioAlimentacion animals={animales} onSubmit={manejarEnvio} />
    </section>);

}

function DetalleAlimentacion({ records: registros, onStatusChange: alCambiarEstado }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const registro = registros.find((elemento) => elemento.id === Number(id));

  if (!registro) {
    return (
      <section className="rounded-2xl border border-[#98a287]/18 bg-white p-6 text-center shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
        <h1 className="text-2xl font-bold text-[#07612d]">Registro no encontrado</h1>
        <button className="mt-5 rounded-2xl bg-[#07612d] px-5 py-3 text-sm font-bold text-white" onClick={() => navigate('/alimentacion')} type="button">
          Volver a Alimentación
        </button>
      </section>);

  }

  return (
    <section className="grid gap-5">
      <button className="w-full rounded-2xl border border-[#07612d]/25 bg-white px-5 py-3 text-sm font-bold text-[#07612d] sm:w-fit" onClick={() => navigate('/alimentacion')} type="button">
        Volver
      </button>
      <article className="rounded-2xl border border-[#98a287]/18 bg-white p-4 shadow-[0_12px_28px_rgba(29,29,27,0.07)] md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[#4CAF50]">Registro #{registro.id}</p>
            <h1 className="mt-2 break-words text-2xl font-bold text-[#07612d] md:text-3xl">{registro.tipoAlimento}</h1>
            <p className="mt-2 text-sm text-[#1d1d1b]/70">{registro.animalIdentificador}</p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <InsigniaEstadoAlimentacion estado={registro.estado} />
            <select className="h-11 rounded-2xl border border-[#98a287]/25 bg-white px-4 text-sm font-bold text-[#1d1d1b] outline-none focus:border-[#07612d]" onChange={(elemento) => alCambiarEstado(registro.id, elemento.target.value)} value={registro.estado}>
              {opcionesEstadoAlimentacion.map((status) =>
              <option key={status} value={status}>
                  {status}
                </option>
              )}
            </select>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
          ['Cantidad', `${registro.cantidad} ${registro.unidad}`],
          ['Fecha y hora', `${registro.fecha} ${registro.hora}`],
          ['Responsable', registro.responsable],
          ['Costo aproximado', mxn.format(registro.costoAproximado)],
          ['Animal o grupo', registro.animalIdentificador],
          ['Estado', registro.estado]].
          map(([etiqueta, valor]) =>
          <div className="rounded-2xl bg-[#F4F4F4] p-4" key={etiqueta}>
              <p className="text-xs font-bold uppercase text-[#98a287]">{etiqueta}</p>
              <p className="mt-2 break-words text-sm font-semibold text-[#1d1d1b]">{valor}</p>
            </div>
          )}
        </div>

        {registro.nutricion ?
        <section className="mt-5 rounded-2xl bg-[#F4F4F4] p-4">
            <div>
              <p className="text-xs font-bold uppercase text-[#98a287]">Datos nutricionales</p>
              <h2 className="mt-1 text-xl font-bold text-[#07612d]">Perfil del alimento</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
            ['Proteína', `${registro.nutricion.proteina}%`],
            ['Fibra', `${registro.nutricion.fibra}%`],
            ['Energía', `${registro.nutricion.energia} Mcal/kg`],
            ['Materia seca', `${registro.nutricion.materiaSeca}%`]].
            map(([etiqueta, valor]) =>
            <div className="rounded-2xl bg-white p-4" key={etiqueta}>
                  <p className="text-xs font-bold uppercase text-[#98a287]">{etiqueta}</p>
                  <p className="mt-2 break-words text-sm font-semibold text-[#1d1d1b]">{valor}</p>
                </div>
            )}
            </div>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-bold uppercase text-[#98a287]">Minerales / vitaminas</p>
                <p className="mt-2 text-sm leading-6 text-[#1d1d1b]/75">{registro.nutricion.minerales || 'Sin datos registrados.'}</p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-bold uppercase text-[#98a287]">Notas nutricionales</p>
                <p className="mt-2 text-sm leading-6 text-[#1d1d1b]/75">{registro.nutricion.notas || 'Sin notas registradas.'}</p>
              </div>
            </div>
          </section> :
        null}

        <div className="mt-5 rounded-2xl bg-[#F4F4F4] p-4">
          <p className="text-xs font-bold uppercase text-[#98a287]">Observaciones</p>
          <p className="mt-2 text-sm leading-6 text-[#1d1d1b]/75">{registro.observaciones || 'Sin observaciones registradas.'}</p>
        </div>
      </article>
    </section>);

}

function PaginaAlimentacion() {
  const [animales, establecerAnimales] = useState([]);
  const [registros, establecerRegistros] = useState([]);
  const [filtros, setFilters] = useState(filtrosIniciales);
  const [cargando, establecerCargando] = useState(true);

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      establecerAnimales(leerAlmacenamiento('agroweb.animals', mockAnimals));
      establecerRegistros(leerAlmacenamiento('agroweb.feeding', mockFeeding).map((registro) => normalizarEstadoAlimentacion(registro)));
      establecerCargando(false);
    }, 350);

    return () => window.clearTimeout(temporizador);
  }, []);

  function crearRegistro(registro) {
    establecerRegistros((actual) => {
      const registrosSiguientes = [normalizarEstadoAlimentacion(registro), ...actual];
      escribirAlmacenamiento('agroweb.feeding', registrosSiguientes);
      return registrosSiguientes;
    });
  }

  function actualizarEstadoRegistro(idRegistro, estado) {
    establecerRegistros((actual) => {
      const registrosSiguientes = actual.map((registro) => registro.id === idRegistro ? { ...registro, estado } : registro);
      escribirAlmacenamiento('agroweb.feeding', registrosSiguientes);
      return registrosSiguientes;
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 md:px-6 md:py-6">
        <Routes>
          <Route index element={<PanelAlimentacion animals={animales} filters={filtros} isLoading={cargando} onFiltersChange={setFilters} onStatusChange={actualizarEstadoRegistro} records={registros} />} />
          <Route path="nuevo" element={<NuevaAlimentacion animals={animales} onCreate={crearRegistro} />} />
          <Route path=":id" element={<DetalleAlimentacion onStatusChange={actualizarEstadoRegistro} records={registros} />} />
        </Routes>
    </div>);

}

export default PaginaAlimentacion;
