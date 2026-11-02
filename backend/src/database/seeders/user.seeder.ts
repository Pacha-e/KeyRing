// --- External imports ---
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// --- Internal imports ---
import { User } from '../../users/entities/user.entity.js';

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
        fullName: 'Admin KeyRing',
        email: 'admin@keyring.co',
        password: 'admin123',
        phone: '3001112233',
        city: 'Medellín',
        memberSince: this.isoDaysAgo(400),
        role: 'admin',
      }),
    );
    const user = await this.usersRepository.save(
      this.usersRepository.create({
        fullName: 'Demo User',
        email: 'user@keyring.co',
        password: 'user123',
        phone: '3004445566',
        city: 'Bogotá',
        memberSince: this.isoDaysAgo(200),
        role: 'user',
      }),
    );

    return [admin, user];
  }
}
