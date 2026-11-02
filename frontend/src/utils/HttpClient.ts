// --- External imports ---
import axios from 'axios';

// --- Exported members ---
export class HttpClient {
  static readonly instance = axios.create({
    baseURL: import.meta.env?.VITE_API_BASE_URL ?? 'http://localhost:3000',
  });

  static apiErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as { message?: string } | undefined;
      if (typeof data?.message === 'string' && data.message) return data.message;
    }
    return 'Could not connect to the server. Please try again.';
  }

  static isNotFound(error: unknown): boolean {
    return axios.isAxiosError(error) && error.response?.status === 404;
  }
}
