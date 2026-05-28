export const mxn = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

export const categoriasGasto = ['Alimentación', 'Medicamento', 'Vacunas', 'Desparasitantes', 'Veterinario', 'Transporte', 'Mantenimiento', 'Otro'];

export function obtenerTotalesCategoria(gastos) {
  return gastos.reduce((totales, gasto) => {
    totales[gasto.categoria] = (totales[gasto.categoria] ?? 0) + Number(gasto.precio);
    return totales;
  }, {});
}

export function obtenerEntradaPrincipal(entradas) {
  return entradas.reduce((top, actual) => actual[1] > (top?.[1] ?? 0) ? actual : top, null);
}
