// --- External imports ---
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// --- Internal imports ---
import { ContractsModule } from './contracts/contracts.module.js';
import { dataSource } from './database/data-source.js';
import { SeedModule } from './database/seeders/seed.module.js';
import { PropertiesModule } from './properties/properties.module.js';
import { TransactionsModule } from './transactions/transactions.module.js';
import { UsersModule } from './users/users.module.js';

// --- Exported members ---
@Module({
  imports: [
    TypeOrmModule.forRoot(dataSource.options),
    UsersModule,
    PropertiesModule,
    ContractsModule,
    TransactionsModule,
    SeedModule,
  ],
})
export class AppModule {}
