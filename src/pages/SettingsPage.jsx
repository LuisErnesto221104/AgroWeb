import { useEffect, useMemo, useRef, useState } from 'react'
import { Eye, MapPin, Navigation, ShieldCheck, UserCog, UsersRound, X } from 'lucide-react'
import RanchLocationMap from '../components/RanchLocationMap'
import StatCard from '../components/StatCard'
import { useAuth } from '../hooks/useAuth'
import { apiRequest } from '../services/api'
import { readStorage, writeStorage } from '../utils/storage'

const permissions = [
  { key: 'animales', label: 'Gestión Ganadera' },
  { key: 'sanidad', label: 'Sanidad' },
  { key: 'gastos', label: 'Gastos' },
  { key: 'reportes', label: 'Reportes' },
  { key: 'alimentacion', label: 'Alimentación' },
  { key: 'configuracion', label: 'Configuración' },
]

const placeTypes = ['Corral', 'Potrero', 'Caballeriza', 'Área porcina', 'Área de cuarentena', 'Enfermería', 'Bodega de alimento', 'Manga de manejo', 'Área de ordeña', 'Otro']

function SettingsPage() {
  const { user: authUser } = useAuth()
  const [users, setUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLocating, setIsLocating] = useState(false)
  const [isResolvingAddress, setIsResolvingAddress] = useState(false)
  const [locationAccuracy, setLocationAccuracy] = useState(null)
  const [ranches, setRanches] = useState(() => readStorage('agroweb.ranches', []))
  const [ranchForm, setRanchForm] = useState({ nombre: '', propietario: '', telefono: '', direccion: '', lat: '', lng: '' })
  const [placeForm, setPlaceForm] = useState({ ranchoId: '', nombre: '', tipo: 'Corral', capacidad: '', descripcion: '' })
  const [selectedRanchDetails, setSelectedRanchDetails] = useState(null)
  const locationWatchRef = useRef(null)
  const locationTimeoutRef = useRef(null)
  const addressRequestRef = useRef(0)

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

  useEffect(
    () => () => {
      if (locationWatchRef.current) navigator.geolocation?.clearWatch(locationWatchRef.current)
      if (locationTimeoutRef.current) window.clearTimeout(locationTimeoutRef.current)
    },
    [],
  )

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

  function saveRanches(nextRanches) {
    setRanches(nextRanches)
    writeStorage('agroweb.ranches', nextRanches)
  }

  function updateRanchForm(event) {
    setRanchForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  function updatePlaceForm(event) {
    const { name, value } = event.target
    setPlaceForm((current) => ({ ...current, [name]: name === 'capacidad' ? value.replace(/\D/g, '') : value }))
  }

  async function resolveAddressFromCoordinates(coordinates) {
    const lat = Number(coordinates.lat)
    const lng = Number(coordinates.lng)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return

    const requestId = Date.now()
    addressRequestRef.current = requestId
    setIsResolvingAddress(true)

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=es`)
      if (!response.ok) return
      const payload = await response.json()
      if (addressRequestRef.current !== requestId || !payload?.display_name) return
      setRanchForm((current) => ({ ...current, direccion: payload.display_name }))
    } catch {
      showError('No se pudo autocompletar la dirección. Puedes escribirla manualmente.')
    } finally {
      if (addressRequestRef.current === requestId) setIsResolvingAddress(false)
    }
  }

  function updateRanchLocation(coordinates) {
    setLocationAccuracy(null)
    setRanchForm((current) => ({
      ...current,
      lat: String(coordinates.lat),
      lng: String(coordinates.lng),
    }))
    resolveAddressFromCoordinates(coordinates)
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      showError('Tu navegador no permite obtener ubicación. Selecciona el punto manualmente en el mapa.')
      return
    }

    if (!window.isSecureContext) {
      showError('El navegador bloquea la ubicación en conexiones no seguras. Abre la app en localhost o selecciona el punto en el mapa.')
      return
    }

    if (locationWatchRef.current) navigator.geolocation.clearWatch(locationWatchRef.current)
    if (locationTimeoutRef.current) window.clearTimeout(locationTimeoutRef.current)

    let bestPosition = null

    function applyPosition(position) {
      const accuracy = Number(position.coords.accuracy)
      bestPosition = !bestPosition || accuracy < bestPosition.coords.accuracy ? position : bestPosition
      setRanchForm((current) => ({
        ...current,
        lat: position.coords.latitude.toFixed(6),
        lng: position.coords.longitude.toFixed(6),
      }))
      setLocationAccuracy(accuracy)
    }

    function finishLocation(messageText) {
      if (locationWatchRef.current) {
        navigator.geolocation.clearWatch(locationWatchRef.current)
        locationWatchRef.current = null
      }
      if (locationTimeoutRef.current) {
        window.clearTimeout(locationTimeoutRef.current)
        locationTimeoutRef.current = null
      }
      if (bestPosition) applyPosition(bestPosition)
      if (bestPosition) {
        resolveAddressFromCoordinates({
          lat: bestPosition.coords.latitude.toFixed(6),
          lng: bestPosition.coords.longitude.toFixed(6),
        })
      }
      setIsLocating(false)
      if (messageText) showMessage(messageText)
    }

    setIsLocating(true)
    setLocationAccuracy(null)
    locationWatchRef.current = navigator.geolocation.watchPosition(
      (position) => {
        applyPosition(position)
        if (position.coords.accuracy <= 20) {
          finishLocation(`Ubicación detectada con precisión aproximada de ${Math.round(position.coords.accuracy)} m.`)
        }
      },
      (locationError) => {
        if (bestPosition) {
          finishLocation(`Se usó la mejor ubicación disponible con precisión aproximada de ${Math.round(bestPosition.coords.accuracy)} m.`)
          return
        }
        finishLocation('')
        const messages = {
          1: 'Permiso de ubicación denegado. Actívalo en el navegador o selecciona el punto en el mapa.',
          2: 'No se pudo detectar tu ubicación actual. Selecciona el punto manualmente en el mapa.',
          3: 'La ubicación tardó demasiado en responder. Intenta de nuevo o selecciona el punto en el mapa.',
        }
        showError(messages[locationError.code] ?? 'No se pudo obtener la ubicación del navegador.')
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
    )

    locationTimeoutRef.current = window.setTimeout(() => {
      if (bestPosition) {
        finishLocation(`Se usó la mejor ubicación disponible con precisión aproximada de ${Math.round(bestPosition.coords.accuracy)} m.`)
      } else {
        finishLocation('')
        showError('No se recibió una ubicación precisa. Puedes seleccionar el punto exacto manualmente en el mapa.')
      }
    }, 10000)
  }

  function createRanch(event) {
    event.preventDefault()
    if (!ranchForm.nombre.trim() || !ranchForm.direccion.trim() || !ranchForm.lat || !ranchForm.lng) {
      showError('El rancho requiere nombre, dirección y coordenadas.')
      return
    }

    if (ranches.some((ranch) => ranch.nombre.trim().toLowerCase() === ranchForm.nombre.trim().toLowerCase())) {
      showError('Ya existe un rancho con ese nombre.')
      return
    }

    const newRanch = {
      id: Date.now(),
      nombre: ranchForm.nombre.trim(),
      propietario: ranchForm.propietario.trim(),
      telefono: ranchForm.telefono.trim(),
      direccion: ranchForm.direccion.trim(),
      coordenadas: { lat: Number(ranchForm.lat), lng: Number(ranchForm.lng) },
      lugares: [],
    }
    saveRanches([newRanch, ...ranches])
    setPlaceForm((current) => ({ ...current, ranchoId: String(newRanch.id) }))
    setRanchForm({ nombre: '', propietario: '', telefono: '', direccion: '', lat: '', lng: '' })
    showMessage('Rancho registrado correctamente.')
  }

  function createPlace(event) {
    event.preventDefault()
    if (!placeForm.ranchoId || !placeForm.nombre.trim() || !placeForm.tipo.trim()) {
      showError('El lugar requiere rancho, nombre y tipo.')
      return
    }

    if (!placeTypes.includes(placeForm.tipo)) {
      showError('Selecciona un tipo válido para el lugar.')
      return
    }

    const capacity = Number(placeForm.capacidad)
    if (!placeForm.capacidad || !Number.isFinite(capacity) || capacity < 1) {
      showError('La capacidad debe ser un número mayor a cero.')
      return
    }

    const targetRanch = ranches.find((ranch) => ranch.id === Number(placeForm.ranchoId))
    if (!targetRanch) {
      showError('Selecciona un rancho válido.')
      return
    }

    if (targetRanch.lugares?.some((place) => place.nombre.trim().toLowerCase() === placeForm.nombre.trim().toLowerCase())) {
      showError('Ese rancho ya tiene un lugar con ese nombre.')
      return
    }

    const nextRanches = ranches.map((ranch) => {
      if (ranch.id !== Number(placeForm.ranchoId)) return ranch
      return {
        ...ranch,
        lugares: [
          ...(ranch.lugares ?? []),
          {
            id: Date.now(),
            nombre: placeForm.nombre.trim(),
            tipo: placeForm.tipo.trim(),
            capacidad: capacity,
            descripcion: placeForm.descripcion.trim(),
          },
        ],
      }
    })
    saveRanches(nextRanches)
    setPlaceForm({ ranchoId: placeForm.ranchoId, nombre: '', tipo: 'Corral', capacidad: '', descripcion: '' })
    showMessage('Lugar del rancho registrado correctamente.')
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

        <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <form className="rounded-2xl border border-[#98a287]/18 bg-white p-4 shadow-[0_12px_28px_rgba(29,29,27,0.07)] md:p-5" onSubmit={createRanch}>
            <h2 className="text-xl font-bold text-[#07612d]">Ranchos</h2>
            <p className="mt-1 text-sm text-[#1d1d1b]/65">Registra uno o más ranchos para asignar animales por ubicación real.</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                ['nombre', 'Nombre del rancho'],
                ['propietario', 'Propietario o responsable'],
                ['telefono', 'Teléfono'],
              ].map(([name, label]) => (
                <label className="block" key={name}>
                  <span className="text-sm font-bold text-[#1d1d1b]">{label}</span>
                  <input className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none focus:border-[#07612d] focus:bg-white" name={name} onChange={updateRanchForm} value={ranchForm[name]} />
                </label>
              ))}
              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-[#1d1d1b]">Dirección general</span>
                <input className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none focus:border-[#07612d] focus:bg-white" name="direccion" onChange={updateRanchForm} placeholder="Se autocompleta al seleccionar una ubicación" value={ranchForm.direccion} />
                {isResolvingAddress ? <span className="mt-2 block text-xs font-bold text-[#1f7a8c]">Buscando dirección de la ubicación seleccionada...</span> : null}
              </label>
            </div>
            <div className="mt-5">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-[#1d1d1b]">
                    <MapPin size={17} className="text-[#07612d]" />
                    Ubicación del rancho
                  </span>
                  <p className="mt-1 text-sm text-[#1d1d1b]/65">Selecciona el punto exacto en el mapa para guardar sus coordenadas.</p>
                </div>
                <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[#07612d]/25 bg-white px-4 text-sm font-bold text-[#07612d] disabled:cursor-wait disabled:opacity-65" disabled={isLocating} onClick={useCurrentLocation} type="button">
                  <Navigation size={17} /> {isLocating ? 'Detectando...' : 'Usar mi ubicación'}
                </button>
              </div>
              <RanchLocationMap accuracy={locationAccuracy} onChange={updateRanchLocation} value={{ lat: ranchForm.lat, lng: ranchForm.lng }} />
              {locationAccuracy ? (
                <p className="mt-2 rounded-2xl bg-[#1f7a8c]/10 px-4 py-3 text-sm font-semibold text-[#1f7a8c]">
                  Precisión aproximada del navegador: {Math.round(locationAccuracy)} m. Para dejarlo exacto, arrastra el marcador hasta la entrada o centro del rancho.
                </p>
              ) : null}
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button className="min-h-11 rounded-2xl bg-[#07612d] px-4 text-sm font-bold text-white" type="submit">
                Guardar rancho
              </button>
            </div>
          </form>

          <section className="rounded-2xl border border-[#98a287]/18 bg-white p-4 shadow-[0_12px_28px_rgba(29,29,27,0.07)] md:p-5">
            <h2 className="text-xl font-bold text-[#07612d]">Lugares del rancho</h2>
            <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={createPlace}>
              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-[#1d1d1b]">Rancho</span>
                <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white" name="ranchoId" onChange={updatePlaceForm} value={placeForm.ranchoId}>
                  <option value="">Selecciona rancho</option>
                  {ranches.map((ranch) => (
                    <option key={ranch.id} value={ranch.id}>
                      {ranch.nombre}
                    </option>
                  ))}
                </select>
              </label>
              {[
                ['nombre', 'Nombre del lugar'],
              ].map(([name, label]) => (
                <label className="block" key={name}>
                  <span className="text-sm font-bold text-[#1d1d1b]">{label}</span>
                  <input className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none focus:border-[#07612d] focus:bg-white" name={name} onChange={updatePlaceForm} value={placeForm[name]} />
                </label>
              ))}
              <label className="block">
                <span className="text-sm font-bold text-[#1d1d1b]">Tipo</span>
                <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white" name="tipo" onChange={updatePlaceForm} value={placeForm.tipo}>
                  {placeTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-bold text-[#1d1d1b]">Capacidad</span>
                <input className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none focus:border-[#07612d] focus:bg-white" inputMode="numeric" min="1" name="capacidad" onChange={updatePlaceForm} placeholder="Ej. 25" type="number" value={placeForm.capacidad} />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-[#1d1d1b]">Descripción</span>
                <input className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none focus:border-[#07612d] focus:bg-white" name="descripcion" onChange={updatePlaceForm} placeholder="Uso, observaciones o ubicación interna" value={placeForm.descripcion} />
              </label>
              <button className="min-h-11 rounded-2xl bg-[#07612d] px-4 text-sm font-bold text-white md:col-span-2" type="submit">
                Guardar lugar
              </button>
            </form>
            <div className="mt-5 grid gap-3">
              {ranches.map((ranch) => (
                <button className="rounded-2xl bg-[#F4F4F4] p-4 text-left transition hover:bg-[#07612d]/8 focus:outline-none focus:ring-4 focus:ring-[#07612d]/12" key={ranch.id} onClick={() => setSelectedRanchDetails(ranch)} type="button">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="break-words font-bold text-[#1d1d1b]">{ranch.nombre}</h3>
                      <p className="mt-1 break-words text-sm text-[#1d1d1b]/65">{ranch.direccion} · {ranch.coordenadas?.lat}, {ranch.coordenadas?.lng}</p>
                      <p className="mt-2 text-xs font-bold uppercase text-[#98a287]">
                        {ranch.lugares?.length ?? 0} lugares · Capacidad total {(ranch.lugares ?? []).reduce((sum, place) => sum + Number(place.capacidad || 0), 0)}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#07612d]">
                      <Eye size={14} /> Ver lugares
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </section>
      </section>
      {selectedRanchDetails ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#1d1d1b]/45 p-4">
          <section className="max-h-[88vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-5 shadow-[0_24px_60px_rgba(29,29,27,0.22)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase text-[#98a287]">Detalle del rancho</p>
                <h2 className="mt-1 break-words text-2xl font-bold text-[#07612d]">{selectedRanchDetails.nombre}</h2>
                <p className="mt-2 break-words text-sm leading-6 text-[#1d1d1b]/68">{selectedRanchDetails.direccion}</p>
              </div>
              <button className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F4F4F4] text-[#1d1d1b]" onClick={() => setSelectedRanchDetails(null)} type="button" aria-label="Cerrar detalle de rancho">
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-[#F4F4F4] p-4">
                <p className="text-xs font-bold uppercase text-[#98a287]">Lugares</p>
                <p className="mt-2 text-2xl font-bold text-[#1d1d1b]">{selectedRanchDetails.lugares?.length ?? 0}</p>
              </div>
              <div className="rounded-2xl bg-[#F4F4F4] p-4">
                <p className="text-xs font-bold uppercase text-[#98a287]">Capacidad total</p>
                <p className="mt-2 text-2xl font-bold text-[#1d1d1b]">{(selectedRanchDetails.lugares ?? []).reduce((sum, place) => sum + Number(place.capacidad || 0), 0)}</p>
              </div>
              <div className="rounded-2xl bg-[#F4F4F4] p-4">
                <p className="text-xs font-bold uppercase text-[#98a287]">Coordenadas</p>
                <p className="mt-2 break-words text-sm font-bold text-[#1d1d1b]">{selectedRanchDetails.coordenadas?.lat}, {selectedRanchDetails.coordenadas?.lng}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {(selectedRanchDetails.lugares ?? []).length ? (
                selectedRanchDetails.lugares.map((place) => (
                  <article className="rounded-2xl border border-[#98a287]/18 bg-[#F4F4F4] p-4" key={place.id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-[#1d1d1b]">{place.nombre}</h3>
                        <p className="mt-1 text-sm text-[#1d1d1b]/65">{place.descripcion || 'Sin descripción registrada.'}</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#07612d]">{place.tipo}</span>
                    </div>
                    <p className="mt-3 text-sm font-bold text-[#1d1d1b]/75">Capacidad: {place.capacidad}</p>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-[#98a287]/35 bg-[#F4F4F4] p-5 text-sm font-semibold text-[#1d1d1b]/65">
                  Este rancho todavía no tiene lugares registrados.
                </div>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}

export default SettingsPage
