// --- External imports ---
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

// --- Internal imports ---
import { UserRole } from '../enums/UserRole';
import { AuthService, type SessionUser } from '../services/auth.service';
import { HttpClient } from '../utils/HttpClient';

// --- Exported members ---
export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null);
  const user = ref<SessionUser | null>(null);
  const isAdmin = computed(() => user.value?.role === UserRole.ADMIN);
  const isAuthenticated = computed(() => Boolean(user.value && token.value));

  function clearSession(): void {
    token.value = null;
    user.value = null;
    HttpClient.setToken(null);
  }

  async function login(email: string, password: string): Promise<void> {
    const session = await AuthService.login(email, password);
    if (!session.user || !session.token) throw new Error('Invalid session response.');
    user.value = session.user;
    token.value = session.token;
    HttpClient.setToken(session.token);
  }

  async function logout(): Promise<void> {
    try {
      if (token.value) await AuthService.logout();
    } finally {
      clearSession();
    }
  }

  return { clearSession, isAdmin, isAuthenticated, login, logout, token, user };
});
