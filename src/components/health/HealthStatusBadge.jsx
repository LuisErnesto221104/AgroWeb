const estilosEstado = {
  Completado: 'bg-[#4CAF50]/12 text-[#2f8f36] border-[#4CAF50]/25',
  Pendiente: 'bg-[#FFA000]/14 text-[#9b6300] border-[#FFA000]/25',
  Vencido: 'bg-[#D32F2F]/10 text-[#D32F2F] border-[#D32F2F]/20'
};

function InsigniaEstadoSanidad({ estado }) {
  return <span className={`inline-flex min-h-7 items-center rounded-full border px-3 py-1 text-xs font-bold ${estilosEstado[estado] ?? estilosEstado.Pendiente}`}>{estado}</span>;
}

export default InsigniaEstadoSanidad;
