import { useMemo, useState } from 'react';
import { FileText, Save, Upload } from 'lucide-react';
import VistaPreviaArchivo from '../FilePreview';
import { categoriasGasto } from './expenseUtils';

function obtenerFormularioInicial(movimientoPredeterminado = 'gasto') {
  const esVenta = movimientoPredeterminado === 'venta';
  return {
    movimiento: movimientoPredeterminado,
    tipoCompra: esVenta ? 'Venta de animal' : '',
    precio: '',
    fecha: '',
    animalId: 'general',
    categoria: esVenta ? 'Venta de animal' : 'Alimentación',
    descripcion: '',
    comprobante: ''
  };
}

const hoy = new Date().toISOString().slice(0, 10);

function archivoAUrlDatos(archivo) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result);
    lector.onerror = reject;
    lector.readAsDataURL(archivo);
  });
}

function FormularioGasto({ animals: animales, onSubmit: alEnviar, defaultMovement: movimientoPredeterminado = 'gasto', lockMovement: bloquearMovimiento = false }) {
  const [formulario, establecerFormulario] = useState(() => obtenerFormularioInicial(movimientoPredeterminado));
  const [nombreComprobante, establecerNombreComprobante] = useState('');
  const esVenta = formulario.movimiento === 'venta';

  const puedeEnviar = useMemo(() => {
    const tieneAnimal = !esVenta || formulario.animalId !== 'general';
    const tieneTipo = esVenta || formulario.tipoCompra.trim();
    const fechaValida = formulario.fecha && formulario.fecha <= hoy;
    return Boolean(tieneAnimal && tieneTipo && Number(formulario.precio) > 0 && fechaValida && formulario.categoria && formulario.descripcion.trim().length >= 5);
  }, [formulario, esVenta]);

  function actualizarCampo(evento) {
    const { name, value: valor } = evento.target;
    establecerFormulario((actual) => {
      const siguiente = { ...actual, [name]: valor };
      if (name === 'movimiento' && valor === 'venta') {
        siguiente.tipoCompra = 'Venta de animal';
        siguiente.categoria = 'Venta de animal';
      }
      if (name === 'movimiento' && valor === 'gasto') {
        siguiente.tipoCompra = '';
        siguiente.categoria = 'Alimentación';
      }
      return siguiente;
    });
  }

  async function manejarComprobante(evento) {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;
    const urlDatos = await archivoAUrlDatos(archivo);
    establecerNombreComprobante(archivo.name);
    establecerFormulario((actual) => ({
      ...actual,
      comprobante: {
        name: archivo.name,
        dataUrl: urlDatos
      }
    }));
  }

  function manejarEnvio(evento) {
    evento.preventDefault();
    if (!puedeEnviar) return;

    const animal = animales.find((elemento) => elemento.id === Number(formulario.animalId));
    alEnviar({
      ...formulario,
      id: Date.now(),
      precio: Number(formulario.precio),
      esVenta: esVenta,
      tipoCompra: esVenta ? 'Venta de animal' : formulario.tipoCompra,
      categoria: esVenta ? 'Venta de animal' : formulario.categoria,
      animalId: formulario.animalId === 'general' ? null : Number(formulario.animalId),
      animalIdentificador: animal?.identificador ?? 'Rancho general'
    });
  }

  return (
    <form className="grid gap-5" onSubmit={manejarEnvio}>
      <section className="grid gap-5 rounded-2xl border border-[#98a287]/18 bg-white p-5 shadow-[0_12px_28px_rgba(29,29,27,0.07)] lg:grid-cols-2">
        {!bloquearMovimiento ?
        <label className="block lg:col-span-2">
            <span className="text-sm font-bold text-[#1d1d1b]">Tipo de movimiento</span>
            <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="movimiento" onChange={actualizarCampo} value={formulario.movimiento}>
              <option value="gasto">Registrar gasto</option>
              <option value="venta">Registrar venta de animal</option>
            </select>
          </label> :
        null}

        <label className="block">
          <span className="text-sm font-bold text-[#1d1d1b]">{esVenta ? 'Tipo de ingreso' : 'Tipo de compra'}</span>
          <input className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" disabled={esVenta} name="tipoCompra" onChange={actualizarCampo} placeholder="Vacuna, Forraje, Traslado..." value={esVenta ? 'Venta de animal' : formulario.tipoCompra} />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-[#1d1d1b]">{esVenta ? 'Monto de venta' : 'Precio de compra'}</span>
          <input className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" inputMode="decimal" min="0" name="precio" onChange={actualizarCampo} placeholder="1250" type="number" value={formulario.precio} />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-[#1d1d1b]">Fecha del gasto</span>
          <input className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" max={hoy} name="fecha" onChange={actualizarCampo} type="date" value={formulario.fecha} />
          {formulario.fecha > hoy ? <p className="mt-2 text-xs font-semibold text-[#D32F2F]">La fecha no puede ser futura.</p> : null}
        </label>

        <label className="block">
          <span className="text-sm font-bold text-[#1d1d1b]">Animal relacionado</span>
          <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="animalId" onChange={actualizarCampo} value={formulario.animalId}>
            <option value="general">{esVenta ? 'Selecciona animal vendido' : 'Rancho general'}</option>
            {animales.filter((animal) => !esVenta || animal.estado === 'Activo').map((animal) =>
            <option key={animal.id} value={animal.id}>
                {animal.identificador} - {animal.nombre}
              </option>
            )}
          </select>
        </label>

        <label className="block lg:col-span-2">
          <span className="text-sm font-bold text-[#1d1d1b]">{esVenta ? 'Categoría del ingreso' : 'Categoría del gasto'}</span>
          <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" disabled={esVenta} name="categoria" onChange={actualizarCampo} value={formulario.categoria}>
            {(esVenta ? ['Venta de animal'] : categoriasGasto).map((category) =>
            <option key={category} value={category}>
                {category}
              </option>
            )}
          </select>
        </label>
      </section>

      <section className="rounded-2xl border border-[#98a287]/18 bg-white p-5 shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
        <label className="block">
          <span className="text-sm font-bold text-[#1d1d1b]">Descripción</span>
          <textarea className="mt-2 min-h-28 w-full resize-y rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] p-4 text-sm outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="descripcion" onChange={actualizarCampo} value={formulario.descripcion} />
          {formulario.descripcion && formulario.descripcion.trim().length < 5 ? <p className="mt-2 text-xs font-semibold text-[#D32F2F]">Agrega una descripción de al menos 5 caracteres.</p> : null}
        </label>

        <div className="mt-5 rounded-2xl border border-dashed border-[#07612d]/25 bg-[#F4F4F4] p-4">
          <span className="text-sm font-bold text-[#1d1d1b]">Comprobante opcional</span>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex min-h-11 min-w-0 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#1d1d1b]/70 sm:flex-1">
              <FileText size={18} className="text-[#07612d]" />
              <span className="min-w-0 break-words">{nombreComprobante || 'Sin comprobante cargado'}</span>
            </div>
            <label className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#07612d] px-4 text-sm font-bold text-white sm:w-auto">
              <Upload size={18} /> Subir comprobante
              <input accept="image/*,application/pdf,.pdf" className="sr-only" onChange={manejarComprobante} type="file" />
            </label>
          </div>
          <VistaPreviaArchivo file={formulario.comprobante} title="Previsualización del comprobante" />
        </div>
      </section>

      <button className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-[#07612d] px-5 text-base font-bold text-white shadow-[0_10px_22px_rgba(7,97,45,0.2)] disabled:cursor-not-allowed disabled:bg-[#98a287]" disabled={!puedeEnviar} type="submit">
        <Save size={19} /> {esVenta ? 'Registrar Venta' : 'Registrar Gasto'}
      </button>
    </form>);

}

export default FormularioGasto;
