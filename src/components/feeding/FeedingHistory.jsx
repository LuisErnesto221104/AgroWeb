import FeedingCard from './FeedingCard'
import FeedingTable from './FeedingTable'

function FeedingHistory({ records, viewMode }) {
  if (!records.length) {
    return (
      <section className="rounded-2xl border border-[#98a287]/18 bg-white p-8 text-center shadow-[0_12px_28px_rgba(29,29,27,0.07)]">
        <h2 className="text-2xl font-bold text-[#07612d]">No hay registros de alimentación</h2>
        <p className="mt-2 text-sm text-[#1d1d1b]/70">Registra una alimentación o ajusta los filtros actuales.</p>
      </section>
    )
  }

  if (viewMode === 'table') {
    return <FeedingTable records={records} />
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {records.map((record) => (
        <FeedingCard key={record.id} record={record} />
      ))}
    </div>
  )
}

export default FeedingHistory
