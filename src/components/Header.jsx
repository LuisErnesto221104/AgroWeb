import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

function Encabezado({ onMenuClick: alClickMenu }) {
  const { logout: cerrarSesion, user: usuario } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-[#98a287]/18 bg-white/95 px-4 py-4 shadow-[0_6px_22px_rgba(29,29,27,0.05)] backdrop-blur md:px-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-4">
          <button aria-label="Abrir menú" className="flex size-11 items-center justify-center rounded-2xl border border-[#98a287]/25 bg-white text-[#07612d] lg:hidden" onClick={alClickMenu} type="button">
            <Menu size={22} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#07612d] md:text-3xl">AgroWeb</h1>
            <p className="text-sm text-[#98a287]">Bienvenido, {usuario?.name ?? usuario?.nombre ?? 'admin'}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <button className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#07612d] px-5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(7,97,45,0.2)] md:w-auto" onClick={cerrarSesion} type="button">
            <LogOut size={17} /> Salir
          </button>
        </div>
      </div>
    </header>);

}

export default Encabezado;
