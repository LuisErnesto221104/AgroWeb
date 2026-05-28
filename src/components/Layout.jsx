import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Encabezado from './Header';
import BarraLateral from './Sidebar';

function Estructura() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F4F4F4] font-['Poppins',sans-serif] text-[#1d1d1b]">
      <BarraLateral isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="lg:pl-72">
        <Encabezado onMenuClick={() => setIsSidebarOpen(true)} />
        <Outlet />
      </main>
    </div>);

}

export default Estructura;
