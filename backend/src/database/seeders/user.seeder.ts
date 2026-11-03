// --- External imports ---
import { Injectable } from '@nestjs/common';
import type { EntityManager } from 'typeorm';

// --- Internal imports ---
import { DateUtils } from '../../common/utils/date-utils.js';
import { PasswordHasher } from '../../common/utils/password-hasher.js';
import { UserRole } from '../../domain/enums/user-role.js';
import { User } from '../../users/entities/user.entity.js';

// --- Exported members ---
@Injectable()
export class UserSeeder {
  async seed(manager: EntityManager): Promise<User[]> {
    const admin = await manager.getRepository(User).save(
      manager.getRepository(User).create({
        city: 'Medellín',
        email: 'admin@keyring.co',
        fullName: 'Admin KeyRing',
        memberSince: DateUtils.isoDaysAgo(400),
        password: await PasswordHasher.hash('admin123'),
        phone: '3001112233',
        role: UserRole.Admin,
      }),
    );
    const user = await manager.getRepository(User).save(
      manager.getRepository(User).create({
        city: 'Bogotá',
        email: 'user@keyring.co',
        fullName: 'Demo User',
        memberSince: DateUtils.isoDaysAgo(200),
        password: await PasswordHasher.hash('user123'),
        phone: '3004445566',
        role: UserRole.User,
      }),
    );

    return [admin, user];
  }
}
