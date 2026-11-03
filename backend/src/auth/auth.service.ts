// --- External imports ---
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import type { Request } from 'express';
import { randomBytes } from 'node:crypto';
import { Repository } from 'typeorm';

// --- Internal imports ---
import { UserRole } from '../domain/enums/user-role.js';
import { Property } from '../properties/entities/property.entity.js';
import { User } from '../users/entities/user.entity.js';

// --- Types ---
export type AuthRequest = Request & { user?: User; token?: string };

// --- Exported members ---
export const Public = () => SetMetadata('public', true);

@Injectable()
export class AuthService {
  private readonly sessions = new Map<string, { userId: string; expires: number }>();

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Property) private readonly properties: Repository<Property>,
  ) {}

  async authenticate(token: string): Promise<User> {
    const session = this.sessions.get(token);
    if (!session || session.expires <= Date.now()) {
      this.sessions.delete(token);
      throw new UnauthorizedException();
    }
    const user = await this.users.findOneBy({ id: session.userId });
    if (!user) {
      this.sessions.delete(token);
      throw new UnauthorizedException();
    }
    return user;
  }

  createSession(userId: string): string {
    for (const [token, session] of this.sessions) {
      if (session.expires <= Date.now()) this.sessions.delete(token);
    }
    const token = randomBytes(32).toString('hex');
    this.sessions.set(token, { userId, expires: Date.now() + 12 * 60 * 60 * 1000 });
    return token;
  }

  async property(user: User, propertyId: string): Promise<void> {
    const property = await this.properties.findOneBy({ id: propertyId });
    if (!property || (user.role !== UserRole.Admin && property.userId !== user.id))
      throw new ForbiddenException();
  }

  revoke(token: string): void {
    this.sessions.delete(token);
  }

  async visibleIds(user: User): Promise<string[]> {
    const properties =
      user.role === UserRole.Admin
        ? await this.properties.find()
        : await this.properties.findBy({ userId: user.id });
    return properties.map((property) => property.id);
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly auth: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const isPublic = this.reflector.getAllAndOverride<boolean>('public', [
      context.getHandler(),
      context.getClass(),
    ]);
    const header = request.headers.authorization;
    if (!header && isPublic) return true;
    const match = /^Bearer ([a-f0-9]{64})$/.exec(header ?? '');
    if (!match) throw new UnauthorizedException();
    request.token = match[1];
    request.user = await this.auth.authenticate(match[1]);
    return true;
  }
}
