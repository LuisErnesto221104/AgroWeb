import crypto from 'node:crypto';
import fs from 'node:fs';
import ruta from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { animales as animalesFrontend } from '../src/data/animals.js';
import { gastos as gastosFrontend } from '../src/data/expenses.js';
import { alimentacion as alimentacionFrontend } from '../src/data/feeding.js';
import { eventosSanitarios as eventosSanitariosFrontend } from '../src/data/healthEvents.js';
import { ingresos as ingresosFrontend } from '../src/data/income.js';

dotenv.config();

const aplicacionExpress = express();
const puerto = process.env.PORT ?? 4000;
const __dirname = ruta.dirname(fileURLToPath(import.meta.url));
const raizProyecto = ruta.resolve(__dirname, '..');
const directorioDatos = ruta.join(__dirname, 'data');
const directorioCargas = ruta.join(__dirname, 'uploads');
const directorioImagenes = ruta.join(directorioCargas, 'images');
const directorioDocumentos = ruta.join(directorioCargas, 'documents');
const rutaAlmacenLocal = ruta.join(directorioDatos, 'local-store.json');

aplicacionExpress.use(cors());
aplicacionExpress.use(express.json({ limit: '8mb' }));
aplicacionExpress.use('/uploads', express.static(directorioCargas));

for (const directorio of [directorioDatos, directorioCargas, directorioImagenes, directorioDocumentos]) {
  fs.mkdirSync(directorio, { recursive: true });
}

const imagenesBaseAnimales = [
{ id: 1, source: 'src/img/Animales/Bovino/vaca.webp', target: 'animals/luna-bovino.webp' },
{ id: 2, source: 'src/img/Animales/Bovino/brahman.jpeg', target: 'animals/titan-brahman.jpeg' },
{ id: 3, source: 'src/img/Animales/Ovino/borrego1.jpg', target: 'animals/mora-ovino.jpg' },
{ id: 4, source: 'src/img/Animales/Cabrino/cabra.jpg', target: 'animals/nube-caprino.jpg' },
{ id: 5, source: 'src/img/Animales/Bovino/hereford.jpg', target: 'animals/canela-hereford.jpg' },
{ id: 6, source: 'src/img/Animales/Bovino/vaca lechera.webp', target: 'animals/estrella-holstein.webp' },
{ id: 7, source: 'src/img/Animales/Equino/descarga.webp', target: 'animals/relampago-equino.webp' },
{ id: 8, source: 'src/img/Animales/Porcino/Cerdo1.jpg', target: 'animals/bruno-porcino.jpg' }];


const fotoAnimalPorId = Object.fromEntries(imagenesBaseAnimales.map((imagen) => [imagen.id, `/uploads/images/${imagen.target}`]));

function asegurarImagenesBaseAnimales() {
  for (const imagen of imagenesBaseAnimales) {
    const rutaOrigen = ruta.join(raizProyecto, imagen.source);
    const rutaDestino = ruta.join(directorioImagenes, imagen.target);
    if (!fs.existsSync(rutaOrigen)) continue;
    fs.mkdirSync(ruta.dirname(rutaDestino), { recursive: true });
    if (!fs.existsSync(rutaDestino)) fs.copyFileSync(rutaOrigen, rutaDestino);
  }
}

function agregarFotosPredeterminadasAnimales(listaAnimales = []) {
  return listaAnimales.map((animal) => ({
    ...animal,
    fotografia: animal.fotografia || fotoAnimalPorId[animal.id] || ''
  }));
}

asegurarImagenesBaseAnimales();

function crearSal() {
  return crypto.randomBytes(16).toString('hex');
}

function crearHashPin(pin, sal) {
  return crypto.pbkdf2Sync(String(pin), sal, 1000, 32, 'sha256').toString('hex');
}

function sanearUsuario(usuario) {
  const configuracion = baseDatos.configuracion_usuarios.find((elemento) => elemento.usuario_id === usuario.id);
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    fecha_creacion: usuario.fecha_creacion,
    ultimo_acceso: usuario.ultimo_acceso,
    rol: configuracion?.rol ?? 'Consulta',
    activo: configuracion?.activo ?? true,
    permisos: configuracion?.permisos ?? [],
    protegido: configuracion?.protegido ?? false
  };
}

const salAdministrador = 'agroweb_admin_salt';

const permisosSistema = ['animales', 'sanidad', 'gastos', 'reportes', 'alimentacion', 'configuracion'];

const ranchosPredeterminados = [
{
  id: 1,
  nombre: 'Rancho AgroWeb',
  propietario: 'Administrador AgroWeb',
  telefono: '3330000000',
  direccion: 'Tepatitlan, Jalisco',
  coordenadas: { lat: 20.8169, lng: -102.7635 },
  lugares: [
  { id: 1, nombre: 'Corral 1', tipo: 'Corral', capacidad: 25, descripcion: 'Área principal para bovinos activos.' },
  { id: 2, nombre: 'Corral Lechero', tipo: 'Corral', capacidad: 18, descripcion: 'Zona para vacas lecheras.' },
  { id: 3, nombre: 'Caballerizas', tipo: 'Caballeriza', capacidad: 8, descripcion: 'Espacio para equinos de trabajo.' }]

}];


const usuariosConfiguracionPredeterminados = [
{
  id: 1,
  usuario_id: 1,
  nombre: 'Administrador AgroWeb',
  correo: 'admin@agroweb.mx',
  rol: 'Administrador',
  activo: true,
  permisos: permisosSistema,
  protegido: true
},
{
  id: 2,
  usuario_id: null,
  nombre: 'Encargado del Rancho',
  correo: 'rancho@agroweb.mx',
  rol: 'Ganadero',
  activo: true,
  permisos: ['animales', 'sanidad', 'alimentacion'],
  protegido: false
},
{
  id: 3,
  usuario_id: null,
  nombre: 'Contabilidad',
  correo: 'finanzas@agroweb.mx',
  rol: 'Finanzas',
  activo: true,
  permisos: ['gastos', 'reportes'],
  protegido: false
}];


function leerArchivoJson(filePath, respaldo) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return respaldo;
  }
}

function escribirArchivoJson(filePath, datos) {
  fs.writeFileSync(filePath, JSON.stringify(datos, null, 2));
}

function obtenerAlmacenLocalPredeterminado() {
  return {
    'agroweb.animals': agregarFotosPredeterminadasAnimales(animalesFrontend),
    'agroweb.expenses': gastosFrontend,
    'agroweb.feeding': alimentacionFrontend,
    'agroweb.healthEvents': eventosSanitariosFrontend,
    'agroweb.income': ingresosFrontend,
    'agroweb.settings.users': usuariosConfiguracionPredeterminados,
    'agroweb.ranches': ranchosPredeterminados
  };
}

let almacenLocal = { ...obtenerAlmacenLocalPredeterminado(), ...leerArchivoJson(rutaAlmacenLocal, {}) };
almacenLocal['agroweb.animals'] = agregarFotosPredeterminadasAnimales(almacenLocal['agroweb.animals'] ?? animalesFrontend);

function urlDatosABuffer(urlDatos) {
  const coincidencia = String(urlDatos).match(/^data:([^;]+);base64,(.+)$/);
  if (!coincidencia) return null;
  return {
    mimeType: coincidencia[1],
    buffer: Buffer.from(coincidencia[2], 'base64')
  };
}

function extensionDesdeMime(tipoMime, nombreRespaldo = '') {
  if (tipoMime === 'application/pdf') return '.pdf';
  if (tipoMime === 'image/jpeg') return '.jpg';
  if (tipoMime === 'image/png') return '.png';
  if (tipoMime === 'image/webp') return '.webp';
  return ruta.extname(nombreRespaldo) || '.bin';
}

function nombreArchivoSeguro(nombreArchivo) {
  return String(nombreArchivo || 'archivo').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]+/g, '-');
}

function persistirUrlDatos(urlDatos, nombreArchivo, claveAlmacen) {
  const analizado = urlDatosABuffer(urlDatos);
  if (!analizado) return urlDatos;
  const esImagen = analizado.mimeType.startsWith('image/');
  const directorioBase = esImagen ? directorioImagenes : ruta.join(directorioDocumentos, nombreArchivoSeguro(claveAlmacen));
  fs.mkdirSync(directorioBase, { recursive: true });
  const nombreFinal = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${nombreArchivoSeguro(nombreArchivo).replace(/\.[^.]+$/, '')}${extensionDesdeMime(analizado.mimeType, nombreArchivo)}`;
  const rutaFinal = ruta.join(directorioBase, nombreFinal);
  fs.writeFileSync(rutaFinal, analizado.buffer);
  const rutaPublica = ruta.relative(directorioCargas, rutaFinal).split(ruta.sep).join('/');
  return `/uploads/${rutaPublica}`;
}

function persistirCargas(valor, claveAlmacen) {
  if (Array.isArray(valor)) return valor.map((elemento) => persistirCargas(elemento, claveAlmacen));
  if (!valor || typeof valor !== 'object') {
    if (typeof valor === 'string' && valor.startsWith('data:image/')) return persistirUrlDatos(valor, 'imagen-subida', claveAlmacen);
    return valor;
  }

  const siguiente = { ...valor };
  if (typeof siguiente.dataUrl === 'string' && siguiente.dataUrl.startsWith('data:')) {
    siguiente.dataUrl = persistirUrlDatos(siguiente.dataUrl, siguiente.name, claveAlmacen);
  }

  if (typeof siguiente.fotografia === 'string' && siguiente.fotografia.startsWith('data:image/')) {
    siguiente.fotografia = persistirUrlDatos(siguiente.fotografia, `${siguiente.identificador || siguiente.id || 'animal'}.jpg`, claveAlmacen);
  }

  for (const [clave, nestedValue] of Object.entries(siguiente)) {
    if (clave !== 'dataUrl' && clave !== 'fotografia') siguiente[clave] = persistirCargas(nestedValue, claveAlmacen);
  }

  return siguiente;
}

function guardarAlmacenLocal() {
  escribirArchivoJson(rutaAlmacenLocal, almacenLocal);
}

guardarAlmacenLocal();

const baseDatos = {
  animales: [
  {
    id: 1,
    arete: 'MX011400001028',
    especie: 'Vaca',
    sexo: 'Hembra',
    fecha: '2022-04-12',
    peso: 485,
    estado: 'OBSERVACION',
    foto_path: '',
    fecha_baja: null,
    motivo_baja: null
  },
  {
    id: 2,
    arete: 'MX010500001044',
    especie: 'Toro',
    sexo: 'Macho',
    fecha: '2021-06-22',
    peso: 690,
    estado: 'TRATAMIENTO',
    foto_path: '',
    fecha_baja: null,
    motivo_baja: null
  },
  {
    id: 3,
    arete: 'MX011500007782',
    especie: 'Vaca',
    sexo: 'Hembra',
    fecha: '2023-02-18',
    peso: 438,
    estado: 'ACTIVO',
    foto_path: '',
    fecha_baja: null,
    motivo_baja: null
  }],

  eventos_sanitarios: [
  {
    id: 1,
    animal_id: 1,
    tipo_evento: 'Revision',
    descripcion: 'Revision postparto',
    fecha_evento: '2026-05-13',
    fecha_proximo_evento: '2026-05-16',
    veterinario: 'Dra. Morales',
    dosis: '',
    observaciones: 'Monitorear temperatura y apetito.'
  },
  {
    id: 2,
    animal_id: 2,
    tipo_evento: 'Tratamiento',
    descripcion: 'Dosis antibiotico',
    fecha_evento: '2026-05-13',
    fecha_proximo_evento: '2026-05-14',
    veterinario: 'Dr. Campos',
    dosis: '10 ml',
    observaciones: 'Aplicar segunda dosis.'
  },
  {
    id: 3,
    animal_id: 3,
    tipo_evento: 'Vacuna',
    descripcion: 'Vacuna clostridial',
    fecha_evento: '2026-05-10',
    fecha_proximo_evento: '2026-05-20',
    veterinario: 'Dra. Morales',
    dosis: '5 ml',
    observaciones: 'Refuerzo programado.'
  }],

  gastos: [
  { id: 1, animal_id: 1, categoria: 'Medicinas', monto: 1200, fecha: '2026-05-13', descripcion: 'Revision y medicamento' },
  { id: 2, animal_id: 2, categoria: 'Medicinas', monto: 3000, fecha: '2026-05-13', descripcion: 'Tratamiento antibiotico' },
  { id: 3, animal_id: null, categoria: 'Mantenimiento', monto: 2100, fecha: '2026-05-09', descripcion: 'Equipo de corral' }],

  alimentacion: [
  { id: 1, animal_id: 1, tipo_alimento: 'Concentrado', cantidad: 18, unidad: 'kg', fecha: '2026-05-13', costo: 680, observaciones: 'Racion de recuperacion' },
  { id: 2, animal_id: 2, tipo_alimento: 'Forraje', cantidad: 24, unidad: 'kg', fecha: '2026-05-13', costo: 520, observaciones: 'Consumo normal' },
  { id: 3, animal_id: 3, tipo_alimento: 'Minerales', cantidad: 4, unidad: 'kg', fecha: '2026-05-12', costo: 380, observaciones: 'Suplemento semanal' }],

  usuarios: [
  {
    id: 1,
    pin_hash: crearHashPin('1234', salAdministrador),
    salt: salAdministrador,
    nombre: 'admin',
    fecha_creacion: '2026-05-13T14:00:00.000Z',
    ultimo_acceso: '2026-05-16T08:00:00.000Z'
  }],

  configuracion_usuarios: almacenLocal['agroweb.settings.users'] ?? usuariosConfiguracionPredeterminados,
  session_manager: [
  {
    id: 1,
    usuario_id: 1,
    inicio_sesion: '2026-05-16T08:00:00.000Z',
    ultimo_ping: '2026-05-16T08:20:00.000Z',
    activa: 1
  }]

};

const eventosCompletados = new Set();

function siguienteId(coleccion) {
  return coleccion.length ? Math.max(...coleccion.map((elemento) => elemento.id)) + 1 : 1;
}

function buscarPorId(coleccion, id) {
  return coleccion.find((elemento) => elemento.id === Number(id));
}

function crearUsuarioConfiguracionDesdeUsuario(usuario) {
  return {
    id: siguienteId(baseDatos.configuracion_usuarios),
    usuario_id: usuario.id,
    nombre: usuario.nombre === 'admin' ? 'Administrador AgroWeb' : usuario.nombre,
    correo: usuario.nombre === 'admin' ? 'admin@agroweb.mx' : `${usuario.nombre}@agroweb.local`,
    rol: usuario.nombre === 'admin' ? 'Administrador' : 'Consulta',
    activo: true,
    permisos: usuario.nombre === 'admin' ? permisosSistema : [],
    protegido: usuario.nombre === 'admin'
  };
}

function sincronizarUsuariosConfiguracion() {
  let cambio = false;
  for (const usuario of baseDatos.usuarios) {
    const existe = baseDatos.configuracion_usuarios.some((elemento) => elemento.usuario_id === usuario.id);
    if (!existe) {
      baseDatos.configuracion_usuarios.push(crearUsuarioConfiguracionDesdeUsuario(usuario));
      cambio = true;
    }
  }
  if (cambio) {
    almacenLocal['agroweb.settings.users'] = baseDatos.configuracion_usuarios;
    guardarAlmacenLocal();
  }
}

sincronizarUsuariosConfiguracion();

function noEncontrado(respuesta, entidad) {
  respuesta.status(404).json({ message: `${entidad} no encontrado.` });
}

function validarAnimal(datos) {
  if (!datos?.arete || !datos?.especie || !datos?.sexo || !datos?.fecha || datos?.peso === undefined) {
    return 'El animal requiere arete, especie, sexo, fecha y peso.';
  }

  if (baseDatos.animales.some((animal) => animal.arete === datos.arete)) {
    return 'El arete ya existe.';
  }

  return null;
}

function existeAnimal(idAnimal) {
  return baseDatos.animales.some((animal) => animal.id === Number(idAnimal));
}

function diasEntre(fecha) {
  const hoy = new Date('2026-05-16T00:00:00.000Z');
  const destino = new Date(`${fecha}T00:00:00.000Z`);
  return Math.ceil((destino.getTime() - hoy.getTime()) / 86_400_000);
}

function prioridadDesdeFecha(fecha) {
  const days = diasEntre(fecha);
  if (days <= 0) return 'Urgente';
  if (days <= 3) return 'Próximo';
  return 'Normal';
}

function formatearFechaCorta(fecha) {
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long' }).format(new Date(`${fecha}T00:00:00.000Z`));
}

function calcularTextoEdad(fecha) {
  const inicio = new Date(`${fecha}T00:00:00.000Z`);
  const hoy = new Date('2026-05-16T00:00:00.000Z');
  const anios = hoy.getUTCFullYear() - inicio.getUTCFullYear();
  if (anios > 0) return `${anios} ${anios === 1 ? 'año' : 'años'}`;

  const meses = Math.max(1, hoy.getUTCMonth() - inicio.getUTCMonth() + 12 * anios);
  return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
}

function ultimoEventoPorAnimal(idAnimal) {
  return baseDatos.eventos_sanitarios.
  filter((evento) => evento.animal_id === idAnimal).
  toSorted((a, b) => b.fecha_evento.localeCompare(a.fecha_evento))[0];
}

function animalesPanel() {
  return baseDatos.animales.map((animal) => {
    const ultimoEvento = ultimoEventoPorAnimal(animal.id);
    return {
      id: animal.arete,
      name: animal.arete,
      type: animal.especie,
      age: calcularTextoEdad(animal.fecha),
      status: animal.estado === 'ACTIVO' ? 'Activo' : animal.estado === 'OBSERVACION' ? 'Observación' : 'Tratamiento',
      last: ultimoEvento?.descripcion ?? 'Alta inventario',
      next: ultimoEvento?.fecha_proximo_evento ? formatearFechaCorta(ultimoEvento.fecha_proximo_evento) : 'Sin tarea',
      priority: ultimoEvento?.fecha_proximo_evento ? prioridadDesdeFecha(ultimoEvento.fecha_proximo_evento) : 'Normal'
    };
  });
}

function tareasPanel() {
  return baseDatos.eventos_sanitarios.map((evento) => {
    const animal = buscarPorId(baseDatos.animales, evento.animal_id);
    const prioridad = prioridadDesdeFecha(evento.fecha_proximo_evento);
    return {
      id: evento.id,
      group: prioridad === 'Urgente' ? 'Hoy' : prioridad === 'Próximo' ? 'Mañana' : 'Esta semana',
      date: formatearFechaCorta(evento.fecha_proximo_evento),
      task: `${evento.tipo_evento}: ${animal?.arete ?? 'animal sin arete'}`,
      module: 'Sanitario',
      priority: prioridad,
      completed: eventosCompletados.has(evento.id)
    };
  });
}

function costosPanel() {
  const totales = new Map();
  for (const gasto of baseDatos.gastos) totales.set(gasto.categoria, (totales.get(gasto.categoria) ?? 0) + gasto.monto);
  const totalAlimento = baseDatos.alimentacion.reduce((total, elemento) => total + elemento.costo, 0);
  totales.set('Alimento', (totales.get('Alimento') ?? 0) + totalAlimento);

  const total = [...totales.values()].reduce((suma, valor) => suma + valor, 0);
  return [...totales.entries()].map(([etiqueta, valor]) => ({
    label: etiqueta,
    value: valor,
    percent: total > 0 ? Math.round(valor / total * 100) : 0
  }));
}

function resumenSanidadPanel() {
  const eventosSiguientes = baseDatos.eventos_sanitarios.filter((evento) => !eventosCompletados.has(evento.id));
  return [
  { label: 'Vacunas pendientes', value: eventosSiguientes.filter((evento) => evento.tipo_evento === 'Vacuna').length, tone: 'warning' },
  { label: 'Desparasitaciones próximas', value: eventosSiguientes.filter((evento) => evento.tipo_evento === 'Desparasitacion').length, tone: 'primary' },
  { label: 'Revisiones clínicas', value: eventosSiguientes.filter((evento) => evento.tipo_evento === 'Revision').length, tone: 'danger' },
  { label: 'Animales en observación', value: baseDatos.animales.filter((animal) => animal.estado === 'OBSERVACION').length, tone: 'warning' },
  { label: 'Historial reciente', value: baseDatos.eventos_sanitarios.length, tone: 'success' }];

}

function obtenerPanel() {
  const animales = animalesPanel();
  const tareas = tareasPanel();
  const costos = costosPanel();
  const costosTotales = costos.reduce((total, costo) => total + costo.value, 0);

  return {
    stats: [
    { title: 'Animales activos', value: baseDatos.animales.filter((animal) => animal.estado !== 'BAJA').length.toString(), detail: 'Inventario productivo', tone: 'primary' },
    { title: 'En observación', value: baseDatos.animales.filter((animal) => animal.estado === 'OBSERVACION').length.toString(), detail: 'Requieren seguimiento', tone: 'warning' },
    { title: 'Eventos próximos', value: tareas.filter((tarea) => !tarea.completed).length.toString(), detail: 'Sanitario y manejo', tone: 'primary' },
    { title: 'Gastos del mes', value: `$${costosTotales.toLocaleString('es-MX')}`, detail: 'Gastos y alimentación', tone: 'success' },
    { title: 'Tareas pendientes', value: tareas.filter((tarea) => !tarea.completed).length.toString(), detail: 'Prioriza las de hoy', tone: 'warning' },
    { title: 'Alertas urgentes', value: tareas.filter((tarea) => tarea.priority === 'Urgente' && !tarea.completed).length.toString(), detail: 'Atención inmediata', tone: 'danger' }],

    animals: animales,
    tasks: tareas,
    costs: costos,
    healthSummary: resumenSanidadPanel()
  };
}

function sanearUsuarioConfiguracion(usuario) {
  return {
    id: usuario.id,
    usuario_id: usuario.usuario_id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol: usuario.rol,
    activo: usuario.activo,
    permisos: usuario.permisos,
    protegido: usuario.protegido
  };
}

function obtenerUsuarioConfiguracion(id) {
  return baseDatos.configuracion_usuarios.find((usuario) => usuario.id === Number(id));
}

function validarPermisos(permisos) {
  if (!Array.isArray(permisos)) return 'Los permisos deben enviarse como arreglo.';
  const permisoInvalido = permisos.find((permiso) => !permisosSistema.includes(permiso));
  if (permisoInvalido) return `Permiso inválido: ${permisoInvalido}.`;
  return null;
}

function registrarRutasCrud(ruta, nombreColeccion, camposRequeridos = []) {
  aplicacionExpress.get(`/api/${ruta}`, (_request, respuesta) => {
    respuesta.json(baseDatos[nombreColeccion]);
  });

  aplicacionExpress.get(`/api/${ruta}/:id`, (solicitud, respuesta) => {
    const entidad = buscarPorId(baseDatos[nombreColeccion], solicitud.params.id);
    if (!entidad) {
      noEncontrado(respuesta, nombreColeccion);
      return;
    }

    respuesta.json(entidad);
  });

  aplicacionExpress.post(`/api/${ruta}`, (solicitud, respuesta) => {
    const campoFaltante = camposRequeridos.find((campo) => solicitud.body?.[campo] === undefined || solicitud.body?.[campo] === '');
    if (campoFaltante) {
      respuesta.status(400).json({ message: `Falta el campo ${campoFaltante}.` });
      return;
    }

    const entidad = { id: siguienteId(baseDatos[nombreColeccion]), ...solicitud.body };
    baseDatos[nombreColeccion].push(entidad);
    respuesta.status(201).json(entidad);
  });

  aplicacionExpress.put(`/api/${ruta}/:id`, (solicitud, respuesta) => {
    const indice = baseDatos[nombreColeccion].findIndex((elemento) => elemento.id === Number(solicitud.params.id));
    if (indice < 0) {
      noEncontrado(respuesta, nombreColeccion);
      return;
    }

    baseDatos[nombreColeccion][indice] = { ...baseDatos[nombreColeccion][indice], ...solicitud.body, id: Number(solicitud.params.id) };
    respuesta.json(baseDatos[nombreColeccion][indice]);
  });

  aplicacionExpress.delete(`/api/${ruta}/:id`, (solicitud, respuesta) => {
    const indice = baseDatos[nombreColeccion].findIndex((elemento) => elemento.id === Number(solicitud.params.id));
    if (indice < 0) {
      noEncontrado(respuesta, nombreColeccion);
      return;
    }

    const [deleted] = baseDatos[nombreColeccion].splice(indice, 1);
    respuesta.json(deleted);
  });
}

aplicacionExpress.get('/api/health', (_request, respuesta) => {
  respuesta.json({ ok: true, service: 'AgroWeb API', database: 'mock-der-v1' });
});

aplicacionExpress.get('/api/dashboard', (_request, respuesta) => {
  respuesta.json(obtenerPanel());
});

aplicacionExpress.get('/api/db', (_request, respuesta) => {
  respuesta.json(baseDatos);
});

aplicacionExpress.get('/api/local-store', (_request, respuesta) => {
  respuesta.json(almacenLocal);
});

aplicacionExpress.get('/api/local-store/:key', (solicitud, respuesta) => {
  const clave = decodeURIComponent(solicitud.params.key);
  respuesta.json(almacenLocal[clave] ?? null);
});

aplicacionExpress.put('/api/local-store/:key', (solicitud, respuesta) => {
  const clave = decodeURIComponent(solicitud.params.key);
  const valor = persistirCargas(solicitud.body?.value, clave);
  almacenLocal[clave] = valor;

  if (clave === 'agroweb.settings.users') baseDatos.configuracion_usuarios = valor;
  guardarAlmacenLocal();
  respuesta.json({ key: clave, value: valor });
});

aplicacionExpress.post('/api/auth/login', (solicitud, respuesta) => {
  const { nombre, pin: pin } = solicitud.body;
  if (!nombre || !pin) {
    respuesta.status(400).json({ message: 'Ingresa usuario y PIN.' });
    return;
  }

  const usuario = baseDatos.usuarios.find((usuario) => usuario.nombre.toLowerCase() === String(nombre).trim().toLowerCase());
  if (!usuario || usuario.pin_hash !== crearHashPin(pin, usuario.salt)) {
    respuesta.status(401).json({ message: 'Credenciales incorrectas.' });
    return;
  }

  const configuracion = baseDatos.configuracion_usuarios.find((elemento) => elemento.usuario_id === usuario.id);
  if (configuracion && !configuracion.activo) {
    respuesta.status(403).json({ message: 'Usuario bloqueado. Solicita acceso al administrador.' });
    return;
  }

  const ahora = new Date().toISOString();
  usuario.ultimo_acceso = ahora;

  const sesion = {
    id: siguienteId(baseDatos.session_manager),
    usuario_id: usuario.id,
    inicio_sesion: ahora,
    ultimo_ping: ahora,
    activa: 1
  };
  baseDatos.session_manager.push(sesion);

  respuesta.json({ user: sanearUsuario(usuario), session: sesion });
});

aplicacionExpress.post('/api/auth/register', (solicitud, respuesta) => {
  const { nombre, pin: pin } = solicitud.body;
  if (!nombre || !pin) {
    respuesta.status(400).json({ message: 'Ingresa nombre de usuario y PIN.' });
    return;
  }

  if (String(pin).length < 4) {
    respuesta.status(400).json({ message: 'El PIN debe tener al menos 4 caracteres.' });
    return;
  }

  const nombreNormalizado = String(nombre).trim();
  const existe = baseDatos.usuarios.some((usuario) => usuario.nombre.toLowerCase() === nombreNormalizado.toLowerCase());
  if (existe) {
    respuesta.status(409).json({ message: 'Ese usuario ya existe.' });
    return;
  }

  const sal = crearSal();
  const ahora = new Date().toISOString();
  const usuario = {
    id: siguienteId(baseDatos.usuarios),
    pin_hash: crearHashPin(pin, sal),
    salt: sal,
    nombre: nombreNormalizado,
    fecha_creacion: ahora,
    ultimo_acceso: ahora
  };

  baseDatos.usuarios.push(usuario);
  const usuarioConfiguracion = crearUsuarioConfiguracionDesdeUsuario(usuario);
  baseDatos.configuracion_usuarios.push(usuarioConfiguracion);
  almacenLocal['agroweb.settings.users'] = baseDatos.configuracion_usuarios;
  guardarAlmacenLocal();

  const sesion = {
    id: siguienteId(baseDatos.session_manager),
    usuario_id: usuario.id,
    inicio_sesion: ahora,
    ultimo_ping: ahora,
    activa: 1
  };
  baseDatos.session_manager.push(sesion);

  respuesta.status(201).json({ user: sanearUsuario(usuario), session: sesion });
});

aplicacionExpress.post('/api/auth/logout', (solicitud, respuesta) => {
  const { sessionId: idSesion } = solicitud.body;
  const sesion = buscarPorId(baseDatos.session_manager, idSesion);
  if (sesion) {
    sesion.activa = 0;
    sesion.ultimo_ping = new Date().toISOString();
  }

  respuesta.json({ ok: true });
});

aplicacionExpress.post('/api/animales', (solicitud, respuesta) => {
  const error = validarAnimal(solicitud.body);
  if (error) {
    respuesta.status(400).json({ message: error });
    return;
  }

  const animal = {
    id: siguienteId(baseDatos.animales),
    estado: 'ACTIVO',
    foto_path: '',
    fecha_baja: null,
    motivo_baja: null,
    ...solicitud.body
  };
  baseDatos.animales.push(animal);

  const precioCompra = Number(solicitud.body.precio_compra ?? 0);
  if (precioCompra > 0) {
    baseDatos.gastos.push({
      id: siguienteId(baseDatos.gastos),
      animal_id: animal.id,
      categoria: 'Compra',
      monto: precioCompra,
      fecha: solicitud.body.fecha,
      descripcion: `Compra de animal ${animal.arete}`
    });
  }

  respuesta.status(201).json(animal);
});

aplicacionExpress.put('/api/animales/:id', (solicitud, respuesta) => {
  const indice = baseDatos.animales.findIndex((animal) => animal.id === Number(solicitud.params.id));
  if (indice < 0) {
    noEncontrado(respuesta, 'Animal');
    return;
  }

  baseDatos.animales[indice] = { ...baseDatos.animales[indice], ...solicitud.body, id: Number(solicitud.params.id) };
  respuesta.json(baseDatos.animales[indice]);
});

aplicacionExpress.delete('/api/animales/:id', (solicitud, respuesta) => {
  const animal = buscarPorId(baseDatos.animales, solicitud.params.id);
  if (!animal) {
    noEncontrado(respuesta, 'Animal');
    return;
  }

  animal.estado = 'BAJA';
  animal.fecha_baja = new Date().toISOString();
  animal.motivo_baja = solicitud.body?.motivo_baja ?? 'Baja administrativa';
  respuesta.json(animal);
});

aplicacionExpress.get('/api/animales', (_request, respuesta) => {
  respuesta.json(baseDatos.animales);
});

aplicacionExpress.get('/api/animales/:id', (solicitud, respuesta) => {
  const animal = buscarPorId(baseDatos.animales, solicitud.params.id);
  if (!animal) {
    noEncontrado(respuesta, 'Animal');
    return;
  }

  respuesta.json(animal);
});

registrarRutasCrud('usuarios', 'usuarios', ['pin_hash', 'salt', 'nombre']);
registrarRutasCrud('session-manager', 'session_manager', ['usuario_id', 'inicio_sesion', 'ultimo_ping']);

aplicacionExpress.get('/api/configuracion/usuarios', (_request, respuesta) => {
  respuesta.json(baseDatos.configuracion_usuarios.map(sanearUsuarioConfiguracion));
});

aplicacionExpress.put('/api/configuracion/usuarios/:id/rol', (solicitud, respuesta) => {
  const usuario = obtenerUsuarioConfiguracion(solicitud.params.id);
  if (!usuario) {
    noEncontrado(respuesta, 'Usuario de configuración');
    return;
  }

  const { rol } = solicitud.body;
  if (!rol) {
    respuesta.status(400).json({ message: 'El rol es obligatorio.' });
    return;
  }

  if (usuario.protegido && rol !== 'Administrador') {
    respuesta.status(403).json({ message: 'El administrador principal no puede dejar de ser Administrador.' });
    return;
  }

  usuario.rol = rol;
  almacenLocal['agroweb.settings.users'] = baseDatos.configuracion_usuarios;
  guardarAlmacenLocal();
  respuesta.json(sanearUsuarioConfiguracion(usuario));
});

aplicacionExpress.patch('/api/configuracion/usuarios/:id/estado', (solicitud, respuesta) => {
  const usuario = obtenerUsuarioConfiguracion(solicitud.params.id);
  if (!usuario) {
    noEncontrado(respuesta, 'Usuario de configuración');
    return;
  }

  if (usuario.protegido) {
    respuesta.status(403).json({ message: 'El administrador principal no puede bloquearse.' });
    return;
  }

  usuario.activo = Boolean(solicitud.body?.activo);
  almacenLocal['agroweb.settings.users'] = baseDatos.configuracion_usuarios;
  guardarAlmacenLocal();
  respuesta.json(sanearUsuarioConfiguracion(usuario));
});

aplicacionExpress.put('/api/configuracion/usuarios/:id/permisos', (solicitud, respuesta) => {
  const usuario = obtenerUsuarioConfiguracion(solicitud.params.id);
  if (!usuario) {
    noEncontrado(respuesta, 'Usuario de configuración');
    return;
  }

  const error = validarPermisos(solicitud.body?.permisos);
  if (error) {
    respuesta.status(400).json({ message: error });
    return;
  }

  if (usuario.protegido) {
    const permisoEliminado = permisosSistema.find((permiso) => !solicitud.body.permisos.includes(permiso));
    if (permisoEliminado) {
      respuesta.status(403).json({ message: 'El administrador principal no puede quitarse permisos.' });
      return;
    }
  }

  usuario.permisos = [...new Set(solicitud.body.permisos)];
  almacenLocal['agroweb.settings.users'] = baseDatos.configuracion_usuarios;
  guardarAlmacenLocal();
  respuesta.json(sanearUsuarioConfiguracion(usuario));
});

aplicacionExpress.post('/api/eventos-sanitarios', (solicitud, respuesta) => {
  if (!existeAnimal(solicitud.body?.animal_id)) {
    respuesta.status(400).json({ message: 'El animal_id no existe.' });
    return;
  }

  const camposRequeridos = ['tipo_evento', 'descripcion', 'fecha_evento', 'fecha_proximo_evento'];
  const campoFaltante = camposRequeridos.find((campo) => !solicitud.body?.[campo]);
  if (campoFaltante) {
    respuesta.status(400).json({ message: `Falta el campo ${campoFaltante}.` });
    return;
  }

  const evento = { id: siguienteId(baseDatos.eventos_sanitarios), veterinario: '', dosis: '', observaciones: '', ...solicitud.body };
  baseDatos.eventos_sanitarios.push(evento);
  respuesta.status(201).json(evento);
});

registrarRutasCrud('eventos-sanitarios', 'eventos_sanitarios');

aplicacionExpress.post('/api/gastos', (solicitud, respuesta) => {
  if (solicitud.body?.animal_id !== null && solicitud.body?.animal_id !== undefined && !existeAnimal(solicitud.body.animal_id)) {
    respuesta.status(400).json({ message: 'El animal_id no existe.' });
    return;
  }

  if (!solicitud.body?.categoria || Number(solicitud.body?.monto) <= 0 || !solicitud.body?.fecha) {
    respuesta.status(400).json({ message: 'El gasto requiere categoria, monto mayor a 0 y fecha.' });
    return;
  }

  const gasto = { id: siguienteId(baseDatos.gastos), descripcion: '', ...solicitud.body };
  baseDatos.gastos.push(gasto);
  respuesta.status(201).json(gasto);
});

registrarRutasCrud('gastos', 'gastos');

aplicacionExpress.post('/api/alimentacion', (solicitud, respuesta) => {
  if (!existeAnimal(solicitud.body?.animal_id)) {
    respuesta.status(400).json({ message: 'El animal_id no existe.' });
    return;
  }

  const camposRequeridos = ['tipo_alimento', 'cantidad', 'unidad', 'fecha', 'costo'];
  const campoFaltante = camposRequeridos.find((campo) => solicitud.body?.[campo] === undefined || solicitud.body?.[campo] === '');
  if (campoFaltante) {
    respuesta.status(400).json({ message: `Falta el campo ${campoFaltante}.` });
    return;
  }

  const elemento = { id: siguienteId(baseDatos.alimentacion), observaciones: '', ...solicitud.body };
  baseDatos.alimentacion.push(elemento);
  respuesta.status(201).json(elemento);
});

registrarRutasCrud('alimentacion', 'alimentacion');

aplicacionExpress.patch('/api/tasks/:id/toggle', (solicitud, respuesta) => {
  const evento = buscarPorId(baseDatos.eventos_sanitarios, solicitud.params.id);
  if (!evento) {
    noEncontrado(respuesta, 'Evento sanitario');
    return;
  }

  if (eventosCompletados.has(evento.id)) eventosCompletados.delete(evento.id);else
  eventosCompletados.add(evento.id);

  const tarea = tareasPanel().find((elemento) => elemento.id === evento.id);
  respuesta.json(tarea);
});

aplicacionExpress.listen(puerto, '0.0.0.0', () => {
  console.log(`AgroWeb API escuchando en http://localhost:${puerto}`);
});
