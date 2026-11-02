// --- Internal imports ---
import type { CreateUserDto } from '../dtos/CreateUserDto';
import { HttpClient } from '../utils/HttpClient';
import type { SessionUser } from './auth.service';

// --- Exported members ---
export class UserService {
  static async blockedFromRemoval(id: string, currentUserId: string): Promise<string | null> {
    if (id === currentUserId) return 'You cannot delete your own user.';
    const user = await UserService.findById(id);
    if (!user) return 'This user no longer exists.';
    const users = await UserService.findAll();
    if (
      user.role === 'admin' &&
      users.filter((candidate) => candidate.role === 'admin').length <= 1
    )
      return 'You cannot delete the last administrator.';
    return null;
  }

  static async create(newUser: CreateUserDto): Promise<SessionUser> {
    const { data } = await HttpClient.instance.post<SessionUser>('/api/users', newUser);
    return data;
  }

  static async emailTaken(email: string, exceptId?: string): Promise<boolean> {
    const { data } = await HttpClient.instance.get<{ taken: boolean }>('/api/users/email-taken', {
      params: { email, exceptId },
    });
    return data.taken;
  }

  static async findAll(): Promise<SessionUser[]> {
    const { data } = await HttpClient.instance.get<SessionUser[]>('/api/users');
    return data;
  }

  static async findById(id: string): Promise<SessionUser | null> {
    try {
      const { data } = await HttpClient.instance.get<SessionUser>(`/api/users/${id}`);
      return data;
    } catch (error) {
      if (HttpClient.isNotFound(error)) return null;
      throw new Error(HttpClient.apiErrorMessage(error));
    }
  }

  static async remove(id: string): Promise<void> {
    await HttpClient.instance.delete(`/api/users/${id}`);
  }

  static async update(id: string, changes: Partial<CreateUserDto>): Promise<SessionUser> {
    const { data } = await HttpClient.instance.patch<SessionUser>(`/api/users/${id}`, changes);
    return data;
  }
}
