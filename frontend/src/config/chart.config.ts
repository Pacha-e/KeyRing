// Colores de los gráficos.
//
// Se definen aquí para que todas las pantallas dibujen el mismo concepto del
// mismo color: si los ingresos son verdes en el dashboard, lo son también en
// transacciones y en reportes. Los tonos de marca —terracota y azul noche—
// salen del logo; el verde y el rojo son semánticos y coinciden con los badges
// de ingreso y gasto de las tablas.

/** Verde de "entra dinero". El mismo del badge de ingreso. */
export const CHART_INCOME = '#16a34a'

/** Rojo de "sale dinero". El mismo del badge de gasto. */
export const CHART_EXPENSE = '#dc2626'

/** Relleno translúcido del verde, para el área bajo la línea de ingresos. */
export const CHART_INCOME_FILL = 'rgba(22, 163, 74, 0.13)'

/** Relleno translúcido del rojo. */
export const CHART_EXPENSE_FILL = 'rgba(220, 38, 38, 0.13)'

/** Terracota del logo. Serie principal cuando el gráfico tiene una sola. */
export const CHART_PRIMARY = '#b3543a'

/** Azul noche del logo. Serie secundaria o de contraste. */
export const CHART_NAVY = '#1b2438'

/**
 * Colores para categorías sin orden natural, como las fuentes de ingreso.
 * Van en orden: el primero es el terracota, que es también el color con el que
 * se marca Airbnb en las tablas.
 */
export const CHART_CATEGORICAL = [CHART_PRIMARY, CHART_NAVY, '#a8a29e']
