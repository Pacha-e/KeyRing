import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Contract } from './entities/contract.entity.js'
import { Property } from '../properties/entities/property.entity.js'
import type { CreateContractDto, UpdateContractDto } from './dto/create-contract.dto.js'
import type { ContractStatus } from '../domain/enums.js'

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractsRepository: Repository<Contract>,
    @InjectRepository(Property)
    private readonly propertiesRepository: Repository<Property>,
  ) {}

  /** Todos los contratos registrados. */
  findAll(): Promise<Contract[]> {
    return this.contractsRepository.find()
  }

  /**
   * Contratos de las propiedades visibles para la sesión.
   * @param visiblePropertyIds ids de propiedades que la sesión puede ver
   */
  async findVisible(visiblePropertyIds: string[]): Promise<Contract[]> {
    const all = await this.findAll()
    const visible = new Set(visiblePropertyIds)
    return all.filter((contract) => visible.has(contract.propertyId))
  }

  /**
   * Busca un contrato por id.
   * @throws NotFoundException si no existe
   */
  async findOne(id: string): Promise<Contract> {
    const contract = await this.contractsRepository.findOneBy({ id })
    if (!contract) throw new NotFoundException(`Contrato ${id} no encontrado`)
    return contract
  }

  /** Cantidad de contratos en estado ACTIVE de un conjunto dado. */
  countActive(contracts: Contract[]): number {
    return contracts.filter((contract) => contract.status === 'ACTIVE').length
  }

  /**
   * Regla de negocio compartida por create y update: la vigencia tiene
   * sentido y el canon es positivo. Centralizada aquí para que no exista
   * una segunda copia en el frontend que pueda divergir.
   * @throws BadRequestException con el mensaje en español
   */
  private assertValid(draft: Pick<Contract, 'startDate' | 'endDate' | 'fixedRent'>): void {
    if (draft.fixedRent <= 0) {
      throw new BadRequestException('El canon debe ser mayor que cero.')
    }
    if (draft.startDate >= draft.endDate) {
      throw new BadRequestException('La fecha de inicio debe ser anterior a la de fin.')
    }
  }

  /**
   * Devuelve la propiedad referenciada por un id.
   * @throws NotFoundException si no existe (contrato/transacción huérfana imposible)
   */
  private async findPropertyOrThrow(propertyId: string): Promise<Property> {
    const property = await this.propertiesRepository.findOneBy({ id: propertyId })
    if (!property) throw new NotFoundException(`Propiedad ${propertyId} no encontrada`)
    return property
  }

  async create(createContractDto: CreateContractDto): Promise<Contract> {
    this.assertValid(createContractDto)
    const property = await this.findPropertyOrThrow(createContractDto.propertyId)
    const contract = this.contractsRepository.create({
      ...createContractDto,
      property,
    })
    return this.contractsRepository.save(contract)
  }

  async update(id: string, changes: UpdateContractDto): Promise<Contract> {
    const contract = await this.findOne(id)
    this.assertValid({ ...contract, ...changes })
    const property =
      changes.propertyId !== undefined
        ? await this.findPropertyOrThrow(changes.propertyId)
        : contract.property
    this.contractsRepository.merge(contract, { ...changes, property })
    return this.contractsRepository.save(contract)
  }

  async remove(id: string): Promise<void> {
    await this.contractsRepository.delete(id)
  }
}
