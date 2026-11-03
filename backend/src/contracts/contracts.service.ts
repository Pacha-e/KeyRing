// --- External imports ---
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// --- Internal imports ---
import { ContractStatus } from '../domain/enums/contract-status.js';
import { Property } from '../properties/entities/property.entity.js';
import type { CreateContractDto } from './dto/create-contract.dto.js';
import type { UpdateContractDto } from './dto/update-contract.dto.js';
import { Contract } from './entities/contract.entity.js';

// --- Exported members ---
@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractsRepository: Repository<Contract>,
    @InjectRepository(Property)
    private readonly propertiesRepository: Repository<Property>,
  ) {}

  countActive(contracts: Contract[]): number {
    return contracts.filter((contract) => contract.status === ContractStatus.Active).length;
  }

  async create(createContractDto: CreateContractDto): Promise<Contract> {
    this.assertValid(createContractDto);
    const property = await this.findPropertyOrThrow(createContractDto.propertyId);
    const contract = this.contractsRepository.create({
      ...createContractDto,
      property,
    });
    return this.contractsRepository.save(contract);
  }

  findAll(): Promise<Contract[]> {
    return this.contractsRepository.find();
  }

  async findOne(id: string): Promise<Contract> {
    const contract = await this.contractsRepository.findOneBy({ id });
    if (!contract) throw new NotFoundException(`Contract ${id} not found`);
    return contract;
  }

  async findVisible(visiblePropertyIds: string[]): Promise<Contract[]> {
    const all = await this.findAll();
    const visible = new Set(visiblePropertyIds);
    return all.filter((contract) => visible.has(contract.propertyId));
  }

  async remove(id: string): Promise<void> {
    await this.contractsRepository.delete(id);
  }

  async update(id: string, changes: UpdateContractDto): Promise<Contract> {
    const contract = await this.findOne(id);
    this.assertValid({ ...contract, ...changes });
    const property =
      changes.propertyId !== undefined
        ? await this.findPropertyOrThrow(changes.propertyId)
        : contract.property;
    this.contractsRepository.merge(contract, { ...changes, property });
    return this.contractsRepository.save(contract);
  }

  private assertValid(draft: Pick<Contract, 'startDate' | 'endDate' | 'fixedRent'>): void {
    if (draft.fixedRent <= 0) {
      throw new BadRequestException('Rent must be greater than zero.');
    }
    if (draft.startDate >= draft.endDate) {
      throw new BadRequestException('The start date must be before the end date.');
    }
  }

  private async findPropertyOrThrow(propertyId: string): Promise<Property> {
    const property = await this.propertiesRepository.findOneBy({ id: propertyId });
    if (!property) throw new NotFoundException(`Property ${propertyId} not found`);
    return property;
  }
}
