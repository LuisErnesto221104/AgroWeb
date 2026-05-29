import { createSlice } from '@reduxjs/toolkit';
import { animales as animalesMock } from '../data/animals';
import { gastos as gastosMock } from '../data/expenses';
import { alimentacion as alimentacionMock } from '../data/feeding';
import { eventosSanitarios as eventosSanitariosMock } from '../data/healthEvents';
import { ingresos as ingresosMock } from '../data/income';
import { leerAlmacenamiento } from '../utils/storage';

const estadoInicial = {
  animales: leerAlmacenamiento('agroweb.animals', animalesMock),
  gastos: leerAlmacenamiento('agroweb.expenses', gastosMock),
  alimentacion: leerAlmacenamiento('agroweb.feeding', alimentacionMock),
  eventosSanitarios: leerAlmacenamiento('agroweb.healthEvents', eventosSanitariosMock),
  ingresos: leerAlmacenamiento('agroweb.income', ingresosMock),
  ranchos: leerAlmacenamiento('agroweb.ranches', [])
};

const segmentoAgroWeb = createSlice({
  name: 'agroweb',
  initialState: estadoInicial,
  reducers: {
    crearAnimal(estado, accion) {
      estado.animales.unshift(accion.payload);
    },
    actualizarAnimal(estado, accion) {
      const indice = estado.animales.findIndex((animal) => animal.id === accion.payload.id);
      if (indice >= 0) estado.animales[indice] = { ...estado.animales[indice], ...accion.payload };
    },
    cambiarEstadoAnimal(estado, accion) {
      const { id, estado: estadoAnimal } = accion.payload;
      const animal = estado.animales.find((elemento) => elemento.id === id);
      if (animal && animal.estado === 'Activo') animal.estado = estadoAnimal;
    },
    crearEventoSanitario(estado, accion) {
      estado.eventosSanitarios.unshift(accion.payload);
    },
    actualizarEstadoEventoSanitario(estado, accion) {
      const evento = estado.eventosSanitarios.find((elemento) => elemento.id === accion.payload.id);
      if (evento) evento.estado = accion.payload.estado;
    },
    crearGasto(estado, accion) {
      estado.gastos.unshift(accion.payload);
    },
    registrarVentaAnimal(estado, accion) {
      const { gasto, ingreso } = accion.payload;
      estado.gastos.unshift(gasto);
      estado.ingresos.unshift(ingreso);
      const animal = estado.animales.find((elemento) => elemento.id === gasto.animalId);
      if (animal) {
        animal.estado = 'Vendido';
        animal.ubicacion = 'Historial de ventas';
      }
    },
    crearRegistroAlimentacion(estado, accion) {
      estado.alimentacion.unshift(accion.payload);
    },
    actualizarEstadoAlimentacion(estado, accion) {
      const registro = estado.alimentacion.find((elemento) => elemento.id === accion.payload.id);
      if (registro) registro.estado = accion.payload.estado;
    },
    guardarRanchos(estado, accion) {
      estado.ranchos = accion.payload;
    }
  }
});

export const {
  crearAnimal,
  actualizarAnimal,
  cambiarEstadoAnimal,
  crearEventoSanitario,
  actualizarEstadoEventoSanitario,
  crearGasto,
  registrarVentaAnimal,
  crearRegistroAlimentacion,
  actualizarEstadoAlimentacion,
  guardarRanchos
} = segmentoAgroWeb.actions;

export default segmentoAgroWeb.reducer;
