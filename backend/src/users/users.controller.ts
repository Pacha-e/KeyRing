// --- External imports ---
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';

// --- Internal imports ---
import { AuthService, Public } from '../auth/auth.service.js';
import type { AuthRequest } from '../auth/auth.service.js';
import { UserRole } from '../domain/enums/user-role.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import type { SafeUser } from './users.service.js';
import { UsersService } from './users.service.js';

// --- Exported members ---
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auth: AuthService,
  ) {}

  @Public()
  @Post()
  create(@Body() dto: CreateUserDto, @Req() request: AuthRequest): Promise<SafeUser> {
    if (dto.role === UserRole.Admin && request.user?.role !== UserRole.Admin)
      throw new ForbiddenException();
    return this.usersService.create(dto);
  }

  // Literal routes precede :id because Express matches in registration order.
  @Public()
  @Get('email-taken')
  async emailTaken(@Query('email') email: string, @Query('exceptId') exceptId?: string) {
    return { taken: await this.usersService.emailTaken(email, exceptId) };
  }

  @Get()
  findAll(@Req() request: AuthRequest): Promise<SafeUser[]> {
    if (request.user!.role !== UserRole.Admin) throw new ForbiddenException();
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() request: AuthRequest): Promise<SafeUser> {
    if (request.user!.role !== UserRole.Admin && request.user!.id !== id)
      throw new ForbiddenException();
    return this.usersService.findOne(id);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<{ user: SafeUser; token: string }> {
    const user = await this.usersService.login(dto);
    return { user, token: this.auth.createSession(user.id) };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Req() request: AuthRequest): void {
    this.auth.revoke(request.token!);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() request: AuthRequest): Promise<void> {
    if (request.user!.role !== UserRole.Admin) throw new ForbiddenException();
    const reason = await this.usersService.blockedFromRemoval(id, request.user!.id);
    if (reason) throw new ForbiddenException(reason);
    await this.usersService.remove(id, request.user!.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changes: UpdateUserDto,
    @Req() request: AuthRequest,
  ): Promise<SafeUser> {
    if (
      request.user!.role !== UserRole.Admin &&
      (request.user!.id !== id || changes.role !== undefined)
    )
      throw new ForbiddenException();
    return this.usersService.update(id, changes);
  }
}
