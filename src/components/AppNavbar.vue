<script setup lang="ts">
// Sidebar de navegación: enlaces según autenticación y rol (estilo mockup: barra oscura lateral)
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const linkClass =
  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-300 no-underline transition hover:bg-sidebar-hover hover:text-white'
const linkActiveClass = 'bg-sidebar-hover text-white font-medium'

function onLogout() {
  auth.logout()
  router.push({ name: 'home' })
}
</script>

<template>
  <aside class="sticky top-0 flex h-screen w-60 shrink-0 self-start flex-col bg-sidebar text-white">
    <div class="px-5 pt-6 pb-4">
      <router-link
        class="font-brand flex items-center gap-2 text-xl font-semibold text-white no-underline"
        :to="{ name: 'home' }"
      >
        <svg
          class="h-5 w-5 text-primary"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M14.7 2.7a5.5 5.5 0 0 0-7.2 7.2L2 15.4V19a1 1 0 0 0 1 1h3.6a1 1 0 0 0 .7-.3l1-1a1 1 0 0 0 .3-.7v-1h1a1 1 0 0 0 .7-.3l.7-.7a1 1 0 0 0 .3-.7v-1h1a1 1 0 0 0 .7-.3l1.5-1.5a5.5 5.5 0 0 0 .2-8.8zM16 8.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"
          />
        </svg>
        KeyRing
      </router-link>
    </div>

    <nav v-if="auth.isAuthenticated" class="flex flex-1 flex-col gap-1 px-3">
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
    </nav>
    <div v-else class="flex-1"></div>

    <div class="border-t border-white/10 p-4">
      <template v-if="auth.isAuthenticated">
        <div class="mb-3 flex items-center gap-2 text-sm">
          <span
            class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold"
          >
            {{ auth.user?.fullName?.charAt(0) ?? '?' }}
          </span>
          <span class="truncate text-slate-200">{{ auth.user?.fullName }}</span>
        </div>
        <button
          class="w-full rounded-lg border border-white/20 bg-transparent px-3 py-1.5 text-sm text-slate-200 hover:bg-sidebar-hover"
          type="button"
          @click="onLogout"
        >
          Salir
        </button>
      </template>
      <router-link
        v-else
        class="block rounded-lg bg-primary px-3 py-2 text-center text-sm text-white no-underline hover:bg-primary-dark"
        :to="{ name: 'login' }"
      >
        Ingresar
      </router-link>
    </div>
  </aside>
</template>
