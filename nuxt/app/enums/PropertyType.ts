// --- Exported members ---
export enum PropertyType {
  Apartment = 'APARTMENT',
  Farm = 'FARM',
  House = 'HOUSE',
}

export const propertyTypeLabels: Record<PropertyType, string> = {
  [PropertyType.Apartment]: 'Apartment',
  [PropertyType.Farm]: 'Farm',
  [PropertyType.House]: 'House',
};
