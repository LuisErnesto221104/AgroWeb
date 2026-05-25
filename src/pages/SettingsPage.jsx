import { useEffect, useMemo, useState } from 'react'
import { ShieldCheck, UserCog, UsersRound } from 'lucide-react'
import StatCard from '../components/StatCard'
import { useAuth } from '../hooks/useAuth'
import { apiRequest } from '../services/api'

const permissions = [
  { key: 'animales', label: 'Gestión Ganadera' },
  { key: 'sanidad', label: 'Sanidad' },
  { key: 'gastos', label: 'Gastos' },
  { key: 'reportes', label: 'Reportes' },
  { key: 'alimentacion', label: 'Alimentación' },
  { key: 'configuracion', label: 'Configuración' },
]

function SettingsPage() {
  const { user: authUser } = useAuth()
  const [users, setUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const selectedUser = users.find((user) => user.id === selectedUserId) ?? users[0]
  const isProtectedAdmin = Boolean(selectedUser?.protegido)
  const isCurrentUser = selectedUser?.usuario_id === authUser?.id || selectedUser?.id === authUser?.id

  useEffect(() => {
    let ignore = false

    async function loadUsers() {
      try {
        setIsLoading(true)
        setError('')
        const payload = await apiRequest('/configuracion/usuarios')
        if (ignore) return
        setUsers(payload)
        setSelectedUserId((current) => current ?? payload[0]?.id ?? null)
      } catch (requestError) {
        if (!ignore) setError(requestError.message)
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadUsers()
    return () => {
      ignore = true
    }
  }, [])

  const stats = useMemo(
    () => [
      { title: 'Usuarios', value: users.length, detail: 'Cuentas administradas desde API', icon: UsersRound, tone: 'primary' },
      { title: 'Usuarios activos', value: users.filter((user) => user.activo).length, detail: 'Con acceso permitido', icon: ShieldCheck, tone: 'success' },
      { title: 'Roles', value: new Set(users.map((user) => user.rol)).size, detail: 'Perfiles disponibles', icon: UserCog, tone: 'info' },
    ],
    [users],
  )

  function updateUserInState(updatedUser) {
    setUsers((current) => current.map((user) => (user.id === updatedUser.id ? updatedUser : user)))
  }

  function showMessage(nextMessage) {
    setMessage(nextMessage)
    window.setTimeout(() => setMessage(''), 3500)
  }

  function showError(nextError) {
    setError(nextError)
    window.setTimeout(() => setError(''), 4500)
  }

  async function togglePermission(permissionKey) {
    if (!selectedUser) return
    const hasPermission = selectedUser.permisos.includes(permissionKey)

    if (isProtectedAdmin && hasPermission) {
      showError('El administrador principal no puede quitarse permisos.')
      return
    }

    const permisos = hasPermission ? selectedUser.permisos.filter((permission) => permission !== permissionKey) : [...selectedUser.permisos, permissionKey]

    try {
      const updatedUser = await apiRequest(`/configuracion/usuarios/${selectedUser.id}/permisos`, {
        method: 'PUT',
        body: JSON.stringify({ permisos }),
      })
      updateUserInState(updatedUser)
      showMessage('Permisos actualizados correctamente.')
    } catch (requestError) {
      showError(requestError.message)
    }
  }

  async function updateRole(event) {
    if (!selectedUser) return

    try {
      const updatedUser = await apiRequest(`/configuracion/usuarios/${selectedUser.id}/rol`, {
        method: 'PUT',
        body: JSON.stringify({ rol: event.target.value }),
      })
      updateUserInState(updatedUser)
      showMessage('Rol actualizado correctamente.')
    } catch (requestError) {
      showError(requestError.message)
    }
  }

  async function toggleUserStatus() {
    if (!selectedUser) return

    if (isProtectedAdmin) {
      showError('El administrador principal no puede bloquearse.')
      return
    }

    try {
      const updatedUser = await apiRequest(`/configuracion/usuarios/${selectedUser.id}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ activo: !selectedUser.activo }),
      })
      updateUserInState(updatedUser)
      showMessage('Estado del usuario actualizado correctamente.')
    } catch (requestError) {
      showError(requestError.message)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-5 sm:px-4 md:px-6 md:py-6">
      <section className="grid gap-6">
        <div>
          <span className="inline-flex min-h-8 items-center gap-2 rounded-full bg-[#1f7a8c]/10 px-3 text-xs font-bold uppercase tracking-[0.14em] text-[#1f7a8c]">
            <ShieldCheck size={16} />
            Administración
          </span>
          <h1 className="mt-4 break-words text-3xl font-bold text-[#07612d] md:text-4xl">Configuración</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#1d1d1b]/70">
            Administra usuarios, roles y permisos desde el backend mock de AgroWeb.
          </p>
        </div>

        {message ? <div className="rounded-2xl border border-[#4CAF50]/20 bg-[#4CAF50]/10 p-4 text-sm font-bold text-[#2f8f36]">{message}</div> : null}
        {error ? <div className="rounded-2xl border border-[#D32F2F]/20 bg-[#D32F2F]/10 p-4 text-sm font-bold text-[#D32F2F]">{error}</div> : null}
        {isProtectedAdmin && isCurrentUser ? (
          <div className="rounded-2xl border border-[#FFA000]/25 bg-[#FFA000]/12 p-4 text-sm font-bold text-[#9b6300]">
            Estás editando al administrador principal. Por seguridad no puede quitarse permisos, cambiar a otro rol ni bloquearse.
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <section className="rounded-2xl border border-[#98a287]/18 bg-white p-4 shadow-[0_12px_28px_rgba(29,29,27,0.07)] md:p-5">
            <h2 className="text-xl font-bold text-[#07612d]">Usuarios</h2>
            <div className="mt-4 grid gap-3">
              {isLoading ? <div className="min-h-28 animate-pulse rounded-2xl bg-[#F4F4F4]" /> : null}
              {!isLoading &&
                users.map((user) => (
                  <button
                    className={`rounded-2xl border p-4 text-left transition ${selectedUser?.id === user.id ? 'border-[#07612d] bg-[#07612d]/8' : 'border-[#98a287]/18 bg-[#F4F4F4] hover:border-[#07612d]/30'}`}
                    key={user.id}
                    onClick={() => setSelectedUserId(user.id)}
                    type="button"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <strong className="break-words text-[#1d1d1b]">{user.nombre}</strong>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${user.activo ? 'bg-[#4CAF50]/12 text-[#2f8f36]' : 'bg-[#D32F2F]/10 text-[#D32F2F]'}`}>
                        {user.activo ? 'Activo' : 'Bloqueado'}
                      </span>
                    </div>
                    <p className="mt-1 break-words text-sm text-[#1d1d1b]/65">{user.correo}</p>
                    <p className="mt-2 text-xs font-bold uppercase text-[#98a287]">{user.rol}</p>
                  </button>
                ))}
            </div>
          </section>

          {selectedUser ? (
            <section className="rounded-2xl border border-[#98a287]/18 bg-white p-4 shadow-[0_12px_28px_rgba(29,29,27,0.07)] md:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h2 className="break-words text-xl font-bold text-[#07612d]">{selectedUser.nombre}</h2>
                  <p className="mt-1 break-words text-sm text-[#1d1d1b]/65">{selectedUser.correo}</p>
                </div>
                <button className="min-h-11 rounded-2xl border border-[#07612d]/25 bg-white px-4 text-sm font-bold text-[#07612d] disabled:cursor-not-allowed disabled:border-[#98a287]/25 disabled:text-[#98a287]" disabled={isProtectedAdmin} onClick={toggleUserStatus} type="button">
                  {selectedUser.activo ? 'Bloquear acceso' : 'Activar usuario'}
                </button>
              </div>

              <label className="mt-5 block">
                <span className="text-sm font-bold text-[#1d1d1b]">Rol del usuario</span>
                <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none disabled:cursor-not-allowed disabled:opacity-60 focus:border-[#07612d] focus:bg-white" disabled={isProtectedAdmin} onChange={updateRole} value={selectedUser.rol}>
                  {['Administrador', 'Ganadero', 'Veterinario', 'Finanzas', 'Consulta'].map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>

              <div className="mt-5">
                <h3 className="text-base font-bold text-[#1d1d1b]">Permisos del sistema</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {permissions.map((permission) => {
                    const checked = selectedUser.permisos.includes(permission.key)
                    return (
                      <label className="flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-2xl bg-[#F4F4F4] px-4 text-sm font-bold text-[#1d1d1b]" key={permission.key}>
                        <span className="break-words">{permission.label}</span>
                        <input checked={checked} className="size-5 accent-[#07612d] disabled:cursor-not-allowed" disabled={isProtectedAdmin && checked} onChange={() => togglePermission(permission.key)} type="checkbox" />
                      </label>
                    )
                  })}
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </div>
  )
}

export default SettingsPage
