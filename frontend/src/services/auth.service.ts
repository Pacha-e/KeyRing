// --- External imports ---
import axios from 'axios';

// --- Internal imports ---
import type { UserInterface } from '../interfaces/UserInterface';
import { HttpClient } from '../utils/HttpClient';

// --- Types ---
export type SessionUser = Omit<UserInterface, 'password'>;

export interface LoginResponse {
  token: string;
  user: SessionUser;
}

// --- Exported members ---
export class AuthService {
  static async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const { data } = await HttpClient.instance.post<LoginResponse>('/api/users/login', {
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

  static async logout(): Promise<void> {
    await HttpClient.instance.post('/api/users/logout');
  }
}
