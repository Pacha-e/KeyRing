// --- External imports ---
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

// --- Internal imports ---
import { CreatePropertyDto } from './dto/create-property.dto.js';
import { UpdatePropertyDto } from './dto/update-property.dto.js';
import { Property } from './entities/property.entity.js';
import { PropertiesService } from './properties.service.js';

// --- Exported members ---
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  create(@Body() createPropertyDto: CreatePropertyDto): Promise<Property> {
    return this.propertiesService.create(createPropertyDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Property> {
    return this.propertiesService.findOne(id);
  }

  @Get()
  findVisible(@Query('role') role?: string, @Query('userId') userId?: string): Promise<Property[]> {
    if (role !== undefined && userId !== undefined) {
      return this.propertiesService.findVisible(role, userId);
    }
    return this.propertiesService.findAll();
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.propertiesService.remove(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changes: UpdatePropertyDto,
  ): Promise<Property> {
    return this.propertiesService.update(id, changes);
  }
}
