import ReportCard from '../reports/ReportCard'
import { mxn } from '../expenses/expenseUtils'

function FeedingSummary({ records }) {
  const byAnimal = records.reduce((totals, record) => {
    const key = record.animalIdentificador
    if (!totals[key]) totals[key] = { cantidad: 0, costo: 0 }
    totals[key].cantidad += Number(record.cantidad)
    totals[key].costo += Number(record.costoAproximado)
    return totals
  }, {})

  return (
    <ReportCard title="Consumo por animal o grupo" subtitle="Cantidad total y costo aproximado de alimentación.">
      {Object.entries(byAnimal).length ? (
        <div className="grid gap-3">
          {Object.entries(byAnimal).map(([animal, values]) => (
            <article className="rounded-2xl bg-[#F4F4F4] p-4" key={animal}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-base font-bold text-[#07612d]">{animal}</h3>
                <strong className="text-[#2f8f36]">{mxn.format(values.costo)}</strong>
              </div>
              <p className="mt-2 text-sm text-[#1d1d1b]/70">Consumo acumulado: <strong>{values.cantidad}</strong></p>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-sm font-semibold text-[#1d1d1b]/70">No hay consumo registrado.</p>
      )}
    </ReportCard>
  )
}

export default FeedingSummary
