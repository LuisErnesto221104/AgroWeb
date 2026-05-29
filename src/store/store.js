import { configureStore } from '@reduxjs/toolkit';
import reductorAgroWeb from './agrowebSlice';
import reductorPanel from './dashboardSlice';
import { escribirAlmacenamiento } from '../utils/storage';

const accionesPersistentes = new Set([
  'agroweb/crearAnimal',
  'agroweb/actualizarAnimal',
  'agroweb/cambiarEstadoAnimal',
  'agroweb/crearEventoSanitario',
  'agroweb/actualizarEstadoEventoSanitario',
  'agroweb/crearGasto',
  'agroweb/registrarVentaAnimal',
  'agroweb/crearRegistroAlimentacion',
  'agroweb/actualizarEstadoAlimentacion',
  'agroweb/guardarRanchos'
]);

const persistirAgroWeb = (almacenApi) => (siguiente) => (accion) => {
  const resultado = siguiente(accion);
  if (accionesPersistentes.has(accion.type)) {
    const estado = almacenApi.getState().agroweb;
    escribirAlmacenamiento('agroweb.animals', estado.animales);
    escribirAlmacenamiento('agroweb.expenses', estado.gastos);
    escribirAlmacenamiento('agroweb.feeding', estado.alimentacion);
    escribirAlmacenamiento('agroweb.healthEvents', estado.eventosSanitarios);
    escribirAlmacenamiento('agroweb.income', estado.ingresos);
    escribirAlmacenamiento('agroweb.ranches', estado.ranchos);
  }
  return resultado;
};

export const almacen = configureStore({
  reducer: {
    agroweb: reductorAgroWeb,
    dashboard: reductorPanel
  },
  middleware: (obtenerMiddlewarePredeterminado) => obtenerMiddlewarePredeterminado().concat(persistirAgroWeb)
});
