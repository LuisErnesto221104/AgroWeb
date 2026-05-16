import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname ?? '/'

  if (user) {
    return <Navigate to={from} replace />
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F4F4] px-4 font-['Poppins',sans-serif]">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_14px_40px_rgba(29,29,27,0.08)]">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-[#07612d]/10 text-[#07612d]">
          <ShieldCheck size={30} />
        </span>
        <h1 className="mt-5 text-2xl font-bold text-[#07612d]">Acceso AgroWeb</h1>
        <p className="mt-2 text-sm leading-6 text-[#1d1d1b]/70">
          Inicia una sesión de demostración para entrar a las rutas protegidas del panel ganadero.
        </p>
        <button
          className="mt-6 min-h-12 w-full rounded-2xl bg-[#07612d] px-5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(7,97,45,0.2)]"
          onClick={() => {
            login()
            navigate(from, { replace: true })
          }}
          type="button"
        >
          Entrar al dashboard
        </button>
      </section>
    </main>
  )
}

export default Login
