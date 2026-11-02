// --- External imports ---
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// --- Internal imports ---
import { PasswordHasher } from '../../common/utils/password-hasher.js';
import { User } from '../../users/entities/user.entity.js';
import { UserRole } from '../../domain/enums/user-role.js';

// --- Exported members ---
@Injectable()
export class UserSeeder {
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {}

  private isoDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().slice(0, 10);
  }

  async seed(): Promise<User[]> {
    if (await this.usersRepository.count()) return this.usersRepository.find();
    const admin = await this.usersRepository.save(
      this.usersRepository.create({
        city: 'Medellín',
        email: 'admin@keyring.co',
        fullName: 'Admin KeyRing',
        memberSince: this.isoDaysAgo(400),
        password: await PasswordHasher.hash('admin123'),
        phone: '3001112233',
        role: UserRole.Admin,
      }),
    );
    const user = await this.usersRepository.save(
      this.usersRepository.create({
        city: 'Bogotá',
        email: 'user@keyring.co',
        fullName: 'Demo User',
        memberSince: this.isoDaysAgo(200),
        password: await PasswordHasher.hash('user123'),
        phone: '3004445566',
        role: UserRole.User,
      }),
    );

    return [admin, user];
  }
}
