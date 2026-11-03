// --- External imports ---
import { Injectable } from '@nestjs/common';
import type { EntityManager } from 'typeorm';

// --- Internal imports ---
import { DateUtils } from '../../common/utils/date-utils.js';
import { TransactionSource } from '../../domain/enums/transaction-source.js';
import { TransactionType } from '../../domain/enums/transaction-type.js';
import { Property } from '../../properties/entities/property.entity.js';
import { Transaction } from '../../transactions/entities/transaction.entity.js';

// --- Exported members ---
@Injectable()
export class TransactionSeeder {
  async seed(manager: EntityManager, properties: Property[]): Promise<void> {
    const transactions = [
      {
        amount: 950000,
        date: DateUtils.isoDaysAgo(5),
        description: 'Airbnb reservation, 3 nights',
        property: properties[0],
        source: TransactionSource.Airbnb,
        type: TransactionType.Income,
      },
      {
        amount: 1200000,
        date: DateUtils.isoDaysAgo(20),
        description: 'Airbnb reservation, 4 nights',
        property: properties[0],
        source: TransactionSource.Airbnb,
        type: TransactionType.Income,
      },
      {
        amount: 180000,
        date: DateUtils.isoDaysAgo(22),
        description: 'Cleaning and laundry',
        property: properties[0],
        source: TransactionSource.Other,
        type: TransactionType.Expense,
      },
      {
        amount: 4200000,
        date: DateUtils.isoDaysAgo(3),
        description: 'Monthly rent',
        property: properties[1],
        source: TransactionSource.Contract,
        type: TransactionType.Income,
      },
      {
        amount: 450000,
        date: DateUtils.isoDaysAgo(10),
        description: 'Administration and utilities',
        property: properties[1],
        source: TransactionSource.Other,
        type: TransactionType.Expense,
      },
      {
        amount: 2600000,
        date: DateUtils.isoDaysAgo(7),
        description: 'Monthly rent',
        property: properties[2],
        source: TransactionSource.Contract,
        type: TransactionType.Income,
      },
      {
        amount: 2600000,
        date: DateUtils.isoDaysAgo(37),
        description: 'Monthly rent',
        property: properties[2],
        source: TransactionSource.Contract,
        type: TransactionType.Income,
      },
      {
        amount: 700000,
        date: DateUtils.isoDaysAgo(12),
        description: 'Airbnb reservation, 2 nights',
        property: properties[4],
        source: TransactionSource.Airbnb,
        type: TransactionType.Income,
      },
      {
        amount: 1050000,
        date: DateUtils.isoDaysAgo(45),
        description: 'Airbnb reservation, 3 nights',
        property: properties[4],
        source: TransactionSource.Airbnb,
        type: TransactionType.Income,
      },
      {
        amount: 5800000,
        date: DateUtils.isoDaysAgo(2),
        description: 'Monthly rent',
        property: properties[5],
        source: TransactionSource.Contract,
        type: TransactionType.Income,
      },
      {
        amount: 600000,
        date: DateUtils.isoDaysAgo(15),
        description: 'Garden maintenance',
        property: properties[5],
        source: TransactionSource.Other,
        type: TransactionType.Expense,
      },
      {
        amount: 320000,
        date: DateUtils.isoDaysAgo(60),
        description: 'Plumbing repair',
        property: properties[1],
        source: TransactionSource.Other,
        type: TransactionType.Expense,
      },
      {
        amount: 880000,
        date: DateUtils.isoDaysAgo(70),
        description: 'Airbnb reservation, 3 nights',
        property: properties[0],
        source: TransactionSource.Airbnb,
        type: TransactionType.Income,
      },
    ];
    await Promise.all(
      transactions.map((draft) =>
        manager.getRepository(Transaction).save(manager.getRepository(Transaction).create(draft)),
      ),
    );
  }
}
