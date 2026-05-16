import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'

dotenv.config()

const app = express()
const port = process.env.PORT ?? 4000

app.use(cors())
app.use(express.json())

const db = {
  animales: [
    {
      id: 1,
      arete: 'MX-1028',
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
      arete: 'MX-1044',
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
      arete: 'SIN-7782',
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
      pin_hash: 'demo_hash',
      salt: 'demo_salt',
      nombre: 'Encargado AgroWeb',
      fecha_creacion: '2026-05-13T14:00:00.000Z',
      ultimo_acceso: '2026-05-16T08:00:00.000Z',
    },
  ],
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
