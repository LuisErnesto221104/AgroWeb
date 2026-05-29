import { useEffect, useMemo, useRef, useState } from 'react';
import { Eye, MapPin, Navigation, ShieldCheck, UserCog, UsersRound, X } from 'lucide-react';
import MapaUbicacionRancho from '../components/RanchLocationMap';
import TarjetaEstadistica from '../components/StatCard';
import { useAuth } from '../hooks/useAuth';
import { solicitudApi } from '../services/api';
import { guardarRanchos as guardarRanchosEnRedux } from '../store/agrowebSlice';
import { useDespachoAplicacion, useSelectorAplicacion } from '../store/hooks';

const permisos = [
{ key: 'animales', label: 'Gestión Ganadera' },
{ key: 'sanidad', label: 'Sanidad' },
{ key: 'gastos', label: 'Gastos' },
{ key: 'reportes', label: 'Reportes' },
{ key: 'alimentacion', label: 'Alimentación' },
{ key: 'configuracion', label: 'Configuración' }];


const tiposLugar = ['Corral', 'Potrero', 'Caballeriza', 'Área porcina', 'Área de cuarentena', 'Enfermería', 'Bodega de alimento', 'Manga de manejo', 'Área de ordeña', 'Otro'];

function PaginaConfiguracion() {
  const { user: authUser } = useAuth();
  const despachar = useDespachoAplicacion();
  const [usuarios, establecerUsuarios] = useState([]);
  const [idUsuarioSeleccionado, establecerIdUsuarioSeleccionado] = useState(null);
  const [cargando, establecerCargando] = useState(true);
  const [mensaje, establecerMensaje] = useState('');
  const [error, establecerError] = useState('');
  const [localizando, establecerLocalizando] = useState(false);
  const [resolviendoDireccion, establecerResolviendoDireccion] = useState(false);
  const [precisionUbicacion, establecerPrecisionUbicacion] = useState(null);
  const ranchos = useSelectorAplicacion((estado) => estado.agroweb.ranchos);
  const [formularioRancho, establecerFormularioRancho] = useState({ nombre: '', propietario: '', telefono: '', direccion: '', lat: '', lng: '' });
  const [formularioLugar, establecerFormularioLugar] = useState({ ranchoId: '', nombre: '', tipo: 'Corral', capacidad: '', descripcion: '' });
  const [detalleRanchoSeleccionado, establecerDetalleRanchoSeleccionado] = useState(null);
  const referenciaObservadorUbicacion = useRef(null);
  const referenciaTiempoUbicacion = useRef(null);
  const referenciaSolicitudDireccion = useRef(0);

  const usuarioSeleccionado = usuarios.find((usuario) => usuario.id === idUsuarioSeleccionado) ?? usuarios[0];
  const usuarioActualConfiguracion = usuarios.find((usuario) => usuario.usuario_id === authUser?.id);
  const puedeEditarUsuarios = authUser?.rol === 'Administrador' || usuarioActualConfiguracion?.rol === 'Administrador';
  const esAdministradorProtegido = Boolean(usuarioSeleccionado?.protegido);
  const esUsuarioActual = usuarioSeleccionado?.usuario_id === authUser?.id || usuarioSeleccionado?.id === authUser?.id;

  useEffect(() => {
    let ignore = false;

    async function loadUsers() {
      try {
        establecerCargando(true);
        establecerError('');
        const datos = await solicitudApi('/configuracion/usuarios');
        if (ignore) return;
        establecerUsuarios(datos);
        establecerIdUsuarioSeleccionado((actual) => actual ?? datos[0]?.id ?? null);
      } catch (errorSolicitud) {
        if (!ignore) establecerError(errorSolicitud.message);
      } finally {
        if (!ignore) establecerCargando(false);
      }
    }

    loadUsers();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(
    () => () => {
      if (referenciaObservadorUbicacion.current) navigator.geolocation?.clearWatch(referenciaObservadorUbicacion.current);
      if (referenciaTiempoUbicacion.current) window.clearTimeout(referenciaTiempoUbicacion.current);
    },
    []
  );

  const estadisticas = useMemo(
    () => [
    { title: 'Usuarios', value: usuarios.length, detail: 'Cuentas administradas desde API', icon: UsersRound, tone: 'primary' },
    { title: 'Usuarios activos', value: usuarios.filter((usuario) => usuario.activo).length, detail: 'Con acceso permitido', icon: ShieldCheck, tone: 'success' },
    { title: 'Roles', value: new Set(usuarios.map((usuario) => usuario.rol)).size, detail: 'Perfiles disponibles', icon: UserCog, tone: 'info' }],

    [usuarios]
  );

  function actualizarUsuarioEnEstado(usuarioActualizado) {
    establecerUsuarios((actual) => actual.map((usuario) => usuario.id === usuarioActualizado.id ? usuarioActualizado : usuario));
  }

  function mostrarMensaje(nextMessage) {
    establecerMensaje(nextMessage);
    window.setTimeout(() => establecerMensaje(''), 3500);
  }

  function mostrarError(nextError) {
    establecerError(nextError);
    window.setTimeout(() => establecerError(''), 4500);
  }

  async function alternarPermiso(clavePermiso) {
    if (!usuarioSeleccionado) return;
    if (!puedeEditarUsuarios) {
      mostrarError('Solo un usuario Administrador puede editar permisos.');
      return;
    }
    const tienePermiso = usuarioSeleccionado.permisos.includes(clavePermiso);

    if (esAdministradorProtegido && tienePermiso) {
      mostrarError('El administrador principal no puede quitarse permisos.');
      return;
    }

    const permisos = tienePermiso ? usuarioSeleccionado.permisos.filter((permiso) => permiso !== clavePermiso) : [...usuarioSeleccionado.permisos, clavePermiso];

    try {
      const usuarioActualizado = await solicitudApi(`/configuracion/usuarios/${usuarioSeleccionado.id}/permisos`, {
        method: 'PUT',
        body: JSON.stringify({ permisos })
      });
      actualizarUsuarioEnEstado(usuarioActualizado);
      mostrarMensaje('Permisos actualizados correctamente.');
    } catch (errorSolicitud) {
      mostrarError(errorSolicitud.message);
    }
  }

  async function actualizarRol(evento) {
    if (!usuarioSeleccionado) return;
    if (!puedeEditarUsuarios) {
      mostrarError('Solo un usuario Administrador puede editar roles.');
      return;
    }

    try {
      const usuarioActualizado = await solicitudApi(`/configuracion/usuarios/${usuarioSeleccionado.id}/rol`, {
        method: 'PUT',
        body: JSON.stringify({ rol: evento.target.value })
      });
      actualizarUsuarioEnEstado(usuarioActualizado);
      mostrarMensaje('Rol actualizado correctamente.');
    } catch (errorSolicitud) {
      mostrarError(errorSolicitud.message);
    }
  }

  async function alternarEstadoUsuario() {
    if (!usuarioSeleccionado) return;
    if (!puedeEditarUsuarios) {
      mostrarError('Solo un usuario Administrador puede bloquear o activar usuarios.');
      return;
    }

    if (esAdministradorProtegido) {
      mostrarError('El administrador principal no puede bloquearse.');
      return;
    }

    try {
      const usuarioActualizado = await solicitudApi(`/configuracion/usuarios/${usuarioSeleccionado.id}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ activo: !usuarioSeleccionado.activo })
      });
      actualizarUsuarioEnEstado(usuarioActualizado);
      mostrarMensaje('Estado del usuario actualizado correctamente.');
    } catch (errorSolicitud) {
      mostrarError(errorSolicitud.message);
    }
  }

  function guardarRanchos(ranchosSiguientes) {
    despachar(guardarRanchosEnRedux(ranchosSiguientes));
  }

  function actualizarFormularioRancho(evento) {
    establecerFormularioRancho((actual) => ({ ...actual, [evento.target.name]: evento.target.value }));
  }

  function actualizarFormularioLugar(evento) {
    const { name, value: valor } = evento.target;
    establecerFormularioLugar((actual) => ({ ...actual, [name]: name === 'capacidad' ? valor.replace(/\D/g, '') : valor }));
  }

  async function resolverDireccionDesdeCoordenadas(coordenadas) {
    const lat = Number(coordenadas.lat);
    const lng = Number(coordenadas.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    const idSolicitud = Date.now();
    referenciaSolicitudDireccion.current = idSolicitud;
    establecerResolviendoDireccion(true);

    try {
      const respuesta = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=es`);
      if (!respuesta.ok) return;
      const datos = await respuesta.json();
      if (referenciaSolicitudDireccion.current !== idSolicitud || !datos?.display_name) return;
      establecerFormularioRancho((actual) => ({ ...actual, direccion: datos.display_name }));
    } catch {
      mostrarError('No se pudo autocompletar la dirección. Puedes escribirla manualmente.');
    } finally {
      if (referenciaSolicitudDireccion.current === idSolicitud) establecerResolviendoDireccion(false);
    }
  }

  function actualizarUbicacionRancho(coordenadas) {
    establecerPrecisionUbicacion(null);
    establecerFormularioRancho((actual) => ({
      ...actual,
      lat: String(coordenadas.lat),
      lng: String(coordenadas.lng)
    }));
    resolverDireccionDesdeCoordenadas(coordenadas);
  }

  function usarUbicacionActual() {
    if (!navigator.geolocation) {
      mostrarError('Tu navegador no permite obtener ubicación. Selecciona el punto manualmente en el mapa.');
      return;
    }

    if (!window.isSecureContext) {
      mostrarError('El navegador bloquea la ubicación en conexiones no seguras. Abre la app en localhost o selecciona el punto en el mapa.');
      return;
    }

    if (referenciaObservadorUbicacion.current) navigator.geolocation.clearWatch(referenciaObservadorUbicacion.current);
    if (referenciaTiempoUbicacion.current) window.clearTimeout(referenciaTiempoUbicacion.current);

    let mejorPosicion = null;

    function aplicarPosicion(posicion) {
      const precision = Number(posicion.coords.accuracy);
      mejorPosicion = !mejorPosicion || precision < mejorPosicion.coords.accuracy ? posicion : mejorPosicion;
      establecerFormularioRancho((actual) => ({
        ...actual,
        lat: posicion.coords.latitude.toFixed(6),
        lng: posicion.coords.longitude.toFixed(6)
      }));
      establecerPrecisionUbicacion(precision);
    }

    function finalizarUbicacion(textoMensaje) {
      if (referenciaObservadorUbicacion.current) {
        navigator.geolocation.clearWatch(referenciaObservadorUbicacion.current);
        referenciaObservadorUbicacion.current = null;
      }
      if (referenciaTiempoUbicacion.current) {
        window.clearTimeout(referenciaTiempoUbicacion.current);
        referenciaTiempoUbicacion.current = null;
      }
      if (mejorPosicion) aplicarPosicion(mejorPosicion);
      if (mejorPosicion) {
        resolverDireccionDesdeCoordenadas({
          lat: mejorPosicion.coords.latitude.toFixed(6),
          lng: mejorPosicion.coords.longitude.toFixed(6)
        });
      }
      establecerLocalizando(false);
      if (textoMensaje) mostrarMensaje(textoMensaje);
    }

    establecerLocalizando(true);
    establecerPrecisionUbicacion(null);
    referenciaObservadorUbicacion.current = navigator.geolocation.watchPosition(
      (posicion) => {
        aplicarPosicion(posicion);
        if (posicion.coords.accuracy <= 20) {
          finalizarUbicacion(`Ubicación detectada con precisión aproximada de ${Math.round(posicion.coords.accuracy)} m.`);
        }
      },
      (errorUbicacion) => {
        if (mejorPosicion) {
          finalizarUbicacion(`Se usó la mejor ubicación disponible con precisión aproximada de ${Math.round(mejorPosicion.coords.accuracy)} m.`);
          return;
        }
        finalizarUbicacion('');
        const mensajes = {
          1: 'Permiso de ubicación denegado. Actívalo en el navegador o selecciona el punto en el mapa.',
          2: 'No se pudo detectar tu ubicación actual. Selecciona el punto manualmente en el mapa.',
          3: 'La ubicación tardó demasiado en responder. Intenta de nuevo o selecciona el punto en el mapa.'
        };
        mostrarError(mensajes[errorUbicacion.code] ?? 'No se pudo obtener la ubicación del navegador.');
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
    );

    referenciaTiempoUbicacion.current = window.setTimeout(() => {
      if (mejorPosicion) {
        finalizarUbicacion(`Se usó la mejor ubicación disponible con precisión aproximada de ${Math.round(mejorPosicion.coords.accuracy)} m.`);
      } else {
        finalizarUbicacion('');
        mostrarError('No se recibió una ubicación precisa. Puedes seleccionar el punto exacto manualmente en el mapa.');
      }
    }, 10000);
  }

  function crearRancho(evento) {
    evento.preventDefault();
    if (!formularioRancho.nombre.trim() || !formularioRancho.direccion.trim() || !formularioRancho.lat || !formularioRancho.lng) {
      mostrarError('El rancho requiere nombre, dirección y coordenadas.');
      return;
    }

    if (ranchos.some((rancho) => rancho.nombre.trim().toLowerCase() === formularioRancho.nombre.trim().toLowerCase())) {
      mostrarError('Ya existe un rancho con ese nombre.');
      return;
    }

    const nuevoRancho = {
      id: Date.now(),
      nombre: formularioRancho.nombre.trim(),
      propietario: formularioRancho.propietario.trim(),
      telefono: formularioRancho.telefono.trim(),
      direccion: formularioRancho.direccion.trim(),
      coordenadas: { lat: Number(formularioRancho.lat), lng: Number(formularioRancho.lng) },
      lugares: []
    };
    guardarRanchos([nuevoRancho, ...ranchos]);
    establecerFormularioLugar((actual) => ({ ...actual, ranchoId: String(nuevoRancho.id) }));
    establecerFormularioRancho({ nombre: '', propietario: '', telefono: '', direccion: '', lat: '', lng: '' });
    mostrarMensaje('Rancho registrado correctamente.');
  }

  function crearLugar(evento) {
    evento.preventDefault();
    if (!formularioLugar.ranchoId || !formularioLugar.nombre.trim() || !formularioLugar.tipo.trim()) {
      mostrarError('El lugar requiere rancho, nombre y tipo.');
      return;
    }

    if (!tiposLugar.includes(formularioLugar.tipo)) {
      mostrarError('Selecciona un tipo válido para el lugar.');
      return;
    }

    const capacidadNumerica = Number(formularioLugar.capacidad);
    if (!formularioLugar.capacidad || !Number.isFinite(capacidadNumerica) || capacidadNumerica < 1) {
      mostrarError('La capacidad debe ser un número mayor a cero.');
      return;
    }

    const ranchoObjetivo = ranchos.find((rancho) => rancho.id === Number(formularioLugar.ranchoId));
    if (!ranchoObjetivo) {
      mostrarError('Selecciona un rancho válido.');
      return;
    }

    if (ranchoObjetivo.lugares?.some((lugar) => lugar.nombre.trim().toLowerCase() === formularioLugar.nombre.trim().toLowerCase())) {
      mostrarError('Ese rancho ya tiene un lugar con ese nombre.');
      return;
    }

    const ranchosSiguientes = ranchos.map((rancho) => {
      if (rancho.id !== Number(formularioLugar.ranchoId)) return rancho;
      return {
        ...rancho,
        lugares: [
        ...(rancho.lugares ?? []),
        {
          id: Date.now(),
          nombre: formularioLugar.nombre.trim(),
          tipo: formularioLugar.tipo.trim(),
          capacidad: capacidadNumerica,
          descripcion: formularioLugar.descripcion.trim()
        }]

      };
    });
    guardarRanchos(ranchosSiguientes);
    establecerFormularioLugar({ ranchoId: formularioLugar.ranchoId, nombre: '', tipo: 'Corral', capacidad: '', descripcion: '' });
    mostrarMensaje('Lugar del rancho registrado correctamente.');
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

        {mensaje ? <div className="rounded-2xl border border-[#4CAF50]/20 bg-[#4CAF50]/10 p-4 text-sm font-bold text-[#2f8f36]">{mensaje}</div> : null}
        {error ? <div className="rounded-2xl border border-[#D32F2F]/20 bg-[#D32F2F]/10 p-4 text-sm font-bold text-[#D32F2F]">{error}</div> : null}
        {esAdministradorProtegido && esUsuarioActual ?
        <div className="rounded-2xl border border-[#FFA000]/25 bg-[#FFA000]/12 p-4 text-sm font-bold text-[#9b6300]">
            Estás editando al administrador principal. Por seguridad no puede quitarse permisos, cambiar a otro rol ni bloquearse.
          </div> :
        null}
        {!puedeEditarUsuarios ?
        <div className="rounded-2xl border border-[#1f7a8c]/20 bg-[#1f7a8c]/10 p-4 text-sm font-bold text-[#1f7a8c]">
            Solo los usuarios con rol Administrador pueden modificar roles, permisos o estado de usuarios.
          </div> :
        null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {estadisticas.map((estadistica) =>
          <TarjetaEstadistica key={estadistica.title} {...estadistica} />
          )}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <section className="rounded-2xl border border-[#98a287]/18 bg-white p-4 shadow-[0_12px_28px_rgba(29,29,27,0.07)] md:p-5">
            <h2 className="text-xl font-bold text-[#07612d]">Usuarios</h2>
            <div className="mt-4 grid gap-3">
              {cargando ? <div className="min-h-28 animate-pulse rounded-2xl bg-[#F4F4F4]" /> : null}
              {!cargando &&
              usuarios.map((usuario) =>
              <button
                className={`rounded-2xl border p-4 text-left transition ${usuarioSeleccionado?.id === usuario.id ? 'border-[#07612d] bg-[#07612d]/8' : 'border-[#98a287]/18 bg-[#F4F4F4] hover:border-[#07612d]/30'}`}
                key={usuario.id}
                onClick={() => establecerIdUsuarioSeleccionado(usuario.id)}
                type="button">
                
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <strong className="break-words text-[#1d1d1b]">{usuario.nombre}</strong>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${usuario.activo ? 'bg-[#4CAF50]/12 text-[#2f8f36]' : 'bg-[#D32F2F]/10 text-[#D32F2F]'}`}>
                        {usuario.activo ? 'Activo' : 'Bloqueado'}
                      </span>
                    </div>
                    <p className="mt-1 break-words text-sm text-[#1d1d1b]/65">{usuario.correo}</p>
                    <p className="mt-2 text-xs font-bold uppercase text-[#98a287]">{usuario.rol}</p>
                  </button>
              )}
            </div>
          </section>

          {usuarioSeleccionado ?
          <section className="rounded-2xl border border-[#98a287]/18 bg-white p-4 shadow-[0_12px_28px_rgba(29,29,27,0.07)] md:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h2 className="break-words text-xl font-bold text-[#07612d]">{usuarioSeleccionado.nombre}</h2>
                  <p className="mt-1 break-words text-sm text-[#1d1d1b]/65">{usuarioSeleccionado.correo}</p>
                </div>
                <button className="min-h-11 rounded-2xl border border-[#07612d]/25 bg-white px-4 text-sm font-bold text-[#07612d] disabled:cursor-not-allowed disabled:border-[#98a287]/25 disabled:text-[#98a287]" disabled={!puedeEditarUsuarios || esAdministradorProtegido} onClick={alternarEstadoUsuario} type="button">
                  {usuarioSeleccionado.activo ? 'Bloquear acceso' : 'Activar usuario'}
                </button>
              </div>

              <label className="mt-5 block">
                <span className="text-sm font-bold text-[#1d1d1b]">Rol del usuario</span>
                <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none disabled:cursor-not-allowed disabled:opacity-60 focus:border-[#07612d] focus:bg-white" disabled={!puedeEditarUsuarios || esAdministradorProtegido} onChange={actualizarRol} value={usuarioSeleccionado.rol}>
                  {['Administrador', 'Ganadero', 'Veterinario', 'Finanzas', 'Consulta'].map((rol) =>
                <option key={rol} value={rol}>
                      {rol}
                    </option>
                )}
                </select>
              </label>

              <div className="mt-5">
                <h3 className="text-base font-bold text-[#1d1d1b]">Permisos del sistema</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {permisos.map((permiso) => {
                  const marcado = usuarioSeleccionado.permisos.includes(permiso.key);
                  return (
                    <label className="flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-2xl bg-[#F4F4F4] px-4 text-sm font-bold text-[#1d1d1b]" key={permiso.key}>
                        <span className="break-words">{permiso.label}</span>
                        <input checked={marcado} className="size-5 accent-[#07612d] disabled:cursor-not-allowed" disabled={!puedeEditarUsuarios || esAdministradorProtegido && marcado} onChange={() => alternarPermiso(permiso.key)} type="checkbox" />
                      </label>);

                })}
                </div>
              </div>
            </section> :
          null}
        </div>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <form className="rounded-2xl border border-[#98a287]/18 bg-white p-4 shadow-[0_12px_28px_rgba(29,29,27,0.07)] md:p-5" onSubmit={crearRancho}>
            <h2 className="text-xl font-bold text-[#07612d]">Ranchos</h2>
            <p className="mt-1 text-sm text-[#1d1d1b]/65">Registra uno o más ranchos para asignar animales por ubicación real.</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
              ['nombre', 'Nombre del rancho'],
              ['propietario', 'Propietario o responsable'],
              ['telefono', 'Teléfono']].
              map(([name, etiqueta]) =>
              <label className="block" key={name}>
                  <span className="text-sm font-bold text-[#1d1d1b]">{etiqueta}</span>
                  <input className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none focus:border-[#07612d] focus:bg-white" name={name} onChange={actualizarFormularioRancho} value={formularioRancho[name]} />
                </label>
              )}
              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-[#1d1d1b]">Dirección general</span>
                <input className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none focus:border-[#07612d] focus:bg-white" name="direccion" onChange={actualizarFormularioRancho} placeholder="Se autocompleta al seleccionar una ubicación" value={formularioRancho.direccion} />
                {resolviendoDireccion ? <span className="mt-2 block text-xs font-bold text-[#1f7a8c]">Buscando dirección de la ubicación seleccionada...</span> : null}
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
                <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[#07612d]/25 bg-white px-4 text-sm font-bold text-[#07612d] disabled:cursor-wait disabled:opacity-65" disabled={localizando} onClick={usarUbicacionActual} type="button">
                  <Navigation size={17} /> {localizando ? 'Detectando...' : 'Usar mi ubicación'}
                </button>
              </div>
              <MapaUbicacionRancho accuracy={precisionUbicacion} onChange={actualizarUbicacionRancho} value={{ lat: formularioRancho.lat, lng: formularioRancho.lng }} />
              {precisionUbicacion ?
              <p className="mt-2 rounded-2xl bg-[#1f7a8c]/10 px-4 py-3 text-sm font-semibold text-[#1f7a8c]">
                  Precisión aproximada del navegador: {Math.round(precisionUbicacion)} m. Para dejarlo exacto, arrastra el marcador hasta la entrada o centro del rancho.
                </p> :
              null}
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button className="min-h-11 rounded-2xl bg-[#07612d] px-4 text-sm font-bold text-white" type="submit">
                Guardar rancho
              </button>
            </div>
          </form>

          <section className="rounded-2xl border border-[#98a287]/18 bg-white p-4 shadow-[0_12px_28px_rgba(29,29,27,0.07)] md:p-5">
            <h2 className="text-xl font-bold text-[#07612d]">Lugares del rancho</h2>
            <form className="mt-5 grid gap-4 md:grid-cols-2" onSubmit={crearLugar}>
              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-[#1d1d1b]">Rancho</span>
                <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white" name="ranchoId" onChange={actualizarFormularioLugar} value={formularioLugar.ranchoId}>
                  <option value="">Selecciona rancho</option>
                  {ranchos.map((rancho) =>
                  <option key={rancho.id} value={rancho.id}>
                      {rancho.nombre}
                    </option>
                  )}
                </select>
              </label>
              {[
              ['nombre', 'Nombre del lugar']].
              map(([name, etiqueta]) =>
              <label className="block" key={name}>
                  <span className="text-sm font-bold text-[#1d1d1b]">{etiqueta}</span>
                  <input className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none focus:border-[#07612d] focus:bg-white" name={name} onChange={actualizarFormularioLugar} value={formularioLugar[name]} />
                </label>
              )}
              <label className="block">
                <span className="text-sm font-bold text-[#1d1d1b]">Tipo</span>
                <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white" name="tipo" onChange={actualizarFormularioLugar} value={formularioLugar.tipo}>
                  {tiposLugar.map((tipo) =>
                  <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  )}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-bold text-[#1d1d1b]">Capacidad</span>
                <input className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none focus:border-[#07612d] focus:bg-white" inputMode="numeric" min="1" name="capacidad" onChange={actualizarFormularioLugar} placeholder="Ej. 25" type="number" value={formularioLugar.capacidad} />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-[#1d1d1b]">Descripción</span>
                <input className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none focus:border-[#07612d] focus:bg-white" name="descripcion" onChange={actualizarFormularioLugar} placeholder="Uso, observaciones o ubicación interna" value={formularioLugar.descripcion} />
              </label>
              <button className="min-h-11 rounded-2xl bg-[#07612d] px-4 text-sm font-bold text-white md:col-span-2" type="submit">
                Guardar lugar
              </button>
            </form>
            <div className="mt-5 grid gap-3">
              {ranchos.map((rancho) =>
              <button className="rounded-2xl bg-[#F4F4F4] p-4 text-left transition hover:bg-[#07612d]/8 focus:outline-none focus:ring-4 focus:ring-[#07612d]/12" key={rancho.id} onClick={() => establecerDetalleRanchoSeleccionado(rancho)} type="button">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="break-words font-bold text-[#1d1d1b]">{rancho.nombre}</h3>
                      <p className="mt-1 break-words text-sm text-[#1d1d1b]/65">{rancho.direccion} · {rancho.coordenadas?.lat}, {rancho.coordenadas?.lng}</p>
                      <p className="mt-2 text-xs font-bold uppercase text-[#98a287]">
                        {rancho.lugares?.length ?? 0} lugares · Capacidad total {(rancho.lugares ?? []).reduce((suma, lugar) => suma + Number(lugar.capacidad || 0), 0)}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#07612d]">
                      <Eye size={14} /> Ver lugares
                    </span>
                  </div>
                </button>
              )}
            </div>
          </section>
        </section>
      </section>
      {detalleRanchoSeleccionado ?
      <div className="fixed inset-0 z-[2000] grid place-items-center bg-[#1d1d1b]/45 p-4">
          <section className="relative z-[2001] max-h-[88vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-5 shadow-[0_24px_60px_rgba(29,29,27,0.22)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase text-[#98a287]">Detalle del rancho</p>
                <h2 className="mt-1 break-words text-2xl font-bold text-[#07612d]">{detalleRanchoSeleccionado.nombre}</h2>
                <p className="mt-2 break-words text-sm leading-6 text-[#1d1d1b]/68">{detalleRanchoSeleccionado.direccion}</p>
              </div>
              <button className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[#F4F4F4] text-[#1d1d1b]" onClick={() => establecerDetalleRanchoSeleccionado(null)} type="button" aria-label="Cerrar detalle de rancho">
                <X size={20} />
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-[#F4F4F4] p-4">
                <p className="text-xs font-bold uppercase text-[#98a287]">Lugares</p>
                <p className="mt-2 text-2xl font-bold text-[#1d1d1b]">{detalleRanchoSeleccionado.lugares?.length ?? 0}</p>
              </div>
              <div className="rounded-2xl bg-[#F4F4F4] p-4">
                <p className="text-xs font-bold uppercase text-[#98a287]">Capacidad total</p>
                <p className="mt-2 text-2xl font-bold text-[#1d1d1b]">{(detalleRanchoSeleccionado.lugares ?? []).reduce((suma, lugar) => suma + Number(lugar.capacidad || 0), 0)}</p>
              </div>
              <div className="rounded-2xl bg-[#F4F4F4] p-4">
                <p className="text-xs font-bold uppercase text-[#98a287]">Coordenadas</p>
                <p className="mt-2 break-words text-sm font-bold text-[#1d1d1b]">{detalleRanchoSeleccionado.coordenadas?.lat}, {detalleRanchoSeleccionado.coordenadas?.lng}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {(detalleRanchoSeleccionado.lugares ?? []).length ?
            detalleRanchoSeleccionado.lugares.map((lugar) =>
            <article className="rounded-2xl border border-[#98a287]/18 bg-[#F4F4F4] p-4" key={lugar.id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-[#1d1d1b]">{lugar.nombre}</h3>
                        <p className="mt-1 text-sm text-[#1d1d1b]/65">{lugar.descripcion || 'Sin descripción registrada.'}</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#07612d]">{lugar.tipo}</span>
                    </div>
                    <p className="mt-3 text-sm font-bold text-[#1d1d1b]/75">Capacidad: {lugar.capacidad}</p>
                  </article>
            ) :

            <div className="rounded-2xl border border-dashed border-[#98a287]/35 bg-[#F4F4F4] p-5 text-sm font-semibold text-[#1d1d1b]/65">
                  Este rancho todavía no tiene lugares registrados.
                </div>
            }
            </div>
          </section>
        </div> :
      null}
    </div>);

}

export default PaginaConfiguracion;
