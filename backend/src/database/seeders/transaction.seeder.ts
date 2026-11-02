// --- External imports ---
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// --- Internal imports ---
import { Property } from '../../properties/entities/property.entity.js';
import { Transaction } from '../../transactions/entities/transaction.entity.js';
import { TransactionSource } from '../../domain/enums/transaction-source.js';
import { TransactionType } from '../../domain/enums/transaction-type.js';

// --- Exported members ---
@Injectable()
export class TransactionSeeder {
  constructor(
    @InjectRepository(Transaction) private readonly transactionsRepository: Repository<Transaction>,
  ) {}

  private isoDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().slice(0, 10);
  }

  async seed(properties: Property[]): Promise<void> {
    if (await this.transactionsRepository.count()) return;
    const transactions = [
      {
        amount: 950000,
        date: this.isoDaysAgo(5),
        description: 'Airbnb reservation, 3 nights',
        property: properties[0],
        source: TransactionSource.Airbnb,
        type: TransactionType.Income,
      },
      {
        amount: 1200000,
        date: this.isoDaysAgo(20),
        description: 'Airbnb reservation, 4 nights',
        property: properties[0],
        source: TransactionSource.Airbnb,
        type: TransactionType.Income,
      },
      {
        amount: 180000,
        date: this.isoDaysAgo(22),
        description: 'Cleaning and laundry',
        property: properties[0],
        source: TransactionSource.Other,
        type: TransactionType.Expense,
      },
      {
        amount: 4200000,
        date: this.isoDaysAgo(3),
        description: 'Monthly rent',
        property: properties[1],
        source: TransactionSource.Contract,
        type: TransactionType.Income,
      },
      {
        amount: 450000,
        date: this.isoDaysAgo(10),
        description: 'Administration and utilities',
        property: properties[1],
        source: TransactionSource.Other,
        type: TransactionType.Expense,
      },
      {
        amount: 2600000,
        date: this.isoDaysAgo(7),
        description: 'Monthly rent',
        property: properties[2],
        source: TransactionSource.Contract,
        type: TransactionType.Income,
      },
      {
        amount: 2600000,
        date: this.isoDaysAgo(37),
        description: 'Monthly rent',
        property: properties[2],
        source: TransactionSource.Contract,
        type: TransactionType.Income,
      },
      {
        amount: 700000,
        date: this.isoDaysAgo(12),
        description: 'Airbnb reservation, 2 nights',
        property: properties[4],
        source: TransactionSource.Airbnb,
        type: TransactionType.Income,
      },
      {
        amount: 1050000,
        date: this.isoDaysAgo(45),
        description: 'Airbnb reservation, 3 nights',
        property: properties[4],
        source: TransactionSource.Airbnb,
        type: TransactionType.Income,
      },
      {
        amount: 5800000,
        date: this.isoDaysAgo(2),
        description: 'Monthly rent',
        property: properties[5],
        source: TransactionSource.Contract,
        type: TransactionType.Income,
      },
      {
        amount: 600000,
        date: this.isoDaysAgo(15),
        description: 'Garden maintenance',
        property: properties[5],
        source: TransactionSource.Other,
        type: TransactionType.Expense,
      },
      {
        amount: 320000,
        date: this.isoDaysAgo(60),
        description: 'Plumbing repair',
        property: properties[1],
        source: TransactionSource.Other,
        type: TransactionType.Expense,
      },
      {
        amount: 880000,
        date: this.isoDaysAgo(70),
        description: 'Airbnb reservation, 3 nights',
        property: properties[0],
        source: TransactionSource.Airbnb,
        type: TransactionType.Income,
      },
    ];
    await Promise.all(
      transactions.map((draft) =>
        this.transactionsRepository.save(this.transactionsRepository.create(draft)),
      ),
    );
  }
}
