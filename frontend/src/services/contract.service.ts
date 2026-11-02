// --- Internal imports ---
import type { CreateContractDto } from '../dtos/CreateContractDto';
import { ContractStatus } from '../enums/ContractStatus';
import type { ContractInterface } from '../interfaces/ContractInterface';
import { HttpClient } from '../utils/HttpClient';
import type { SessionUser } from './auth.service';
import { PropertyService } from './property.service';

// --- Exported members ---
export class ContractService {
  static countActive(contracts: ContractInterface[]): number {
    return contracts.filter((contract) => contract.status === ContractStatus.ACTIVE).length;
  }

  static async create(newContract: CreateContractDto): Promise<ContractInterface> {
    const { data } = await HttpClient.instance.post<ContractInterface>(
      '/api/contracts',
      newContract,
    );
    return data;
  }

  static async findAll(): Promise<ContractInterface[]> {
    const { data } = await HttpClient.instance.get<ContractInterface[]>('/api/contracts');
    return data;
  }

  static async findById(id: string): Promise<ContractInterface | null> {
    try {
      const { data } = await HttpClient.instance.get<ContractInterface>(`/api/contracts/${id}`);
      return data;
    } catch (error) {
      if (HttpClient.isNotFound(error)) return null;
      throw new Error(HttpClient.apiErrorMessage(error));
    }
  }

  static async listForUser(user: SessionUser | null): Promise<ContractInterface[]> {
    const visibles = await PropertyService.listForUser(user);
    if (visibles.length === 0) return [];
    const { data } = await HttpClient.instance.get<ContractInterface[]>('/api/contracts', {
      params: { propertyIds: visibles.map((property) => property.id).join(',') },
    });
    return data;
  }

  static async remove(id: string): Promise<void> {
    await HttpClient.instance.delete(`/api/contracts/${id}`);
  }

  static async update(id: string, changes: Partial<CreateContractDto>): Promise<ContractInterface> {
    const { data } = await HttpClient.instance.patch<ContractInterface>(
      `/api/contracts/${id}`,
      changes,
    );
    return data;
  }
}
