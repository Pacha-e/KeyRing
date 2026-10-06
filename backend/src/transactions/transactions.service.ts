import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Transaction } from './entities/transaction.entity.js'
import { Property } from '../properties/entities/property.entity.js'
import type { CreateTransactionDto, UpdateTransactionDto } from './dto/create-transaction.dto.js'

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    @InjectRepository(Property)
    private readonly propertiesRepository: Repository<Property>,
  ) {}

  /** Todas las transacciones registradas. */
  findAll(): Promise<Transaction[]> {
    return this.transactionsRepository.find()
  }

  /**
   * Transacciones de las propiedades visibles para la sesión.
   * @param visiblePropertyIds ids de propiedades que la sesión puede ver
   */
  async findVisible(visiblePropertyIds: string[]): Promise<Transaction[]> {
    const all = await this.findAll()
    const visible = new Set(visiblePropertyIds)
    return all.filter((transaction) => visible.has(transaction.propertyId))
  }

  /**
   * Busca una transacción por id.
   * @throws NotFoundException si no existe
   */
  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOneBy({ id })
    if (!transaction) throw new NotFoundException(`Transacción ${id} no encontrada`)
    return transaction
  }

  /**
   * Regla de negocio compartida por create y update: el monto es positivo.
   * @throws BadRequestException con el mensaje en español
   */
  private assertValid(draft: Pick<Transaction, 'amount'>): void {
    if (draft.amount <= 0) {
      throw new BadRequestException('El monto debe ser mayor que cero.')
    }
  }

  async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    this.assertValid(createTransactionDto)
    const property = await this.findPropertyOrThrow(createTransactionDto.propertyId)
    const transaction = this.transactionsRepository.create({
      ...createTransactionDto,
      property,
    })
    return this.transactionsRepository.save(transaction)
  }

  async update(id: string, changes: UpdateTransactionDto): Promise<Transaction> {
    const transaction = await this.findOne(id)
    this.assertValid({ ...transaction, ...changes })
    const property =
      changes.propertyId !== undefined
        ? await this.findPropertyOrThrow(changes.propertyId)
        : transaction.property
    this.transactionsRepository.merge(transaction, { ...changes, property })
    return this.transactionsRepository.save(transaction)
  }

  async remove(id: string): Promise<void> {
    await this.transactionsRepository.delete(id)
  }

  /**
   * Devuelve la propiedad referenciada por un id.
   * @throws NotFoundException si no existe (transacción huérfana imposible)
   */
  private async findPropertyOrThrow(propertyId: string): Promise<Property> {
    const property = await this.propertiesRepository.findOneBy({ id: propertyId })
    if (!property) throw new NotFoundException(`Propiedad ${propertyId} no encontrada`)
    return property
  }
}
