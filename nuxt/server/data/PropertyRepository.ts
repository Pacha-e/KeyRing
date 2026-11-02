// --- Internal imports ---
import { PropertyStatus } from '#shared/enums/PropertyStatus';
import { PropertyType } from '#shared/enums/PropertyType';
import { RentalMode } from '#shared/enums/RentalMode';
import type { Property } from '#shared/interfaces/Property';

// --- Constants ---
const properties: Property[] = [
  {
    address: 'Calle 39 # 74-20',
    adminFee: 350000,
    city: 'Medellín',
    estimatedMonthlyRent: 2400000,
    id: 1,
    latitude: 6.2442,
    longitude: -75.5901,
    name: 'Laureles Garden',
    otherFixedCosts: 80000,
    rentalMode: RentalMode.LongTerm,
    status: PropertyStatus.Available,
    type: PropertyType.Apartment,
    userId: 1,
  },
  {
    address: 'Carrera 29 # 10-45',
    adminFee: 620000,
    city: 'Medellín',
    estimatedMonthlyRent: 4200000,
    id: 2,
    latitude: 6.2088,
    longitude: -75.5646,
    name: 'El Poblado View',
    otherFixedCosts: 120000,
    rentalMode: RentalMode.LongTerm,
    status: PropertyStatus.Rented,
    type: PropertyType.Apartment,
    userId: 1,
  },
  {
    address: 'Calle 67 Sur # 45-18',
    adminFee: 290000,
    city: 'Sabaneta',
    estimatedMonthlyRent: 2100000,
    id: 3,
    latitude: 6.1515,
    longitude: -75.6166,
    name: 'Sabaneta Terrace',
    otherFixedCosts: 65000,
    rentalMode: RentalMode.LongTerm,
    status: PropertyStatus.Available,
    type: PropertyType.Apartment,
    userId: 1,
  },
  {
    address: 'Carrera 43 # 36 Sur-24',
    adminFee: 0,
    city: 'Envigado',
    estimatedMonthlyRent: 3800000,
    id: 4,
    latitude: 6.1702,
    longitude: -75.5839,
    name: 'Envigado Family House',
    otherFixedCosts: 150000,
    rentalMode: RentalMode.LongTerm,
    status: PropertyStatus.Rented,
    type: PropertyType.House,
    userId: 1,
  },
  {
    address: 'Via Las Palmas km 12',
    adminFee: 0,
    city: 'Medellín',
    estimatedMonthlyRent: 6500000,
    id: 5,
    latitude: 6.192,
    longitude: -75.52,
    name: 'Las Palmas Retreat',
    otherFixedCosts: 400000,
    rentalMode: RentalMode.ShortTerm,
    status: PropertyStatus.Maintenance,
    type: PropertyType.Farm,
    userId: 1,
  },
  {
    address: 'Carrera 43A # 75 Sur-30',
    adminFee: 260000,
    city: 'Sabaneta',
    estimatedMonthlyRent: 1900000,
    id: 6,
    latitude: 6.149,
    longitude: -75.616,
    name: 'Sabaneta Central',
    otherFixedCosts: 60000,
    rentalMode: RentalMode.ShortTerm,
    status: PropertyStatus.Available,
    type: PropertyType.Apartment,
    userId: 1,
  },
];

// --- Exported members ---
export class PropertyRepository {
  static findAll(): Property[] {
    return properties;
  }

  static findById(id: number): Property | undefined {
    return properties.find((property) => property.id === id);
  }
}
