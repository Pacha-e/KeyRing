<script setup lang="ts">
// Barra de navegación: enlaces según autenticación y rol
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const linkClass = 'text-blue-100 no-underline hover:text-white'
const linkActiveClass = 'border-b-2 border-accent font-semibold text-white'

function onLogout() {
  auth.logout()
  router.push({ name: 'home' })
}
</script>

<template>
  <nav class="bg-primary-dark text-white">
    <div class="mx-auto flex w-[min(1100px,92%)] items-center gap-4 py-2.5">
      <router-link class="mr-4 text-lg font-bold text-white no-underline" :to="{ name: 'home' }">
        🔑 KeyRing
      </router-link>

      <template v-if="auth.isAuthenticated">
        <router-link :class="linkClass" :active-class="linkActiveClass" :to="{ name: 'dashboard' }">
          Dashboard
        </router-link>
        <router-link :class="linkClass" :active-class="linkActiveClass" :to="{ name: 'properties' }">
          Propiedades
        </router-link>
        <router-link :class="linkClass" :active-class="linkActiveClass" :to="{ name: 'contracts' }">
          Contratos
        </router-link>
        <router-link
          :class="linkClass"
          :active-class="linkActiveClass"
          :to="{ name: 'transactions' }"
        >
          Transacciones
        </router-link>
        <router-link :class="linkClass" :active-class="linkActiveClass" :to="{ name: 'map' }">
          Mapa
        </router-link>
        <router-link
          v-if="auth.isAdmin"
          :class="linkClass"
          :active-class="linkActiveClass"
          :to="{ name: 'reports' }"
        >
          Reportes
        </router-link>
        <router-link
          v-if="auth.isAdmin"
          :class="linkClass"
          :active-class="linkActiveClass"
          :to="{ name: 'admin-users' }"
        >
          Usuarios
        </router-link>
      </template>

      <span class="flex-1"></span>

      <template v-if="auth.isAuthenticated">
        <span>{{ auth.user?.fullName }}</span>
        <button
          class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          @click="onLogout"
        >
          Salir
        </button>
      </template>
      <router-link v-else :class="linkClass" :to="{ name: 'login' }">Ingresar</router-link>
    </div>
  </nav>
</template>
