import { useEffect } from 'react';
import { cargarPanel } from '../store/dashboardSlice';
import { useDespachoAplicacion, useSelectorAplicacion } from '../store/hooks';

export function useDashboard() {
  const despachar = useDespachoAplicacion();
  const panel = useSelectorAplicacion((estado) => estado.dashboard);

  useEffect(() => {
    if (panel.status === 'idle') {
      void despachar(cargarPanel());
    }
  }, [panel.status, despachar]);

  return panel;
}
