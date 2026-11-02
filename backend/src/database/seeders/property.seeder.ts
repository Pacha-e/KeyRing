// --- External imports ---
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// --- Internal imports ---
import { Property } from '../../properties/entities/property.entity.js';
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
        name: 'El Poblado Apartment',
        address: 'Cra 43A #10-25',
        city: 'Medellín',
        type: 'APARTMENT' as const,
        rentalMode: 'AIRBNB' as const,
        status: 'ACTIVE' as const,
        estimatedMonthlyRent: 3200000,
        adminFee: 320000,
        otherFixedCosts: 250000,
        latitude: 6.2086,
        longitude: -75.5676,
      },
      {
        name: 'Laureles House',
        address: 'Cll 33 #78-40',
        city: 'Medellín',
        type: 'HOUSE' as const,
        rentalMode: 'BOTH' as const,
        status: 'ACTIVE' as const,
        estimatedMonthlyRent: 4500000,
        adminFee: 450000,
        otherFixedCosts: 380000,
        latitude: 6.2447,
        longitude: -75.5963,
      },
      {
        name: 'Chapinero Apartment',
        address: 'Cll 53 #13-20',
        city: 'Bogotá',
        type: 'APARTMENT' as const,
        rentalMode: 'FIXED_CONTRACT' as const,
        status: 'ACTIVE' as const,
        estimatedMonthlyRent: 2800000,
        adminFee: 280000,
        otherFixedCosts: 300000,
        latitude: 4.6418,
        longitude: -74.0645,
      },
      {
        name: 'Casa Usaquén',
        address: 'Cll 119 #5-30',
        city: 'Bogotá',
        type: 'HOUSE' as const,
        rentalMode: 'BOTH' as const,
        status: 'VACANT' as const,
        estimatedMonthlyRent: 5200000,
        adminFee: 520000,
        otherFixedCosts: 420000,
        latitude: 4.6959,
        longitude: -74.0305,
      },
      {
        name: 'San Antonio Apartment',
        address: 'Cra 5 #3-15',
        city: 'Cali',
        type: 'APARTMENT' as const,
        rentalMode: 'AIRBNB' as const,
        status: 'ACTIVE' as const,
        estimatedMonthlyRent: 2100000,
        adminFee: 210000,
        otherFixedCosts: 180000,
        latitude: 3.4455,
        longitude: -76.5412,
      },
      {
        name: 'La Loma Farm',
        address: 'Vereda La Loma km 4',
        city: 'Cali',
        type: 'FARM' as const,
        rentalMode: 'FIXED_CONTRACT' as const,
        status: 'ACTIVE' as const,
        estimatedMonthlyRent: 6000000,
        adminFee: 600000,
        otherFixedCosts: 500000,
        latitude: 3.4181,
        longitude: -76.5851,
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
