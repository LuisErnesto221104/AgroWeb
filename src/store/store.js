import { configureStore } from '@reduxjs/toolkit';
import reductorPanel from './dashboardSlice';

export const almacen = configureStore({
  reducer: {
    dashboard: reductorPanel
  }
});
