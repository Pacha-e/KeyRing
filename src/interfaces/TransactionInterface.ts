import type { TransactionType, TransactionSource } from './enums'

export interface TransactionInterface {
  id: string
  propertyId: string
  type: TransactionType
  source: TransactionSource
  amount: number
  /** Fecha ISO 'YYYY-MM-DD' */
  date: string
  description: string
}
