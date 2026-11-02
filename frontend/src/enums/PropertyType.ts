// --- Types ---
export enum PropertyType {
  HOUSE = 'HOUSE',
  APARTMENT = 'APARTMENT',
  FARM = 'FARM',
}

// --- Exported members ---
export const PropertyTypeLabel: Record<PropertyType, string> = Object.freeze({
  [PropertyType.APARTMENT]: 'Apartment',
  [PropertyType.FARM]: 'Farm',
  [PropertyType.HOUSE]: 'House',
});
