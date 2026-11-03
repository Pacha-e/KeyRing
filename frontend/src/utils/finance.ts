// --- Internal imports ---
import { TransactionType } from '../enums/TransactionType';
import type { PropertyInterface } from '../interfaces/PropertyInterface';
import type { TransactionInterface } from '../interfaces/TransactionInterface';
import { DateFormatter } from './format';

// --- Types ---
export interface FinancialSummary {
  expense: number;
  income: number;
  net: number;
}

// --- Exported members ---
export class FinanceCalculator {
  static listMonthsPresent(transactions: TransactionInterface[]): string[] {
    return [...new Set(transactions.map((transaction) => transaction.date.slice(0, 7)))].sort();
  }

  static sumAmountsByMonth(
    transactions: TransactionInterface[],
    type: TransactionType,
    month: string,
  ): number {
    return FinanceCalculator.sumAmountsByType(
      transactions.filter((transaction) => transaction.date.startsWith(month)),
      type,
    );
  }

  static sumAmountsByType(transactions: TransactionInterface[], type: TransactionType): number {
    return transactions
      .filter((transaction) => transaction.type === type)
      .reduce((total, transaction) => total + transaction.amount, 0);
  }

  static sumEstimatedRentByCity(
    properties: PropertyInterface[],
  ): { city: string; amount: number }[] {
    const cities = [...new Set(properties.map((property) => property.city))];
    return cities.map((city) => ({
      city,
      amount: properties
        .filter((property) => property.city === city)
        .reduce((total, property) => total + property.estimatedMonthlyRent, 0),
    }));
  }

  static sumIncomeBySource(transactions: TransactionInterface[]): Record<string, number> {
    return transactions
      .filter((transaction) => transaction.type === TransactionType.INCOME)
      .reduce<Record<string, number>>((totals, transaction) => {
        totals[transaction.source] = (totals[transaction.source] ?? 0) + transaction.amount;
        return totals;
      }, {});
  }

  static sumIncomeForCurrentMonth(transactions: TransactionInterface[]): number {
    const currentMonth = DateFormatter.bogotaDate().slice(0, 7);
    return FinanceCalculator.sumAmountsByMonth(transactions, TransactionType.INCOME, currentMonth);
  }

  static summarizePropertyBalance(
    propertyId: string,
    transactions: TransactionInterface[],
  ): FinancialSummary {
    return FinanceCalculator.summarizeTransactions(
      transactions.filter((transaction) => transaction.propertyId === propertyId),
    );
  }

  static summarizeTransactions(transactions: TransactionInterface[]): FinancialSummary {
    const income = FinanceCalculator.sumAmountsByType(transactions, TransactionType.INCOME);
    const expense = FinanceCalculator.sumAmountsByType(transactions, TransactionType.EXPENSE);
    return { income, expense, net: income - expense };
  }
  static sumNetProfitByCity(
    properties: PropertyInterface[],
    transactions: TransactionInterface[],
  ): { city: string; profit: number }[] {
    const cities = [...new Set(properties.map((property) => property.city))];
    return cities.map((city) => {
      const propertyIdsInCity = new Set(
        properties.filter((property) => property.city === city).map((property) => property.id),
      );
      const transactionsInCity = transactions.filter((transaction) =>
        propertyIdsInCity.has(transaction.propertyId),
      );
      return { city, profit: FinanceCalculator.summarizeTransactions(transactionsInCity).net };
    });
  }
}
