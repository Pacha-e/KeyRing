// --- Types ---
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

// --- Exported members ---
export const TransactionTypeLabel: Record<TransactionType, string> = Object.freeze({
  [TransactionType.EXPENSE]: 'Expense',
  [TransactionType.INCOME]: 'Income',
});
