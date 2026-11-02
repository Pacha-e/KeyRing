// --- Types ---
export enum TransactionSource {
  AIRBNB = 'AIRBNB',
  CONTRACT = 'CONTRACT',
  OTHER = 'OTHER',
}

// --- Exported members ---
export const TransactionSourceLabel: Record<TransactionSource, string> = Object.freeze({
  [TransactionSource.AIRBNB]: 'Airbnb',
  [TransactionSource.CONTRACT]: 'Contract',
  [TransactionSource.OTHER]: 'Other',
});
