import { useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Inicio, ImagePlus, PackageCheck, Syringe, WalletCards } from 'lucide-react';
import { solicitudApi } from '../services/api';
import { cargarPanel } from '../store/dashboardSlice';
import { useDespachoAplicacion } from '../store/hooks';

const razas = ['Holstein', 'Suizo Pardo', 'Jersey', 'Brahman', 'Angus', 'Hereford', 'Charolais', 'Simmental', 'Criollo', 'Limousin', 'Otro'];

const navegacionInferior = [
{ label: 'Inicio', to: '/', icon: Inicio },
{ label: 'Animales', to: '/animales', icon: PackageCheck },
{ label: 'Sanitario', to: '/sanitario', icon: Syringe },
{ label: 'Gastos', to: '/costos', icon: WalletCards },
{ label: 'Reportes', to: '/reportes', icon: BarChart3 }];


const formularioInicial = {
  arete: '',
  especie: 'Holstein',
  sexo: 'Macho',
  fecha: '',
  peso: '',
  precio_compra: '',
  origen: 'comprado',
  foto_path: ''
};

function archivoAUrlDatos(archivo) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result);
    lector.onerror = reject;
    lector.readAsDataURL(archivo);
  });
}

function RegistrarAnimal() {
  const navigate = useNavigate();
  const despachar = useDespachoAplicacion();
  const [formulario, establecerFormulario] = useState(formularioInicial);
  const [vistaPrevia, establecerVistaPrevia] = useState('');
  const [status, setStatus] = useState('idle');
  const [mensaje, establecerMensaje] = useState('');

  const puedeEnviar = useMemo(() => {
    const tieneCamposBase = formulario.arete.trim() && formulario.especie && formulario.sexo && formulario.fecha && Number(formulario.peso) > 0;
    const tienePrecio = formulario.origen === 'nacio' || Number(formulario.precio_compra) > 0;
    return Boolean(tieneCamposBase && tienePrecio && status !== 'loading');
  }, [formulario, status]);

  function actualizarCampo(evento) {
    const { name, value: valor } = evento.target;
    const valorSiguiente = name === 'arete' ? valor.replace(/\D/g, '') : valor;
    establecerFormulario((actual) => ({ ...actual, [name]: valorSiguiente }));
  }

  function selectOrigin(origen) {
    establecerFormulario((actual) => ({
      ...actual,
      origen,
      precio_compra: origen === 'nacio' ? '0' : actual.precio_compra === '0' ? '' : actual.precio_compra
    }));
  }

  async function manejarImagen(evento) {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;

    const urlDatos = await archivoAUrlDatos(archivo);
    establecerVistaPrevia(urlDatos);
    establecerFormulario((actual) => ({ ...actual, foto_path: urlDatos }));
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    if (!puedeEnviar) return;

    setStatus('loading');
    establecerMensaje('');

    try {
      await solicitudApi('/animales', {
        method: 'POST',
        body: JSON.stringify({
          arete: formulario.arete.trim(),
          especie: formulario.especie,
          sexo: formulario.sexo,
          fecha: formulario.fecha,
          peso: Number(formulario.peso),
          precio_compra: Number(formulario.precio_compra || 0),
          foto_path: formulario.foto_path
        })
      });

      await despachar(cargarPanel());
      navigate('/animales', { replace: true });
    } catch (error) {
      setStatus('failed');
      establecerMensaje(error.message);
    }
  }

  return (
    <main className="min-h-screen bg-[#F4F4F4] pb-24 font-['Poppins',sans-serif] text-[#1d1d1b]">
      <header className="border-b border-[#98a287]/18 bg-white px-4 py-5 shadow-[0_6px_22px_rgba(29,29,27,0.05)]">
        <div className="mx-auto max-w-3xl">
          <button className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-[#07612d]/25 bg-white px-4 text-sm font-semibold text-[#07612d]" onClick={() => navigate(-1)} type="button">
          <ArrowLeft size={22} /> Volver
          </button>
          <h1 className="mt-5 text-3xl font-bold text-[#07612d]">Registrar Animal</h1>
          <p className="mt-1 text-sm text-[#98a287]">Alta de animal con arete, datos productivos y fotografía.</p>
        </div>
      </header>

      <form className="mx-auto max-w-4xl space-y-8 px-4 py-8" onSubmit={manejarEnvio}>
        <div className="rounded-2xl bg-white p-4 text-sm font-semibold leading-6 text-[#1d1d1b]/70 shadow-[0_10px_30px_rgba(29,29,27,0.07)]">
          Los campos marcados con <span className="font-bold text-[#D32F2F]">*</span> son obligatorios. En el número SINIIGA escribe solo dígitos.
        </div>

        <label className="block rounded-2xl bg-white p-6 shadow-[0_10px_30px_rgba(29,29,27,0.07)]">
          <span className="text-base font-bold">Numero de Arete SINIIGA *</span>
          <input
            className="mt-3 h-14 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-base font-semibold outline-none transition focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10"
            inputMode="numeric"
            name="arete"
            onChange={actualizarCampo}
            pattern="[0-9]*"
            value={formulario.arete} />
          
          <p className="mt-2 text-sm font-semibold text-[#98a287]">Solo números. No se aceptan letras en este campo.</p>
        </label>

        <section className="rounded-2xl bg-white p-6 shadow-[0_10px_30px_rgba(29,29,27,0.07)]">
          <h2 className="text-base font-bold text-[#07612d]">Especie / Raza</h2>
          <div className="mt-5 flex flex-wrap gap-4">
            {razas.map((breed) => {
              const activo = formulario.especie === breed;
              return (
                <button
                  className={`min-h-12 rounded-2xl border px-5 text-sm font-bold transition ${activo ? 'border-[#07612d] bg-[#07612d] text-white shadow-[0_8px_18px_rgba(7,97,45,0.18)]' : 'border-[#98a287]/25 bg-white text-[#1d1d1b] hover:bg-[#F4F4F4]'}`}
                  key={breed}
                  onClick={() => establecerFormulario((actual) => ({ ...actual, especie: breed }))}
                  type="button">
                  
                  {breed}
                </button>);

            })}
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
          <label className="block rounded-2xl bg-white p-6 shadow-[0_10px_30px_rgba(29,29,27,0.07)]">
            <span className="text-base font-bold text-[#07612d]">Género *</span>
            <select className="mt-3 h-14 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-base font-semibold outline-none transition focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="sexo" onChange={actualizarCampo} value={formulario.sexo}>
              <option value="Macho">Macho</option>
              <option value="Hembra">Hembra</option>
            </select>
          </label>

          <label className="block rounded-2xl bg-white p-6 shadow-[0_10px_30px_rgba(29,29,27,0.07)]">
          <span className="text-base font-bold">Fecha de ingreso *</span>
          <input
              className="mt-3 h-14 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-base text-[#1d1d1b] outline-none transition focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10"
              name="fecha"
              onChange={actualizarCampo}
              type="date"
              value={formulario.fecha} />
            
          </label>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <label className="block rounded-2xl bg-white p-6 shadow-[0_10px_30px_rgba(29,29,27,0.07)]">
          <span className="text-base font-bold">Peso (kg) *</span>
          <input
              className="mt-3 h-14 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-base font-semibold outline-none transition focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10"
              inputMode="decimal"
              min="0"
              name="peso"
              onChange={actualizarCampo}
              type="number"
              value={formulario.peso} />
            
          </label>

          <section className="rounded-2xl bg-white p-6 shadow-[0_10px_30px_rgba(29,29,27,0.07)]">
          <h2 className="text-base font-bold text-[#07612d]">Precio de compra</h2>
          <div className="mt-5 grid gap-4">
            <button className={`min-h-12 rounded-2xl border px-3 text-sm font-bold ${formulario.origen === 'nacio' ? 'border-[#07612d] bg-[#07612d] text-white shadow-[0_8px_18px_rgba(7,97,45,0.18)]' : 'border-[#98a287]/25 bg-white hover:bg-[#F4F4F4]'}`} onClick={() => selectOrigin('nacio')} type="button">
              Nació en el rancho ($0)
            </button>
            <button className={`min-h-12 rounded-2xl border px-3 text-sm font-bold ${formulario.origen === 'comprado' ? 'border-[#07612d] bg-[#07612d] text-white shadow-[0_8px_18px_rgba(7,97,45,0.18)]' : 'border-[#98a287]/25 bg-white hover:bg-[#F4F4F4]'}`} onClick={() => selectOrigin('comprado')} type="button">
              Comprado
            </button>
          </div>
          <label className="relative mt-4 block">
            <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-bold text-[#07612d]">$</span>
            <input
                className="h-14 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] pl-12 pr-4 text-base font-semibold outline-none transition focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10 disabled:bg-[#F4F4F4]/60"
                disabled={formulario.origen === 'nacio'}
                inputMode="decimal"
                min="0"
                name="precio_compra"
                onChange={actualizarCampo}
                type="number"
                value={formulario.precio_compra} />
              
          </label>
          </section>
        </div>

        <section className="rounded-2xl bg-white p-6 shadow-[0_10px_30px_rgba(29,29,27,0.07)]">
          <h2 className="text-base font-bold text-[#07612d]">Fotografía del animal</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <label className="flex min-h-14 cursor-pointer items-center justify-center gap-3 rounded-2xl border border-[#07612d]/25 bg-white px-5 text-center text-base font-bold text-[#07612d]">
              <ImagePlus size={22} /> Seleccionar imagen
              <input accept="image/*" className="sr-only" onChange={manejarImagen} type="file" />
            </label>
          </div>
          <div className="mt-6 flex min-h-80 items-center justify-center overflow-hidden rounded-2xl border border-[#98a287]/18 bg-[#F4F4F4] px-4 text-center text-base font-semibold text-[#98a287]">
            {vistaPrevia ? <img alt="Vista previa del animal" className="h-full max-h-80 w-full object-cover" src={vistaPrevia} /> : 'Sin fotografía capturada'}
          </div>
        </section>

        {mensaje ? <div className="rounded-2xl border border-[#D32F2F]/20 bg-[#D32F2F]/10 p-4 text-sm font-semibold text-[#D32F2F]">{mensaje}</div> : null}

        <button className="min-h-16 w-full rounded-2xl bg-[#07612d] px-5 text-lg font-bold text-white shadow-[0_10px_22px_rgba(7,97,45,0.2)] disabled:cursor-not-allowed disabled:bg-[#98a287]" disabled={!puedeEnviar} type="submit">
          {status === 'loading' ? 'Registrando...' : 'Registrar'}
        </button>
      </form>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-[#e6e2d7] bg-white px-2 py-2 shadow-[0_-8px_24px_rgba(29,29,27,0.06)] md:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-5">
          {navegacionInferior.map(({ label: etiqueta, to, icon: Icon }) =>
          <NavLink className={({ isActive }) => `flex min-h-14 flex-col items-center justify-center gap-1 text-xs font-semibold ${isActive ? 'text-[#07612d]' : 'text-[#98a287]'}`} key={etiqueta} to={to}>
              <Icon size={21} />
              {etiqueta}
            </NavLink>
          )}
        </div>
      </nav>
    </main>);

}

export default RegistrarAnimal;
