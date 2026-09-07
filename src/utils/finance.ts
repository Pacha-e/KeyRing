// Capa "Util": funciones puras y reutilizables para cálculos financieros,
// sin dependencia de Vue ni de la fuente de datos (reciben los arreglos ya cargados).
import { TransactionType } from '../interfaces/enums'
import type { TransactionInterface } from '../interfaces/TransactionInterface'
import type { PropertyInterface } from '../interfaces/PropertyInterface'

/** Suma los ingresos del mes en curso (formato 'YYYY-MM'). */
export function calculateMonthlyIncome(transactions: TransactionInterface[]): number {
  const prefix = new Date().toISOString().slice(0, 7)
  return transactions
    .filter((t) => t.type === TransactionType.INCOME && t.date.startsWith(prefix))
    .reduce((sum, t) => sum + t.amount, 0)
}

/** Ingresos, gastos y utilidad neta de una propiedad específica. */
export function calculatePropertyBalance(
  propertyId: string,
  transactions: TransactionInterface[],
): { income: number; expense: number; net: number } {
  const tx = transactions.filter((t) => t.propertyId === propertyId)
  const income = tx
    .filter((t) => t.type === TransactionType.INCOME)
    .reduce((s, t) => s + t.amount, 0)
  const expense = tx
    .filter((t) => t.type === TransactionType.EXPENSE)
    .reduce((s, t) => s + t.amount, 0)
  return { income, expense, net: income - expense }
}

/** Utilidad neta agrupada por ciudad, para el gráfico de Reportes. */
export function calculateProfitByCity(
  properties: PropertyInterface[],
  transactions: TransactionInterface[],
): { city: string; profit: number }[] {
  const cities = [...new Set(properties.map((p) => p.city))]
  return cities.map((city) => {
    const ids = new Set(properties.filter((p) => p.city === city).map((p) => p.id))
    const profit = transactions
      .filter((t) => ids.has(t.propertyId))
      .reduce((sum, t) => sum + (t.type === TransactionType.INCOME ? t.amount : -t.amount), 0)
    return { city, profit }
  })
}

/** Ingreso mensual estimado total, agrupado por ciudad (para el gráfico de Propiedades). */
export function calculateEstimatedIncomeByCity(
  properties: PropertyInterface[],
): { city: string; amount: number }[] {
  const cities = [...new Set(properties.map((p) => p.city))]
  return cities.map((city) => ({
    city,
    amount: properties
      .filter((p) => p.city === city)
      .reduce((sum, p) => sum + p.estimatedMonthlyRent, 0),
  }))
}
