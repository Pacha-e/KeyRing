// --- Internal imports ---
import type { TransactionInterface } from '../interfaces/TransactionInterface';

// --- Types ---
export type CreateTransactionDto = Omit<TransactionInterface, 'id'>;
