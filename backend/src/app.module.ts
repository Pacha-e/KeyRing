import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { HomeModule } from './home/home.module.js'
import { UsersModule } from './users/users.module.js'
import { PropertiesModule } from './properties/properties.module.js'
import { ContractsModule } from './contracts/contracts.module.js'
import { TransactionsModule } from './transactions/transactions.module.js'
import { SeedModule } from './seed/seed.module.js'

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.SQLITE_PATH ?? 'database.sqlite',
      autoLoadEntities: true,
      synchronize: true,
    }),
    HomeModule,
    UsersModule,
    PropertiesModule,
    ContractsModule,
    TransactionsModule,
    SeedModule,
  ],
})
export class AppModule {}
