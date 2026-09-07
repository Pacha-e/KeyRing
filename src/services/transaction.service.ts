// Capa de servicios de Transaction: aísla a las vistas del acceso directo a storage.ts.
import { getAll, create, update, remove, KEYS } from './storage'
import type { TransactionInterface } from '../interfaces/TransactionInterface'
import type { CreateTransactionDTO } from '../dtos/CreateTransactionDTO'

export function getTransactions(): TransactionInterface[] {
  return getAll<TransactionInterface>(KEYS.transactions)
}

export function createTransaction(data: CreateTransactionDTO): TransactionInterface {
  return create<TransactionInterface>(KEYS.transactions, data)
}

export function updateTransaction(
  id: string,
  data: CreateTransactionDTO,
): TransactionInterface | null {
  return update<TransactionInterface>(KEYS.transactions, id, data)
}

export function deleteTransaction(id: string): void {
  remove(KEYS.transactions, id)
}
