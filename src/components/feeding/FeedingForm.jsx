import { useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { perfilesNutricionalesAlimento, tiposAlimento, unidades } from './feedingUtils';

const formularioInicial = {
  target: 'animal',
  animalId: '',
  grupo: '',
  tipoAlimento: 'Forraje',
  cantidad: '',
  unidad: 'kg',
  fecha: '',
  hora: '',
  responsable: '',
  costoAproximado: '',
  nutricion: perfilesNutricionalesAlimento.Forraje,
  observaciones: '',
  estado: 'Registrado'
};

function FormularioAlimentacion({ animals: animales, onSubmit: alEnviar }) {
  const [formulario, establecerFormulario] = useState(formularioInicial);

  const puedeEnviar = useMemo(() => {
    const tieneObjetivo = formulario.target === 'grupo' ? formulario.grupo.trim() : formulario.animalId;
    return Boolean(tieneObjetivo && formulario.tipoAlimento && Number(formulario.cantidad) > 0 && formulario.unidad && formulario.fecha && formulario.hora && formulario.responsable.trim() && Number(formulario.costoAproximado) >= 0);
  }, [formulario]);

  function actualizarCampo(evento) {
    const { name, value: valor } = evento.target;
    establecerFormulario((actual) => {
      if (name === 'tipoAlimento') {
        return {
          ...actual,
          tipoAlimento: valor,
          nutricion: perfilesNutricionalesAlimento[valor]
        };
      }

      return { ...actual, [name]: valor };
    });
  }

  function actualizarNutricion(evento) {
    const { name, value: valor } = evento.target;
    establecerFormulario((actual) => ({
      ...actual,
      nutricion: {
        ...actual.nutricion,
        [name]: valor
      }
    }));
  }

  function manejarEnvio(evento) {
    evento.preventDefault();
    if (!puedeEnviar) return;

    const animal = animales.find((elemento) => elemento.id === Number(formulario.animalId));
    const esGrupo = formulario.target === 'grupo';
    alEnviar({
      ...formulario,
      id: Date.now(),
      animalId: esGrupo ? null : Number(formulario.animalId),
      animalIdentificador: esGrupo ? formulario.grupo : animal?.identificador ?? 'Sin identificador',
      tipoAlimento: formulario.tipoAlimento,
      alimento: formulario.tipoAlimento,
      cantidad: Number(formulario.cantidad),
      costoAproximado: Number(formulario.costoAproximado),
      costo: Number(formulario.costoAproximado),
      nutricion: {
        ...formulario.nutricion,
        proteina: formulario.nutricion.proteina === '' ? '' : Number(formulario.nutricion.proteina),
        fibra: formulario.nutricion.fibra === '' ? '' : Number(formulario.nutricion.fibra),
        energia: formulario.nutricion.energia === '' ? '' : Number(formulario.nutricion.energia),
        materiaSeca: formulario.nutricion.materiaSeca === '' ? '' : Number(formulario.nutricion.materiaSeca)
      },
      grupo: esGrupo ? formulario.grupo : ''
    });
  }

  return (
    <form className="grid gap-5" onSubmit={manejarEnvio}>
      <section className="grid gap-5 rounded-2xl border border-[#98a287]/18 bg-white p-5 shadow-[0_12px_28px_rgba(29,29,27,0.07)] lg:grid-cols-2">
        <div className="lg:col-span-2">
          <span className="text-sm font-bold text-[#1d1d1b]">Seleccionar animal o grupo</span>
          <div className="mt-2 grid grid-cols-2 gap-2 rounded-2xl bg-[#F4F4F4] p-1">
            {[
            ['animal', 'Animal'],
            ['grupo', 'Grupo']].
            map(([valor, etiqueta]) =>
            <button className={`min-h-11 rounded-xl text-sm font-bold ${formulario.target === valor ? 'bg-[#07612d] text-white' : 'text-[#1d1d1b]/70'}`} key={valor} onClick={() => establecerFormulario((actual) => ({ ...actual, target: valor }))} type="button">
                {etiqueta}
              </button>
            )}
          </div>
        </div>

        {formulario.target === 'animal' ?
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
          </label> :

        <label className="block">
            <span className="text-sm font-bold text-[#1d1d1b]">Nombre del grupo</span>
            <input className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="grupo" onChange={actualizarCampo} placeholder="Grupo Corral 1" value={formulario.grupo} />
          </label>
        }

        <label className="block">
          <span className="text-sm font-bold text-[#1d1d1b]">Tipo de alimento</span>
          <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="tipoAlimento" onChange={actualizarCampo} value={formulario.tipoAlimento}>
            {tiposAlimento.map((tipo) =>
            <option key={tipo} value={tipo}>{tipo}</option>
            )}
          </select>
        </label>

        <section className="rounded-2xl border border-[#07612d]/12 bg-[#F4F4F4] p-4 lg:col-span-2">
          <div>
            <h2 className="text-base font-bold text-[#07612d]">Datos nutricionales del alimento</h2>
            <p className="mt-1 text-sm leading-6 text-[#1d1d1b]/65">Estos valores ayudan a controlar proteína, fibra, energía y materia seca de la ración.</p>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
            ['proteina', 'Proteína (%)', '16'],
            ['fibra', 'Fibra (%)', '32'],
            ['energia', 'Energía Mcal/kg', '2.4'],
            ['materiaSeca', 'Materia seca (%)', '88']].
            map(([name, etiqueta, placeholder]) =>
            <label className="block" key={name}>
                <span className="text-sm font-bold text-[#1d1d1b]">{etiqueta}</span>
                <input
                className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-white px-4 text-sm outline-none focus:border-[#07612d] focus:ring-4 focus:ring-[#07612d]/10"
                inputMode="decimal"
                min="0"
                name={name}
                onChange={actualizarNutricion}
                placeholder={placeholder}
                type="number"
                value={formulario.nutricion[name]} />
              
              </label>
            )}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <label className="block">
              <span className="text-sm font-bold text-[#1d1d1b]">Minerales / vitaminas</span>
              <input className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-white px-4 text-sm outline-none focus:border-[#07612d] focus:ring-4 focus:ring-[#07612d]/10" name="minerales" onChange={actualizarNutricion} value={formulario.nutricion.minerales} />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-[#1d1d1b]">Notas nutricionales</span>
              <input className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-white px-4 text-sm outline-none focus:border-[#07612d] focus:ring-4 focus:ring-[#07612d]/10" name="notas" onChange={actualizarNutricion} value={formulario.nutricion.notas} />
            </label>
          </div>
        </section>

        <label className="block">
          <span className="text-sm font-bold text-[#1d1d1b]">Cantidad</span>
          <input className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" inputMode="decimal" min="0" name="cantidad" onChange={actualizarCampo} type="number" value={formulario.cantidad} />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-[#1d1d1b]">Unidad de medida</span>
          <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="unidad" onChange={actualizarCampo} value={formulario.unidad}>
            {unidades.map((unit) =>
            <option key={unit} value={unit}>{unit}</option>
            )}
          </select>
        </label>

        {[
        ['fecha', 'Fecha', 'date'],
        ['hora', 'Hora', 'time'],
        ['responsable', 'Responsable', 'text'],
        ['costoAproximado', 'Costo aproximado', 'number']].
        map(([name, etiqueta, tipo]) =>
        <label className="block" key={name}>
            <span className="text-sm font-bold text-[#1d1d1b]">{etiqueta}</span>
            <input className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" inputMode={tipo === 'number' ? 'decimal' : undefined} min={tipo === 'number' ? '0' : undefined} name={name} onChange={actualizarCampo} type={tipo} value={formulario[name]} />
          </label>
        )}

        <label className="block">
          <span className="text-sm font-bold text-[#1d1d1b]">Estado</span>
          <select className="mt-2 h-12 w-full rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] px-4 text-sm font-semibold outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="estado" onChange={actualizarCampo} value={formulario.estado}>
            {['Registrado', 'Pendiente', 'Atrasado'].map((status) =>
            <option key={status} value={status}>{status}</option>
            )}
          </select>
        </label>
      </section>

      <label className="block rounded-2xl border border-[#98a287]/18 bg-white p-5 shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
        <span className="text-sm font-bold text-[#1d1d1b]">Observaciones</span>
        <textarea className="mt-2 min-h-28 w-full resize-y rounded-2xl border border-[#98a287]/25 bg-[#F4F4F4] p-4 text-sm outline-none focus:border-[#07612d] focus:bg-white focus:ring-4 focus:ring-[#07612d]/10" name="observaciones" onChange={actualizarCampo} value={formulario.observaciones} />
      </label>

      <button className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-[#07612d] px-5 text-base font-bold text-white shadow-[0_10px_22px_rgba(7,97,45,0.2)] disabled:cursor-not-allowed disabled:bg-[#98a287]" disabled={!puedeEnviar} type="submit">
        <Save size={19} /> Registrar Alimentación
      </button>
    </form>);

}

export default FormularioAlimentacion;
