// Cálculos financieros del dominio: funciones puras, sin Vue y sin conocer de
// dónde salieron los datos. Reciben los arreglos ya cargados y devuelven números,
// de modo que las vistas no repitan la misma aritmética y los servicios puedan
// delegar aquí. Es el único lugar del proyecto donde vive esta matemática.
import { TransactionType } from '../interfaces/enums'
import type { TransactionInterface } from '../interfaces/TransactionInterface'
import type { PropertyInterface } from '../interfaces/PropertyInterface'

/** Ingresos, gastos y utilidad neta de un conjunto de movimientos. */
export interface FinancialSummary {
  income: number
  expense: number
  net: number
}

/**
 * Suma los montos de un tipo de movimiento dentro de un conjunto.
 * @param transactions movimientos sobre los que sumar
 * @param type ingreso o gasto
 * @returns monto total del tipo indicado
 */
export function sumAmountsByType(
  transactions: TransactionInterface[],
  type: TransactionType,
): number {
  return transactions
    .filter((transaction) => transaction.type === type)
    .reduce((total, transaction) => total + transaction.amount, 0)
}

/**
 * Resume ingresos, gastos y utilidad neta de un conjunto de movimientos.
 * @param transactions movimientos sobre los que calcular
 * @returns ingresos, gastos y la diferencia entre ambos
 */
export function summarizeTransactions(transactions: TransactionInterface[]): FinancialSummary {
  const income = sumAmountsByType(transactions, TransactionType.INCOME)
  const expense = sumAmountsByType(transactions, TransactionType.EXPENSE)
  return { income, expense, net: income - expense }
}

/**
 * Resume el balance de una propiedad concreta.
 * @param propertyId identificador de la propiedad
 * @param transactions movimientos de todas las propiedades
 * @returns ingresos, gastos y utilidad neta de esa propiedad
 */
export function summarizePropertyBalance(
  propertyId: string,
  transactions: TransactionInterface[],
): FinancialSummary {
  return summarizeTransactions(
    transactions.filter((transaction) => transaction.propertyId === propertyId),
  )
}

/**
 * Meses distintos con movimientos, en formato 'YYYY-MM'.
 * @param transactions movimientos sobre los que calcular
 * @returns meses ordenados de más antiguo a más reciente, para el eje X de los gráficos
 */
export function listMonthsPresent(transactions: TransactionInterface[]): string[] {
  return [...new Set(transactions.map((transaction) => transaction.date.slice(0, 7)))].sort()
}

/**
 * Suma los montos de un tipo dentro de un mes concreto.
 * @param transactions movimientos sobre los que sumar
 * @param type ingreso o gasto
 * @param month mes en formato 'YYYY-MM'
 * @returns monto total del tipo indicado en ese mes
 */
export function sumAmountsByMonth(
  transactions: TransactionInterface[],
  type: TransactionType,
  month: string,
): number {
  return sumAmountsByType(
    transactions.filter((transaction) => transaction.date.startsWith(month)),
    type,
  )
}

/**
 * Ingresos del mes en curso.
 * @param transactions movimientos sobre los que calcular
 * @returns monto total ingresado en el mes actual
 */
export function sumIncomeForCurrentMonth(transactions: TransactionInterface[]): number {
  const currentMonth = new Date().toISOString().slice(0, 7)
  return sumAmountsByMonth(transactions, TransactionType.INCOME, currentMonth)
}

/**
 * Ingresos agrupados por su fuente.
 * @param transactions movimientos sobre los que calcular
 * @returns mapa fuente -> monto total de ingresos
 */
export function sumIncomeBySource(transactions: TransactionInterface[]): Record<string, number> {
  return transactions
    .filter((transaction) => transaction.type === TransactionType.INCOME)
    .reduce<Record<string, number>>((totals, transaction) => {
      totals[transaction.source] = (totals[transaction.source] ?? 0) + transaction.amount
      return totals
    }, {})
}

/**
 * Utilidad neta agrupada por ciudad.
 * @param properties propiedades que definen las ciudades y sus movimientos
 * @param transactions movimientos de todas las propiedades
 * @returns utilidad neta por ciudad, para el gráfico de Reportes
 */
export function sumNetProfitByCity(
  properties: PropertyInterface[],
  transactions: TransactionInterface[],
): { city: string; profit: number }[] {
  const cities = [...new Set(properties.map((property) => property.city))]
  return cities.map((city) => {
    const propertyIdsInCity = new Set(
      properties.filter((property) => property.city === city).map((property) => property.id),
    )
    const transactionsInCity = transactions.filter((transaction) =>
      propertyIdsInCity.has(transaction.propertyId),
    )
    return { city, profit: summarizeTransactions(transactionsInCity).net }
  })
}

/**
 * Arriendo mensual estimado, sumado por ciudad.
 * @param properties propiedades sobre las que sumar
 * @returns arriendo estimado por ciudad, para el gráfico de Propiedades
 */
export function sumEstimatedRentByCity(
  properties: PropertyInterface[],
): { city: string; amount: number }[] {
  const cities = [...new Set(properties.map((property) => property.city))]
  return cities.map((city) => ({
    city,
    amount: properties
      .filter((property) => property.city === city)
      .reduce((total, property) => total + property.estimatedMonthlyRent, 0),
  }))
}
