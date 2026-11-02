// --- Types ---
export enum RentalMode {
  AIRBNB = 'AIRBNB',
  FIXED_CONTRACT = 'FIXED_CONTRACT',
  BOTH = 'BOTH',
}

// --- Exported members ---
export const RentalModeLabel: Record<RentalMode, string> = Object.freeze({
  [RentalMode.AIRBNB]: 'Airbnb',
  [RentalMode.BOTH]: 'Both',
  [RentalMode.FIXED_CONTRACT]: 'Fixed contract',
});
