// --- External imports ---
import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

// --- Internal imports ---
import { Contract } from '../../contracts/entities/contract.entity.js';
import { Property } from '../../properties/entities/property.entity.js';
import { Transaction } from '../../transactions/entities/transaction.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { ContractSeeder } from './contract.seeder.js';
import { PropertySeeder } from './property.seeder.js';
import { TransactionSeeder } from './transaction.seeder.js';
import { UserSeeder } from './user.seeder.js';

// --- Exported members ---
@Injectable()
export class SeedRunner implements OnModuleInit {
  constructor(
    private readonly contractSeeder: ContractSeeder,
    private readonly dataSource: DataSource,
    private readonly propertySeeder: PropertySeeder,
    private readonly transactionSeeder: TransactionSeeder,
    private readonly userSeeder: UserSeeder,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const counts = await Promise.all([
        manager.count(Contract),
        manager.count(Property),
        manager.count(Transaction),
        manager.count(User),
      ]);
      if (counts.some((count) => count > 0)) return;
      const users = await this.userSeeder.seed(manager);
      const properties = await this.propertySeeder.seed(manager, users);
      await this.contractSeeder.seed(manager, properties);
      await this.transactionSeeder.seed(manager, properties);
    });
  }
}
