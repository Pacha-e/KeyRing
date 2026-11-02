// --- Exported members ---
export enum RentalMode {
  LongTerm = 'LONG_TERM',
  ShortTerm = 'SHORT_TERM',
}

export const rentalModeLabels: Record<RentalMode, string> = {
  [RentalMode.LongTerm]: 'Long term',
  [RentalMode.ShortTerm]: 'Short term',
};
