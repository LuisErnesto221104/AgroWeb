import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'

function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F4F4F4] font-['Poppins',sans-serif] text-[#1d1d1b]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="lg:pl-72">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
