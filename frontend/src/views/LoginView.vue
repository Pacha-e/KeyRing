<script setup lang="ts">
// Login: formulario funcional contra auth.service vía el store de Pinia.
// La pantalla se divide en dos: a la izquierda la marca, repitiendo el lenguaje
// de la portada para que entrar no parezca salir del producto; a la derecha el
// formulario.
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon, { type IconName } from '../components/AppIcon.vue'
import { APP_NAME } from '../config/app.config'
import { useAuthStore } from '../stores/auth'

const email = ref('')
const password = ref('')
const loginError = ref('')

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

function submitLogin() {
  loginError.value = ''
  const ok = authStore.login(email.value.trim(), password.value)
  if (!ok) {
    loginError.value = 'Credenciales incorrectas. Verifica correo y contraseña.'
    return
  }
  const redirect = route.query.redirect
  router.push(typeof redirect === 'string' ? redirect : { name: 'dashboard' })
}

/** Lo que el usuario encontrará al entrar, resumido en el panel de marca. */
const highlights: { icon: IconName; label: string }[] = [
  { icon: 'home', label: 'El estado de cada inmueble' },
  { icon: 'contract', label: 'Contratos y sus vencimientos' },
  { icon: 'balance', label: 'Ingresos, gastos y utilidad real' },
]

/** Cuenta de demostración de las que trae la base sembrada. */
interface DemoAccount {
  label: string
  email: string
  password: string
}

const demoAccounts: DemoAccount[] = [
  { label: 'Administrador', email: 'admin@keyring.co', password: 'admin123' },
  { label: 'Propietario', email: 'user@keyring.co', password: 'user123' },
]

/**
 * Rellena el formulario con una cuenta de demostración.
 * Están para que quien evalúe el proyecto entre sin teclear credenciales.
 * @param account cuenta con la que rellenar el formulario
 */
function useDemoAccount(account: DemoAccount): void {
  email.value = account.email
  password.value = account.password
  loginError.value = ''
}
</script>

<template>
  <section
    class="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-2"
  >
    <!-- Panel de marca. Se oculta en móvil, donde el espacio se necesita
         entero para el formulario. -->
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
        <p class="font-brand m-0 text-3xl leading-tight font-semibold">Propiedades en equilibrio</p>
        <p class="mt-3 mb-0 text-sm leading-relaxed text-white/70">
          Todo tu portafolio de arriendos en un mismo tablero.
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
      <!-- En móvil el panel de marca no se ve, así que la marca vuelve aquí -->
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

      <h1 class="font-brand m-0 text-2xl font-semibold text-ink">Entrar</h1>
      <p class="mt-1 mb-6 text-sm text-slate-500">Administra tus propiedades y tus contratos.</p>

      <form @submit.prevent="submitLogin">
        <label class="mb-4 flex flex-col gap-1.5">
          <span class="text-sm font-medium">Correo</span>
          <input
            v-model="email"
            type="email"
            required
            autocomplete="username"
            class="field-input"
          />
        </label>
        <label class="mb-4 flex flex-col gap-1.5">
          <span class="text-sm font-medium">Contraseña</span>
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
          Entrar
        </button>
      </form>

      <!-- Las cuentas sembradas se ofrecen como botones: quien evalúa el
           proyecto entra de un clic en vez de copiar credenciales a mano. -->
      <div class="mt-8 border-t border-slate-200 pt-5">
        <p class="mt-0 mb-3 text-xs font-semibold tracking-wide text-slate-400 uppercase">
          Cuentas de prueba
        </p>
        <div class="flex flex-wrap gap-3">
          <button
            v-for="account in demoAccounts"
            :key="account.email"
            class="rounded-lg border border-slate-300 px-3 py-2 text-left text-xs text-slate-600 transition hover:border-primary hover:text-primary"
            type="button"
            @click="useDemoAccount(account)"
          >
            <span class="block font-medium">{{ account.label }}</span>
            {{ account.email }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
