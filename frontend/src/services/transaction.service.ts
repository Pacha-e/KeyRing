// Servicio de transacciones (ingresos y gastos). Solo acceso a datos: la
// aritmética de totales y agrupaciones vive en utils/finance.ts.
import * as storage from './storage'
import * as propertyService from './property.service'
import type { TransactionInterface } from '../interfaces/TransactionInterface'
import type { CreateTransactionDTO } from '../dtos/CreateTransactionDTO'
import type { SessionUser } from './auth.service'

/**
 * Todas las transacciones registradas.
 * @returns lista completa, sin filtrar por dueño
 */
export function list(): TransactionInterface[] {
  return storage.findAll<TransactionInterface>(storage.STORAGE_KEYS.transactions)
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
  return storage.findById<TransactionInterface>(storage.STORAGE_KEYS.transactions, id)
}

/**
 * Registra una transacción nueva.
 * @param newTransaction datos de la transacción sin id
 * @returns la transacción creada, ya con su id
 */
export function create(newTransaction: CreateTransactionDTO): TransactionInterface {
  return storage.insert<TransactionInterface>(storage.STORAGE_KEYS.transactions, newTransaction)
}

/**
 * Modifica una transacción existente.
 * @param id identificador de la transacción
 * @param changes campos a actualizar
 * @returns la transacción actualizada, o null si el id no existe
 */
export function update(
  id: string,
  changes: Partial<CreateTransactionDTO>,
): TransactionInterface | null {
  return storage.applyChanges<TransactionInterface>(storage.STORAGE_KEYS.transactions, id, changes)
}

/**
 * Elimina una transacción.
 * @param id identificador de la transacción
 */
export function remove(id: string): void {
  storage.deleteById(storage.STORAGE_KEYS.transactions, id)
}

// Los totales, agrupaciones por mes y por fuente viven en utils/finance.ts.
