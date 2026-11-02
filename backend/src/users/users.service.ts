// --- External imports ---
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// --- Internal imports ---
import type { UserRole } from '../domain/enums/user-role.js';
import type { CreateUserDto } from './dto/create-user.dto.js';
import type { LoginDto } from './dto/login.dto.js';
import type { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './entities/user.entity.js';

// --- Types ---
export type SafeUser = Omit<User, 'password'>;

// --- Exported members ---
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async blockedFromRemoval(id: string, currentUserId: string): Promise<string | null> {
    if (id === currentUserId) return 'You cannot delete your own user.';
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) return 'The user no longer exists.';
    if (user.role === 'admin' && (await this.countAdmins()) <= 1) {
      return 'You cannot delete the last system administrator.';
    }
    return null;
  }

  countAdmins(): Promise<number> {
    return this.usersRepository.count({ where: { role: 'admin' as UserRole } });
  }

  async create(createUserDto: CreateUserDto): Promise<SafeUser> {
    const user = this.usersRepository.create({
      ...createUserDto,
      memberSince: createUserDto.memberSince ?? new Date().toISOString().slice(0, 10),
    });
    return this.stripPassword(await this.usersRepository.save(user));
  }

  async emailTaken(email: string, exceptId?: string): Promise<boolean> {
    const existing = await this.usersRepository.findOneBy({ email });
    return existing !== null && existing.id !== exceptId;
  }

  findAll(): Promise<SafeUser[]> {
    return this.stripPasswords(this.usersRepository.find());
  }

  async findOne(id: string): Promise<SafeUser> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return this.stripPassword(user);
  }

  async login(loginDto: LoginDto): Promise<SafeUser> {
    const user = await this.usersRepository.findOneBy({ email: loginDto.email });
    if (!user || user.password !== loginDto.password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.stripPassword(user);
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  private stripPassword(user: User): SafeUser {
    const { password: _password, ...safe } = user;
    return safe;
  }

  private async stripPasswords(users: Promise<User[]>): Promise<SafeUser[]> {
    const all = await users;
    return all.map((user) => this.stripPassword(user));
  }

  async update(id: string, changes: UpdateUserDto): Promise<SafeUser> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    this.usersRepository.merge(user, changes);
    return this.stripPassword(await this.usersRepository.save(user));
  }
}
