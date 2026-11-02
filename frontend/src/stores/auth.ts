// --- External imports ---
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

// --- Internal imports ---
import { UserRole } from '../enums/UserRole';
import { AuthService, type SessionUser } from '../services/auth.service';

// --- Exported members ---
export const useAuthStore = defineStore('auth', () => {
  const user = ref<SessionUser | null>(null);
  const isAdmin = computed(() => user.value?.role === UserRole.ADMIN);
  const isAuthenticated = computed(() => user.value !== null);

  async function login(email: string, password: string): Promise<void> {
    user.value = await AuthService.login(email, password);
  }

  function logout(): void {
    user.value = null;
  }

  return { isAdmin, isAuthenticated, login, logout, user };
});
