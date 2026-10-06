// Servicio de transacciones (ingresos y gastos): habla con la API por HTTP.
// Solo acceso a datos: la aritmética de totales y agrupaciones vive en
// utils/finance.ts.
import { http } from './http'
import * as propertyService from './property.service'
import type { TransactionInterface } from '../interfaces/TransactionInterface'
import type { CreateTransactionDTO } from '../dtos/CreateTransactionDTO'
import type { SessionUser } from './auth.service'

/**
 * Todas las transacciones registradas (vista global del administrador).
 */
export async function list(): Promise<TransactionInterface[]> {
  const { data } = await http.get<TransactionInterface[]>('/api/transactions')
  return data
}

/**
 * Transacciones de las propiedades visibles para la sesión actual.
 * @param user usuario en sesión, o null si no hay sesión
 */
export async function listForUser(user: SessionUser | null): Promise<TransactionInterface[]> {
  const visibles = await propertyService.listForUser(user)
  if (visibles.length === 0) return []
  const { data } = await http.get<TransactionInterface[]>('/api/transactions', {
    params: { propertyIds: visibles.map((p) => p.id).join(',') },
  })
  return data
}

/**
 * Busca una transacción por su id.
 * @param id identificador de la transacción
 * @returns la transacción, o null si no existe (404 traducido a null)
 */
export async function findById(id: string): Promise<TransactionInterface | null> {
  try {
    const { data } = await http.get<TransactionInterface>(`/api/transactions/${id}`)
    return data
  } catch {
    return null
  }
}

/**
 * Registra una transacción nueva.
 * @param newTransaction datos de la transacción sin id
 * @returns la transacción creada, ya con su id
 */
export async function create(newTransaction: CreateTransactionDTO): Promise<TransactionInterface> {
  const { data } = await http.post<TransactionInterface>('/api/transactions', newTransaction)
  return data
}

/**
 * Modifica una transacción existente.
 * @param id identificador de la transacción
 * @param changes campos a actualizar
 * @returns la transacción actualizada, o null si el id no existe
 */
export async function update(
  id: string,
  changes: Partial<CreateTransactionDTO>,
): Promise<TransactionInterface | null> {
  try {
    const { data } = await http.patch<TransactionInterface>(`/api/transactions/${id}`, changes)
    return data
  } catch {
    return null
  }
}

/**
 * Elimina una transacción.
 * @param id identificador de la transacción
 */
export async function remove(id: string): Promise<void> {
  await http.delete(`/api/transactions/${id}`)
}
