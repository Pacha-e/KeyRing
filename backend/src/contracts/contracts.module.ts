import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Contract } from './entities/contract.entity.js'
import { Property } from '../properties/entities/property.entity.js'
import { ContractsController } from './contracts.controller.js'
import { ContractsService } from './contracts.service.js'

@Module({
  imports: [TypeOrmModule.forFeature([Contract, Property])],
  controllers: [ContractsController],
  providers: [ContractsService],
})
export class ContractsModule {}
