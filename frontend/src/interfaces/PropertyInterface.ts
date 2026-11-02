// --- Internal imports ---
import type { PropertyStatus } from '../enums/PropertyStatus';
import type { PropertyType } from '../enums/PropertyType';
import type { RentalMode } from '../enums/RentalMode';

// --- Types ---
export interface PropertyInterface {
  address: string;
  adminFee: number;
  city: string;
  estimatedMonthlyRent: number;
  id: string;
  latitude?: number;
  longitude?: number;
  name: string;
  otherFixedCosts: number;
  rentalMode: RentalMode;
  status: PropertyStatus;
  type: PropertyType;
  userId: string | null;
}
