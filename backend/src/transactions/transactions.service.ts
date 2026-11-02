// --- External imports ---
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// --- Internal imports ---
import { Property } from '../properties/entities/property.entity.js';
import type { CreateTransactionDto } from './dto/create-transaction.dto.js';
import type { UpdateTransactionDto } from './dto/update-transaction.dto.js';
import { Transaction } from './entities/transaction.entity.js';

// --- Exported members ---
@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionsRepository: Repository<Transaction>,
    @InjectRepository(Property)
    private readonly propertiesRepository: Repository<Property>,
  ) {}

  private assertValid(draft: Pick<Transaction, 'amount'>): void {
    if (draft.amount <= 0) {
      throw new BadRequestException('The amount must be greater than zero.');
    }
  }

  async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    this.assertValid(createTransactionDto);
    const property = await this.findPropertyOrThrow(createTransactionDto.propertyId);
    const transaction = this.transactionsRepository.create({
      ...createTransactionDto,
      property,
    });
    return this.transactionsRepository.save(transaction);
  }

  findAll(): Promise<Transaction[]> {
    return this.transactionsRepository.find();
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOneBy({ id });
    if (!transaction) throw new NotFoundException(`Transaction ${id} not found`);
    return transaction;
  }

  private async findPropertyOrThrow(propertyId: string): Promise<Property> {
    const property = await this.propertiesRepository.findOneBy({ id: propertyId });
    if (!property) throw new NotFoundException(`Property ${propertyId} not found`);
    return property;
  }

  async findVisible(visiblePropertyIds: string[]): Promise<Transaction[]> {
    const all = await this.findAll();
    const visible = new Set(visiblePropertyIds);
    return all.filter((transaction) => visible.has(transaction.propertyId));
  }

  async remove(id: string): Promise<void> {
    await this.transactionsRepository.delete(id);
  }

  async update(id: string, changes: UpdateTransactionDto): Promise<Transaction> {
    const transaction = await this.findOne(id);
    this.assertValid({ ...transaction, ...changes });
    const property =
      changes.propertyId !== undefined
        ? await this.findPropertyOrThrow(changes.propertyId)
        : transaction.property;
    this.transactionsRepository.merge(transaction, { ...changes, property });
    return this.transactionsRepository.save(transaction);
  }
}
