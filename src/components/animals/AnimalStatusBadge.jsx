const statusStyles = {
  Activo: 'bg-[#4CAF50]/12 text-[#2f8f36] border-[#4CAF50]/25',
  Vendido: 'bg-[#1f7a8c]/10 text-[#1f7a8c] border-[#1f7a8c]/20',
  Fallecido: 'bg-[#D32F2F]/10 text-[#D32F2F] border-[#D32F2F]/20',
  Inactivo: 'bg-[#98a287]/15 text-[#64705b] border-[#98a287]/25',
}

function AnimalStatusBadge({ estado }) {
  return (
    <span className={`inline-flex min-h-7 items-center rounded-full border px-3 py-1 text-xs font-bold ${statusStyles[estado] ?? statusStyles.Inactivo}`}>
      {estado}
    </span>
  )
}

export default AnimalStatusBadge
