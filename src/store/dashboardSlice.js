import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { solicitudApi } from '../services/api';

const estadoInicial = {
  stats: [],
  animals: [],
  tasks: [],
  costs: [],
  healthSummary: [],
  status: 'idle',
  error: null
};

export const cargarPanel = createAsyncThunk('dashboard/fetchDashboard', async () => {
  return solicitudApi('/dashboard');
});

export const alternarEstadoTarea = createAsyncThunk('dashboard/toggleTaskStatus', async (idTarea) => {
  return solicitudApi(`/tasks/${idTarea}/toggle`, { method: 'PATCH' });
});

const segmentoPanel = createSlice({
  name: 'dashboard',
  initialState: estadoInicial,
  reducers: {},
  extraReducers: (builder) => {
    builder.
    addCase(cargarPanel.pending, (estado) => {
      estado.status = 'loading';
      estado.error = null;
    }).
    addCase(cargarPanel.fulfilled, (estado, accion) => {
      estado.status = 'succeeded';
      estado.stats = accion.payload.stats;
      estado.animals = accion.payload.animals;
      estado.tasks = accion.payload.tasks;
      estado.costs = accion.payload.costs;
      estado.healthSummary = accion.payload.healthSummary;
    }).
    addCase(cargarPanel.rejected, (estado, accion) => {
      estado.status = 'failed';
      estado.error = accion.error.message ?? 'No se pudo cargar el dashboard.';
    }).
    addCase(alternarEstadoTarea.fulfilled, (estado, accion) => {
      const indiceTarea = estado.tasks.findIndex((tarea) => tarea.id === accion.payload.id);
      if (indiceTarea >= 0) {
        estado.tasks[indiceTarea] = accion.payload;
      }
    });
  }
});

export default segmentoPanel.reducer;
