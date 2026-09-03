import type { TransactionInterface } from '../interfaces/TransactionInterface'

/** Datos para crear una transacción (el id lo genera el repositorio) */
export type CreateTransactionDTO = Omit<TransactionInterface, 'id'>
