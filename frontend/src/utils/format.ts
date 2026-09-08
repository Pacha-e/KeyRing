// Formato de números y montos para la interfaz.
//
// Vive aquí y no dentro de cada vista porque cómo se escribe un peso colombiano
// es una decisión de producto: si mañana se decide mostrar decimales, o abreviar
// los millones, se cambia en un solo sitio y no en las seis pantallas que
// muestran dinero.

/**
 * Formatea un monto como pesos colombianos, sin decimales.
 * Se usa donde la cifra aparece sola y necesita decir por sí misma que es dinero.
 * @param amount monto a formatear
 * @returns el monto con símbolo de moneda, por ejemplo "$ 1.200.000"
 */
export function formatCOP(amount: number): string {
  return amount.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  })
}

/**
 * Formatea un número con los separadores de miles del español de Colombia.
 * Se usa dentro de las tablas: allí el encabezado de la columna ya dice que la
 * cifra está en pesos, y repetir el símbolo en cada fila solo añade ruido.
 * @param value número a formatear
 * @returns el número con puntos de millar, por ejemplo "1.200.000"
 */
export function formatNumber(value: number): string {
  return value.toLocaleString('es-CO', { maximumFractionDigits: 0 })
}
