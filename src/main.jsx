import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import './index.css';
import Aplicacion from './App';
import { ProveedorAutenticacion } from './context/AuthContext';
import { sincronizarAlmacenamientoDesdeApi } from './utils/storage';

await sincronizarAlmacenamientoDesdeApi();
const { almacen } = await import('./store/store');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={almacen}>
      <ProveedorAutenticacion>
        <Aplicacion />
      </ProveedorAutenticacion>
    </Provider>
  </StrictMode>
);
