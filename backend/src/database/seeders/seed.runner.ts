// --- External imports ---
import { Injectable, OnModuleInit } from '@nestjs/common';

// --- Internal imports ---
import { ContractSeeder } from './contract.seeder.js';
import { PropertySeeder } from './property.seeder.js';
import { TransactionSeeder } from './transaction.seeder.js';
import { UserSeeder } from './user.seeder.js';

// --- Exported members ---
@Injectable()
export class SeedRunner implements OnModuleInit {
  constructor(
    private readonly contractSeeder: ContractSeeder,
    private readonly propertySeeder: PropertySeeder,
    private readonly transactionSeeder: TransactionSeeder,
    private readonly userSeeder: UserSeeder,
  ) {}

  async onModuleInit(): Promise<void> {
    const users = await this.userSeeder.seed();
    const properties = await this.propertySeeder.seed(users);
    if (properties.length >= 6) {
      await this.contractSeeder.seed(properties);
      await this.transactionSeeder.seed(properties);
    }
  }
}
