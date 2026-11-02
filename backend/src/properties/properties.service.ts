// --- External imports ---
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// --- Internal imports ---
import type { CreatePropertyDto } from './dto/create-property.dto.js';
import type { UpdatePropertyDto } from './dto/update-property.dto.js';
import { Property } from './entities/property.entity.js';

// --- Exported members ---
@Injectable()
export class PropertiesService {
  constructor(
    @InjectRepository(Property)
    private readonly propertiesRepository: Repository<Property>,
  ) {}

  cities(properties: Property[]): string[] {
    return [...new Set(properties.map((property) => property.city))].sort();
  }

  countByType(properties: Property[]): Record<string, number> {
    return properties.reduce<Record<string, number>>((totals, property) => {
      totals[property.type] = (totals[property.type] ?? 0) + 1;
      return totals;
    }, {});
  }

  async create(createPropertyDto: CreatePropertyDto): Promise<Property> {
    const property = this.propertiesRepository.create(createPropertyDto);
    return this.propertiesRepository.save(property);
  }

  findAll(): Promise<Property[]> {
    return this.propertiesRepository.find();
  }

  async findOne(id: string): Promise<Property> {
    const property = await this.propertiesRepository.findOneBy({ id });
    if (!property) throw new NotFoundException(`Property ${id} not found`);
    return property;
  }

  async findVisible(role: string, userId: string): Promise<Property[]> {
    if (role === 'admin') return this.findAll();
    return this.propertiesRepository.find({ where: { userId } });
  }

  async remove(id: string): Promise<void> {
    await this.propertiesRepository.delete(id);
  }

  async update(id: string, changes: UpdatePropertyDto): Promise<Property> {
    const property = await this.findOne(id);
    this.propertiesRepository.merge(property, changes);
    return this.propertiesRepository.save(property);
  }
}
