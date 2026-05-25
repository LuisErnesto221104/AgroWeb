import { useMemo, useState } from 'react'
import { ShieldCheck, UserCog, UsersRound } from 'lucide-react'
import StatCard from '../components/StatCard'
import { readStorage, writeStorage } from '../utils/storage'

const permissions = [
  { key: 'animales', label: 'Gestión Ganadera' },
  { key: 'sanidad', label: 'Sanidad' },
  { key: 'gastos', label: 'Gastos' },
  { key: 'reportes', label: 'Reportes' },
  { key: 'alimentacion', label: 'Alimentación' },
  { key: 'configuracion', label: 'Configuración' },
]

const initialUsers = [
  {
    id: 1,
    nombre: 'Administrador AgroWeb',
    correo: 'admin@agroweb.mx',
    rol: 'Administrador',
    activo: true,
    permisos: ['animales', 'sanidad', 'gastos', 'reportes', 'alimentacion', 'configuracion'],
  },
  {
    id: 2,
    nombre: 'Encargado del Rancho',
    correo: 'rancho@agroweb.mx',
    rol: 'Ganadero',
    activo: true,
    permisos: ['animales', 'sanidad', 'alimentacion'],
  },
  {
    id: 3,
    nombre: 'Contabilidad',
    correo: 'finanzas@agroweb.mx',
    rol: 'Finanzas',
    activo: true,
    permisos: ['gastos', 'reportes'],
  },
]

function SettingsPage() {
  const [users, setUsers] = useState(() => readStorage('agroweb.settings.users', initialUsers))
  const [selectedUserId, setSelectedUserId] = useState(initialUsers[0].id)
  const selectedUser = users.find((user) => user.id === selectedUserId) ?? users[0]

  function updateUsers(updater) {
    setUsers((current) => {
      const nextUsers = typeof updater === 'function' ? updater(current) : updater
      writeStorage('agroweb.settings.users', nextUsers)
      return nextUsers
    })
  }

  const stats = useMemo(
    () => [
      { title: 'Usuarios', value: users.length, detail: 'Cuentas simuladas del sistema', icon: UsersRound, tone: 'primary' },
      { title: 'Usuarios activos', value: users.filter((user) => user.activo).length, detail: 'Con acceso permitido', icon: ShieldCheck, tone: 'success' },
      { title: 'Roles', value: new Set(users.map((user) => user.rol)).size, detail: 'Perfiles disponibles', icon: UserCog, tone: 'info' },
    ],
    [users],
  )

  function togglePermission(permissionKey) {
    updateUsers((current) =>
      current.map((user) => {
        if (user.id !== selectedUser.id) return user
        const hasPermission = user.permisos.includes(permissionKey)
        return {
          ...user,
          permisos: hasPermission ? user.permisos.filter((permission) => permission !== permissionKey) : [...user.permisos, permissionKey],
        }
      }),
    )
  }

  function updateRole(event) {
    updateUsers((current) => current.map((user) => (user.id === selectedUser.id ? { ...user, rol: event.target.value } : user)))
  }

  function toggleUserStatus() {
    updateUsers((current) => current.map((user) => (user.id === selectedUser.id ? { ...user, activo: !user.activo } : user)))
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
            Administra usuarios, roles y permisos para controlar qué puede hacer cada persona dentro de AgroWeb.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <section className="rounded-2xl border border-[#98a287]/18 bg-white p-4 shadow-[0_12px_28px_rgba(29,29,27,0.07)] md:p-5">
            <h2 className="text-xl font-bold text-[#07612d]">Usuarios</h2>
            <div className="mt-4 grid gap-3">
              {users.map((user) => (
                <button
                  className={`rounded-2xl border p-4 text-left transition ${selectedUser.id === user.id ? 'border-[#07612d] bg-[#07612d]/8' : 'border-[#98a287]/18 bg-[#F4F4F4] hover:border-[#07612d]/30'}`}
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

          <section className="rounded-2xl border border-[#98a287]/18 bg-white p-4 shadow-[0_12px_28px_rgba(29,29,27,0.07)] md:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h2 className="break-words text-xl font-bold text-[#07612d]">{selectedUser.nombre}</h2>
                <p className="mt-1 break-words text-sm text-[#1d1d1b]/65">{selectedUser.correo}</p>
              </div>
              <button className="min-h-11 rounded-2xl border border-[#07612d]/25 bg-white px-4 text-sm font-bold text-[#07612d]" onClick={toggleUserStatus} type="button">
                {selectedUser.activo ? 'Bloquear acceso' : 'Activar usuario'}
              </button>
            </div>

            <label className="mt-5 block">
              <span className="text-sm font-bold text-[#1d1d1b]">Rol del usuario</span>
              <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white" onChange={updateRole} value={selectedUser.rol}>
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
                      <input checked={checked} className="size-5 accent-[#07612d]" onChange={() => togglePermission(permission.key)} type="checkbox" />
                    </label>
                  )
                })}
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}

export default SettingsPage
