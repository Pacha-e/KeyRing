// --- External imports ---
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// --- Internal imports ---
import { Property } from '../../properties/entities/property.entity.js';
import { PropertyStatus } from '../../domain/enums/property-status.js';
import { PropertyType } from '../../domain/enums/property-type.js';
import { RentalMode } from '../../domain/enums/rental-mode.js';
import { User } from '../../users/entities/user.entity.js';

// --- Exported members ---
@Injectable()
export class PropertySeeder {
  constructor(
    @InjectRepository(Property) private readonly propertiesRepository: Repository<Property>,
  ) {}

  async seed(users: User[]): Promise<Property[]> {
    if (await this.propertiesRepository.count()) return this.propertiesRepository.find();
    const [admin, user] = users;
    const propertyDrafts = [
      {
        address: 'Cra 43A #10-25',
        adminFee: 320000,
        city: 'Medellín',
        estimatedMonthlyRent: 3200000,
        latitude: 6.2086,
        longitude: -75.5676,
        name: 'El Poblado Apartment',
        otherFixedCosts: 250000,
        rentalMode: RentalMode.Airbnb,
        status: PropertyStatus.Active,
        type: PropertyType.Apartment,
      },
      {
        address: 'Cll 33 #78-40',
        adminFee: 450000,
        city: 'Medellín',
        estimatedMonthlyRent: 4500000,
        latitude: 6.2447,
        longitude: -75.5963,
        name: 'Laureles House',
        otherFixedCosts: 380000,
        rentalMode: RentalMode.Both,
        status: PropertyStatus.Active,
        type: PropertyType.House,
      },
      {
        address: 'Cll 53 #13-20',
        adminFee: 280000,
        city: 'Bogotá',
        estimatedMonthlyRent: 2800000,
        latitude: 4.6418,
        longitude: -74.0645,
        name: 'Chapinero Apartment',
        otherFixedCosts: 300000,
        rentalMode: RentalMode.FixedContract,
        status: PropertyStatus.Active,
        type: PropertyType.Apartment,
      },
      {
        address: 'Cll 119 #5-30',
        adminFee: 520000,
        city: 'Bogotá',
        estimatedMonthlyRent: 5200000,
        latitude: 4.6959,
        longitude: -74.0305,
        name: 'Casa Usaquén',
        otherFixedCosts: 420000,
        rentalMode: RentalMode.Both,
        status: PropertyStatus.Vacant,
        type: PropertyType.House,
      },
      {
        address: 'Cra 5 #3-15',
        adminFee: 210000,
        city: 'Cali',
        estimatedMonthlyRent: 2100000,
        latitude: 3.4455,
        longitude: -76.5412,
        name: 'San Antonio Apartment',
        otherFixedCosts: 180000,
        rentalMode: RentalMode.Airbnb,
        status: PropertyStatus.Active,
        type: PropertyType.Apartment,
      },
      {
        address: 'Vereda La Loma km 4',
        adminFee: 600000,
        city: 'Cali',
        estimatedMonthlyRent: 6000000,
        latitude: 3.4181,
        longitude: -76.5851,
        name: 'La Loma Farm',
        otherFixedCosts: 500000,
        rentalMode: RentalMode.FixedContract,
        status: PropertyStatus.Active,
        type: PropertyType.Farm,
      },
    ];

    const properties = await Promise.all(
      propertyDrafts.map((draft) =>
        this.propertiesRepository.save(
          this.propertiesRepository.create({
            ...draft,
            userId: draft.city === 'Cali' ? user.id : admin.id,
          }),
        ),
      ),
    );

    return properties;
  }
}
