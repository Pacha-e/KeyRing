import { defineStore } from 'pinia'
import * as authService from '../services/auth.service'
import { UserRole } from '../models/enums'

// Estado de sesión. Se hidrata desde LocalStorage al arrancar.
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: authService.currentUser(),
  }),
  getters: {
    isAuthenticated: (state) => state.user !== null,
    isAdmin: (state) => state.user?.role === UserRole.ADMIN,
  },
  actions: {
    login(email, password) {
      const user = authService.login(email, password)
      if (!user) return false
      this.user = user
      return true
    },
    logout() {
      authService.logout()
      this.user = null
    },
  },
})
