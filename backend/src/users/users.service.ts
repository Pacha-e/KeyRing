// --- External imports ---
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// --- Internal imports ---
import { DateUtils } from '../common/utils/date-utils.js';
import { PasswordHasher } from '../common/utils/password-hasher.js';
import { UserRole } from '../domain/enums/user-role.js';
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
    if (user.role === UserRole.Admin && (await this.countAdmins()) <= 1) {
      return 'You cannot delete the last system administrator.';
    }
    return null;
  }

  countAdmins(): Promise<number> {
    return this.usersRepository.count({ where: { role: UserRole.Admin } });
  }

  async create(createUserDto: CreateUserDto): Promise<SafeUser> {
    const user = this.usersRepository.create({
      ...createUserDto,
      memberSince: createUserDto.memberSince ?? DateUtils.todayBogota(),
      password: await PasswordHasher.hash(createUserDto.password),
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
    if (!user || !(await PasswordHasher.matches(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.stripPassword(user);
  }

  async remove(id: string, currentUserId: string): Promise<void> {
    const result = await this.usersRepository
      .createQueryBuilder()
      .delete()
      .where('id = :id AND id != :currentUserId', { id, currentUserId })
      .andWhere('(role != :admin OR (SELECT COUNT(*) FROM "user" WHERE role = :admin) > 1)', {
        admin: UserRole.Admin,
      })
      .execute();
    if (!result.affected) throw new ForbiddenException('Cannot delete this user.');
  }

  async update(id: string, changes: UpdateUserDto): Promise<SafeUser> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    const values = {
      ...changes,
      ...(changes.password !== undefined
        ? { password: await PasswordHasher.hash(changes.password) }
        : {}),
    };
    if (Object.keys(values).length === 0) return this.stripPassword(user);
    const query = this.usersRepository
      .createQueryBuilder()
      .update()
      .set(values)
      .where('id = :id', { id });
    if (changes.role !== undefined && changes.role !== UserRole.Admin) {
      query.andWhere('(role != :admin OR (SELECT COUNT(*) FROM "user" WHERE role = :admin) > 1)', {
        admin: UserRole.Admin,
      });
    }
    const result = await query.execute();
    if (!result.affected)
      throw new ForbiddenException('You cannot demote the last system administrator.');
    return this.findOne(id);
  }
  private stripPassword(user: User): SafeUser {
    const { password: _password, ...safe } = user;
    return safe;
  }

  private async stripPasswords(users: Promise<User[]>): Promise<SafeUser[]> {
    const all = await users;
    return all.map((user) => this.stripPassword(user));
  }
}
