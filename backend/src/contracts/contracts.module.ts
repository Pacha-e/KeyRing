// --- External imports ---
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// --- Internal imports ---
import { Property } from '../properties/entities/property.entity.js';
import { ContractsController } from './contracts.controller.js';
import { ContractsService } from './contracts.service.js';
import { Contract } from './entities/contract.entity.js';

// --- Exported members ---
@Module({
  imports: [TypeOrmModule.forFeature([Contract, Property])],
  controllers: [ContractsController],
  providers: [ContractsService],
})
export class ContractsModule {}
