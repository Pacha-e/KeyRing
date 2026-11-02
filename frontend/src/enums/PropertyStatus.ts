// --- Types ---
export enum PropertyStatus {
  ACTIVE = 'ACTIVE',
  VACANT = 'VACANT',
}

// --- Exported members ---
export const PropertyStatusLabel: Record<PropertyStatus, string> = Object.freeze({
  [PropertyStatus.ACTIVE]: 'Active',
  [PropertyStatus.VACANT]: 'Vacant',
});
