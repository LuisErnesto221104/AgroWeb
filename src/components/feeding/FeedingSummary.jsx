import TarjetaReporte from '../reports/ReportCard';
import { mxn } from '../expenses/expenseUtils';

function ResumenAlimentacion({ records: registros }) {
  const byAnimal = registros.reduce((totales, registro) => {
    const clave = registro.animalIdentificador;
    if (!totales[clave]) totales[clave] = { cantidad: 0, costo: 0 };
    totales[clave].cantidad += Number(registro.cantidad);
    totales[clave].costo += Number(registro.costoAproximado);
    return totales;
  }, {});

  return (
    <TarjetaReporte title="Consumo por animal o grupo" subtitle="Cantidad total y costo aproximado de alimentación.">
      {Object.entries(byAnimal).length ?
      <div className="grid gap-3">
          {Object.entries(byAnimal).map(([animal, valores]) =>
        <article className="rounded-2xl bg-[#F4F4F4] p-4" key={animal}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-base font-bold text-[#07612d]">{animal}</h3>
                <strong className="text-[#2f8f36]">{mxn.format(valores.costo)}</strong>
              </div>
              <p className="mt-2 text-sm text-[#1d1d1b]/70">Consumo acumulado: <strong>{valores.cantidad}</strong></p>
            </article>
        )}
        </div> :

      <p className="text-sm font-semibold text-[#1d1d1b]/70">No hay consumo registrado.</p>
      }
    </TarjetaReporte>);

}

export default ResumenAlimentacion;
