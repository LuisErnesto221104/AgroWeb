# Presentación lógica de AgroWeb

## 1. Descripción general del sistema AgroWeb

AgroWeb es un sistema web para la gestión ganadera de un rancho. Su objetivo es ayudar al usuario a controlar la información más importante del negocio: animales, sanidad, gastos, alimentación y reportes de inversión.

El sistema está construido con React, por lo que la interfaz se divide en componentes reutilizables. Cada módulo funciona como una pantalla independiente, pero todos están conectados mediante React Router, lo que permite navegar sin recargar la página.

Actualmente AgroWeb trabaja con datos mock ubicados en `src/data/`. Estos datos simulan una base de datos temporal mientras todavía no existe un backend real. Gracias a eso, los módulos pueden listar, filtrar, calcular totales y mostrar reportes como si ya hubiera información guardada.

En resumen, AgroWeb permite:

1. Administrar animales del rancho.
2. Registrar eventos sanitarios.
3. Controlar gastos.
4. Registrar alimentación.
5. Calcular reportes de inversión.
6. Navegar entre módulos desde un Home principal.

## 2. Arquitectura general del proyecto

La aplicación está organizada por responsabilidades. Las páginas principales están en `src/pages`, los componentes reutilizables en `src/components`, los datos mock en `src/data` y las rutas principales se definen en `App.jsx`.

Estructura general:

```txt
src/
├── App.jsx
├── main.jsx
├── index.css
├── components/
│   ├── Layout.jsx
│   ├── Sidebar.jsx
│   ├── Header.jsx
│   ├── StatCard.jsx
│   ├── ModuleCard.jsx
│   ├── animals/
│   ├── health/
│   ├── expenses/
│   ├── feeding/
│   └── reports/
├── pages/
│   ├── Home.jsx
│   ├── AnimalsPage.jsx
│   ├── HealthPage.jsx
│   ├── ExpensesPage.jsx
│   ├── FeedingPage.jsx
│   ├── ReportsPage.jsx
│   ├── Login.jsx
│   └── NotFound.jsx
├── data/
│   ├── animals.js
│   ├── healthEvents.js
│   ├── expenses.js
│   ├── feeding.js
│   └── income.js
├── routes/
│   └── ProtectedRoute.jsx
├── context/
└── store/
```

### Archivos importantes

| Archivo o carpeta | Función dentro del proyecto |
|---|---|
| `App.jsx` | Define la estructura principal de rutas con `BrowserRouter`, `Routes` y `Route`. |
| `components/Layout.jsx` | Contiene el layout principal con `Sidebar`, `Header` y `Outlet`. |
| `components/Sidebar.jsx` | Menú lateral con `NavLink` para entrar a cada módulo y marcar la ruta activa. |
| `components/Header.jsx` | Encabezado general del sistema, muestra el nombre AgroWeb y botón de salir. |
| `pages/Home.jsx` | Dashboard principal que conecta con todos los módulos. |
| `pages/AnimalsPage.jsx` | Módulo de Gestión Ganadera. |
| `pages/HealthPage.jsx` | Módulo de Sanidad. |
| `pages/ExpensesPage.jsx` | Módulo de Gastos. |
| `pages/FeedingPage.jsx` | Módulo de Control de Alimentación. |
| `pages/ReportsPage.jsx` | Módulo de Reporte de Inversión. |
| `pages/NotFound.jsx` | Página 404 para rutas inexistentes. |
| `data/` | Datos mock que simulan información de una base de datos. |

## 3. Explicación de React Router

React Router se usa para conectar todas las pantallas del sistema sin recargar la página. Esto convierte a AgroWeb en una SPA, es decir, una aplicación de una sola página donde React cambia el contenido visible según la ruta.

En `App.jsx` se usa:

- `BrowserRouter`: envuelve toda la aplicación y habilita el sistema de rutas.
- `Routes`: agrupa las rutas.
- `Route`: define qué componente se muestra en cada ruta.
- `Navigate`: redirige rutas antiguas o alternativas.
- `Layout`: contiene `Header`, `Sidebar` y un `Outlet`.
- `Outlet`: indica dónde se renderiza la página hija dentro del layout.

Ejemplo simplificado:

```jsx
<BrowserRouter>
  <Routes>
    <Route element={<ProtectedRoute />}>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/animales/*" element={<AnimalsPage />} />
        <Route path="/sanidad/*" element={<HealthPage />} />
        <Route path="/gastos/*" element={<ExpensesPage />} />
        <Route path="/reportes" element={<ReportsPage />} />
        <Route path="/alimentacion/*" element={<FeedingPage />} />
      </Route>
    </Route>
  </Routes>
</BrowserRouter>
```

### Rutas principales

| Ruta | Módulo |
|---|---|
| `/` | Home principal |
| `/dashboard` | Home principal |
| `/animales` | Gestión Ganadera |
| `/animales/nuevo` | Registrar animal |
| `/animales/:id` | Detalle de animal |
| `/animales/:id/editar` | Editar animal |
| `/sanidad` | Sanidad |
| `/sanidad/nuevo` | Registrar evento sanitario |
| `/calendario-sanitario` | Calendario sanitario |
| `/gastos` | Gastos |
| `/gastos/nuevo` | Registrar gasto |
| `/gastos/:id` | Detalle de gasto |
| `/reportes` | Reporte de Inversión |
| `/alimentacion` | Control de Alimentación |
| `/alimentacion/nuevo` | Registrar alimentación |
| `/alimentacion/:id` | Detalle de alimentación |
| `*` | Página 404 |

### Link y NavLink

En AgroWeb se usa `Link` para botones de navegación y `NavLink` en el menú lateral. Esto es importante porque evita recargar la página completa.

Si se usara `<a href="/animales">`, el navegador recargaría todo el sitio. Con `Link` y `NavLink`, React Router cambia la vista internamente.

Ejemplo:

```jsx
<Link to="/animales/nuevo">Registrar Animal</Link>
```

En el Sidebar se usa `NavLink` porque permite saber qué ruta está activa:

```jsx
<NavLink to="/gastos">Gastos</NavLink>
```

### useNavigate, useParams y useLocation

- `useNavigate` se usa para redirigir al usuario después de guardar un registro.
- `useParams` se usa para obtener el `id` de una ruta dinámica, por ejemplo `/animales/:id`.
- `useLocation` se usa en `ProtectedRoute.jsx` para recordar desde qué ruta venía el usuario antes de enviarlo a login.

## 4. Home / Dashboard principal

El Home es el punto central del sistema. Desde ahí se puede entrar a Gestión Ganadera, Sanidad, Gastos, Reportes y Alimentación.

La lógica del Home se encuentra en `pages/Home.jsx`.

### Qué hace el Home

1. Muestra una bienvenida a AgroWeb.
2. Presenta tarjetas de acceso rápido a cada módulo.
3. Muestra estadísticas generales del rancho.
4. Permite buscar módulos.
5. Permite filtrar módulos por área: operación, salud o finanzas.

### Temas de React aplicados

- Componentes funcionales: `Home`, `ModuleCard`, `StatCard`.
- Props: `ModuleCard` recibe título, descripción, ruta e ícono.
- `useState`: controla búsqueda, filtro seleccionado y carga simulada.
- `useEffect`: simula carga inicial.
- `map`: renderiza tarjetas de módulos y estadísticas.
- `filter`: filtra módulos por texto o área.
- `reduce`: calcula gastos y alimentación total.
- React Router: cada tarjeta usa rutas como `/animales`, `/sanidad` o `/gastos`.

Ejemplo de lógica:

```js
const animalesActivos = animals.filter((animal) => animal.estado === 'Activo')
const totalGastos = expenses.reduce((acc, gasto) => acc + gasto.precio, 0)
const totalAlimentacion = feeding.reduce((acc, registro) => acc + registro.costo, 0)
```

## 5. Módulo de Gestión Ganadera

El módulo de Gestión Ganadera está en `pages/AnimalsPage.jsx`.

### Funcionalidades

1. Listar animales registrados.
2. Registrar un nuevo animal.
3. Ver detalle de un animal.
4. Editar información.
5. Dar de baja un animal.
6. Buscar por identificador.
7. Filtrar por estado, especie, raza y ubicación.

### Componentes principales

| Componente | Función |
|---|---|
| `AnimalsPage.jsx` | Coordina las rutas internas y el estado de animales. |
| `AnimalCard.jsx` | Muestra un animal en formato tarjeta. |
| `AnimalTable.jsx` | Muestra animales en tabla. |
| `AnimalForm.jsx` | Formulario para registrar o editar animales. |
| `AnimalDetail.jsx` | Muestra toda la información de un animal. |
| `AnimalFilters.jsx` | Filtros de búsqueda. |
| `AnimalStatusBadge.jsx` | Badge visual para estado del animal. |
| `ConfirmDeleteModal.jsx` | Modal para baja lógica. |

### Lógica React aplicada

- `useState`: guarda animales, filtros, modo de vista y animal seleccionado para baja.
- `useEffect`: carga datos mock desde `data/animals.js`.
- `map`: muestra animales en tarjetas o tabla.
- `filter`: busca por identificador y filtra por estado, especie, raza o ubicación.
- `useParams`: obtiene el `id` para detalle y edición.
- `useNavigate`: redirige al usuario después de registrar o editar.
- Props: se pasan animales a `AnimalCard`, `AnimalTable` y `AnimalForm`.
- Spread operator: actualiza objetos sin mutar el estado.
- Renderizado condicional: muestra mensaje si no hay animales.

Ejemplo de actualización inmutable:

```js
setAnimals((current) =>
  current.map((animal) =>
    animal.id === updatedAnimal.id ? { ...animal, ...updatedAnimal } : animal
  )
)
```

### Baja lógica

En lugar de eliminar permanentemente un animal, AgroWeb cambia su estado a `Vendido`, `Fallecido` o `Inactivo`. Esto conserva el historial para reportes, gastos y trazabilidad.

## 6. Módulo de Sanidad

El módulo de Sanidad está en `pages/HealthPage.jsx`.

### Funcionalidades

1. Registrar eventos sanitarios.
2. Registrar vacunas.
3. Registrar desparasitantes.
4. Registrar tratamientos y revisiones.
5. Ver historial médico.
6. Mostrar calendario sanitario.
7. Mostrar eventos pendientes o vencidos.
8. Filtrar por animal, tipo, estado y fecha.

### Componentes principales

| Componente | Función |
|---|---|
| `HealthPage.jsx` | Coordina rutas y lógica sanitaria. |
| `HealthEventForm.jsx` | Formulario de eventos sanitarios. |
| `HealthEventCard.jsx` | Tarjeta de evento sanitario. |
| `HealthEventTable.jsx` | Tabla de historial sanitario. |
| `HealthFilters.jsx` | Filtros por animal, tipo, estado y fecha. |
| `HealthStatusBadge.jsx` | Colores para completado, pendiente o vencido. |
| `SanitaryCalendar.jsx` | Calendario sanitario. |
| `UpcomingHealthEvents.jsx` | Próximos eventos y alertas. |

### Lógica React aplicada

- `useState`: controla eventos, animales, filtros y carga.
- `useEffect`: carga datos mock.
- `map`: renderiza eventos en tarjetas, tabla y calendario.
- `filter`: filtra por animal, tipo, estado y fecha.
- Renderizado condicional: muestra estados vacíos o alertas.
- Funciones auxiliares: detectan si un evento está vencido o próximo.
- Props: componentes reciben eventos y filtros.
- React Router: permite entrar a `/sanidad`, `/sanidad/nuevo` y `/sanidad/:id`.

### Importancia del calendario sanitario

El calendario sanitario ayuda a anticipar vacunas, desparasitaciones y revisiones. Esto evita olvidos y permite planear el manejo del rancho.

## 7. Módulo de Gastos

El módulo de Gastos está en `pages/ExpensesPage.jsx`.

### Funcionalidades

1. Registrar gastos del rancho.
2. Relacionar gastos con animales.
3. Mostrar historial de compras.
4. Filtrar por animal, fecha, categoría y tipo de compra.
5. Calcular total gastado.
6. Mostrar resumen por categoría.
7. Mostrar gastos recientes.

### Componentes principales

| Componente | Función |
|---|---|
| `ExpensesPage.jsx` | Coordina estado, rutas y cálculos. |
| `ExpenseForm.jsx` | Formulario para registrar gastos. |
| `ExpenseCard.jsx` | Tarjeta de gasto. |
| `ExpenseTable.jsx` | Tabla de historial. |
| `ExpenseFilters.jsx` | Filtros de gastos. |
| `ExpenseSummary.jsx` | Resumen por categoría. |
| `ExpenseCategoryChart.jsx` | Bloque visual de categorías. |
| `RecentExpenses.jsx` | Lista de gastos recientes. |

### Lógica React aplicada

- `useState`: formulario, filtros, gastos y carga.
- `useEffect`: carga gastos mock.
- `map`: muestra gastos.
- `filter`: aplica filtros.
- `reduce`: suma totales y calcula categoría con mayor gasto.
- Props: reutiliza tarjetas, tabla y resumen.
- Renderizado condicional: muestra “No hay gastos registrados”.
- Formato MXN: usa `Intl.NumberFormat` para mostrar moneda mexicana.

Ejemplo de cálculo:

```js
const total = expenses.reduce((sum, expense) => sum + Number(expense.precio), 0)
```

Este módulo ayuda a controlar la inversión económica del rancho.

## 8. Módulo de Control de Alimentación

El módulo de alimentación está en `pages/FeedingPage.jsx`.

### Funcionalidades

1. Registrar alimentación por animal o grupo.
2. Registrar tipo de alimento.
3. Guardar cantidad y unidad.
4. Registrar fecha, hora y responsable.
5. Guardar costo aproximado.
6. Mostrar historial.
7. Calcular consumo total.
8. Calcular costo total.
9. Mostrar alertas pendientes o atrasadas.
10. Registrar datos nutricionales del alimento.

### Componentes principales

| Componente | Función |
|---|---|
| `FeedingPage.jsx` | Coordina rutas y estado. |
| `FeedingForm.jsx` | Formulario de alimentación. |
| `FeedingCard.jsx` | Tarjeta de registro. |
| `FeedingTable.jsx` | Tabla del historial. |
| `FeedingFilters.jsx` | Filtros por animal, fecha y alimento. |
| `FeedingSummary.jsx` | Consumo por animal o grupo. |
| `FeedingAlert.jsx` | Alertas pendientes o atrasadas. |
| `FeedingHistory.jsx` | Decide si mostrar tarjetas o tabla. |

### Datos nutricionales

Además del tipo de alimento, el formulario permite registrar:

- Proteína.
- Fibra.
- Energía.
- Materia seca.
- Minerales y vitaminas.
- Notas nutricionales.

Esto permite explicar que AgroWeb no sólo registra cuánto alimento se da, sino también la calidad nutricional de la ración.

### Lógica React aplicada

- `useState`: formulario, filtros, registros y modo de vista.
- `useEffect`: carga registros mock.
- `map`: muestra historial.
- `filter`: filtra por animal, fecha, grupo o alimento.
- `reduce`: calcula consumo y costo total.
- Renderizado condicional: muestra alertas o mensaje vacío.
- Props: reutiliza `FeedingForm`, `FeedingCard`, `FeedingTable`.
- React Router: conecta `/alimentacion`, `/alimentacion/nuevo` y `/alimentacion/:id`.

## 9. Módulo de Reporte de Inversión

El módulo de Reporte de Inversión está en `pages/ReportsPage.jsx`.

### Funcionalidades

1. Mostrar estadísticas generales.
2. Calcular ganancias.
3. Calcular pérdidas.
4. Calcular balance general.
5. Mostrar inversión por animal.
6. Mostrar gastos por categoría.
7. Mostrar resumen mensual.
8. Preparar exportación simulada a PDF.

### Componentes principales

| Componente | Función |
|---|---|
| `ReportsPage.jsx` | Calcula y muestra reportes. |
| `ReportCard.jsx` | Contenedor reutilizable para bloques de reporte. |
| `ReportFilters.jsx` | Filtros por fecha, animal y tipo de reporte. |
| `ProfitLossSummary.jsx` | Ganancias vs pérdidas. |
| `AnimalInvestmentTable.jsx` | Resumen por animal. |
| `CategoryExpenseSummary.jsx` | Gastos por categoría. |
| `MonthlyReport.jsx` | Resumen mensual. |
| `ExportReportButton.jsx` | Exportación simulada. |

### Lógica React aplicada

- `reduce`: calcula gastos, ingresos, alimentación y balance.
- `filter`: separa datos por fecha, animal y estado.
- `map`: renderiza tarjetas, tablas y reportes.
- `useMemo`: optimiza cálculos derivados.
- Props: pasa datos a tarjetas y reportes.
- Renderizado condicional: muestra mensaje si no hay datos.
- React Router: conecta el módulo desde `/reportes`.

Ejemplos de cálculos:

```js
const totalGastos = expenses.reduce((acc, item) => acc + Number(item.precio), 0)
const totalIngresos = income.reduce((acc, item) => acc + Number(item.monto), 0)
const balance = totalIngresos - totalGastos
const animalesActivos = animals.filter((animal) => animal.estado === 'Activo').length
```

Este módulo resume la situación económica del rancho.

## 10. Datos mock

Los datos mock están en `src/data/` y simulan una base de datos temporal.

| Archivo | Qué contiene |
|---|---|
| `animals.js` | Animales registrados. |
| `healthEvents.js` | Eventos sanitarios. |
| `expenses.js` | Gastos del rancho. |
| `feeding.js` | Registros de alimentación. |
| `income.js` | Ingresos simulados. |

### Relaciones entre datos

El campo `animalId` conecta la información entre módulos:

- En `expenses.js`, un gasto puede pertenecer a un animal.
- En `healthEvents.js`, un evento sanitario pertenece a un animal.
- En `feeding.js`, una alimentación puede estar asociada a un animal.
- En `income.js`, un ingreso puede venir de un animal vendido o productivo.

Ejemplo:

```js
{
  animalId: 1,
  animalIdentificador: 'BOV-001'
}
```

Esto significa que el registro está relacionado con el animal cuyo `id` es `1` en `animals.js`.

## 11. Temas de React aplicados en AgroWeb

| Tema | Dónde se usa | Para qué sirve |
|---|---|---|
| Componentes funcionales | Todas las páginas y componentes | Dividir la interfaz en piezas reutilizables. |
| Props | `StatCard`, `ModuleCard`, `AnimalCard`, `ExpenseCard` | Pasar datos de un componente padre a uno hijo. |
| `useState` | Formularios, filtros, listas, modales | Manejar datos que cambian en pantalla. |
| `useEffect` | Carga de datos mock | Simular carga inicial desde una base de datos. |
| React Router | `App.jsx` y módulos | Navegar entre pantallas sin recargar. |
| `BrowserRouter` | `App.jsx` | Activar el sistema de rutas. |
| `Routes` | `App.jsx` y módulos internos | Agrupar rutas. |
| `Route` | `App.jsx`, `AnimalsPage`, `HealthPage`, etc. | Asociar rutas con componentes. |
| `Link` | Botones de navegación | Cambiar de ruta sin recargar. |
| `NavLink` | `Sidebar.jsx` | Marcar visualmente la ruta activa. |
| `Outlet` | `Layout.jsx` y `ProtectedRoute.jsx` | Renderizar rutas hijas. |
| `useNavigate` | Formularios y detalles | Redirigir después de guardar o volver. |
| `useParams` | Detalle y edición | Leer el `id` de la URL. |
| `map` | Listas, tarjetas, tablas | Renderizar arreglos en pantalla. |
| `filter` | Buscadores y filtros | Obtener sólo los datos que cumplen una condición. |
| `reduce` | Gastos, reportes, alimentación | Calcular totales y balances. |
| Renderizado condicional | Estados vacíos, carga y alertas | Mostrar contenido según una condición. |
| Formularios controlados | Animal, gasto, sanidad, alimentación | Guardar lo escrito en estado React. |
| Spread operator | Actualización de objetos y arreglos | Actualizar sin mutar el estado original. |
| Destructuring | Props y arreglos de configuración | Escribir código más limpio. |
| Template literals | Rutas dinámicas | Crear rutas como `/animales/${id}`. |
| `useMemo` | Cálculos filtrados y reportes | Evitar recalcular datos innecesariamente. |
| Datos mock | Carpeta `data` | Simular backend temporal. |
| Modularización | Carpetas por módulo | Mantener el código ordenado. |

## 12. Flujo general del sistema

1. El usuario entra al Home principal.
2. El Home muestra un resumen del rancho y accesos a los módulos.
3. El usuario entra a un módulo desde una tarjeta o desde el Sidebar.
4. En cada módulo puede registrar, consultar, filtrar o editar información.
5. Los datos se muestran dinámicamente con `map`, `filter` y `reduce`.
6. Los reportes toman información de animales, gastos, alimentación, sanidad e ingresos.
7. El sistema calcula estadísticas para ayudar a tomar decisiones.

## 13. Guion corto para exposición

AgroWeb es un sistema web desarrollado en React para la administración ganadera de un rancho. Su objetivo es ayudar al usuario a controlar animales, sanidad, gastos, alimentación y reportes de inversión desde una sola plataforma.

El sistema está organizado por módulos. El Home funciona como dashboard principal y desde ahí se puede entrar a Gestión Ganadera, Sanidad, Gastos, Reporte de Inversión y Control de Alimentación.

En Gestión Ganadera se pueden registrar animales, editarlos, ver su detalle y darlos de baja de forma lógica para conservar su historial. En Sanidad se registran vacunas, tratamientos, revisiones y se muestra un calendario sanitario. En Gastos se controlan compras y costos relacionados con animales o con el rancho. En Alimentación se registra qué comen los animales, cuánto consumen, cuánto cuesta y también datos nutricionales como proteína, fibra y energía. Finalmente, en Reportes se calcula el balance del rancho usando ingresos, gastos, alimentación y animales registrados.

Técnicamente, AgroWeb usa componentes funcionales, props, hooks como `useState`, `useEffect` y `useMemo`, además de React Router para navegar sin recargar la página. También se usan `map`, `filter` y `reduce` para mostrar listas, filtrar información y calcular totales.

Como todavía no hay backend, el sistema usa datos mock organizados en archivos separados. Esto permite simular una base de datos y demostrar la lógica completa del sistema. Más adelante, esos datos podrían reemplazarse por peticiones a una API.

AgroWeb es útil porque centraliza la información del rancho y ayuda a tomar decisiones sobre salud, inversión, alimentación y manejo de animales.

## 14. Preguntas posibles y respuestas

### ¿Por qué usaron React?

Porque React permite crear interfaces dinámicas usando componentes reutilizables. Esto ayuda a separar el sistema por módulos y facilita el mantenimiento.

### ¿Para qué sirve React Router?

Sirve para navegar entre módulos sin recargar la página. Gracias a React Router, AgroWeb puede tener rutas como `/animales`, `/sanidad`, `/gastos` y `/reportes`.

### ¿Dónde usaron useState?

Se usa en formularios, filtros, selección de vista, modales y listas cargadas en estado. Por ejemplo, en Gestión Ganadera se usa para guardar animales, filtros y el animal seleccionado para baja.

### ¿Dónde usaron useEffect?

Se usa para simular la carga inicial de datos mock. Por ejemplo, al abrir un módulo se cargan animales, gastos o eventos sanitarios.

### ¿Dónde usaron map, filter y reduce?

- `map`: para mostrar tarjetas, tablas y listas.
- `filter`: para buscar animales, gastos o eventos según filtros.
- `reduce`: para calcular totales como gastos, ingresos, consumo y balance.

### ¿Por qué usan datos mock?

Porque todavía no hay backend. Los datos mock permiten simular la información de una base de datos y probar la lógica de la aplicación.

### ¿Cómo se calcula el reporte de inversión?

Se suman ingresos, gastos y alimentación. Después se calcula el balance restando las pérdidas a los ingresos.

```js
balance = totalIngresos - totalGastos - totalAlimentacion
```

### ¿Cómo se relacionan los gastos con los animales?

Mediante `animalId`. Si un gasto tiene `animalId: 1`, significa que pertenece al animal con `id: 1` en `animals.js`.

### ¿Qué módulo es el más importante?

Gestión Ganadera es la base, porque los demás módulos dependen de los animales registrados. Sanidad, gastos, alimentación e ingresos se relacionan con esos animales.

### ¿Cómo se podría conectar después a un backend?

Los datos mock se reemplazarían por peticiones HTTP a una API. Por ejemplo, en lugar de importar `animals.js`, se podría usar `fetch` o Axios para pedir `/api/animales`.

### ¿Por qué se usa baja lógica en animales?

Porque no conviene borrar el historial. Si un animal fue vendido o falleció, sus gastos, sanidad e ingresos siguen siendo importantes para los reportes.

### ¿Qué ventaja tiene dividir en componentes?

Permite reutilizar código. Por ejemplo, una tarjeta estadística se puede usar en Home, Gastos, Alimentación y Reportes sin reescribirla.
