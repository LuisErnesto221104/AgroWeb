import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { CalendarDays, HeartPulse, LayoutGrid, List, Plus, Stethoscope, Syringe, TriangleAlert } from 'lucide-react';
import TarjetaEstadistica from '../components/StatCard';
import TarjetaEventoSanitario from '../components/health/HealthEventCard';
import FormularioEventoSanitario from '../components/health/HealthEventForm';
import TablaEventoSanitario from '../components/health/HealthEventTable';
import FiltrosSanidad from '../components/health/HealthFilters';
import InsigniaEstadoSanidad from '../components/health/HealthStatusBadge';
import CalendarioSanitario from '../components/health/SanitaryCalendar';
import EventosSanitariosProximos from '../components/health/UpcomingHealthEvents';
import { animales as mockAnimals } from '../data/animals';
import { eventosSanitarios as mockHealthEvents } from '../data/healthEvents';
import { leerAlmacenamiento, escribirAlmacenamiento } from '../utils/storage';

const hoy = '2026-05-23';

const filtrosIniciales = {
  animalId: 'Todos',
  tipo: 'Todos',
  estado: 'Todos',
  fecha: ''
};

function estaVencido(evento) {
  const fechaObjetivo = evento.proximaAplicacion || evento.fecha;
  return evento.estado !== 'Completado' && fechaObjetivo && fechaObjetivo < hoy;
}

function estaProximo(evento) {
  const fechaObjetivo = evento.proximaAplicacion || evento.fecha;
  return evento.estado === 'Pendiente' && fechaObjetivo && fechaObjetivo >= hoy;
}

function sanearEstado(evento) {
  return estaVencido(evento) ? { ...evento, estado: 'Vencido' } : evento;
}

const opcionesEstadoSanidad = ['Completado', 'Pendiente', 'Vencido'];

function HealthDetail({ events: eventos, onStatusChange: alCambiarEstado }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const evento = eventos.find((elemento) => elemento.id === Number(id));

  if (!evento) {
    return (
      <section className="rounded-2xl border border-[#98a287]/18 bg-white p-6 text-center shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
        <h1 className="text-2xl font-bold text-[#07612d]">Evento no encontrado</h1>
        <p className="mt-2 text-sm text-[#1d1d1b]/70">El registro sanitario solicitado no existe.</p>
        <button className="mt-5 rounded-2xl bg-[#07612d] px-5 py-3 text-sm font-bold text-white" onClick={() => navigate('/sanidad')} type="button">
          Volver a Sanidad
        </button>
      </section>);

  }

  return (
    <section className="grid gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#07612d]/25 bg-white px-4 text-sm font-bold text-[#07612d]" onClick={() => navigate('/sanidad')} type="button">
          Volver
        </button>
        <div className="flex flex-col gap-2 sm:items-end">
          <InsigniaEstadoSanidad estado={evento.estado} />
          <select className="h-11 rounded-2xl border border-[#98a287]/25 bg-white px-4 text-sm font-bold text-[#1d1d1b] outline-none focus:border-[#07612d]" onChange={(elemento) => alCambiarEstado(evento.id, elemento.target.value)} value={evento.estado}>
            {opcionesEstadoSanidad.map((status) =>
            <option key={status} value={status}>
                {status}
              </option>
            )}
          </select>
        </div>
      </div>

      <article className="rounded-2xl border border-[#98a287]/18 bg-white p-4 shadow-[0_12px_28px_rgba(29,29,27,0.07)] md:p-6">
        <p className="text-sm font-bold text-[#4CAF50]">{evento.animalIdentificador}</p>
        <h1 className="mt-2 break-words text-2xl font-bold text-[#07612d] md:text-3xl">{evento.tipo}</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
          ['Fecha del evento', evento.fecha],
          ['Producto aplicado', evento.producto],
          ['Dosis', evento.dosis],
          ['Responsable', evento.responsable],
          ['Próxima aplicación', evento.proximaAplicacion || 'Sin fecha'],
          ['ID del evento', evento.id]].
          map(([etiqueta, valor]) =>
          <div className="rounded-2xl bg-[#F4F4F4] p-4" key={etiqueta}>
              <p className="text-xs font-bold uppercase text-[#98a287]">{etiqueta}</p>
              <p className="mt-2 text-sm font-semibold text-[#1d1d1b]">{valor}</p>
            </div>
          )}
        </div>
        <div className="mt-5 rounded-2xl bg-[#F4F4F4] p-4">
          <p className="text-xs font-bold uppercase text-[#98a287]">Observaciones</p>
          <p className="mt-2 text-sm leading-6 text-[#1d1d1b]/75">{evento.observaciones || 'Sin observaciones registradas.'}</p>
        </div>
      </article>
    </section>);

}

function NuevoEventoSanitario({ animals: animales, onCreate: alCrear }) {
  const navigate = useNavigate();

  function manejarEnvio(evento) {
    alCrear(evento);
    navigate(`/sanidad/${evento.id}`, { replace: true });
  }

  return (
    <section className="grid gap-5">
      <div>
        <h1 className="text-3xl font-bold text-[#07612d]">Registrar Evento Sanitario</h1>
        <p className="mt-2 text-sm text-[#1d1d1b]/70">Captura vacunas, desparasitantes, tratamientos, revisiones, enfermedades u otros eventos.</p>
      </div>
      <FormularioEventoSanitario animals={animales} onSubmit={manejarEnvio} />
    </section>);

}

function PanelSanidad({ animals: animales, events: eventos, filters: filtros, onFiltersChange: alCambiarFiltros, isLoading: cargando, onStatusChange: alCambiarEstado }) {
  const [modoVista, setViewMode] = useState('cards');
  const eventosFiltrados = useMemo(() => {
    return eventos.filter((evento) => {
      const coincideAnimal = filtros.animalId === 'Todos' || evento.animalId === Number(filtros.animalId);
      const coincideTipo = filtros.tipo === 'Todos' || evento.tipo === filtros.tipo;
      const coincideEstado = filtros.estado === 'Todos' || evento.estado === filtros.estado;
      const coincideFecha = !filtros.fecha || evento.fecha === filtros.fecha || evento.proximaAplicacion === filtros.fecha;
      return coincideAnimal && coincideTipo && coincideEstado && coincideFecha;
    });
  }, [eventos, filtros]);

  const eventosProximos = useMemo(() => eventos.filter((evento) => evento.estado === 'Vencido' || estaProximo(evento)), [eventos]);

  const estadisticas = useMemo(
    () => [
    { title: 'Total de eventos', value: eventos.length, detail: 'Historial sanitario registrado', icon: HeartPulse, tone: 'primary' },
    { title: 'Próximas vacunas', value: eventos.filter((evento) => evento.tipo === 'Vacuna' && estaProximo(evento)).length, detail: 'Aplicaciones pendientes', icon: Syringe, tone: 'warning' },
    { title: 'Eventos vencidos', value: eventos.filter((evento) => evento.estado === 'Vencido').length, detail: 'Requieren atención inmediata', icon: TriangleAlert, tone: 'danger' },
    { title: 'Tratamientos activos', value: eventos.filter((evento) => evento.tipo === 'Tratamiento' && evento.estado === 'Pendiente').length, detail: 'Seguimiento veterinario', icon: Stethoscope, tone: 'info' }],

    [eventos]
  );

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
            <button className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold ${modoVista === 'cards' ? 'bg-[#07612d] text-white' : 'text-[#1d1d1b]/65'}`} onClick={() => setViewMode('cards')} type="button">
              <LayoutGrid size={17} /> Tarjetas
            </button>
            <button className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-bold ${modoVista === 'table' ? 'bg-[#07612d] text-white' : 'text-[#1d1d1b]/65'}`} onClick={() => setViewMode('table')} type="button">
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
        {estadisticas.map((estadistica) =>
        <TarjetaEstadistica key={estadistica.title} {...estadistica} />
        )}
      </div>

      <FiltrosSanidad animals={animales} filters={filtros} onChange={alCambiarFiltros} />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <div className="grid gap-5">
          {cargando ?
          <div className="min-h-80 animate-pulse rounded-2xl bg-white shadow-[0_12px_28px_rgba(29,29,27,0.05)]" /> :
          null}

          {!cargando && eventosFiltrados.length > 0 && modoVista === 'cards' ?
          <div className="grid gap-5 md:grid-cols-2">
              {eventosFiltrados.map((evento) =>
            <TarjetaEventoSanitario event={evento} key={evento.id} onStatusChange={alCambiarEstado} />
            )}
            </div> :
          null}

          {!cargando && eventosFiltrados.length > 0 && modoVista === 'table' ? <TablaEventoSanitario events={eventosFiltrados} onStatusChange={alCambiarEstado} /> : null}

          {!cargando && eventosFiltrados.length === 0 ?
          <section className="rounded-2xl border border-[#98a287]/18 bg-white p-8 text-center shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
              <h2 className="text-2xl font-bold text-[#07612d]">No hay eventos sanitarios registrados</h2>
              <p className="mt-2 text-sm text-[#1d1d1b]/70">No se encontraron eventos con los filtros actuales.</p>
            </section> :
          null}
        </div>

        <EventosSanitariosProximos events={eventosProximos} />
      </div>

      <CalendarioSanitario events={eventos} />
    </section>);

}

function PaginaSanidad({ calendarOnly: soloCalendario = false }) {
  const [animales, establecerAnimales] = useState([]);
  const [eventos, establecerEventos] = useState([]);
  const [filtros, setFilters] = useState(filtrosIniciales);
  const [cargando, establecerCargando] = useState(true);

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      establecerAnimales(leerAlmacenamiento('agroweb.animals', mockAnimals));
      establecerEventos(leerAlmacenamiento('agroweb.healthEvents', mockHealthEvents).map(sanearEstado));
      establecerCargando(false);
    }, 350);

    return () => window.clearTimeout(temporizador);
  }, []);

  function crearEvento(evento) {
    establecerEventos((actual) => {
      const eventosSiguientes = [sanearEstado(evento), ...actual];
      escribirAlmacenamiento('agroweb.healthEvents', eventosSiguientes);
      return eventosSiguientes;
    });
  }

  function actualizarEstadoEvento(idEvento, estado) {
    establecerEventos((actual) => {
      const eventosSiguientes = actual.map((evento) => evento.id === idEvento ? { ...evento, estado } : evento);
      escribirAlmacenamiento('agroweb.healthEvents', eventosSiguientes);
      return eventosSiguientes;
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        {soloCalendario ?
      <section className="grid gap-5">
            <div>
              <h1 className="text-3xl font-bold text-[#07612d]">Calendario sanitario</h1>
              <p className="mt-2 text-sm text-[#1d1d1b]/70">Consulta próximas aplicaciones y eventos médicos programados.</p>
            </div>
            <CalendarioSanitario events={eventos} />
          </section> :

      <Routes>
            <Route index element={<PanelSanidad animals={animales} events={eventos} filters={filtros} isLoading={cargando} onFiltersChange={setFilters} onStatusChange={actualizarEstadoEvento} />} />
            <Route path="nuevo" element={<NuevoEventoSanitario animals={animales} onCreate={crearEvento} />} />
            <Route path=":id" element={<HealthDetail events={eventos} onStatusChange={actualizarEstadoEvento} />} />
          </Routes>
      }
    </div>);

}

export default PaginaSanidad;
