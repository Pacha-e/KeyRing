// --- External imports ---
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

// --- Internal imports ---
import { CreateUserDto } from './dto/create-user.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import type { SafeUser } from './users.service.js';
import { UsersService } from './users.service.js';

// --- Exported members ---
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<SafeUser> {
    return this.usersService.create(createUserDto);
  }

  // Literal GET routes must be declared before @Get(':id') because Express matches in registration order.
  @Get('email-taken')
  async emailTaken(@Query('email') email: string, @Query('exceptId') exceptId?: string) {
    return { taken: await this.usersService.emailTaken(email, exceptId) };
  }

  @Get()
  findAll(): Promise<SafeUser[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<SafeUser> {
    return this.usersService.findOne(id);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto): Promise<SafeUser> {
    return this.usersService.login(loginDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.usersService.remove(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changes: UpdateUserDto,
  ): Promise<SafeUser> {
    return this.usersService.update(id, changes);
  }
}
