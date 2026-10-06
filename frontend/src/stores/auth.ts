import { defineStore } from 'pinia'
import * as authService from '../services/auth.service'
import type { SessionUser } from '../services/auth.service'
import { UserRole } from '../interfaces/enums'

interface AuthState {
  user: SessionUser | null
}

// Estado de sesión. Se hidrata desde LocalStorage al arrancar; el login es
// asíncrono porque valida las credenciales contra la API.
export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: authService.currentUser(),
  }),
  getters: {
    isAuthenticated: (state): boolean => state.user !== null,
    isAdmin: (state): boolean => state.user?.role === UserRole.ADMIN,
  },
  actions: {
    async login(email: string, password: string): Promise<boolean> {
      const user = await authService.login(email, password)
      if (!user) return false
      this.user = user
      return true
    },
    logout(): void {
      authService.logout()
      this.user = null
    },
  },
})
