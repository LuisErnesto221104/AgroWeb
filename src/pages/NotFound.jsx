import { Link } from 'react-router-dom'
import { Home, SearchX } from 'lucide-react'

function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4 py-10">
      <section className="w-full rounded-2xl border border-[#98a287]/18 bg-white p-8 text-center shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
        <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#D32F2F]/10 text-[#D32F2F]">
          <SearchX size={34} />
        </span>
        <h1 className="mt-5 text-3xl font-bold text-[#07612d]">Página no encontrada</h1>
        <p className="mt-2 text-sm leading-6 text-[#1d1d1b]/70">La ruta que intentaste abrir no existe dentro de AgroWeb.</p>
        <Link className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#07612d] px-5 text-sm font-bold text-white" to="/">
          <Home size={18} /> Volver al Dashboard
        </Link>
      </section>
    </main>
  )
}

export default NotFound
