// --- External imports ---
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// --- Internal imports ---
import { Contract } from '../../contracts/entities/contract.entity.js';
import { ContractStatus } from '../../domain/enums/contract-status.js';
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
        endDate: this.isoDaysAgo(-215),
        fixedRent: 4200000,
        property: properties[1],
        startDate: this.isoDaysAgo(150),
        status: ContractStatus.Active,
        tenantContact: '3105551234',
        tenantName: 'Carlos Ríos',
      },
      {
        endDate: this.isoDaysAgo(-275),
        fixedRent: 2600000,
        property: properties[2],
        startDate: this.isoDaysAgo(90),
        status: ContractStatus.Active,
        tenantContact: '3116662345',
        tenantName: 'María Gómez',
      },
      {
        endDate: this.isoDaysAgo(-65),
        fixedRent: 5800000,
        property: properties[5],
        startDate: this.isoDaysAgo(300),
        status: ContractStatus.Active,
        tenantContact: '6027778899',
        tenantName: 'Finca Eventos SAS',
      },
      {
        endDate: this.isoDaysAgo(135),
        fixedRent: 5000000,
        property: properties[3],
        startDate: this.isoDaysAgo(500),
        status: ContractStatus.Expired,
        tenantContact: '3158889900',
        tenantName: 'Pedro Sandoval',
      },
    ];
    await Promise.all(
      contracts.map((draft) =>
        this.contractsRepository.save(this.contractsRepository.create(draft)),
      ),
    );
  }
}
