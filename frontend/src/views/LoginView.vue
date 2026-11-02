<script setup lang="ts">
// --- External imports ---
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// --- Internal imports ---
import AppIcon, { type IconName } from '../components/AppIcon.vue';
import { APP_NAME } from '../config/app.config';
import { useAuthStore } from '../stores/auth';

// --- Types ---
interface DemoAccount {
  label: string;
  email: string;
  password: string;
}

// --- Stores ---
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

// --- State ---
const demoAccounts: DemoAccount[] = [
  { label: 'Administrator', email: 'admin@keyring.co', password: 'admin123' },
  { label: 'Owner', email: 'user@keyring.co', password: 'user123' },
];
const email = ref('');
const highlights: { icon: IconName; label: string }[] = [
  { icon: 'home', label: 'Every property status' },
  { icon: 'contract', label: 'Contracts and their expiration dates' },
  { icon: 'balance', label: 'Income, expenses and real profit' },
];
const loginError = ref('');
const password = ref('');

// --- Methods ---
/** Fills the form with a demo account. */
function fillDemoAccount(account: DemoAccount): void {
  email.value = account.email;
  password.value = account.password;
  loginError.value = '';
}

/** Submits credentials through the auth store. */
async function submitLogin(): Promise<void> {
  loginError.value = '';
  try {
    await authStore.login(email.value.trim(), password.value);
    const redirect = route.query.redirect;
    await router.push(typeof redirect === 'string' ? redirect : { name: 'dashboard' });
  } catch (error) {
    loginError.value =
      error instanceof Error ? error.message : 'Could not sign in. Please try again.';
  }
}
</script>

<template>
  <section
    class="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-2"
  >
    <!-- Brand panel: hidden on mobile where the form needs the full space. -->
    <aside class="hidden flex-col justify-between gap-10 bg-sidebar p-10 text-white md:flex">
      <router-link
        class="font-brand inline-flex items-center gap-2 text-xl font-semibold text-white no-underline"
        :to="{ name: 'home' }"
      >
        <svg
          class="h-6 w-6 text-primary"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            d="M14.7 2.7a5.5 5.5 0 0 0-7.2 7.2L2 15.4V19a1 1 0 0 0 1 1h3.6a1 1 0 0 0 .7-.3l1-1a1 1 0 0 0 .3-.7v-1h1a1 1 0 0 0 .7-.3l.7-.7a1 1 0 0 0 .3-.7v-1h1a1 1 0 0 0 .7-.3l1.5-1.5a5.5 5.5 0 0 0 .2-8.8zM16 8.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"
          />
        </svg>
        {{ APP_NAME }}
      </router-link>

      <div>
        <p class="font-brand m-0 text-3xl leading-tight font-semibold">Properties in balance</p>
        <p class="mt-3 mb-0 text-sm leading-relaxed text-white/70">
          Your whole rental portfolio on a single board.
        </p>
      </div>

      <ul class="m-0 flex list-none flex-col gap-3 p-0 text-sm text-white/80">
        <li v-for="highlight in highlights" :key="highlight.label" class="flex items-center gap-3">
          <AppIcon :name="highlight.icon" :size="18" class="shrink-0 text-primary" />
          {{ highlight.label }}
        </li>
      </ul>
    </aside>

    <div class="p-8 sm:p-10">
      <!-- On mobile the brand panel is hidden, so the brand appears here. -->
      <router-link
        class="font-brand mb-6 inline-flex items-center gap-2 text-lg font-semibold text-ink no-underline md:hidden"
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
        {{ APP_NAME }}
      </router-link>

      <h1 class="font-brand m-0 text-2xl font-semibold text-ink">Sign in</h1>
      <p class="mt-1 mb-6 text-sm text-slate-500">Manage your properties and contracts.</p>

      <form @submit.prevent="submitLogin">
        <label class="mb-4 flex flex-col gap-1.5">
          <span class="text-sm font-medium">Email</span>
          <input
            v-model="email"
            type="email"
            required
            autocomplete="username"
            class="field-input"
          />
        </label>
        <label class="mb-4 flex flex-col gap-1.5">
          <span class="text-sm font-medium">Password</span>
          <input
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            class="field-input"
          />
        </label>

        <p
          v-if="loginError"
          aria-live="polite"
          class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {{ loginError }}
        </p>

        <button
          class="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary-dark"
          type="submit"
        >
          Sign in
        </button>
      </form>

      <!-- Demo accounts are offered as buttons so reviewers can enter with one click. -->
      <div class="mt-8 border-t border-slate-200 pt-5">
        <p class="mt-0 mb-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">
          Demo accounts
        </p>
        <div class="flex flex-wrap gap-3">
          <button
            v-for="account in demoAccounts"
            :key="account.email"
            class="rounded-lg border border-slate-300 px-3 py-2 text-left text-xs text-slate-600 transition hover:border-primary hover:text-primary"
            type="button"
            @click="fillDemoAccount(account)"
          >
            <span class="block font-medium">{{ account.label }}</span>
            {{ account.email }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
