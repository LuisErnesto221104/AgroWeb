import { useEffect, useMemo, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import TarjetaPanel from '../components/DashboardCard';
import { catalogoAnimal } from '../data/animalCatalog';
import { animales } from '../data/animals';
import { gastos } from '../data/expenses';
import { alimentacion } from '../data/feeding';
import { eventosSanitarios } from '../data/healthEvents';
import { leerAlmacenamiento } from '../utils/storage';

const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

function Inicio() {
  const [cargando, establecerCargando] = useState(true);
  const [especieSeleccionada, establecerEspecieSeleccionada] = useState('Bovino');

  useEffect(() => {
    const temporizador = window.setTimeout(() => establecerCargando(false), 350);
    return () => window.clearTimeout(temporizador);
  }, []);

  const datosPanel = useMemo(() => {
    const animalesActuales = leerAlmacenamiento('agroweb.animals', animales);
    const gastosActuales = leerAlmacenamiento('agroweb.expenses', gastos);
    const alimentacionActual = leerAlmacenamiento('agroweb.feeding', alimentacion);
    const eventosSanitariosActuales = leerAlmacenamiento('agroweb.healthEvents', eventosSanitarios);
    return { currentAnimals: animalesActuales, currentExpenses: gastosActuales, currentFeeding: alimentacionActual, currentHealthEvents: eventosSanitariosActuales };
  }, []);

  const resumenesTipo = useMemo(
    () =>
    Object.entries(catalogoAnimal).map(([species, catalog]) => {
      const animalesPorEspecie = datosPanel.currentAnimals.filter((animal) => animal.especie === species);
      const ids = new Set(animalesPorEspecie.map((animal) => animal.id));
      const gastosTipo = datosPanel.currentExpenses.filter((gasto) => ids.has(gasto.animalId)).reduce((suma, gasto) => suma + Number(gasto.precio ?? 0), 0);
      const alimentacionTipo = datosPanel.currentFeeding.filter((elemento) => ids.has(elemento.animalId)).reduce((suma, elemento) => suma + Number(elemento.costo ?? elemento.costoAproximado ?? 0), 0);
      const sanidadTipo = datosPanel.currentHealthEvents.filter((evento) => ids.has(evento.animalId));
      return { species, catalog, count: animalesPorEspecie.length, active: animalesPorEspecie.filter((animal) => animal.estado === 'Activo').length, costs: gastosTipo + alimentacionTipo, events: sanidadTipo.length };
    }),
    [datosPanel]
  );

  const resumenSeleccionado = resumenesTipo.find((summary) => summary.species === especieSeleccionada) ?? resumenesTipo[0];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 md:px-6">
        <TarjetaPanel className="overflow-hidden">
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
              <p className="mt-5 max-w-xl rounded-2xl bg-[#07612d]/8 px-4 py-3 text-sm font-semibold leading-6 text-[#07612d]">
                El menú lateral mantiene la navegación principal siempre disponible; este inicio se concentra en el estado del inventario por especie.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-[#07612d] p-5 text-white">
                <p className="text-sm font-semibold text-white/75">Especies gestionadas</p>
                <strong className="mt-2 block text-4xl font-bold">{Object.keys(catalogoAnimal).length}</strong>
                <p className="mt-3 text-sm leading-6 text-white/78">Catálogo productivo configurado para el rancho.</p>
              </div>
              <div className="rounded-2xl bg-[#F4F4F4] p-5">
                <p className="text-sm font-semibold text-[#98a287]">Alimentación registrada</p>
                <strong className="mt-2 block text-4xl font-bold text-[#1d1d1b]">{leerAlmacenamiento('agroweb.feeding', alimentacion).length}</strong>
                <p className="mt-3 text-sm leading-6 text-[#1d1d1b]/70">Registros mock usados para calcular costos del rancho.</p>
              </div>
            </div>
          </section>
        </TarjetaPanel>

        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-[#07612d]">Tipos de animales del rancho</h2>
            <p className="mt-1 text-sm text-[#98a287]">Selecciona una especie para ver inventario, sanidad, costos y recomendaciones.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {cargando ?
          [1, 2, 3, 4].map((elemento) => <div className="min-h-56 animate-pulse rounded-2xl bg-white" key={elemento} />) :
          resumenesTipo.map((summary) =>
          <button className={`overflow-hidden rounded-2xl border bg-white text-left shadow-[0_12px_28px_rgba(29,29,27,0.07)] transition ${especieSeleccionada === summary.species ? 'border-[#07612d]' : 'border-[#98a287]/18 hover:border-[#07612d]/35'}`} key={summary.species} onClick={() => establecerEspecieSeleccionada(summary.species)} type="button">
                    <div className="flex h-40 w-full items-center justify-center bg-[#F4F4F4] p-3">
                      <img alt={summary.species} className="max-h-full w-full object-contain" src={summary.catalog.image} />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-[#07612d]">{summary.species}</h3>
                      <p className="mt-1 text-sm font-semibold text-[#1d1d1b]/70">{summary.count} registrados · {summary.active} activos</p>
                    </div>
                  </button>
          )}
          </div>

          {resumenSeleccionado ?
        <TarjetaPanel className="mt-6 p-5">
              <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
                <div className="flex min-h-72 items-center justify-center rounded-2xl bg-[#F4F4F4] p-4">
                  <img alt={resumenSeleccionado.species} className="max-h-72 w-full object-contain" src={resumenSeleccionado.catalog.image} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#07612d]">{resumenSeleccionado.species}</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-[#F4F4F4] p-4"><p className="text-xs font-bold uppercase text-[#98a287]">Cantidad</p><p className="mt-2 text-2xl font-bold">{resumenSeleccionado.count}</p></div>
                    <div className="rounded-2xl bg-[#F4F4F4] p-4"><p className="text-xs font-bold uppercase text-[#98a287]">Eventos sanitarios</p><p className="mt-2 text-2xl font-bold">{resumenSeleccionado.events}</p></div>
                    <div className="rounded-2xl bg-[#F4F4F4] p-4"><p className="text-xs font-bold uppercase text-[#98a287]">Costos</p><p className="mt-2 break-words text-xl font-bold">{currency.format(resumenSeleccionado.costs)}</p></div>
                  </div>
                  <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    <div className="rounded-2xl bg-[#F4F4F4] p-4">
                      <p className="text-xs font-bold uppercase text-[#98a287]">Razas comunes en México</p>
                      <p className="mt-2 text-sm leading-6 text-[#1d1d1b]/75">{resumenSeleccionado.catalog.razas.join(', ')}</p>
                    </div>
                    <div className="rounded-2xl bg-[#F4F4F4] p-4">
                      <p className="text-xs font-bold uppercase text-[#98a287]">Nutrición recomendada</p>
                      <p className="mt-2 text-sm leading-6 text-[#1d1d1b]/75">{resumenSeleccionado.catalog.nutricion}</p>
                    </div>
                  </div>
                  <div className="mt-3 rounded-2xl bg-[#07612d]/8 p-4">
                    <p className="text-xs font-bold uppercase text-[#07612d]">Recomendación profesional</p>
                    <p className="mt-2 text-sm leading-6 text-[#1d1d1b]/75">{resumenSeleccionado.catalog.recomendaciones}</p>
                  </div>
                </div>
              </div>
            </TarjetaPanel> :
        null}
        </section>
    </div>);

}

export default Inicio;
