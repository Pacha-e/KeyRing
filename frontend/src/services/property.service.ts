// --- Internal imports ---
import type { CreatePropertyDto } from '../dtos/CreatePropertyDto';
import type { PropertyInterface } from '../interfaces/PropertyInterface';
import { HttpClient } from '../utils/HttpClient';
import type { SessionUser } from './auth.service';

// --- Exported members ---
export class PropertyService {
  static cities(properties: PropertyInterface[]): string[] {
    return [...new Set(properties.map((property) => property.city))].sort();
  }

  static countByType(properties: PropertyInterface[]): Record<string, number> {
    return properties.reduce<Record<string, number>>((acc, property) => {
      acc[property.type] = (acc[property.type] ?? 0) + 1;
      return acc;
    }, {});
  }

  static async create(newProperty: CreatePropertyDto): Promise<PropertyInterface> {
    const { data } = await HttpClient.instance.post<PropertyInterface>(
      '/api/properties',
      newProperty,
    );
    return data;
  }

  static async findAll(): Promise<PropertyInterface[]> {
    const { data } = await HttpClient.instance.get<PropertyInterface[]>('/api/properties');
    return data;
  }

  static async findById(id: string): Promise<PropertyInterface | null> {
    try {
      const { data } = await HttpClient.instance.get<PropertyInterface>(`/api/properties/${id}`);
      return data;
    } catch (error) {
      if (HttpClient.isNotFound(error)) return null;
      throw new Error(HttpClient.apiErrorMessage(error));
    }
  }

  static async listForUser(user: SessionUser | null): Promise<PropertyInterface[]> {
    if (!user) return [];
    const { data } = await HttpClient.instance.get<PropertyInterface[]>('/api/properties', {
      params: { role: user.role, userId: user.id },
    });
    return data;
  }

  static async remove(id: string): Promise<void> {
    await HttpClient.instance.delete(`/api/properties/${id}`);
  }

  static async update(id: string, changes: Partial<CreatePropertyDto>): Promise<PropertyInterface> {
    const { data } = await HttpClient.instance.patch<PropertyInterface>(
      `/api/properties/${id}`,
      changes,
    );
    return data;
  }
}
