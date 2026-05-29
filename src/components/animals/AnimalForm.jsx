import { useMemo, useState } from 'react';
import { FileText, ImagePlus, Save, Upload } from 'lucide-react';
import VistaPreviaArchivo from '../FilePreview';
import { catalogoAnimal, opcionesEspecie } from '../../data/animalCatalog';
import { useSelectorAplicacion } from '../../store/hooks';

const identificationDocuments = ['INE', 'Pasaporte', 'Licencia de conducir', 'Cédula profesional', 'Cartilla militar', 'Documento interno'];

const mexicanStates = [
{ name: 'Aguascalientes', code: '01' },
{ name: 'Baja California', code: '02' },
{ name: 'Baja California Sur', code: '03' },
{ name: 'Campeche', code: '04' },
{ name: 'Coahuila', code: '05' },
{ name: 'Colima', code: '06' },
{ name: 'Chiapas', code: '07' },
{ name: 'Chihuahua', code: '08' },
{ name: 'Ciudad de México', code: '09' },
{ name: 'Durango', code: '10' },
{ name: 'Guanajuato', code: '11' },
{ name: 'Guerrero', code: '12' },
{ name: 'Hidalgo', code: '13' },
{ name: 'Jalisco', code: '14' },
{ name: 'Estado de México', code: '15' },
{ name: 'Michoacán', code: '16' },
{ name: 'Morelos', code: '17' },
{ name: 'Nayarit', code: '18' },
{ name: 'Nuevo León', code: '19' },
{ name: 'Oaxaca', code: '20' },
{ name: 'Puebla', code: '21' },
{ name: 'Querétaro', code: '22' },
{ name: 'Quintana Roo', code: '23' },
{ name: 'San Luis Potosí', code: '24' },
{ name: 'Sinaloa', code: '25' },
{ name: 'Sonora', code: '26' },
{ name: 'Tabasco', code: '27' },
{ name: 'Tamaulipas', code: '28' },
{ name: 'Tlaxcala', code: '29' },
{ name: 'Veracruz', code: '30' },
{ name: 'Yucatán', code: '31' },
{ name: 'Zacatecas', code: '32' }];


function obtenerOpcionesEstado(currentStatus = 'Activo') {
  if (currentStatus === 'Activo') {
    return [
    { value: 'Activo', label: 'Activo' },
    { value: 'Fallecido', label: 'Muerto / Fallecido' }];

  }

  if (currentStatus === 'Vendido') return [{ value: 'Vendido', label: 'Vendido' }];
  if (currentStatus === 'Fallecido') return [{ value: 'Fallecido', label: 'Muerto / Fallecido' }];

  return [{ value: currentStatus, label: currentStatus }];
}

function obtenerCodigoEspecie(species) {
  return opcionesEspecie.find((opcion) => opcion.label === species)?.code ?? '01';
}

function obtenerEspeciePorCodigo(code) {
  return opcionesEspecie.find((opcion) => opcion.code === code)?.label ?? 'Bovino';
}

function obtenerCodigoEstado(stateName) {
  return mexicanStates.find((estado) => estado.name === stateName)?.code ?? '14';
}

function crearIdSinida({ especie, entidadFederativa, identificacionUnica }) {
  return `MX${obtenerCodigoEspecie(especie)}${obtenerCodigoEstado(entidadFederativa)}${identificacionUnica}`;
}

function analizarIdSinida(identifier = '') {
  const normalizado = identifier.trim().toUpperCase();
  const coincidencia = normalizado.match(/^MX(\d{2})(\d{2})(\d{6}|\d{8})$/);
  if (!coincidencia) {
    return {
      entidadFederativa: 'Jalisco',
      identificacionUnica: ''
    };
  }

  return {
    especie: obtenerEspeciePorCodigo(coincidencia[1]),
    entidadFederativa: mexicanStates.find((estado) => estado.code === coincidencia[2])?.name ?? 'Jalisco',
    identificacionUnica: coincidencia[3]
  };
}

const duenoAnteriorVacio = {
  nombre: '',
  documentoIdentificacion: 'INE',
  rfc: '',
  rancho: '',
  ciudad: '',
  estado: 'Jalisco',
  documentoPdf: null
};

const animalVacio = {
  identificador: '',
  entidadFederativa: 'Jalisco',
  identificacionUnica: '',
  nombre: '',
  especie: 'Bovino',
  sexo: 'Macho',
  raza: 'Angus',
  ranchoId: 1,
  lugarId: 1,
  peso: '',
  duenosAnteriores: duenoAnteriorVacio,
  fechaIngreso: '',
  estado: 'Activo',
  fotografia: '',
  ubicacion: '',
  observaciones: ''
};

const hoy = new Date().toISOString().slice(0, 10);

function archivoAUrlDatos(archivo) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result);
    lector.onerror = reject;
    lector.readAsDataURL(archivo);
  });
}

function normalizarAnimal(animal) {
  if (!animal) return animalVacio;

  const previousOwner =
  typeof animal.duenosAnteriores === 'string' ?
  { ...duenoAnteriorVacio, nombre: animal.duenosAnteriores } :
  { ...duenoAnteriorVacio, ...animal.duenosAnteriores };

  return {
    ...animalVacio,
    ...animal,
    ...analizarIdSinida(animal.identificador),
    duenosAnteriores: previousOwner
  };
}

function FormularioAnimal({ initialAnimal: animalInicial, onSubmit: alEnviar, submitLabel: etiquetaEnvio = 'Guardar animal' }) {
  const esAnimalNuevo = !animalInicial;
  const initialStatus = animalInicial?.estado ?? 'Activo';
  const [formulario, establecerFormulario] = useState({ ...normalizarAnimal(animalInicial), estado: esAnimalNuevo ? 'Activo' : initialStatus });
  const ranchos = useSelectorAplicacion((estado) => estado.agroweb.ranchos);
  const [vistaPrevia, establecerVistaPrevia] = useState(animalInicial?.fotografia ?? '');
  const [pdfName, setPdfName] = useState(formulario.duenosAnteriores.documentoPdf?.name ?? '');
  const opcionesEstado = obtenerOpcionesEstado(initialStatus);
  const estadoSoloLectura = !esAnimalNuevo && opcionesEstado.length === 1;
  const tieneIdSinidaValido = /^MX\d{4}(\d{6}|\d{8})$/.test(formulario.identificador);
  const opcionesRaza = catalogoAnimal[formulario.especie]?.razas ?? [];
  const ranchoSeleccionado = ranchos.find((rancho) => rancho.id === Number(formulario.ranchoId));
  const lugarSeleccionado = ranchoSeleccionado?.lugares?.find((lugar) => lugar.id === Number(formulario.lugarId));

  const puedeEnviar = useMemo(() => {
    return Boolean(tieneIdSinidaValido && formulario.especie.trim() && formulario.sexo && formulario.raza.trim() && Number(formulario.peso) > 0 && formulario.fechaIngreso && formulario.fechaIngreso <= hoy && formulario.estado && ranchoSeleccionado && lugarSeleccionado);
  }, [formulario, tieneIdSinidaValido, lugarSeleccionado, ranchoSeleccionado]);

  function actualizarCampo(evento) {
    const { name, value: valor } = evento.target;
    if (name === 'estado' && esAnimalNuevo) return;
    establecerFormulario((actual) => {
      const cleanValue = name === 'raza' ? valor.replace(/[0-9]/g, '') : valor;
      const siguiente = { ...actual, [name]: cleanValue };
      if (['especie', 'entidadFederativa', 'identificacionUnica'].includes(name)) {
        const cleanUniqueId = name === 'identificacionUnica' ? valor.replace(/\D/g, '').slice(0, 8) : siguiente.identificacionUnica;
        siguiente.identificacionUnica = cleanUniqueId;
        if (name === 'especie') siguiente.raza = catalogoAnimal[valor]?.razas?.[0] ?? '';
        siguiente.identificador = crearIdSinida(siguiente);
      }
      if (name === 'ranchoId') siguiente.lugarId = ranchos.find((rancho) => rancho.id === Number(valor))?.lugares?.[0]?.id ?? '';
      return siguiente;
    });
  }

  function actualizarDuenoAnterior(evento) {
    const { name, value: valor } = evento.target;
    establecerFormulario((actual) => ({
      ...actual,
      duenosAnteriores: {
        ...actual.duenosAnteriores,
        [name]: valor
      }
    }));
  }

  async function manejarImagen(evento) {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;

    const urlDatos = await archivoAUrlDatos(archivo);
    establecerVistaPrevia(urlDatos);
    establecerFormulario((actual) => ({ ...actual, fotografia: urlDatos }));
  }

  async function manejarPdfDueno(evento) {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;

    const urlDatos = await archivoAUrlDatos(archivo);
    setPdfName(archivo.name);
    establecerFormulario((actual) => ({
      ...actual,
      duenosAnteriores: {
        ...actual.duenosAnteriores,
        documentoPdf: {
          name: archivo.name,
          dataUrl: urlDatos
        }
      }
    }));
  }

  function manejarEnvio(evento) {
    evento.preventDefault();
    if (!puedeEnviar) return;
    alEnviar({
      ...formulario,
      ranchoId: Number(formulario.ranchoId),
      lugarId: Number(formulario.lugarId),
      ranchoNombre: ranchoSeleccionado?.nombre,
      lugarNombre: lugarSeleccionado?.nombre,
      ubicacion: ranchoSeleccionado && lugarSeleccionado ? `${ranchoSeleccionado.nombre} / ${lugarSeleccionado.nombre}` : '',
      peso: Number(formulario.peso),
      arete: formulario.identificador
    });
  }

  return (
    <form className="grid gap-5" onSubmit={manejarEnvio}>
      <div className="rounded-2xl border border-[#07612d]/18 bg-white p-4 text-sm font-semibold leading-6 text-[#1d1d1b]/70 shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
        Los campos marcados con <span className="font-bold text-[#D32F2F]">*</span> son obligatorios. En el arete SINIIGA/SINIDA solo escribe números en la identificación única.
      </div>

      <section className="grid gap-5 rounded-2xl border border-[#98a287]/18 bg-white p-5 shadow-[0_12px_28px_rgba(29,29,27,0.07)] lg:grid-cols-2">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-[#07612d]/20 bg-[#07612d]/5 p-4">
            <h2 className="text-base font-bold text-[#07612d]">Arete oficial SINIIGA / SINIDA</h2>
            <p className="mt-1 text-sm leading-6 text-[#1d1d1b]/65">Estructura: MX + especie + entidad federativa INEGI + identificación única de 6 u 8 dígitos.</p>
            <div className="mt-4 grid gap-4 md:grid-cols-[0.5fr_1fr_1fr_1fr]">
              <label className="block">
                <span className="text-sm font-bold text-[#1d1d1b]">País <span className="text-[#D32F2F]">*</span></span>
                <div className="mt-2 flex h-12 items-center rounded-2xl border border-[#98a287]/25 bg-white px-4 text-sm font-bold text-[#07612d]">MX</div>
              </label>

              <label className="block">
                <span className="text-sm font-bold text-[#1d1d1b]">Especie <span className="text-[#D32F2F]">*</span></span>
                <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-white px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:ring-4 focus:ring-[#07612d]/10" name="especie" onChange={actualizarCampo} value={formulario.especie}>
                  {opcionesEspecie.map((opcion) =>
                  <option key={opcion.code} value={opcion.label}>
                      {opcion.code} - {opcion.label}
                    </option>
                  )}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-bold text-[#1d1d1b]">Entidad federativa <span className="text-[#D32F2F]">*</span></span>
                <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-white px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:ring-4 focus:ring-[#07612d]/10" name="entidadFederativa" onChange={actualizarCampo} value={formulario.entidadFederativa}>
                  {mexicanStates.map((estado) =>
                  <option key={estado.code} value={estado.name}>
                      {estado.code} - {estado.name}
                    </option>
                  )}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-bold text-[#1d1d1b]">Identificación única <span className="text-[#D32F2F]">*</span></span>
                <input
                  className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-white px-4 text-sm font-semibold outline-none transition focus:border-[#07612d] focus:ring-4 focus:ring-[#07612d]/10"
                  inputMode="numeric"
                  maxLength={8}
                  name="identificacionUnica"
                  onChange={actualizarCampo}
                  pattern="[0-9]*"
                  placeholder="03359239"
                  value={formulario.identificacionUnica} />
                
                <p className="mt-2 text-xs font-semibold text-[#98a287]">Solo números, 6 u 8 dígitos.</p>
              </label>
            </div>

            <div className="mt-4 rounded-2xl bg-white p-4">
              <p className="text-xs font-bold uppercase text-[#98a287]">Código generado</p>
              <p className="mt-2 break-words text-xl font-bold text-[#1d1d1b]">{formulario.identificador || 'MX + especie + estado + identificación'}</p>
              {!tieneIdSinidaValido ? <p className="mt-2 text-xs font-semibold text-[#D32F2F]">La identificación única debe tener 6 u 8 dígitos.</p> : null}
            </div>
          </div>
        </div>

        {[
        ['nombre', 'Nombre del animal', 'Luna'],
        ['peso', 'Peso (kg)', '450']].
        map(([name, etiqueta, placeholder]) =>
        <label className="block" key={name}>
            <span className="text-sm font-bold text-[#1d1d1b]">{etiqueta} {name !== 'nombre' ? <span className="text-[#D32F2F]">*</span> : null}</span>
            <input
            className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none transition focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10"
            inputMode={name === 'peso' ? 'decimal' : undefined}
            min={name === 'peso' ? '0' : undefined}
            name={name}
            onChange={actualizarCampo}
            placeholder={placeholder}
            type={name === 'peso' ? 'number' : 'text'}
            value={formulario[name]} />
          
            {name === 'raza' ? <p className="mt-2 text-xs font-semibold text-[#98a287]">La raza es el tipo genético, por ejemplo Angus, Holstein o Brahman. El género se selecciona aparte.</p> : null}
          </label>
        )}

        <label className="block">
          <span className="text-sm font-bold text-[#1d1d1b]">Raza <span className="text-[#D32F2F]">*</span></span>
          <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="raza" onChange={actualizarCampo} value={formulario.raza}>
          {opcionesRaza.map((raza) =>
          <option key={raza} value={raza}>
              {raza}
            </option>
          )}
          </select>
          <p className="mt-2 text-xs font-semibold text-[#98a287]">Las razas cambian según la especie seleccionada.</p>
        </label>

        <label className="block">
          <span className="text-sm font-bold text-[#1d1d1b]">Género <span className="text-[#D32F2F]">*</span></span>
          <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="sexo" onChange={actualizarCampo} value={formulario.sexo}>
            <option value="Macho">Macho</option>
            <option value="Hembra">Hembra</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-bold text-[#1d1d1b]">Estado <span className="text-[#D32F2F]">*</span></span>
          {esAnimalNuevo ?
          <div className="mt-2 flex h-12 w-full items-center rounded-2xl border border-[#4CAF50]/25 bg-[#4CAF50]/10 px-4 text-sm font-bold text-[#2f8f36]">
              Activo
            </div> :
          estadoSoloLectura ?
          <div className="mt-2 flex h-12 w-full items-center rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-bold text-[#1d1d1b]/70">
              {opcionesEstado[0]?.label ?? formulario.estado}
            </div> :

          <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="estado" onChange={actualizarCampo} value={formulario.estado}>
              {opcionesEstado.map((opcion) =>
            <option key={opcion.value} value={opcion.value}>
                  {opcion.label}
                </option>
            )}
            </select>
          }
          {esAnimalNuevo ? <p className="mt-2 text-xs font-semibold text-[#98a287]">Todo animal nuevo se registra primero como activo.</p> : null}
          {!esAnimalNuevo && opcionesEstado.length === 1 ? <p className="mt-2 text-xs font-semibold text-[#98a287]">Este estado ya no permite cambiar a otro.</p> : null}
        </label>

        <label className="block">
          <span className="text-sm font-bold text-[#1d1d1b]">Fecha de ingreso <span className="text-[#D32F2F]">*</span></span>
          <input className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none transition focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" max={hoy} name="fechaIngreso" onChange={actualizarCampo} type="date" value={formulario.fechaIngreso} />
          {formulario.fechaIngreso > hoy ? <p className="mt-2 text-xs font-semibold text-[#D32F2F]">La fecha de ingreso no puede ser futura.</p> : null}
        </label>

        <label className="block">
          <span className="text-sm font-bold text-[#1d1d1b]">Rancho <span className="text-[#D32F2F]">*</span></span>
          <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="ranchoId" onChange={actualizarCampo} value={formulario.ranchoId}>
            <option value="">Selecciona un rancho</option>
            {ranchos.map((rancho) =>
            <option key={rancho.id} value={rancho.id}>
                {rancho.nombre}
              </option>
            )}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-bold text-[#1d1d1b]">Lugar dentro del rancho <span className="text-[#D32F2F]">*</span></span>
          <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none disabled:opacity-60 focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" disabled={!ranchoSeleccionado} name="lugarId" onChange={actualizarCampo} value={formulario.lugarId}>
            <option value="">Selecciona un lugar</option>
            {(ranchoSeleccionado?.lugares ?? []).map((lugar) =>
            <option key={lugar.id} value={lugar.id}>
                {lugar.nombre} - {lugar.tipo}
              </option>
            )}
          </select>
          {!ranchos.length ? <p className="mt-2 text-xs font-semibold text-[#D32F2F]">Primero registra un rancho en Configuración.</p> : null}
        </label>
      </section>

      <section className="rounded-2xl border border-[#98a287]/18 bg-white p-5 shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
        <div>
          <h2 className="text-base font-bold text-[#07612d]">Dueño anterior</h2>
          <p className="mt-1 text-sm leading-6 text-[#1d1d1b]/65">Registra la procedencia del animal y datos de identificación del propietario previo.</p>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {[
          ['nombre', 'Nombre del dueño anterior', 'Carlos Mendoza'],
          ['rfc', 'RFC', 'MECG780415K92'],
          ['rancho', 'Rancho donde es', 'Rancho La Esperanza'],
          ['ciudad', 'Ciudad', 'Tepatitlan']].
          map(([name, etiqueta, placeholder]) =>
          <label className="block" key={name}>
              <span className="text-sm font-bold text-[#1d1d1b]">{etiqueta}</span>
              <input
              className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none transition focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10"
              name={name}
              onChange={actualizarDuenoAnterior}
              placeholder={placeholder}
              value={formulario.duenosAnteriores[name]} />
            
            </label>
          )}

          <label className="block">
            <span className="text-sm font-bold text-[#1d1d1b]">Documento de identificación</span>
            <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="documentoIdentificacion" onChange={actualizarDuenoAnterior} value={formulario.duenosAnteriores.documentoIdentificacion}>
              {identificationDocuments.map((opcion) =>
              <option key={opcion} value={opcion}>
                  {opcion}
                </option>
              )}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-bold text-[#1d1d1b]">Estado de la República</span>
            <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="estado" onChange={actualizarDuenoAnterior} value={formulario.duenosAnteriores.estado}>
              {mexicanStates.map((estado) =>
              <option key={estado.code} value={estado.name}>
                  {estado.name}
                </option>
              )}
            </select>
          </label>
        </div>

        <div className="mt-5 rounded-2xl border border-dashed border-[#07612d]/25 bg-[#F4F4F4] p-4">
          <span className="text-sm font-bold text-[#1d1d1b]">Documento del dueño anterior</span>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex min-h-11 min-w-0 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#1d1d1b]/70">
              <FileText size={18} className="shrink-0 text-[#07612d]" />
              <span className="min-w-0 break-words">{pdfName || 'Sin PDF cargado'}</span>
            </div>
            <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#07612d] px-4 text-sm font-bold text-white">
              <Upload size={18} /> Subir archivo
              <input accept="image/*,application/pdf,.pdf" className="sr-only" onChange={manejarPdfDueno} type="file" />
            </label>
          </div>
          <VistaPreviaArchivo file={formulario.duenosAnteriores.documentoPdf} title="Previsualización del documento" />
        </div>
      </section>

      <section className="grid gap-5 rounded-2xl border border-[#98a287]/18 bg-white p-5 shadow-[0_12px_28px_rgba(29,29,27,0.07)] lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 className="text-base font-bold text-[#07612d]">Fotografía del animal</h2>
          <div className="mt-4 grid gap-3">
            <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#07612d]/25 bg-white px-4 text-sm font-bold text-[#07612d]">
              <ImagePlus size={19} /> Seleccionar imagen
              <input accept="image/*" className="sr-only" onChange={manejarImagen} type="file" />
            </label>
          </div>
        </div>
        <div className="flex min-h-56 items-center justify-center overflow-hidden rounded-2xl border border-[#98a287]/18 bg-[#F4F4F4] text-sm font-semibold text-[#98a287]">
          {vistaPrevia ? <img alt="Vista previa del animal" className="h-56 w-full object-contain p-2" src={vistaPrevia} /> : 'Sin fotografía capturada'}
        </div>
      </section>

      <label className="block rounded-2xl border border-[#98a287]/18 bg-white p-5 shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
        <span className="text-sm font-bold text-[#1d1d1b]">Observaciones</span>
        <textarea className="mt-2 min-h-32 w-full resize-y rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] p-4 text-sm outline-none transition focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="observaciones" onChange={actualizarCampo} value={formulario.observaciones} />
      </label>

      <button className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-[#07612d] px-5 text-base font-bold text-white shadow-[0_10px_22px_rgba(7,97,45,0.2)] disabled:cursor-not-allowed disabled:bg-[#98a287]" disabled={!puedeEnviar} type="submit">
        <Save size={19} /> {etiquetaEnvio}
      </button>
    </form>);

}

export default FormularioAnimal;
