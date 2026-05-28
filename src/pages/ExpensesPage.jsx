import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { BadgeDollarSign, CalendarClock, ChartPie, LayoutGrid, List, Plus, ReceiptText, Trophy } from 'lucide-react';
import TarjetaEstadistica from '../components/StatCard';
import VistaPreviaArchivo from '../components/FilePreview';
import TarjetaGasto from '../components/expenses/ExpenseCard';
import GraficaCategoriaGasto from '../components/expenses/ExpenseCategoryChart';
import FiltrosGasto from '../components/expenses/ExpenseFilters';
import FormularioGasto from '../components/expenses/ExpenseForm';
import ResumenGasto from '../components/expenses/ExpenseSummary';
import TablaGasto from '../components/expenses/ExpenseTable';
import GastosRecientes from '../components/expenses/RecentExpenses';
import { obtenerTotalesCategoria, obtenerEntradaPrincipal, mxn } from '../components/expenses/expenseUtils';
import { animales as mockAnimals } from '../data/animals';
import { gastos as mockExpenses } from '../data/expenses';
import { ingresos as mockIncome } from '../data/income';
import { leerAlmacenamiento, escribirAlmacenamiento } from '../utils/storage';

const filtrosIniciales = {
  query: '',
  animalId: 'Todos',
  especie: 'Todos',
  raza: 'Todos',
  fecha: '',
  categoria: 'Todos',
  tipoCompra: ''
};

function obtenerInversionAnimal(gastos) {
  const animalTotals = gastos.reduce((totales, gasto) => {
    const clave = gasto.animalIdentificador || 'Rancho general';
    totales[clave] = (totales[clave] ?? 0) + Number(gasto.precio);
    return totales;
  }, {});

  return obtenerEntradaPrincipal(Object.entries(animalTotals));
}

function PanelGastos({ animals: animales, expenses: gastos, filters: filtros, onFiltersChange: alCambiarFiltros, isLoading: cargando }) {
  const [modoVista, setViewMode] = useState('cards');
  const operationalExpenses = useMemo(() => gastos.filter((gasto) => !gasto.esVenta), [gastos]);
  const animalesPorId = useMemo(() => new Map(animales.map((animal) => [animal.id, animal])), [animales]);

  const gastosFiltrados = useMemo(() => {
    const consulta = filtros.query.trim().toLowerCase();
    const tipo = filtros.tipoCompra.trim().toLowerCase();

    return gastos.filter((gasto) => {
      const animalRelacionado = animalesPorId.get(gasto.animalId);
      const coincideConsulta =
      !consulta ||
      [gasto.tipoCompra, gasto.descripcion, gasto.categoria, gasto.animalIdentificador].some((valor) => String(valor).toLowerCase().includes(consulta));
      const coincideAnimal =
      filtros.animalId === 'Todos' ||
      filtros.animalId === 'general' && gasto.animalId === null ||
      gasto.animalId === Number(filtros.animalId);
      const coincideEspecie = filtros.especie === 'Todos' || animalRelacionado?.especie === filtros.especie;
      const coincideRaza = filtros.raza === 'Todos' || animalRelacionado?.raza === filtros.raza;
      const coincideFecha = !filtros.fecha || gasto.fecha === filtros.fecha;
      const matchesCategoria = filtros.categoria === 'Todos' || gasto.categoria === filtros.categoria;
      const coincideTipo = !tipo || gasto.tipoCompra.toLowerCase().includes(tipo);
      return coincideConsulta && coincideAnimal && coincideEspecie && coincideRaza && coincideFecha && matchesCategoria && coincideTipo;
    });
  }, [animalesPorId, gastos, filtros]);

  const estadisticas = useMemo(() => {
    const total = operationalExpenses.reduce((suma, gasto) => suma + Number(gasto.precio), 0);
    const monthTotal = operationalExpenses.filter((gasto) => gasto.fecha.startsWith('2026-05')).reduce((suma, gasto) => suma + Number(gasto.precio), 0);
    const topCategory = obtenerEntradaPrincipal(Object.entries(obtenerTotalesCategoria(operationalExpenses)));
    const topAnimal = obtenerInversionAnimal(operationalExpenses);

    return [
    { title: 'Total gastado', value: mxn.format(total), detail: 'Inversión acumulada registrada', icon: BadgeDollarSign, tone: 'primary' },
    { title: 'Gastos del mes', value: mxn.format(monthTotal), detail: 'Compras registradas en mayo 2026', icon: CalendarClock, tone: 'warning' },
    { title: 'Categoría con mayor gasto', value: topCategory?.[0] ?? 'Sin datos', detail: topCategory ? mxn.format(topCategory[1]) : 'Sin gastos', icon: ChartPie, tone: 'success' },
    { title: 'Animal con mayor inversión', value: topAnimal?.[0] ?? 'Sin datos', detail: topAnimal ? mxn.format(topAnimal[1]) : 'Sin gastos', icon: Trophy, tone: 'info' }];

  }, [operationalExpenses]);

  return (
    <section className="grid gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="inline-flex min-h-8 items-center gap-2 rounded-full bg-[#FFA000]/14 px-3 text-xs font-bold uppercase tracking-[0.14em] text-[#9b6300]">
            <ReceiptText size={16} />
            Control financiero
          </span>
          <h1 className="mt-4 text-3xl font-bold text-[#07612d] md:text-4xl">Gastos</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#1d1d1b]/70">Controla compras, comprobantes e inversión económica por animal y por categoría del rancho.</p>
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
          <Link className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#07612d] px-5 text-sm font-bold text-white shadow-[0_10px_22px_rgba(7,97,45,0.2)] sm:w-auto" to="/gastos/nuevo">
            <Plus size={18} /> Registrar Gasto
          </Link>
          <Link className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[#07612d]/25 bg-white px-5 text-sm font-bold text-[#07612d] sm:w-auto" to="/gastos/venta">
            <Plus size={18} /> Registrar Venta
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {estadisticas.map((estadistica) =>
        <TarjetaEstadistica key={estadistica.title} {...estadistica} />
        )}
      </div>

      <FiltrosGasto animals={animales} filters={filtros} onChange={alCambiarFiltros} />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <div className="grid gap-5">
          {cargando ? <div className="min-h-80 animate-pulse rounded-2xl bg-white shadow-[0_12px_28px_rgba(29,29,27,0.05)]" /> : null}

          {!cargando && gastosFiltrados.length > 0 && modoVista === 'cards' ?
          <div className="grid gap-5 md:grid-cols-2">
              {gastosFiltrados.map((gasto) =>
            <TarjetaGasto expense={gasto} key={gasto.id} />
            )}
            </div> :
          null}

          {!cargando && gastosFiltrados.length > 0 && modoVista === 'table' ? <TablaGasto expenses={gastosFiltrados} /> : null}

          {!cargando && gastosFiltrados.length === 0 ?
          <section className="rounded-2xl border border-[#98a287]/18 bg-white p-8 text-center shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
              <h2 className="text-2xl font-bold text-[#07612d]">No hay gastos registrados</h2>
              <p className="mt-2 text-sm text-[#1d1d1b]/70">No se encontraron compras con los filtros actuales.</p>
            </section> :
          null}
        </div>

        <GastosRecientes expenses={gastos} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ResumenGasto expenses={operationalExpenses} />
        <GraficaCategoriaGasto expenses={operationalExpenses} />
      </div>
    </section>);

}

function NuevoGasto({ animals: animales, onCreate: alCrear, movement = 'gasto' }) {
  const navigate = useNavigate();
  const esVenta = movement === 'venta';

  function manejarEnvio(gasto) {
    const result = alCrear(gasto);
    navigate(result?.to ?? `/gastos/${gasto.id}`, { replace: true });
  }

  return (
    <section className="grid gap-5">
      <div>
        <h1 className="text-3xl font-bold text-[#07612d]">{esVenta ? 'Registrar Venta de Animal' : 'Registrar Gasto'}</h1>
        <p className="mt-2 text-sm text-[#1d1d1b]/70">{esVenta ? 'Registra la venta, cambia el animal a Vendido y manda el ingreso al reporte.' : 'Captura compras del rancho y relaciónalas con un animal específico cuando aplique.'}</p>
      </div>
      <FormularioGasto animals={animales} defaultMovement={movement} lockMovement onSubmit={manejarEnvio} />
    </section>);

}

function DetalleGasto({ expenses: gastos }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const gasto = gastos.find((elemento) => elemento.id === Number(id));

  if (!gasto) {
    return (
      <section className="rounded-2xl border border-[#98a287]/18 bg-white p-6 text-center shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
        <h1 className="text-2xl font-bold text-[#07612d]">Gasto no encontrado</h1>
        <button className="mt-5 rounded-2xl bg-[#07612d] px-5 py-3 text-sm font-bold text-white" onClick={() => navigate('/gastos')} type="button">
          Volver a Gastos
        </button>
      </section>);

  }

  return (
    <section className="grid gap-5">
      <button className="w-fit rounded-2xl border border-[#07612d]/25 bg-white px-5 py-3 text-sm font-bold text-[#07612d]" onClick={() => navigate('/gastos')} type="button">
        Volver
      </button>
      <article className="rounded-2xl border border-[#98a287]/18 bg-white p-4 shadow-[0_12px_28px_rgba(29,29,27,0.07)] md:p-6">
        <p className="text-sm font-bold text-[#4CAF50]">{gasto.esVenta ? 'Venta' : 'Gasto'} #{gasto.id}</p>
        <h1 className="mt-2 break-words text-3xl font-bold text-[#07612d]">{gasto.tipoCompra}</h1>
        <strong className="mt-4 block break-words text-3xl font-bold text-[#1d1d1b] md:text-4xl">{mxn.format(gasto.precio)}</strong>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
          ['Fecha', gasto.fecha],
          ['Animal relacionado', gasto.animalIdentificador],
          ['Categoría', gasto.categoria],
          ['Tipo de movimiento', gasto.esVenta ? 'Venta de animal' : 'Gasto'],
          ['Comprobante', gasto.comprobante ? gasto.comprobante.name || 'Cargado' : 'Sin comprobante'],
          ['ID del gasto', gasto.id]].
          map(([etiqueta, valor]) =>
          <div className="rounded-2xl bg-[#F4F4F4] p-4" key={etiqueta}>
              <p className="text-xs font-bold uppercase text-[#98a287]">{etiqueta}</p>
              <p className="mt-2 break-words text-sm font-semibold text-[#1d1d1b]">{valor}</p>
            </div>
          )}
        </div>
        <div className="mt-5 rounded-2xl bg-[#F4F4F4] p-4">
          <p className="text-xs font-bold uppercase text-[#98a287]">Descripción</p>
          <p className="mt-2 break-words text-sm leading-6 text-[#1d1d1b]/75">{gasto.descripcion}</p>
        </div>
        <VistaPreviaArchivo file={gasto.comprobante} title="Previsualización del comprobante" />
      </article>
    </section>);

}

function PaginaGastos() {
  const [animales, establecerAnimales] = useState([]);
  const [gastos, establecerGastos] = useState([]);
  const [ingresos, establecerIngresos] = useState([]);
  const [filtros, setFilters] = useState(filtrosIniciales);
  const [cargando, establecerCargando] = useState(true);
  const [mensaje, establecerMensaje] = useState('');

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      establecerAnimales(leerAlmacenamiento('agroweb.animals', mockAnimals));
      establecerGastos(leerAlmacenamiento('agroweb.expenses', mockExpenses));
      establecerIngresos(leerAlmacenamiento('agroweb.income', mockIncome));
      establecerCargando(false);
    }, 350);

    return () => window.clearTimeout(temporizador);
  }, []);

  function crearGasto(gasto) {
    if (gasto.esVenta) {
      const registroIngreso = {
        id: Date.now(),
        tipo: 'Venta de animal',
        animalId: gasto.animalId,
        animalIdentificador: gasto.animalIdentificador,
        monto: gasto.precio,
        fecha: gasto.fecha,
        descripcion: gasto.descripcion
      };
      const ingresosSiguientes = [registroIngreso, ...ingresos];
      const animalesSiguientes = animales.map((animal) => animal.id === gasto.animalId ? { ...animal, estado: 'Vendido', ubicacion: 'Historial de ventas' } : animal);
      const gastosSiguientes = [gasto, ...gastos];
      establecerIngresos(ingresosSiguientes);
      establecerAnimales(animalesSiguientes);
      establecerGastos(gastosSiguientes);
      escribirAlmacenamiento('agroweb.income', ingresosSiguientes);
      escribirAlmacenamiento('agroweb.animals', animalesSiguientes);
      escribirAlmacenamiento('agroweb.expenses', gastosSiguientes);
      establecerMensaje(`Venta registrada. ${gasto.animalIdentificador} cambió a estado Vendido y el ingreso se reflejará en Reportes.`);
      return { to: `/gastos/${gasto.id}` };
    }

    const gastosSiguientes = [gasto, ...gastos];
    establecerGastos(gastosSiguientes);
    escribirAlmacenamiento('agroweb.expenses', gastosSiguientes);
    return { to: `/gastos/${gasto.id}` };
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        {mensaje ? <div className="mb-5 rounded-2xl border border-[#4CAF50]/20 bg-[#4CAF50]/10 p-4 text-sm font-bold text-[#2f8f36]">{mensaje}</div> : null}
        <Routes>
          <Route index element={<PanelGastos animals={animales} expenses={gastos} filters={filtros} isLoading={cargando} onFiltersChange={setFilters} />} />
          <Route path="nuevo" element={<NuevoGasto animals={animales} onCreate={crearGasto} />} />
          <Route path="venta" element={<NuevoGasto animals={animales} movement="venta" onCreate={crearGasto} />} />
          <Route path=":id" element={<DetalleGasto expenses={gastos} />} />
        </Routes>
    </div>);

}

export default PaginaGastos;
