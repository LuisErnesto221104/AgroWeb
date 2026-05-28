import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Beef, CircleDollarSign, FileBarChart, PackageCheck, RefreshCw, TrendingDown, TrendingUp, WalletCards } from 'lucide-react';
import TarjetaEstadistica from '../components/StatCard';
import TablaInversionAnimal from '../components/reports/AnimalInvestmentTable';
import ResumenGastoCategoria from '../components/reports/CategoryExpenseSummary';
import BotonExportarReporte from '../components/reports/ExportReportButton';
import ReporteMensual from '../components/reports/MonthlyReport';
import ResumenGananciasPerdidas from '../components/reports/ProfitLossSummary';
import TarjetaReporte from '../components/reports/ReportCard';
import FiltrosReporte from '../components/reports/ReportFilters';
import { mxn } from '../components/expenses/expenseUtils';
import { animales as mockAnimals } from '../data/animals';
import { gastos as mockExpenses } from '../data/expenses';
import { alimentacion as mockFeeding } from '../data/feeding';
import { eventosSanitarios as mockHealthEvents } from '../data/healthEvents';
import { ingresos as mockIncome } from '../data/income';
import { leerAlmacenamiento } from '../utils/storage';

const filtrosIniciales = {
  tipoReporte: 'general',
  animalId: 'Todos',
  especie: 'Todos',
  raza: 'Todos',
  desde: '',
  hasta: ''
};

const hoy = new Date().toISOString().slice(0, 10);

function validarFiltrosReporte(filtros) {
  const errors = {};

  if (filtros.tipoReporte !== 'animal' && filtros.animalId !== 'Todos') {
    errors.animal = 'Solo se puede seleccionar un animal cuando el reporte es “Por animal”.';
  }

  if (filtros.tipoReporte === 'animal' && filtros.animalId === 'Todos') {
    errors.animal = 'Selecciona un animal para generar el reporte por animal.';
  }

  if (filtros.desde && filtros.desde > hoy) {
    errors.desde = 'La fecha inicial no puede ser futura.';
  }

  if (filtros.hasta && filtros.hasta > hoy) {
    errors.hasta = 'La fecha final no puede ser futura.';
  }

  if (filtros.hasta && !filtros.desde) {
    errors.hasta = 'Selecciona primero una fecha inicial.';
  }

  if (filtros.desde && filtros.hasta && filtros.hasta < filtros.desde) {
    errors.rango = 'La fecha final no puede ser menor que la fecha inicial.';
  }

  return errors;
}

function enRangoFechas(fecha, filtros) {
  if (filtros.desde && fecha < filtros.desde) return false;
  if (filtros.hasta && fecha > filtros.hasta) return false;
  return true;
}

function coincideAnimal(elemento, filtros) {
  if (filtros.tipoReporte !== 'animal') return true;
  if (filtros.animalId === 'Todos') return true;
  if (filtros.animalId === 'general') return elemento.animalId === null;
  return elemento.animalId === Number(filtros.animalId);
}

function coincideEspecieYRaza(elemento, filtros, animalesPorId) {
  const animalRelacionado = animalesPorId.get(elemento.animalId);
  const coincideEspecie = filtros.especie === 'Todos' || animalRelacionado?.especie === filtros.especie;
  const coincideRaza = filtros.raza === 'Todos' || animalRelacionado?.raza === filtros.raza;
  return coincideEspecie && coincideRaza;
}

function claveMes(fecha) {
  return fecha?.slice(0, 7) ?? 'Sin fecha';
}

function crearFilasMensuales(gastos, alimentacion, ingresos) {
  const meses = new Map();

  function ensure(mes) {
    if (!meses.has(mes)) meses.set(mes, { month: mes, gastos: 0, alimentacion: 0, ingresos: 0, balance: 0 });
    return meses.get(mes);
  }

  gastos.forEach((gasto) => {
    ensure(claveMes(gasto.fecha)).gastos += Number(gasto.precio);
  });

  alimentacion.forEach((elemento) => {
    ensure(claveMes(elemento.fecha)).alimentacion += Number(elemento.costo ?? elemento.costoAproximado ?? 0);
  });

  ingresos.forEach((elemento) => {
    ensure(claveMes(elemento.fecha)).ingresos += Number(elemento.monto);
  });

  return [...meses.values()].
  map((fila) => ({ ...fila, balance: fila.ingresos - fila.gastos - fila.alimentacion })).
  sort((a, b) => b.month.localeCompare(a.month));
}

function crearFilasAnimales(animales, listaGastos, listaAlimentacion, listaIngresos) {
  return animales.map((animal) => {
    const gastos = listaGastos.filter((gasto) => gasto.animalId === animal.id).reduce((suma, gasto) => suma + Number(gasto.precio), 0);
    const alimentacion = listaAlimentacion.filter((elemento) => elemento.animalId === animal.id).reduce((suma, elemento) => suma + Number(elemento.costo ?? elemento.costoAproximado ?? 0), 0);
    const ingresos = listaIngresos.filter((elemento) => elemento.animalId === animal.id).reduce((suma, elemento) => suma + Number(elemento.monto), 0);

    return {
      id: animal.id,
      identificador: animal.identificador,
      estado: animal.estado,
      gastos,
      alimentacion,
      ingresos,
      balance: ingresos - gastos - alimentacion
    };
  });
}

function crearReporteImprimible({ analytics: analitica, animals: animales, filters: filtros, healthEvents: eventosSanitarios }) {
  const generadoEn = new Date().toLocaleString('es-MX');
  const filas = analitica.animalRows.
  map(
    (fila) => `
        <tr>
          <td>${fila.identificador}</td>
          <td>${fila.estado}</td>
          <td>${mxn.format(fila.gastos)}</td>
          <td>${mxn.format(fila.alimentacion)}</td>
          <td>${mxn.format(fila.ingresos)}</td>
          <td>${mxn.format(fila.balance)}</td>
        </tr>
      `
  ).
  join('');

  return `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>Reporte de Inversión AgroWeb</title>
        <style>
          body { font-family: Arial, sans-serif; color: #1d1d1b; margin: 32px; }
          h1, h2 { color: #07612d; }
          .meta { color: #66735d; font-size: 13px; }
          .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 24px 0; }
          .card { border: 1px solid #d9dfd2; border-radius: 12px; padding: 14px; background: #f7f8f5; }
          .label { color: #66735d; font-size: 12px; text-transform: uppercase; font-weight: 700; }
          .value { margin-top: 8px; font-size: 20px; font-weight: 800; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
          th, td { border: 1px solid #d9dfd2; padding: 10px; text-align: left; }
          th { background: #07612d; color: white; }
          @media print { button { display: none; } body { margin: 18px; } }
        </style>
      </head>
      <body>
        <button onclick="window.print()">Guardar como PDF</button>
        <h1>Reporte de Inversión AgroWeb</h1>
        <p class="meta">Generado: ${generadoEn}</p>
        <p class="meta">Tipo: ${filtros.tipoReporte} | Especie: ${filtros.especie || 'Todas'} | Raza: ${filtros.raza || 'Todas'} | Desde: ${filtros.desde || 'sin inicio'} | Hasta: ${filtros.hasta || 'sin fin'}</p>
        <div class="grid">
          <div class="card"><div class="label">Animales registrados</div><div class="value">${animales.length}</div></div>
          <div class="card"><div class="label">Total ingresos</div><div class="value">${mxn.format(analitica.totalIngresos)}</div></div>
          <div class="card"><div class="label">Total pérdidas</div><div class="value">${mxn.format(analitica.perdidas)}</div></div>
          <div class="card"><div class="label">Balance</div><div class="value">${mxn.format(analitica.balance)}</div></div>
          <div class="card"><div class="label">Gastos</div><div class="value">${mxn.format(analitica.totalGastos)}</div></div>
          <div class="card"><div class="label">Alimentación</div><div class="value">${mxn.format(analitica.totalAlimentacion)}</div></div>
          <div class="card"><div class="label">Ganancias</div><div class="value">${mxn.format(analitica.ganancias)}</div></div>
          <div class="card"><div class="label">Eventos sanitarios</div><div class="value">${eventosSanitarios.length}</div></div>
        </div>
        <h2>Inversión por animal</h2>
        <table>
          <thead>
            <tr>
              <th>Animal</th>
              <th>Estado</th>
              <th>Gastos</th>
              <th>Alimentación</th>
              <th>Ingresos</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>${filas || '<tr><td colspan="6">Sin datos</td></tr>'}</tbody>
        </table>
      </body>
    </html>
  `;
}

function PaginaReportes() {
  const [animales, establecerAnimales] = useState([]);
  const [gastos, establecerGastos] = useState([]);
  const [alimentacion, setFeeding] = useState([]);
  const [eventosSanitarios, setHealthEvents] = useState([]);
  const [ingresos, establecerIngresos] = useState([]);
  const [filtros, setFilters] = useState(filtrosIniciales);
  const [cargando, establecerCargando] = useState(true);
  const [mensaje, establecerMensaje] = useState('');
  const [generatedReport, setGeneratedReport] = useState(null);
  const erroresFiltro = useMemo(() => validarFiltrosReporte(filtros), [filtros]);
  const hasFilterErrors = Object.keys(erroresFiltro).length > 0;
  const animalesPorId = useMemo(() => new Map(animales.map((animal) => [animal.id, animal])), [animales]);

  useEffect(() => {
    const temporizador = window.setTimeout(() => {
      establecerAnimales(leerAlmacenamiento('agroweb.animals', mockAnimals));
      establecerGastos(leerAlmacenamiento('agroweb.expenses', mockExpenses));
      setFeeding(leerAlmacenamiento('agroweb.feeding', mockFeeding));
      setHealthEvents(leerAlmacenamiento('agroweb.healthEvents', mockHealthEvents));
      establecerIngresos(leerAlmacenamiento('agroweb.income', mockIncome));
      establecerCargando(false);
    }, 350);

    return () => window.clearTimeout(temporizador);
  }, []);

  const datosFiltrados = useMemo(() => {
    const gastosFiltrados = gastos.filter((gasto) => !gasto.esVenta && enRangoFechas(gasto.fecha, filtros) && coincideAnimal(gasto, filtros) && coincideEspecieYRaza(gasto, filtros, animalesPorId));
    const ingresosFiltrados = ingresos.filter((elemento) => enRangoFechas(elemento.fecha, filtros) && coincideAnimal(elemento, filtros) && coincideEspecieYRaza(elemento, filtros, animalesPorId));
    const alimentacionFiltrada = alimentacion.filter((elemento) => enRangoFechas(elemento.fecha, filtros) && coincideAnimal(elemento, filtros) && coincideEspecieYRaza(elemento, filtros, animalesPorId));
    const animalesFiltrados =
    animales.filter((animal) => {
      const coincideAnimalSeleccionado = filtros.tipoReporte !== 'animal' || filtros.animalId === 'Todos' || animal.id === Number(filtros.animalId);
      const coincideEspecie = filtros.especie === 'Todos' || animal.especie === filtros.especie;
      const coincideRaza = filtros.raza === 'Todos' || animal.raza === filtros.raza;
      return coincideAnimalSeleccionado && coincideEspecie && coincideRaza;
    });

    return { filteredExpenses: gastosFiltrados, filteredIncome: ingresosFiltrados, filteredFeeding: alimentacionFiltrada, filteredAnimals: animalesFiltrados };
  }, [animales, animalesPorId, gastos, alimentacion, filtros, ingresos]);

  const analitica = useMemo(() => {
    const totalGastos = datosFiltrados.filteredExpenses.reduce((acc, elemento) => acc + Number(elemento.precio), 0);
    const totalAlimentacion = datosFiltrados.filteredFeeding.reduce((acc, elemento) => acc + Number(elemento.costo ?? elemento.costoAproximado ?? 0), 0);
    const totalIngresos = datosFiltrados.filteredIncome.reduce((acc, elemento) => acc + Number(elemento.monto), 0);
    const perdidas = totalGastos + totalAlimentacion;
    const ganancias = Math.max(totalIngresos - perdidas, 0);
    const balance = totalIngresos - perdidas;
    const inversionPromedio = datosFiltrados.filteredAnimals.length ? perdidas / datosFiltrados.filteredAnimals.length : 0;
    const animalRows = crearFilasAnimales(datosFiltrados.filteredAnimals, datosFiltrados.filteredExpenses, datosFiltrados.filteredFeeding, datosFiltrados.filteredIncome);
    const monthlyRows = crearFilasMensuales(datosFiltrados.filteredExpenses, datosFiltrados.filteredFeeding, datosFiltrados.filteredIncome);

    return {
      totalGastos: totalGastos,
      totalAlimentacion,
      totalIngresos: totalIngresos,
      perdidas,
      ganancias,
      balance: balance,
      inversionPromedio,
      animalRows,
      monthlyRows
    };
  }, [datosFiltrados]);

  const estadisticas = useMemo(
    () => [
    { title: 'Total de animales', value: animales.length, detail: 'Animales registrados en inventario', icon: PackageCheck, tone: 'primary' },
    { title: 'Animales activos', value: animales.filter((animal) => animal.estado === 'Activo').length, detail: 'Disponibles en operación', icon: Beef, tone: 'success' },
    { title: 'Animales vendidos', value: animales.filter((animal) => animal.estado === 'Vendido').length, detail: 'Con ingreso o historial de venta', icon: TrendingUp, tone: 'info' },
    { title: 'Animales fallecidos', value: animales.filter((animal) => animal.estado === 'Fallecido').length, detail: 'Registrados como pérdida operativa', icon: TrendingDown, tone: 'danger' },
    { title: 'Total de gastos', value: mxn.format(analitica.perdidas), detail: 'Gastos más alimentación', icon: WalletCards, tone: 'warning' },
    { title: 'Total de ingresos', value: mxn.format(analitica.totalIngresos), detail: 'Ventas e ingresos simulados', icon: CircleDollarSign, tone: 'success' },
    { title: 'Ganancias', value: mxn.format(analitica.ganancias), detail: 'Ingresos menos pérdidas si es positivo', icon: TrendingUp, tone: 'success' },
    { title: 'Balance general', value: mxn.format(analitica.balance), detail: 'Resultado económico del periodo', icon: BarChart3, tone: analitica.balance >= 0 ? 'primary' : 'danger' }],

    [analitica, animales]
  );

  function exportarReporte() {
    if (hasFilterErrors) {
      establecerMensaje('Corrige las validaciones de filtros antes de exportar.');
      window.setTimeout(() => establecerMensaje(''), 3500);
      return;
    }

    const popup = window.open('', '_blank');
    if (!popup) {
      establecerMensaje('No se pudo abrir la ventana de exportación. Revisa si el navegador bloqueó ventanas emergentes.');
      return;
    }

    try {
      popup.document.write(crearReporteImprimible({ analytics: analitica, animals: animales, filters: filtros, healthEvents: eventosSanitarios }));
      popup.document.close();
      popup.focus();
      establecerMensaje(`Reporte "${filtros.tipoReporte}" abierto en una nueva ventana. Presiona "Guardar como PDF" cuando quieras exportarlo.`);
    } catch (errorExportacion) {
      popup.close();
      establecerMensaje(`No se pudo exportar el reporte: ${errorExportacion.message}`);
    }
    window.setTimeout(() => establecerMensaje(''), 4500);
  }

  function generateReport() {
    if (hasFilterErrors) {
      establecerMensaje('Corrige las validaciones de filtros antes de generar el reporte.');
      window.setTimeout(() => establecerMensaje(''), 3500);
      return;
    }

    const animalSeleccionado =
    filtros.animalId === 'Todos' ?
    'Todos los animales' :
    filtros.animalId === 'general' ?
    'Rancho general' :
    (() => {
      const animalEncontrado = animales.find((animal) => animal.id === Number(filtros.animalId));
      return animalEncontrado ? `${animalEncontrado.identificador} - ${animalEncontrado.nombre}` : 'Animal seleccionado';
    })();

    setGeneratedReport({
      generatedAt: new Date().toLocaleString('es-MX'),
      filters: { ...filtros },
      selectedAnimal: animalSeleccionado,
      analytics: analitica,
      records: {
        animals: datosFiltrados.filteredAnimals.length,
        expenses: datosFiltrados.filteredExpenses.length,
        feeding: datosFiltrados.filteredFeeding.length,
        income: datosFiltrados.filteredIncome.length
      }
    });
    establecerMensaje('Reporte generado en pantalla con los filtros seleccionados.');
    window.setTimeout(() => establecerMensaje(''), 3500);
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 md:px-6 md:py-6">
        <section className="grid gap-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex min-h-8 items-center gap-2 rounded-full bg-[#1f7a8c]/10 px-3 text-xs font-bold uppercase tracking-[0.14em] text-[#1f7a8c]">
                <FileBarChart size={16} />
                Análisis económico
              </span>
              <h1 className="mt-4 break-words text-2xl font-bold text-[#07612d] sm:text-3xl md:text-4xl">Reporte de Inversión</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#1d1d1b]/70">
                Visualiza cuánto invierte, gana o pierde el rancho con datos de animales, gastos, sanidad, alimentación e ingresos simulados.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <button className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#07612d] px-5 text-sm font-bold text-white shadow-[0_10px_22px_rgba(7,97,45,0.2)] disabled:cursor-not-allowed disabled:bg-[#98a287] sm:w-auto" disabled={hasFilterErrors} onClick={generateReport} type="button">
                <RefreshCw size={18} /> Generar Reporte
              </button>
              <BotonExportarReporte disabled={hasFilterErrors} onExport={exportarReporte} />
            </div>
          </div>

          {mensaje ? <div className="rounded-2xl border border-[#4CAF50]/20 bg-[#4CAF50]/10 p-4 text-sm font-bold text-[#2f8f36]">{mensaje}</div> : null}

          <FiltrosReporte animals={animales} errors={erroresFiltro} filters={filtros} onChange={setFilters} />

          {generatedReport ?
        <TarjetaReporte title="Reporte generado" subtitle={`Generado el ${generatedReport.generatedAt}`}>
              <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
                <div className="rounded-2xl bg-[#F4F4F4] p-4">
                  <p className="text-xs font-bold uppercase text-[#98a287]">Filtros aplicados</p>
                  <div className="mt-3 grid gap-2 text-sm font-semibold text-[#1d1d1b]/75">
                    <span>Tipo: {generatedReport.filters.tipoReporte}</span>
                    <span>Animal: {generatedReport.selectedAnimal}</span>
                    <span>Especie: {generatedReport.filters.especie}</span>
                    <span>Raza: {generatedReport.filters.raza}</span>
                    <span>Desde: {generatedReport.filters.desde || 'Sin fecha inicial'}</span>
                    <span>Hasta: {generatedReport.filters.hasta || 'Sin fecha final'}</span>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {[
              ['Ingresos', mxn.format(generatedReport.analytics.totalIngresos)],
              ['Pérdidas', mxn.format(generatedReport.analytics.perdidas)],
              ['Ganancias', mxn.format(generatedReport.analytics.ganancias)],
              ['Balance', mxn.format(generatedReport.analytics.balance)]].
              map(([etiqueta, valor]) =>
              <div className="rounded-2xl bg-[#F4F4F4] p-4" key={etiqueta}>
                      <p className="text-xs font-bold uppercase text-[#98a287]">{etiqueta}</p>
                      <p className="mt-2 break-words text-lg font-bold text-[#07612d]">{valor}</p>
                    </div>
              )}
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
            ['Animales incluidos', generatedReport.records.animals],
            ['Gastos encontrados', generatedReport.records.expenses],
            ['Registros de alimentación', generatedReport.records.feeding],
            ['Ingresos encontrados', generatedReport.records.income]].
            map(([etiqueta, valor]) =>
            <div className="rounded-2xl border border-[#98a287]/18 bg-white p-4" key={etiqueta}>
                    <p className="text-xs font-bold uppercase text-[#98a287]">{etiqueta}</p>
                    <p className="mt-2 text-2xl font-bold text-[#1d1d1b]">{valor}</p>
                  </div>
            )}
              </div>
            </TarjetaReporte> :
        null}

          {cargando ?
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((elemento) =>
          <div className="min-h-40 animate-pulse rounded-2xl bg-white shadow-[0_12px_28px_rgba(29,29,27,0.05)]" key={elemento} />
          )}
            </div> :
        null}

          {!cargando ?
        <>
              <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {estadisticas.map((estadistica) =>
            <TarjetaEstadistica key={estadistica.title} {...estadistica} />
            )}
              </div>

              <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
                <ResumenGananciasPerdidas totalGastos={analitica.perdidas} totalIngresos={analitica.totalIngresos} balance={analitica.balance} />
                <TarjetaReporte title="Estado del rancho" subtitle="Indicadores adicionales para toma de decisiones.">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-[#F4F4F4] p-4">
                      <p className="text-xs font-bold uppercase text-[#98a287]">Inversión promedio por animal</p>
                      <p className="mt-2 break-words text-xl font-bold text-[#07612d] md:text-2xl">{mxn.format(analitica.inversionPromedio)}</p>
                    </div>
                    <div className="rounded-2xl bg-[#F4F4F4] p-4">
                      <p className="text-xs font-bold uppercase text-[#98a287]">Eventos sanitarios</p>
                      <p className="mt-2 text-2xl font-bold text-[#07612d]">{eventosSanitarios.length}</p>
                    </div>
                    <div className="rounded-2xl bg-[#F4F4F4] p-4">
                      <p className="text-xs font-bold uppercase text-[#98a287]">Pérdidas</p>
                      <p className="mt-2 break-words text-xl font-bold text-[#D32F2F] md:text-2xl">{mxn.format(analitica.perdidas)}</p>
                    </div>
                    <div className="rounded-2xl bg-[#F4F4F4] p-4">
                      <p className="text-xs font-bold uppercase text-[#98a287]">Ganancias netas</p>
                      <p className="mt-2 break-words text-xl font-bold text-[#2f8f36] md:text-2xl">{mxn.format(analitica.ganancias)}</p>
                    </div>
                  </div>
                </TarjetaReporte>
              </div>

              <div className="grid min-w-0 gap-6 xl:grid-cols-2">
                <ResumenGastoCategoria expenses={datosFiltrados.filteredExpenses} />
                <ReporteMensual rows={analitica.monthlyRows} />
              </div>

              <TablaInversionAnimal rows={analitica.animalRows} />

              {datosFiltrados.filteredExpenses.length === 0 && datosFiltrados.filteredIncome.length === 0 ?
          <section className="rounded-2xl border border-[#98a287]/18 bg-white p-8 text-center shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
                  <h2 className="text-2xl font-bold text-[#07612d]">No hay datos para el reporte</h2>
                  <p className="mt-2 text-sm text-[#1d1d1b]/70">Ajusta el periodo o selecciona otro animal para generar resultados.</p>
                </section> :
          null}
            </> :
        null}
        </section>
    </div>);

}

export default PaginaReportes;
