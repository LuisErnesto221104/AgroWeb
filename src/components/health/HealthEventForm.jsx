import { useMemo, useState } from 'react';
import { Save } from 'lucide-react';

const formularioInicial = {
  animalId: '',
  tipo: 'Vacuna',
  fecha: '',
  producto: '',
  dosis: '',
  responsable: '',
  proximaAplicacion: '',
  observaciones: '',
  estado: 'Pendiente'
};

function FormularioEventoSanitario({ animals: animales, onSubmit: alEnviar }) {
  const [formulario, establecerFormulario] = useState(formularioInicial);

  const puedeEnviar = useMemo(() => {
    return Boolean(formulario.animalId && formulario.tipo && formulario.fecha && formulario.producto.trim() && formulario.dosis.trim() && formulario.responsable.trim() && formulario.estado);
  }, [formulario]);

  function actualizarCampo(evento) {
    const { name, value: valor } = evento.target;
    establecerFormulario((actual) => ({ ...actual, [name]: valor }));
  }

  function manejarEnvio(evento) {
    evento.preventDefault();
    if (!puedeEnviar) return;
    const animal = animales.find((elemento) => elemento.id === Number(formulario.animalId));
    alEnviar({
      ...formulario,
      id: Date.now(),
      animalId: Number(formulario.animalId),
      animalIdentificador: animal?.identificador ?? 'Sin identificador'
    });
  }

  return (
    <form className="grid gap-5" onSubmit={manejarEnvio}>
      <section className="grid gap-5 rounded-2xl border border-[#98a287]/18 bg-white p-5 shadow-[0_12px_28px_rgba(29,29,27,0.07)] lg:grid-cols-2">
        <label className="block">
          <span className="text-sm font-bold text-[#1d1d1b]">Animal relacionado</span>
          <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="animalId" onChange={actualizarCampo} value={formulario.animalId}>
            <option value="">Selecciona animal</option>
            {animales.map((animal) =>
            <option key={animal.id} value={animal.id}>
                {animal.identificador} - {animal.nombre}
              </option>
            )}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-bold text-[#1d1d1b]">Tipo de evento</span>
          <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="tipo" onChange={actualizarCampo} value={formulario.tipo}>
            {['Vacuna', 'Desparasitante', 'Revision', 'Tratamiento', 'Enfermedad', 'Otro'].map((tipo) =>
            <option key={tipo} value={tipo}>
                {tipo}
              </option>
            )}
          </select>
        </label>

        {[
        ['fecha', 'Fecha del evento', 'date'],
        ['producto', 'Producto aplicado', 'text'],
        ['dosis', 'Dosis', 'text'],
        ['responsable', 'Responsable', 'text'],
        ['proximaAplicacion', 'Próxima aplicación', 'date']].
        map(([name, etiqueta, tipo]) =>
        <label className="block" key={name}>
            <span className="text-sm font-bold text-[#1d1d1b]">{etiqueta}</span>
            <input className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none transition focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name={name} onChange={actualizarCampo} type={tipo} value={formulario[name]} />
          </label>
        )}

        <label className="block">
          <span className="text-sm font-bold text-[#1d1d1b]">Estado</span>
          <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="estado" onChange={actualizarCampo} value={formulario.estado}>
            {['Completado', 'Pendiente', 'Vencido'].map((estado) =>
            <option key={estado} value={estado}>
                {estado}
              </option>
            )}
          </select>
        </label>
      </section>

      <label className="block rounded-2xl border border-[#98a287]/18 bg-white p-5 shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
        <span className="text-sm font-bold text-[#1d1d1b]">Observaciones</span>
        <textarea className="mt-2 min-h-32 w-full resize-y rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] p-4 text-sm outline-none transition focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="observaciones" onChange={actualizarCampo} value={formulario.observaciones} />
      </label>

      <button className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-[#07612d] px-5 text-base font-bold text-white shadow-[0_10px_22px_rgba(7,97,45,0.2)] disabled:cursor-not-allowed disabled:bg-[#98a287]" disabled={!puedeEnviar} type="submit">
        <Save size={19} /> Registrar Evento Sanitario
      </button>
    </form>);

}

export default FormularioEventoSanitario;
