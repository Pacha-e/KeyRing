// --- Exported members ---
export enum PropertyStatus {
  Available = 'AVAILABLE',
  Maintenance = 'MAINTENANCE',
  Rented = 'RENTED',
}

export const propertyStatusLabels: Record<PropertyStatus, string> = {
  [PropertyStatus.Available]: 'Available',
  [PropertyStatus.Maintenance]: 'Under maintenance',
  [PropertyStatus.Rented]: 'Rented',
};
