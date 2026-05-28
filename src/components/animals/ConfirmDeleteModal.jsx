import { AlertTriangle, X } from 'lucide-react';

function ModalConfirmarBaja({ animal: animal, onClose: alCerrar, onConfirm: alConfirmar }) {
  if (!animal) return null;
  const puedeCambiarEstado = animal.estado === 'Activo';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1d1d1b]/45 px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_20px_50px_rgba(29,29,27,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#D32F2F]/10 text-[#D32F2F]">
            <AlertTriangle size={25} />
          </span>
          <button aria-label="Cerrar modal" className="rounded-xl p-2 text-[#98a287]" onClick={alCerrar} type="button">
            <X size={21} />
          </button>
        </div>

        <h2 className="mt-5 text-xl font-bold text-[#1d1d1b]">Dar de baja animal</h2>
        {puedeCambiarEstado ?
        <p className="mt-2 text-sm leading-6 text-[#1d1d1b]/70">
            No se eliminará definitivamente. Se cambiará el estado de {animal.identificador} para conservar su historial.
          </p> :

        <p className="mt-2 text-sm leading-6 text-[#1d1d1b]/70">
            {animal.identificador} ya está marcado como {animal.estado}. Este estado no permite cambiarse a otro para evitar inconsistencias en el historial.
          </p>
        }

        {puedeCambiarEstado ?
        <div className="mt-5 grid gap-3">
            {[
          ['Fallecido', 'Muerto / Fallecido']].
          map(([estado, etiqueta]) =>
          <button className="min-h-11 rounded-xl border border-[#98a287]/25 bg-[#F4F4F4] px-3 text-sm font-bold text-[#1d1d1b] hover:border-[#07612d]/30" key={estado} onClick={() => alConfirmar(estado)} type="button">
                {etiqueta}
              </button>
          )}
          </div> :

        <button className="mt-5 min-h-11 w-full rounded-xl bg-[#07612d] px-3 text-sm font-bold text-white" onClick={alCerrar} type="button">
            Entendido
          </button>
        }
      </section>
    </div>);

}

export default ModalConfirmarBaja;
