// Servicio de transacciones (ingresos y gastos), incluidos los agregados
// que alimentan las tablas resumen y los gráficos de Chart.js.
import { getAll, getById, create as insert, update as patch, remove as del, KEYS } from './storage'
import * as propertyService from './property.service'
import { TransactionType } from '../interfaces/enums'
import type { TransactionInterface } from '../interfaces/TransactionInterface'
import type { CreateTransactionDTO } from '../dtos/CreateTransactionDTO'
import type { SessionUser } from './auth.service'

/** Ingresos, gastos y neto de un conjunto de transacciones. */
export interface Totals {
  income: number
  expense: number
  net: number
}

/**
 * Todas las transacciones registradas.
 * @returns lista completa, sin filtrar por dueño
 */
export function list(): TransactionInterface[] {
  return getAll<TransactionInterface>(KEYS.transactions)
}

/**
 * Transacciones de las propiedades visibles para la sesión actual.
 * @param user usuario en sesión, o null si no hay sesión
 * @returns transacciones que el usuario puede consultar
 */
export function listForUser(user: SessionUser | null): TransactionInterface[] {
  const visibles = new Set(propertyService.listForUser(user).map((p) => p.id))
  return list().filter((t) => visibles.has(t.propertyId))
}

/**
 * Busca una transacción por su id.
 * @param id identificador de la transacción
 * @returns la transacción, o null si no existe
 */
export function findById(id: string): TransactionInterface | null {
  return getById<TransactionInterface>(KEYS.transactions, id)
}

/**
 * Registra una transacción nueva.
 * @param dto datos de la transacción sin id
 * @returns la transacción creada, ya con su id
 */
export function create(dto: CreateTransactionDTO): TransactionInterface {
  return insert<TransactionInterface>(KEYS.transactions, dto)
}

/**
 * Modifica una transacción existente.
 * @param id identificador de la transacción
 * @param cambios campos a actualizar
 * @returns la transacción actualizada, o null si el id no existe
 */
export function update(
  id: string,
  cambios: Partial<CreateTransactionDTO>,
): TransactionInterface | null {
  return patch<TransactionInterface>(KEYS.transactions, id, cambios)
}

/**
 * Elimina una transacción.
 * @param id identificador de la transacción
 */
export function remove(id: string): void {
  del(KEYS.transactions, id)
}

/**
 * Suma ingresos, gastos y neto de un conjunto de transacciones.
 * @param transactions transacciones sobre las que calcular
 * @returns totales de ingresos, gastos y neto
 */
export function totals(transactions: TransactionInterface[]): Totals {
  const income = transactions
    .filter((t) => t.type === TransactionType.INCOME)
    .reduce((s, t) => s + t.amount, 0)
  const expense = transactions
    .filter((t) => t.type === TransactionType.EXPENSE)
    .reduce((s, t) => s + t.amount, 0)
  return { income, expense, net: income - expense }
}

/**
 * Meses distintos con movimientos, en formato 'YYYY-MM'.
 * @param transactions transacciones sobre las que calcular
 * @returns meses ordenados ascendentemente, para el eje X de los gráficos
 */
export function months(transactions: TransactionInterface[]): string[] {
  return [...new Set(transactions.map((t) => t.date.slice(0, 7)))].sort()
}

/**
 * Suma los montos de un tipo dado dentro de un mes.
 * @param transactions transacciones sobre las que calcular
 * @param type tipo de movimiento (ingreso o gasto)
 * @param month mes en formato 'YYYY-MM'
 * @returns monto total del tipo indicado en ese mes
 */
export function sumByMonth(
  transactions: TransactionInterface[],
  type: TransactionType,
  month: string,
): number {
  return transactions
    .filter((t) => t.type === type && t.date.startsWith(month))
    .reduce((s, t) => s + t.amount, 0)
}

/**
 * Suma los ingresos agrupados por fuente.
 * @param transactions transacciones sobre las que calcular
 * @returns mapa fuente -> monto total de ingresos
 */
export function incomeBySource(transactions: TransactionInterface[]): Record<string, number> {
  return transactions
    .filter((t) => t.type === TransactionType.INCOME)
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.source] = (acc[t.source] ?? 0) + t.amount
      return acc
    }, {})
}
