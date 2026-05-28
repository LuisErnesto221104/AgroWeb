import { NavLink } from 'react-router-dom';
import { BarChart3, Beef, CircleDollarSign, HeartPulse, Home as IconoInicio, PackageCheck, Settings, X } from 'lucide-react';

const navegacion = [
{ label: 'Inicio', to: '/', icon: IconoInicio },
{ label: 'Gestión Ganadera', to: '/animales', icon: PackageCheck },
{ label: 'Sanidad', to: '/sanidad', icon: HeartPulse },
{ label: 'Gastos', to: '/gastos', icon: CircleDollarSign },
{ label: 'Reporte de Inversión', to: '/reportes', icon: BarChart3 },
{ label: 'Alimentación', to: '/alimentacion', icon: Beef },
{ label: 'Configuración', to: '/configuracion', icon: Settings }];


function BarraLateral({ isOpen, onClose: alCerrar }) {
  return (
    <>
      {isOpen ? <button aria-label="Cerrar navegación" className="fixed inset-0 z-30 bg-[#1d1d1b]/30 lg:hidden" onClick={alCerrar} type="button" /> : null}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-[#98a287]/18 bg-white px-4 py-5 shadow-[0_16px_40px_rgba(29,29,27,0.12)] transition-transform lg:translate-x-0 lg:shadow-none ${
        isOpen ? 'translate-x-0' : '-translate-x-full'}`
        }>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[#07612d] text-lg font-bold text-white">A</div>
            <div>
              <p className="text-base font-bold text-[#07612d]">AgroWeb</p>
              <p className="text-xs text-[#98a287]">Panel del rancho</p>
            </div>
          </div>
          <button aria-label="Cerrar menú" className="rounded-xl p-2 text-[#07612d] lg:hidden" onClick={alCerrar} type="button">
            <X size={22} />
          </button>
        </div>

        <nav className="mt-8 space-y-2">
          {navegacion.map(({ label: etiqueta, to, icon: Icon }) =>
          <NavLink
            className={({ isActive }) =>
            `flex min-h-12 w-full items-center gap-3 rounded-2xl px-4 text-sm font-semibold transition ${
            isActive ? 'bg-[#07612d] text-white shadow-[0_10px_24px_rgba(7,97,45,0.2)]' : 'text-[#1d1d1b] hover:bg-[#F4F4F4]'}`

            }
            end={to === '/'}
            key={to}
            onClick={alCerrar}
            to={to}>
            
              <Icon size={20} />
              {etiqueta}
            </NavLink>
          )}
        </nav>
      </aside>
    </>);

}

export default BarraLateral;
