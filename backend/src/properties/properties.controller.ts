// --- External imports ---
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
} from '@nestjs/common';

// --- Internal imports ---
import { AuthService } from '../auth/auth.service.js';
import type { AuthRequest } from '../auth/auth.service.js';
import { UserRole } from '../domain/enums/user-role.js';
import { CreatePropertyDto } from './dto/create-property.dto.js';
import { UpdatePropertyDto } from './dto/update-property.dto.js';
import { Property } from './entities/property.entity.js';
import { PropertiesService } from './properties.service.js';

// --- Exported members ---
@Controller('properties')
export class PropertiesController {
  constructor(
    private readonly propertiesService: PropertiesService,
    private readonly auth: AuthService,
  ) {}

  @Post()
  create(@Body() dto: CreatePropertyDto, @Req() request: AuthRequest): Promise<Property> {
    if (request.user!.role !== UserRole.Admin) {
      if (dto.userId != null && dto.userId !== request.user!.id) throw new ForbiddenException();
      dto.userId = request.user!.id;
    }
    return this.propertiesService.create(dto);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: AuthRequest,
  ): Promise<Property> {
    await this.auth.property(request.user!, id);
    return this.propertiesService.findOne(id);
  }

  @Get()
  findVisible(@Req() request: AuthRequest): Promise<Property[]> {
    return this.propertiesService.findVisible(request.user!.role, request.user!.id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() request: AuthRequest): Promise<void> {
    await this.auth.property(request.user!, id);
    await this.propertiesService.remove(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changes: UpdatePropertyDto,
    @Req() request: AuthRequest,
  ): Promise<Property> {
    await this.auth.property(request.user!, id);
    if (
      request.user!.role !== UserRole.Admin &&
      changes.userId !== undefined &&
      changes.userId !== request.user!.id
    )
      throw new ForbiddenException();
    return this.propertiesService.update(id, changes);
  }
}
