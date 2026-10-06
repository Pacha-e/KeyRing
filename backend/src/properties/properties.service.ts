import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Property } from './entities/property.entity.js'
import type { CreatePropertyDto, UpdatePropertyDto } from './dto/create-property.dto.js'

@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private readonly propertiesRepository: Repository<Property>,
  ) {}

  /** Todas las propiedades registradas. */
  findAll(): Promise<Property[]> {
    return this.propertiesRepository.find()
  }

  /**
   * Propiedades visibles para una sesión: el admin ve todo, el propietario
   * solo las suyas. Es la regla de visibilidad que ya cumplía el frontend.
   * @param role rol del usuario en sesión
   * @param userId id del usuario en sesión
   */
  async findVisible(role: string, userId: string): Promise<Property[]> {
    if (role === 'admin') return this.findAll()
    return this.propertiesRepository.find({ where: { ownerId: userId } })
  }

  /**
   * Busca una propiedad por id.
   * @throws NotFoundException si no existe
   */
  async findOne(id: string): Promise<Property> {
    const property = await this.propertiesRepository.findOneBy({ id })
    if (!property) throw new NotFoundException(`Propiedad ${id} no encontrada`)
    return property
  }

  /** Ciudades distintas presentes en un conjunto de propiedades. */
  cities(properties: Property[]): string[] {
    return [...new Set(properties.map((property) => property.city))].sort()
  }

  /** Cuenta las propiedades agrupadas por tipo, para los gráficos. */
  countByType(properties: Property[]): Record<string, number> {
    return properties.reduce<Record<string, number>>((totals, property) => {
      totals[property.type] = (totals[property.type] ?? 0) + 1
      return totals
    }, {})
  }

  async create(createPropertyDto: CreatePropertyDto): Promise<Property> {
    const property = this.propertiesRepository.create(createPropertyDto)
    return this.propertiesRepository.save(property)
  }

  async update(id: string, changes: UpdatePropertyDto): Promise<Property> {
    const property = await this.findOne(id)
    this.propertiesRepository.merge(property, changes)
    return this.propertiesRepository.save(property)
  }

  async remove(id: string): Promise<void> {
    await this.propertiesRepository.delete(id)
  }
}
