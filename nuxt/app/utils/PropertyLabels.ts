// --- Internal imports ---
import { PropertyStatus } from '#shared/enums/PropertyStatus';
import { PropertyType } from '#shared/enums/PropertyType';
import { RentalMode } from '#shared/enums/RentalMode';

// --- Exported members ---
export class PropertyLabels {
  private static readonly RENTAL_MODE_LABELS: Record<RentalMode, string> = {
    [RentalMode.LongTerm]: 'Long term',
    [RentalMode.ShortTerm]: 'Short term',
  };

  private static readonly STATUS_LABELS: Record<PropertyStatus, string> = {
    [PropertyStatus.Available]: 'Available',
    [PropertyStatus.Maintenance]: 'Under maintenance',
    [PropertyStatus.Rented]: 'Rented',
  };

  private static readonly TYPE_LABELS: Record<PropertyType, string> = {
    [PropertyType.Apartment]: 'Apartment',
    [PropertyType.Farm]: 'Farm',
    [PropertyType.House]: 'House',
  };

  static rentalMode(value: RentalMode): string {
    return PropertyLabels.RENTAL_MODE_LABELS[value];
  }

  static status(value: PropertyStatus): string {
    return PropertyLabels.STATUS_LABELS[value];
  }

  static type(value: PropertyType): string {
    return PropertyLabels.TYPE_LABELS[value];
  }
}
