import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { UsersService } from './users.service.js'
import type { SafeUser } from './users.service.js'
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto.js'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** GET /api/users?ownerId=... — lista, o las propiedades de un dueño. */
  @Get()
  findAll(): Promise<SafeUser[]> {
    return this.usersService.findAll()
  }

  @Get('login')
  async login(
    @Query('email') email: string,
    @Query('password') password: string,
  ): Promise<SafeUser | null> {
    return this.usersService.login(email, password)
  }

  @Get('email-taken')
  async emailTaken(@Query('email') email: string, @Query('exceptId') exceptId?: string) {
    return { taken: await this.usersService.emailTaken(email, exceptId) }
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<SafeUser> {
    return this.usersService.findOne(id)
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<SafeUser> {
    return this.usersService.create(createUserDto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() changes: UpdateUserDto): Promise<SafeUser> {
    return this.usersService.update(id, changes)
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.usersService.remove(id)
  }
}
