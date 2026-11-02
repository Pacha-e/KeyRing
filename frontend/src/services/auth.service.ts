// --- External imports ---
import axios from 'axios';

// --- Internal imports ---
import type { UserInterface } from '../interfaces/UserInterface';
import { HttpClient } from '../utils/HttpClient';

// --- Types ---
export type SessionUser = Omit<UserInterface, 'password'>;

// --- Exported members ---
export class AuthService {
  static async login(email: string, password: string): Promise<SessionUser> {
    try {
      const { data } = await HttpClient.instance.post<SessionUser>('/api/users/login', {
        email,
        password,
      });
      return data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        throw new Error('Invalid email or password');
      }
      throw new Error(HttpClient.apiErrorMessage(error));
    }
  }
}
