// --- External imports ---
import { Injectable } from '@nestjs/common';
import type { EntityManager } from 'typeorm';

// --- Internal imports ---
import { DateUtils } from '../../common/utils/date-utils.js';
import { Contract } from '../../contracts/entities/contract.entity.js';
import { ContractStatus } from '../../domain/enums/contract-status.js';
import { Property } from '../../properties/entities/property.entity.js';

// --- Exported members ---
@Injectable()
export class ContractSeeder {
  async seed(manager: EntityManager, properties: Property[]): Promise<void> {
    const contracts = [
      {
        endDate: DateUtils.isoDaysAgo(-215),
        fixedRent: 4200000,
        property: properties[1],
        startDate: DateUtils.isoDaysAgo(150),
        status: ContractStatus.Active,
        tenantContact: '3105551234',
        tenantName: 'Carlos Ríos',
      },
      {
        endDate: DateUtils.isoDaysAgo(-275),
        fixedRent: 2600000,
        property: properties[2],
        startDate: DateUtils.isoDaysAgo(90),
        status: ContractStatus.Active,
        tenantContact: '3116662345',
        tenantName: 'María Gómez',
      },
      {
        endDate: DateUtils.isoDaysAgo(-65),
        fixedRent: 5800000,
        property: properties[5],
        startDate: DateUtils.isoDaysAgo(300),
        status: ContractStatus.Active,
        tenantContact: '6027778899',
        tenantName: 'Finca Eventos SAS',
      },
      {
        endDate: DateUtils.isoDaysAgo(135),
        fixedRent: 5000000,
        property: properties[3],
        startDate: DateUtils.isoDaysAgo(500),
        status: ContractStatus.Expired,
        tenantContact: '3158889900',
        tenantName: 'Pedro Sandoval',
      },
    ];
    await Promise.all(
      contracts.map((draft) =>
        manager.getRepository(Contract).save(manager.getRepository(Contract).create(draft)),
      ),
    );
  }
}
