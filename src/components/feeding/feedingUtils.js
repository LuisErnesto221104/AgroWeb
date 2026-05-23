export const feedingStatusStyles = {
  Registrado: 'bg-[#4CAF50]/12 text-[#2f8f36] border-[#4CAF50]/25',
  Pendiente: 'bg-[#FFA000]/14 text-[#9b6300] border-[#FFA000]/25',
  Atrasado: 'bg-[#D32F2F]/10 text-[#D32F2F] border-[#D32F2F]/20',
}

export const foodTypes = ['Forraje', 'Concentrado', 'Silo', 'Minerales', 'Suplemento', 'Agua', 'Otro']
export const units = ['kg', 'g', 'lb', 'litros', 'pacas', 'porciones']

export const foodNutritionProfiles = {
  Forraje: {
    proteina: 9,
    fibra: 32,
    energia: 2.1,
    materiaSeca: 88,
    minerales: 'Calcio y fosforo moderado',
    notas: 'Base de fibra para rumia y mantenimiento.',
  },
  Concentrado: {
    proteina: 16,
    fibra: 12,
    energia: 3.1,
    materiaSeca: 90,
    minerales: 'Mezcla mineral balanceada',
    notas: 'Aporta energía y proteína para producción.',
  },
  Silo: {
    proteina: 8,
    fibra: 28,
    energia: 2.4,
    materiaSeca: 35,
    minerales: 'Bajo en minerales, complementar',
    notas: 'Buena fuente energética con alta humedad.',
  },
  Minerales: {
    proteina: 0,
    fibra: 0,
    energia: 0,
    materiaSeca: 96,
    minerales: 'Calcio, fosforo, sal y microminerales',
    notas: 'Complemento para balance mineral.',
  },
  Suplemento: {
    proteina: 22,
    fibra: 8,
    energia: 2.8,
    materiaSeca: 92,
    minerales: 'Vitaminas A, D, E y trazas',
    notas: 'Usar según etapa productiva.',
  },
  Agua: {
    proteina: 0,
    fibra: 0,
    energia: 0,
    materiaSeca: 0,
    minerales: 'Sales disueltas variables',
    notas: 'Controlar disponibilidad y limpieza.',
  },
  Otro: {
    proteina: '',
    fibra: '',
    energia: '',
    materiaSeca: '',
    minerales: '',
    notas: '',
  },
}

export function normalizeFeedingStatus(record, today = '2026-05-23') {
  if (record.estado === 'Registrado') return record
  if (record.fecha < today) return { ...record, estado: 'Atrasado' }
  return record
}
