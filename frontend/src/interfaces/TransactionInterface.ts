// --- Internal imports ---
import type { TransactionSource } from '../enums/TransactionSource';
import type { TransactionType } from '../enums/TransactionType';

// --- Types ---
export interface TransactionInterface {
  amount: number;
  /** ISO date in YYYY-MM-DD format. */
  date: string;
  description: string;
  id: string;
  propertyId: string;
  source: TransactionSource;
  type: TransactionType;
}
