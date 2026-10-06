import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { PropertiesService } from './properties.service.js'
import { Property } from './entities/property.entity.js'
import { CreatePropertyDto, UpdatePropertyDto } from './dto/create-property.dto.js'

@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  /**
   * GET /api/properties — todo, o solo lo visible para la sesión.
   * Sin query devuelve todo, como en los reportes del administrador;
   * con role+userId aplica la regla de visibilidad por dueño.
   */
  @Get()
  findVisible(
    @Query('role') role?: string,
    @Query('userId') userId?: string,
  ): Promise<Property[]> {
    if (role !== undefined && userId !== undefined) {
      return this.propertiesService.findVisible(role, userId)
    }
    return this.propertiesService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Property> {
    return this.propertiesService.findOne(id)
  }

  @Post()
  create(@Body() createPropertyDto: CreatePropertyDto): Promise<Property> {
    return this.propertiesService.create(createPropertyDto)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() changes: UpdatePropertyDto,
  ): Promise<Property> {
    return this.propertiesService.update(id, changes)
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    await this.propertiesService.remove(id)
  }
}
