import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { animals as frontendAnimals } from '../src/data/animals.js'
import { expenses as frontendExpenses } from '../src/data/expenses.js'
import { feeding as frontendFeeding } from '../src/data/feeding.js'
import { healthEvents as frontendHealthEvents } from '../src/data/healthEvents.js'
import { income as frontendIncome } from '../src/data/income.js'

dotenv.config()

const app = express()
const port = process.env.PORT ?? 4000
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const dataDirectory = path.join(__dirname, 'data')
const uploadsDirectory = path.join(__dirname, 'uploads')
const imagesDirectory = path.join(uploadsDirectory, 'images')
const documentsDirectory = path.join(uploadsDirectory, 'documents')
const localStorePath = path.join(dataDirectory, 'local-store.json')

app.use(cors())
app.use(express.json({ limit: '8mb' }))
app.use('/uploads', express.static(uploadsDirectory))

for (const directory of [dataDirectory, uploadsDirectory, imagesDirectory, documentsDirectory]) {
  fs.mkdirSync(directory, { recursive: true })
}

const animalImageSeeds = [
  { id: 1, source: 'src/img/Animales/Bovino/vaca.webp', target: 'animals/luna-bovino.webp' },
  { id: 2, source: 'src/img/Animales/Bovino/brahman.jpeg', target: 'animals/titan-brahman.jpeg' },
  { id: 3, source: 'src/img/Animales/Ovino/borrego1.jpg', target: 'animals/mora-ovino.jpg' },
  { id: 4, source: 'src/img/Animales/Cabrino/cabra.jpg', target: 'animals/nube-caprino.jpg' },
  { id: 5, source: 'src/img/Animales/Bovino/hereford.jpg', target: 'animals/canela-hereford.jpg' },
  { id: 6, source: 'src/img/Animales/Bovino/vaca lechera.webp', target: 'animals/estrella-holstein.webp' },
  { id: 7, source: 'src/img/Animales/Equino/descarga.webp', target: 'animals/relampago-equino.webp' },
  { id: 8, source: 'src/img/Animales/Porcino/Cerdo1.jpg', target: 'animals/bruno-porcino.jpg' },
]

const animalPhotoById = Object.fromEntries(animalImageSeeds.map((image) => [image.id, `/uploads/images/${image.target}`]))

function ensureSeedAnimalImages() {
  for (const image of animalImageSeeds) {
    const sourcePath = path.join(projectRoot, image.source)
    const targetPath = path.join(imagesDirectory, image.target)
    if (!fs.existsSync(sourcePath)) continue
    fs.mkdirSync(path.dirname(targetPath), { recursive: true })
    if (!fs.existsSync(targetPath)) fs.copyFileSync(sourcePath, targetPath)
  }
}

function addDefaultAnimalPhotos(animalList = []) {
  return animalList.map((animal) => ({
    ...animal,
    fotografia: animal.fotografia || animalPhotoById[animal.id] || '',
  }))
}

ensureSeedAnimalImages()

function createSalt() {
  return crypto.randomBytes(16).toString('hex')
}

function hashPin(pin, salt) {
  return crypto.pbkdf2Sync(String(pin), salt, 1000, 32, 'sha256').toString('hex')
}

function sanitizeUser(user) {
  return {
    id: user.id,
    nombre: user.nombre,
    fecha_creacion: user.fecha_creacion,
    ultimo_acceso: user.ultimo_acceso,
  }
}

const adminSalt = 'agroweb_admin_salt'

const systemPermissions = ['animales', 'sanidad', 'gastos', 'reportes', 'alimentacion', 'configuracion']

const defaultRanches = [
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
      { id: 3, nombre: 'Caballerizas', tipo: 'Caballeriza', capacidad: 8, descripcion: 'Espacio para equinos de trabajo.' },
    ],
  },
]

const defaultConfigUsers = [
  {
    id: 1,
    usuario_id: 1,
    nombre: 'Administrador AgroWeb',
    correo: 'admin@agroweb.mx',
    rol: 'Administrador',
    activo: true,
    permisos: systemPermissions,
    protegido: true,
  },
  {
    id: 2,
    usuario_id: null,
    nombre: 'Encargado del Rancho',
    correo: 'rancho@agroweb.mx',
    rol: 'Ganadero',
    activo: true,
    permisos: ['animales', 'sanidad', 'alimentacion'],
    protegido: false,
  },
  {
    id: 3,
    usuario_id: null,
    nombre: 'Contabilidad',
    correo: 'finanzas@agroweb.mx',
    rol: 'Finanzas',
    activo: true,
    permisos: ['gastos', 'reportes'],
    protegido: false,
  },
]

function readJsonFile(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return fallback
  }
}

function writeJsonFile(filePath, payload) {
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2))
}

function getDefaultLocalStore() {
  return {
    'agroweb.animals': addDefaultAnimalPhotos(frontendAnimals),
    'agroweb.expenses': frontendExpenses,
    'agroweb.feeding': frontendFeeding,
    'agroweb.healthEvents': frontendHealthEvents,
    'agroweb.income': frontendIncome,
    'agroweb.settings.users': defaultConfigUsers,
    'agroweb.ranches': defaultRanches,
  }
}

let localStore = { ...getDefaultLocalStore(), ...readJsonFile(localStorePath, {}) }
localStore['agroweb.animals'] = addDefaultAnimalPhotos(localStore['agroweb.animals'] ?? frontendAnimals)

function dataUrlToBuffer(dataUrl) {
  const match = String(dataUrl).match(/^data:([^;]+);base64,(.+)$/)
  if (!match) return null
  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], 'base64'),
  }
}

function extensionFromMime(mimeType, fallbackName = '') {
  if (mimeType === 'application/pdf') return '.pdf'
  if (mimeType === 'image/jpeg') return '.jpg'
  if (mimeType === 'image/png') return '.png'
  if (mimeType === 'image/webp') return '.webp'
  return path.extname(fallbackName) || '.bin'
}

function safeFileName(fileName) {
  return String(fileName || 'archivo').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]+/g, '-')
}

function persistDataUrl(dataUrl, fileName, storeKey) {
  const parsed = dataUrlToBuffer(dataUrl)
  if (!parsed) return dataUrl
  const isImage = parsed.mimeType.startsWith('image/')
  const baseDirectory = isImage ? imagesDirectory : path.join(documentsDirectory, safeFileName(storeKey))
  fs.mkdirSync(baseDirectory, { recursive: true })
  const finalName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${safeFileName(fileName).replace(/\.[^.]+$/, '')}${extensionFromMime(parsed.mimeType, fileName)}`
  const finalPath = path.join(baseDirectory, finalName)
  fs.writeFileSync(finalPath, parsed.buffer)
  const publicPath = path.relative(uploadsDirectory, finalPath).split(path.sep).join('/')
  return `/uploads/${publicPath}`
}

function persistUploads(value, storeKey) {
  if (Array.isArray(value)) return value.map((item) => persistUploads(item, storeKey))
  if (!value || typeof value !== 'object') {
    if (typeof value === 'string' && value.startsWith('data:image/')) return persistDataUrl(value, 'imagen-subida', storeKey)
    return value
  }

  const next = { ...value }
  if (typeof next.dataUrl === 'string' && next.dataUrl.startsWith('data:')) {
    next.dataUrl = persistDataUrl(next.dataUrl, next.name, storeKey)
  }

  if (typeof next.fotografia === 'string' && next.fotografia.startsWith('data:image/')) {
    next.fotografia = persistDataUrl(next.fotografia, `${next.identificador || next.id || 'animal'}.jpg`, storeKey)
  }

  for (const [key, nestedValue] of Object.entries(next)) {
    if (key !== 'dataUrl' && key !== 'fotografia') next[key] = persistUploads(nestedValue, storeKey)
  }

  return next
}

function saveLocalStore() {
  writeJsonFile(localStorePath, localStore)
}

saveLocalStore()

const db = {
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
      motivo_baja: null,
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
      motivo_baja: null,
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
      motivo_baja: null,
    },
  ],
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
      observaciones: 'Monitorear temperatura y apetito.',
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
      observaciones: 'Aplicar segunda dosis.',
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
      observaciones: 'Refuerzo programado.',
    },
  ],
  gastos: [
    { id: 1, animal_id: 1, categoria: 'Medicinas', monto: 1200, fecha: '2026-05-13', descripcion: 'Revision y medicamento' },
    { id: 2, animal_id: 2, categoria: 'Medicinas', monto: 3000, fecha: '2026-05-13', descripcion: 'Tratamiento antibiotico' },
    { id: 3, animal_id: null, categoria: 'Mantenimiento', monto: 2100, fecha: '2026-05-09', descripcion: 'Equipo de corral' },
  ],
  alimentacion: [
    { id: 1, animal_id: 1, tipo_alimento: 'Concentrado', cantidad: 18, unidad: 'kg', fecha: '2026-05-13', costo: 680, observaciones: 'Racion de recuperacion' },
    { id: 2, animal_id: 2, tipo_alimento: 'Forraje', cantidad: 24, unidad: 'kg', fecha: '2026-05-13', costo: 520, observaciones: 'Consumo normal' },
    { id: 3, animal_id: 3, tipo_alimento: 'Minerales', cantidad: 4, unidad: 'kg', fecha: '2026-05-12', costo: 380, observaciones: 'Suplemento semanal' },
  ],
  usuarios: [
    {
      id: 1,
      pin_hash: hashPin('1234', adminSalt),
      salt: adminSalt,
      nombre: 'admin',
      fecha_creacion: '2026-05-13T14:00:00.000Z',
      ultimo_acceso: '2026-05-16T08:00:00.000Z',
    },
  ],
  configuracion_usuarios: localStore['agroweb.settings.users'] ?? defaultConfigUsers,
  session_manager: [
    {
      id: 1,
      usuario_id: 1,
      inicio_sesion: '2026-05-16T08:00:00.000Z',
      ultimo_ping: '2026-05-16T08:20:00.000Z',
      activa: 1,
    },
  ],
}

const completedEvents = new Set()

function nextId(collection) {
  return collection.length ? Math.max(...collection.map((item) => item.id)) + 1 : 1
}

function findById(collection, id) {
  return collection.find((item) => item.id === Number(id))
}

function notFound(response, entity) {
  response.status(404).json({ message: `${entity} no encontrado.` })
}

function validateAnimal(payload) {
  if (!payload?.arete || !payload?.especie || !payload?.sexo || !payload?.fecha || payload?.peso === undefined) {
    return 'El animal requiere arete, especie, sexo, fecha y peso.'
  }

  if (db.animales.some((animal) => animal.arete === payload.arete)) {
    return 'El arete ya existe.'
  }

  return null
}

function animalExists(animalId) {
  return db.animales.some((animal) => animal.id === Number(animalId))
}

function daysBetween(date) {
  const today = new Date('2026-05-16T00:00:00.000Z')
  const target = new Date(`${date}T00:00:00.000Z`)
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000)
}

function priorityFromDate(date) {
  const days = daysBetween(date)
  if (days <= 0) return 'Urgente'
  if (days <= 3) return 'Próximo'
  return 'Normal'
}

function formatShortDate(date) {
  return new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long' }).format(new Date(`${date}T00:00:00.000Z`))
}

function calculateAgeText(date) {
  const start = new Date(`${date}T00:00:00.000Z`)
  const today = new Date('2026-05-16T00:00:00.000Z')
  const years = today.getUTCFullYear() - start.getUTCFullYear()
  if (years > 0) return `${years} ${years === 1 ? 'año' : 'años'}`

  const months = Math.max(1, today.getUTCMonth() - start.getUTCMonth() + 12 * years)
  return `${months} ${months === 1 ? 'mes' : 'meses'}`
}

function latestEventForAnimal(animalId) {
  return db.eventos_sanitarios
    .filter((event) => event.animal_id === animalId)
    .toSorted((a, b) => b.fecha_evento.localeCompare(a.fecha_evento))[0]
}

function dashboardAnimals() {
  return db.animales.map((animal) => {
    const latestEvent = latestEventForAnimal(animal.id)
    return {
      id: animal.arete,
      name: animal.arete,
      type: animal.especie,
      age: calculateAgeText(animal.fecha),
      status: animal.estado === 'ACTIVO' ? 'Activo' : animal.estado === 'OBSERVACION' ? 'Observación' : 'Tratamiento',
      last: latestEvent?.descripcion ?? 'Alta inventario',
      next: latestEvent?.fecha_proximo_evento ? formatShortDate(latestEvent.fecha_proximo_evento) : 'Sin tarea',
      priority: latestEvent?.fecha_proximo_evento ? priorityFromDate(latestEvent.fecha_proximo_evento) : 'Normal',
    }
  })
}

function dashboardTasks() {
  return db.eventos_sanitarios.map((event) => {
    const animal = findById(db.animales, event.animal_id)
    const priority = priorityFromDate(event.fecha_proximo_evento)
    return {
      id: event.id,
      group: priority === 'Urgente' ? 'Hoy' : priority === 'Próximo' ? 'Mañana' : 'Esta semana',
      date: formatShortDate(event.fecha_proximo_evento),
      task: `${event.tipo_evento}: ${animal?.arete ?? 'animal sin arete'}`,
      module: 'Sanitario',
      priority,
      completed: completedEvents.has(event.id),
    }
  })
}

function dashboardCosts() {
  const totals = new Map()
  for (const gasto of db.gastos) totals.set(gasto.categoria, (totals.get(gasto.categoria) ?? 0) + gasto.monto)
  const alimentoTotal = db.alimentacion.reduce((total, item) => total + item.costo, 0)
  totals.set('Alimento', (totals.get('Alimento') ?? 0) + alimentoTotal)

  const total = [...totals.values()].reduce((sum, value) => sum + value, 0)
  return [...totals.entries()].map(([label, value]) => ({
    label,
    value,
    percent: total > 0 ? Math.round((value / total) * 100) : 0,
  }))
}

function dashboardHealthSummary() {
  const nextEvents = db.eventos_sanitarios.filter((event) => !completedEvents.has(event.id))
  return [
    { label: 'Vacunas pendientes', value: nextEvents.filter((event) => event.tipo_evento === 'Vacuna').length, tone: 'warning' },
    { label: 'Desparasitaciones próximas', value: nextEvents.filter((event) => event.tipo_evento === 'Desparasitacion').length, tone: 'primary' },
    { label: 'Revisiones clínicas', value: nextEvents.filter((event) => event.tipo_evento === 'Revision').length, tone: 'danger' },
    { label: 'Animales en observación', value: db.animales.filter((animal) => animal.estado === 'OBSERVACION').length, tone: 'warning' },
    { label: 'Historial reciente', value: db.eventos_sanitarios.length, tone: 'success' },
  ]
}

function getDashboard() {
  const animals = dashboardAnimals()
  const tasks = dashboardTasks()
  const costs = dashboardCosts()
  const totalCosts = costs.reduce((total, cost) => total + cost.value, 0)

  return {
    stats: [
      { title: 'Animales activos', value: db.animales.filter((animal) => animal.estado !== 'BAJA').length.toString(), detail: 'Inventario productivo', tone: 'primary' },
      { title: 'En observación', value: db.animales.filter((animal) => animal.estado === 'OBSERVACION').length.toString(), detail: 'Requieren seguimiento', tone: 'warning' },
      { title: 'Eventos próximos', value: tasks.filter((task) => !task.completed).length.toString(), detail: 'Sanitario y manejo', tone: 'primary' },
      { title: 'Gastos del mes', value: `$${totalCosts.toLocaleString('es-MX')}`, detail: 'Gastos y alimentación', tone: 'success' },
      { title: 'Tareas pendientes', value: tasks.filter((task) => !task.completed).length.toString(), detail: 'Prioriza las de hoy', tone: 'warning' },
      { title: 'Alertas urgentes', value: tasks.filter((task) => task.priority === 'Urgente' && !task.completed).length.toString(), detail: 'Atención inmediata', tone: 'danger' },
    ],
    animals,
    tasks,
    costs,
    healthSummary: dashboardHealthSummary(),
  }
}

function sanitizeConfigUser(user) {
  return {
    id: user.id,
    usuario_id: user.usuario_id,
    nombre: user.nombre,
    correo: user.correo,
    rol: user.rol,
    activo: user.activo,
    permisos: user.permisos,
    protegido: user.protegido,
  }
}

function getConfigUser(id) {
  return db.configuracion_usuarios.find((user) => user.id === Number(id))
}

function validatePermissions(permisos) {
  if (!Array.isArray(permisos)) return 'Los permisos deben enviarse como arreglo.'
  const invalidPermission = permisos.find((permission) => !systemPermissions.includes(permission))
  if (invalidPermission) return `Permiso inválido: ${invalidPermission}.`
  return null
}

function registerCrudRoutes(path, collectionName, requiredFields = []) {
  app.get(`/api/${path}`, (_request, response) => {
    response.json(db[collectionName])
  })

  app.get(`/api/${path}/:id`, (request, response) => {
    const entity = findById(db[collectionName], request.params.id)
    if (!entity) {
      notFound(response, collectionName)
      return
    }

    response.json(entity)
  })

  app.post(`/api/${path}`, (request, response) => {
    const missingField = requiredFields.find((field) => request.body?.[field] === undefined || request.body?.[field] === '')
    if (missingField) {
      response.status(400).json({ message: `Falta el campo ${missingField}.` })
      return
    }

    const entity = { id: nextId(db[collectionName]), ...request.body }
    db[collectionName].push(entity)
    response.status(201).json(entity)
  })

  app.put(`/api/${path}/:id`, (request, response) => {
    const index = db[collectionName].findIndex((item) => item.id === Number(request.params.id))
    if (index < 0) {
      notFound(response, collectionName)
      return
    }

    db[collectionName][index] = { ...db[collectionName][index], ...request.body, id: Number(request.params.id) }
    response.json(db[collectionName][index])
  })

  app.delete(`/api/${path}/:id`, (request, response) => {
    const index = db[collectionName].findIndex((item) => item.id === Number(request.params.id))
    if (index < 0) {
      notFound(response, collectionName)
      return
    }

    const [deleted] = db[collectionName].splice(index, 1)
    response.json(deleted)
  })
}

app.get('/api/health', (_request, response) => {
  response.json({ ok: true, service: 'AgroWeb API', database: 'mock-der-v1' })
})

app.get('/api/dashboard', (_request, response) => {
  response.json(getDashboard())
})

app.get('/api/db', (_request, response) => {
  response.json(db)
})

app.get('/api/local-store', (_request, response) => {
  response.json(localStore)
})

app.get('/api/local-store/:key', (request, response) => {
  const key = decodeURIComponent(request.params.key)
  response.json(localStore[key] ?? null)
})

app.put('/api/local-store/:key', (request, response) => {
  const key = decodeURIComponent(request.params.key)
  const value = persistUploads(request.body?.value, key)
  localStore[key] = value

  if (key === 'agroweb.settings.users') db.configuracion_usuarios = value
  saveLocalStore()
  response.json({ key, value })
})

app.post('/api/auth/login', (request, response) => {
  const { nombre, pin } = request.body
  if (!nombre || !pin) {
    response.status(400).json({ message: 'Ingresa usuario y PIN.' })
    return
  }

  const user = db.usuarios.find((usuario) => usuario.nombre.toLowerCase() === String(nombre).trim().toLowerCase())
  if (!user || user.pin_hash !== hashPin(pin, user.salt)) {
    response.status(401).json({ message: 'Credenciales incorrectas.' })
    return
  }

  const now = new Date().toISOString()
  user.ultimo_acceso = now

  const session = {
    id: nextId(db.session_manager),
    usuario_id: user.id,
    inicio_sesion: now,
    ultimo_ping: now,
    activa: 1,
  }
  db.session_manager.push(session)

  response.json({ user: sanitizeUser(user), session })
})

app.post('/api/auth/register', (request, response) => {
  const { nombre, pin } = request.body
  if (!nombre || !pin) {
    response.status(400).json({ message: 'Ingresa nombre de usuario y PIN.' })
    return
  }

  if (String(pin).length < 4) {
    response.status(400).json({ message: 'El PIN debe tener al menos 4 caracteres.' })
    return
  }

  const normalizedName = String(nombre).trim()
  const exists = db.usuarios.some((usuario) => usuario.nombre.toLowerCase() === normalizedName.toLowerCase())
  if (exists) {
    response.status(409).json({ message: 'Ese usuario ya existe.' })
    return
  }

  const salt = createSalt()
  const now = new Date().toISOString()
  const user = {
    id: nextId(db.usuarios),
    pin_hash: hashPin(pin, salt),
    salt,
    nombre: normalizedName,
    fecha_creacion: now,
    ultimo_acceso: now,
  }

  db.usuarios.push(user)

  const session = {
    id: nextId(db.session_manager),
    usuario_id: user.id,
    inicio_sesion: now,
    ultimo_ping: now,
    activa: 1,
  }
  db.session_manager.push(session)

  response.status(201).json({ user: sanitizeUser(user), session })
})

app.post('/api/auth/logout', (request, response) => {
  const { sessionId } = request.body
  const session = findById(db.session_manager, sessionId)
  if (session) {
    session.activa = 0
    session.ultimo_ping = new Date().toISOString()
  }

  response.json({ ok: true })
})

app.post('/api/animales', (request, response) => {
  const error = validateAnimal(request.body)
  if (error) {
    response.status(400).json({ message: error })
    return
  }

  const animal = {
    id: nextId(db.animales),
    estado: 'ACTIVO',
    foto_path: '',
    fecha_baja: null,
    motivo_baja: null,
    ...request.body,
  }
  db.animales.push(animal)

  const precioCompra = Number(request.body.precio_compra ?? 0)
  if (precioCompra > 0) {
    db.gastos.push({
      id: nextId(db.gastos),
      animal_id: animal.id,
      categoria: 'Compra',
      monto: precioCompra,
      fecha: request.body.fecha,
      descripcion: `Compra de animal ${animal.arete}`,
    })
  }

  response.status(201).json(animal)
})

app.put('/api/animales/:id', (request, response) => {
  const index = db.animales.findIndex((animal) => animal.id === Number(request.params.id))
  if (index < 0) {
    notFound(response, 'Animal')
    return
  }

  db.animales[index] = { ...db.animales[index], ...request.body, id: Number(request.params.id) }
  response.json(db.animales[index])
})

app.delete('/api/animales/:id', (request, response) => {
  const animal = findById(db.animales, request.params.id)
  if (!animal) {
    notFound(response, 'Animal')
    return
  }

  animal.estado = 'BAJA'
  animal.fecha_baja = new Date().toISOString()
  animal.motivo_baja = request.body?.motivo_baja ?? 'Baja administrativa'
  response.json(animal)
})

app.get('/api/animales', (_request, response) => {
  response.json(db.animales)
})

app.get('/api/animales/:id', (request, response) => {
  const animal = findById(db.animales, request.params.id)
  if (!animal) {
    notFound(response, 'Animal')
    return
  }

  response.json(animal)
})

registerCrudRoutes('usuarios', 'usuarios', ['pin_hash', 'salt', 'nombre'])
registerCrudRoutes('session-manager', 'session_manager', ['usuario_id', 'inicio_sesion', 'ultimo_ping'])

app.get('/api/configuracion/usuarios', (_request, response) => {
  response.json(db.configuracion_usuarios.map(sanitizeConfigUser))
})

app.put('/api/configuracion/usuarios/:id/rol', (request, response) => {
  const user = getConfigUser(request.params.id)
  if (!user) {
    notFound(response, 'Usuario de configuración')
    return
  }

  const { rol } = request.body
  if (!rol) {
    response.status(400).json({ message: 'El rol es obligatorio.' })
    return
  }

  if (user.protegido && rol !== 'Administrador') {
    response.status(403).json({ message: 'El administrador principal no puede dejar de ser Administrador.' })
    return
  }

  user.rol = rol
  localStore['agroweb.settings.users'] = db.configuracion_usuarios
  saveLocalStore()
  response.json(sanitizeConfigUser(user))
})

app.patch('/api/configuracion/usuarios/:id/estado', (request, response) => {
  const user = getConfigUser(request.params.id)
  if (!user) {
    notFound(response, 'Usuario de configuración')
    return
  }

  if (user.protegido) {
    response.status(403).json({ message: 'El administrador principal no puede bloquearse.' })
    return
  }

  user.activo = Boolean(request.body?.activo)
  localStore['agroweb.settings.users'] = db.configuracion_usuarios
  saveLocalStore()
  response.json(sanitizeConfigUser(user))
})

app.put('/api/configuracion/usuarios/:id/permisos', (request, response) => {
  const user = getConfigUser(request.params.id)
  if (!user) {
    notFound(response, 'Usuario de configuración')
    return
  }

  const error = validatePermissions(request.body?.permisos)
  if (error) {
    response.status(400).json({ message: error })
    return
  }

  if (user.protegido) {
    const removedPermission = systemPermissions.find((permission) => !request.body.permisos.includes(permission))
    if (removedPermission) {
      response.status(403).json({ message: 'El administrador principal no puede quitarse permisos.' })
      return
    }
  }

  user.permisos = [...new Set(request.body.permisos)]
  localStore['agroweb.settings.users'] = db.configuracion_usuarios
  saveLocalStore()
  response.json(sanitizeConfigUser(user))
})

app.post('/api/eventos-sanitarios', (request, response) => {
  if (!animalExists(request.body?.animal_id)) {
    response.status(400).json({ message: 'El animal_id no existe.' })
    return
  }

  const requiredFields = ['tipo_evento', 'descripcion', 'fecha_evento', 'fecha_proximo_evento']
  const missingField = requiredFields.find((field) => !request.body?.[field])
  if (missingField) {
    response.status(400).json({ message: `Falta el campo ${missingField}.` })
    return
  }

  const event = { id: nextId(db.eventos_sanitarios), veterinario: '', dosis: '', observaciones: '', ...request.body }
  db.eventos_sanitarios.push(event)
  response.status(201).json(event)
})

registerCrudRoutes('eventos-sanitarios', 'eventos_sanitarios')

app.post('/api/gastos', (request, response) => {
  if (request.body?.animal_id !== null && request.body?.animal_id !== undefined && !animalExists(request.body.animal_id)) {
    response.status(400).json({ message: 'El animal_id no existe.' })
    return
  }

  if (!request.body?.categoria || Number(request.body?.monto) <= 0 || !request.body?.fecha) {
    response.status(400).json({ message: 'El gasto requiere categoria, monto mayor a 0 y fecha.' })
    return
  }

  const gasto = { id: nextId(db.gastos), descripcion: '', ...request.body }
  db.gastos.push(gasto)
  response.status(201).json(gasto)
})

registerCrudRoutes('gastos', 'gastos')

app.post('/api/alimentacion', (request, response) => {
  if (!animalExists(request.body?.animal_id)) {
    response.status(400).json({ message: 'El animal_id no existe.' })
    return
  }

  const requiredFields = ['tipo_alimento', 'cantidad', 'unidad', 'fecha', 'costo']
  const missingField = requiredFields.find((field) => request.body?.[field] === undefined || request.body?.[field] === '')
  if (missingField) {
    response.status(400).json({ message: `Falta el campo ${missingField}.` })
    return
  }

  const item = { id: nextId(db.alimentacion), observaciones: '', ...request.body }
  db.alimentacion.push(item)
  response.status(201).json(item)
})

registerCrudRoutes('alimentacion', 'alimentacion')

app.patch('/api/tasks/:id/toggle', (request, response) => {
  const event = findById(db.eventos_sanitarios, request.params.id)
  if (!event) {
    notFound(response, 'Evento sanitario')
    return
  }

  if (completedEvents.has(event.id)) completedEvents.delete(event.id)
  else completedEvents.add(event.id)

  const task = dashboardTasks().find((item) => item.id === event.id)
  response.json(task)
})

app.listen(port, '0.0.0.0', () => {
  console.log(`AgroWeb API escuchando en http://localhost:${port}`)
})
