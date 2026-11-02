// --- External imports ---
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// --- Internal imports ---
import { Property } from '../properties/entities/property.entity.js';
import { Transaction } from './entities/transaction.entity.js';
import { TransactionsController } from './transactions.controller.js';
import { TransactionsService } from './transactions.service.js';

// --- Exported members ---
@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Property])],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
