// --- External imports ---
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// --- Internal imports ---
import { Contract } from '../../contracts/entities/contract.entity.js';
import { Property } from '../../properties/entities/property.entity.js';
import { Transaction } from '../../transactions/entities/transaction.entity.js';
import { User } from '../../users/entities/user.entity.js';
import { ContractSeeder } from './contract.seeder.js';
import { PropertySeeder } from './property.seeder.js';
import { SeedRunner } from './seed.runner.js';
import { TransactionSeeder } from './transaction.seeder.js';
import { UserSeeder } from './user.seeder.js';

// --- Exported members ---
@Module({
  imports: [TypeOrmModule.forFeature([Contract, Property, Transaction, User])],
  providers: [ContractSeeder, PropertySeeder, SeedRunner, TransactionSeeder, UserSeeder],
})
export class SeedModule {}
