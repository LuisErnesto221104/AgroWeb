export const mxn = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const expenseCategories = ['Alimentación', 'Medicamento', 'Vacunas', 'Desparasitantes', 'Veterinario', 'Transporte', 'Mantenimiento', 'Otro']

export function getCategoryTotals(expenses) {
  return expenses.reduce((totals, expense) => {
    totals[expense.categoria] = (totals[expense.categoria] ?? 0) + Number(expense.precio)
    return totals
  }, {})
}

export function getTopEntry(entries) {
  return entries.reduce((top, current) => (current[1] > (top?.[1] ?? 0) ? current : top), null)
}
