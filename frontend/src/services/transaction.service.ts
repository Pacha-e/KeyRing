// --- Internal imports ---
import type { CreateTransactionDto } from '../dtos/CreateTransactionDto';
import type { TransactionInterface } from '../interfaces/TransactionInterface';
import { HttpClient } from '../utils/HttpClient';
import type { SessionUser } from './auth.service';
import { PropertyService } from './property.service';

// --- Exported members ---
export class TransactionService {
  static async create(newTransaction: CreateTransactionDto): Promise<TransactionInterface> {
    const { data } = await HttpClient.instance.post<TransactionInterface>(
      '/api/transactions',
      newTransaction,
    );
    return data;
  }

  static async findAll(): Promise<TransactionInterface[]> {
    const { data } = await HttpClient.instance.get<TransactionInterface[]>('/api/transactions');
    return data;
  }

  static async findById(id: string): Promise<TransactionInterface | null> {
    try {
      const { data } = await HttpClient.instance.get<TransactionInterface>(
        `/api/transactions/${id}`,
      );
      return data;
    } catch (error) {
      if (HttpClient.isNotFound(error)) return null;
      throw new Error(HttpClient.apiErrorMessage(error));
    }
  }

  static async listForUser(user: SessionUser | null): Promise<TransactionInterface[]> {
    const visibles = await PropertyService.listForUser(user);
    if (visibles.length === 0) return [];
    const { data } = await HttpClient.instance.get<TransactionInterface[]>('/api/transactions', {
      params: { propertyIds: visibles.map((property) => property.id).join(',') },
    });
    return data;
  }

  static async remove(id: string): Promise<void> {
    await HttpClient.instance.delete(`/api/transactions/${id}`);
  }

  static async update(
    id: string,
    changes: Partial<CreateTransactionDto>,
  ): Promise<TransactionInterface> {
    const { data } = await HttpClient.instance.patch<TransactionInterface>(
      `/api/transactions/${id}`,
      changes,
    );
    return data;
  }
}
