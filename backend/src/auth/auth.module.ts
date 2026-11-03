// --- External imports ---
import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

// --- Internal imports ---
import { Property } from '../properties/entities/property.entity.js';
import { User } from '../users/entities/user.entity.js';
import { AuthGuard, AuthService } from './auth.service.js';

// --- Exported members ---
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Property, User])],
  providers: [AuthService, { provide: APP_GUARD, useClass: AuthGuard }],
  exports: [AuthService],
})
export class AuthModule {}
