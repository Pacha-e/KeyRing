// --- External imports ---
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// --- Internal imports ---
import { Property } from '../../properties/entities/property.entity.js';
import { Transaction } from '../../transactions/entities/transaction.entity.js';

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
        property: properties[0],
        type: 'INCOME' as const,
        source: 'AIRBNB' as const,
        amount: 950000,
        date: this.isoDaysAgo(5),
        description: 'Airbnb reservation, 3 nights',
      },
      {
        property: properties[0],
        type: 'INCOME' as const,
        source: 'AIRBNB' as const,
        amount: 1200000,
        date: this.isoDaysAgo(20),
        description: 'Airbnb reservation, 4 nights',
      },
      {
        property: properties[0],
        type: 'EXPENSE' as const,
        source: 'OTHER' as const,
        amount: 180000,
        date: this.isoDaysAgo(22),
        description: 'Cleaning and laundry',
      },
      {
        property: properties[1],
        type: 'INCOME' as const,
        source: 'CONTRACT' as const,
        amount: 4200000,
        date: this.isoDaysAgo(3),
        description: 'Monthly rent',
      },
      {
        property: properties[1],
        type: 'EXPENSE' as const,
        source: 'OTHER' as const,
        amount: 450000,
        date: this.isoDaysAgo(10),
        description: 'Administration and utilities',
      },
      {
        property: properties[2],
        type: 'INCOME' as const,
        source: 'CONTRACT' as const,
        amount: 2600000,
        date: this.isoDaysAgo(7),
        description: 'Monthly rent',
      },
      {
        property: properties[2],
        type: 'INCOME' as const,
        source: 'CONTRACT' as const,
        amount: 2600000,
        date: this.isoDaysAgo(37),
        description: 'Monthly rent',
      },
      {
        property: properties[4],
        type: 'INCOME' as const,
        source: 'AIRBNB' as const,
        amount: 700000,
        date: this.isoDaysAgo(12),
        description: 'Airbnb reservation, 2 nights',
      },
      {
        property: properties[4],
        type: 'INCOME' as const,
        source: 'AIRBNB' as const,
        amount: 1050000,
        date: this.isoDaysAgo(45),
        description: 'Airbnb reservation, 3 nights',
      },
      {
        property: properties[5],
        type: 'INCOME' as const,
        source: 'CONTRACT' as const,
        amount: 5800000,
        date: this.isoDaysAgo(2),
        description: 'Monthly rent',
      },
      {
        property: properties[5],
        type: 'EXPENSE' as const,
        source: 'OTHER' as const,
        amount: 600000,
        date: this.isoDaysAgo(15),
        description: 'Garden maintenance',
      },
      {
        property: properties[1],
        type: 'EXPENSE' as const,
        source: 'OTHER' as const,
        amount: 320000,
        date: this.isoDaysAgo(60),
        description: 'Plumbing repair',
      },
      {
        property: properties[0],
        type: 'INCOME' as const,
        source: 'AIRBNB' as const,
        amount: 880000,
        date: this.isoDaysAgo(70),
        description: 'Airbnb reservation, 3 nights',
      },
    ];
    await Promise.all(
      transactions.map((draft) =>
        this.transactionsRepository.save(this.transactionsRepository.create(draft)),
      ),
    );
  }
}
