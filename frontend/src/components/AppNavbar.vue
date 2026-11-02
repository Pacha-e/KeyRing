<script setup lang="ts">
// --- External imports ---
import { useRouter } from 'vue-router';

// --- Internal imports ---
import { APP_NAME } from '../config/app.config';
import { useAuthStore } from '../stores/auth';

// --- State ---
const authStore = useAuthStore();
const linkActiveClass = 'bg-sidebar-hover text-white font-medium';
const linkClass =
  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-300 no-underline transition hover:bg-sidebar-hover hover:text-white';
const router = useRouter();

// --- Methods ---
function onLogout(): void {
  authStore.logout();
  router.push({ name: 'home' });
}
</script>

<template>
  <aside class="sticky top-0 flex h-screen w-60 shrink-0 self-start flex-col bg-sidebar text-white">
    <div class="px-5 pt-6 pb-4">
      <router-link
        class="font-brand flex items-center gap-2 text-xl font-semibold text-white no-underline"
        :to="{ name: 'home' }"
      >
        <img class="h-7 w-7" src="/isotipo-keyring-claro.png" :alt="`${APP_NAME} isotype`" />
        {{ APP_NAME }}
      </router-link>
    </div>

    <nav v-if="authStore.isAuthenticated" class="flex flex-1 flex-col gap-1 px-3">
      <router-link :class="linkClass" :active-class="linkActiveClass" :to="{ name: 'dashboard' }">
        Dashboard
      </router-link>
      <router-link :class="linkClass" :active-class="linkActiveClass" :to="{ name: 'properties' }">
        Properties
      </router-link>
      <router-link :class="linkClass" :active-class="linkActiveClass" :to="{ name: 'contracts' }">
        Contracts
      </router-link>
      <router-link
        :class="linkClass"
        :active-class="linkActiveClass"
        :to="{ name: 'transactions' }"
      >
        Transactions
      </router-link>
      <router-link :class="linkClass" :active-class="linkActiveClass" :to="{ name: 'map' }">
        Map
      </router-link>
      <router-link
        v-if="authStore.isAdmin"
        :class="linkClass"
        :active-class="linkActiveClass"
        :to="{ name: 'reports' }"
      >
        Reports
      </router-link>
      <router-link
        v-if="authStore.isAdmin"
        :class="linkClass"
        :active-class="linkActiveClass"
        :to="{ name: 'admin-users' }"
      >
        Users
      </router-link>
    </nav>
    <div v-else class="flex-1"></div>

    <div class="border-t border-white/10 p-4">
      <template v-if="authStore.isAuthenticated">
        <div class="mb-3 flex items-center gap-2 text-sm">
          <span
            class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold"
          >
            {{ authStore.user?.fullName?.charAt(0) ?? '?' }}
          </span>
          <span class="truncate text-slate-200">{{ authStore.user?.fullName }}</span>
        </div>
        <button
          class="w-full rounded-lg border border-white/20 bg-transparent px-3 py-1.5 text-sm text-slate-200 hover:bg-sidebar-hover"
          type="button"
          @click="onLogout"
        >
          Log out
        </button>
      </template>
      <router-link
        v-else
        class="block rounded-lg bg-primary px-3 py-2 text-center text-sm text-white no-underline hover:bg-primary-dark"
        :to="{ name: 'login' }"
      >
        Log in
      </router-link>
    </div>
  </aside>
</template>
