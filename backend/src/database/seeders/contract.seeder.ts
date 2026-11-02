// --- External imports ---
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// --- Internal imports ---
import { Contract } from '../../contracts/entities/contract.entity.js';
import { Property } from '../../properties/entities/property.entity.js';

// --- Exported members ---
@Injectable()
export class ContractSeeder {
  constructor(
    @InjectRepository(Contract) private readonly contractsRepository: Repository<Contract>,
  ) {}

  private isoDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().slice(0, 10);
  }

  async seed(properties: Property[]): Promise<void> {
    if (await this.contractsRepository.count()) return;
    const contracts = [
      {
        property: properties[1],
        fixedRent: 4200000,
        startDate: this.isoDaysAgo(150),
        endDate: this.isoDaysAgo(-215),
        tenantName: 'Carlos Ríos',
        tenantContact: '3105551234',
        status: 'ACTIVE' as const,
      },
      {
        property: properties[2],
        fixedRent: 2600000,
        startDate: this.isoDaysAgo(90),
        endDate: this.isoDaysAgo(-275),
        tenantName: 'María Gómez',
        tenantContact: '3116662345',
        status: 'ACTIVE' as const,
      },
      {
        property: properties[5],
        fixedRent: 5800000,
        startDate: this.isoDaysAgo(300),
        endDate: this.isoDaysAgo(-65),
        tenantName: 'Finca Eventos SAS',
        tenantContact: '6027778899',
        status: 'ACTIVE' as const,
      },
      {
        property: properties[3],
        fixedRent: 5000000,
        startDate: this.isoDaysAgo(500),
        endDate: this.isoDaysAgo(135),
        tenantName: 'Pedro Sandoval',
        tenantContact: '3158889900',
        status: 'EXPIRED' as const,
      },
    ];
    await Promise.all(
      contracts.map((draft) =>
        this.contractsRepository.save(this.contractsRepository.create(draft)),
      ),
    );
  }
}
