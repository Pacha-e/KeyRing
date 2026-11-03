// --- External imports ---
import axios from 'axios';

// --- Internal imports ---
import { API_BASE_URL } from '../config/app.config';

// --- Exported members ---
export class HttpClient {
  static readonly instance = axios.create({
    baseURL: API_BASE_URL,
  });

  static apiErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as { message?: string } | undefined;
      if (typeof data?.message === 'string' && data.message) return data.message;
    } else if (error instanceof Error && error.message) {
      return error.message;
    }
    return 'Could not connect to the server. Please try again.';
  }

  static configureUnauthorizedHandler(onUnauthorized: () => void): void {
    HttpClient.instance.interceptors.response.use(undefined, (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        const requestToken = error.config?.headers?.Authorization;
        const currentToken = HttpClient.instance.defaults.headers.common.Authorization;
        if (requestToken && requestToken === currentToken) onUnauthorized();
      }
      return Promise.reject(error);
    });
  }

  static isNotFound(error: unknown): boolean {
    return axios.isAxiosError(error) && error.response?.status === 404;
  }

  static setToken(token: string | null): void {
    if (token) HttpClient.instance.defaults.headers.common.Authorization = `Bearer ${token}`;
    else delete HttpClient.instance.defaults.headers.common.Authorization;
  }
}
