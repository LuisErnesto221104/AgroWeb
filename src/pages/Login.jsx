import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { LogIn, ShieldCheck, UserPlus } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const adminCredentials = {
  nombre: 'admin',
  pin: '1234',
}

function Login() {
  const { login, register, user, status, error } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname ?? '/'
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(adminCredentials)
  const [localError, setLocalError] = useState('')

  if (user) {
    return <Navigate to={from} replace />
  }

  const isRegister = mode === 'register'
  const isLoading = status === 'loading'

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLocalError('')

    if (!form.nombre.trim() || !form.pin.trim()) {
      setLocalError('Ingresa usuario y PIN.')
      return
    }

    if (isRegister && form.pin.trim().length < 4) {
      setLocalError('El PIN debe tener al menos 4 caracteres.')
      return
    }

    try {
      const action = isRegister ? register : login
      await action({ nombre: form.nombre.trim(), pin: form.pin.trim() })
      navigate(from, { replace: true })
    } catch {
      // El mensaje visible lo controla el contexto.
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F4F4] px-4 font-['Poppins',sans-serif]">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_14px_40px_rgba(29,29,27,0.08)]">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-[#07612d]/10 text-[#07612d]">
          <ShieldCheck size={30} />
        </span>

        <div className="mt-5">
          <h1 className="text-2xl font-bold text-[#07612d]">{isRegister ? 'Crear cuenta' : 'Acceso AgroWeb'}</h1>
          <p className="mt-2 text-sm leading-6 text-[#1d1d1b]/70">
            {isRegister ? 'Registra un usuario con PIN para entrar al panel ganadero.' : 'Inicia sesión para entrar al dashboard protegido.'}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-[#F4F4F4] p-1">
          <button
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition ${!isRegister ? 'bg-white text-[#07612d] shadow-sm' : 'text-[#1d1d1b]/70'}`}
            onClick={() => {
              setMode('login')
              setForm(adminCredentials)
              setLocalError('')
            }}
            type="button"
          >
            <LogIn size={17} /> Login
          </button>
          <button
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition ${isRegister ? 'bg-white text-[#07612d] shadow-sm' : 'text-[#1d1d1b]/70'}`}
            onClick={() => {
              setMode('register')
              setForm({ nombre: '', pin: '' })
              setLocalError('')
            }}
            type="button"
          >
            <UserPlus size={17} /> Registro
          </button>
        </div>

        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-semibold text-[#1d1d1b]">Usuario</span>
            <input
              autoComplete="username"
              className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none transition focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10"
              name="nombre"
              onChange={updateField}
              placeholder="admin"
              value={form.nombre}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-[#1d1d1b]">PIN</span>
            <input
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none transition focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10"
              inputMode="numeric"
              name="pin"
              onChange={updateField}
              placeholder="1234"
              type="password"
              value={form.pin}
            />
          </label>

          {localError || error ? <div className="rounded-2xl border border-[#D32F2F]/20 bg-[#D32F2F]/10 p-3 text-sm font-semibold text-[#D32F2F]">{localError || error}</div> : null}

          <button className="min-h-12 w-full rounded-2xl bg-[#07612d] px-5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(7,97,45,0.2)] disabled:cursor-not-allowed disabled:opacity-65" disabled={isLoading} type="submit">
            {isLoading ? 'Procesando...' : isRegister ? 'Crear cuenta y entrar' : 'Entrar al dashboard'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default Login
