import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from '../users/entities/user.entity.js'
import { Property } from '../properties/entities/property.entity.js'
import { Contract } from '../contracts/entities/contract.entity.js'
import { Transaction } from '../transactions/entities/transaction.entity.js'
import { SeedService } from './seed.service.js'

/** Registra el sembrado de datos como proveedor del módulo raíz. */
@Module({
  imports: [TypeOrmModule.forFeature([User, Property, Contract, Transaction])],
  providers: [SeedService],
})
export class SeedModule {}
