// --- External imports ---
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// --- Internal imports ---
import { User } from './entities/user.entity.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

// --- Exported members ---
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
