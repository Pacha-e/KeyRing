<script setup lang="ts">
// Login: formulario funcional contra auth.service vía el store de Pinia
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const email = ref('')
const password = ref('')
const error = ref('')

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

function onSubmit() {
  error.value = ''
  const ok = auth.login(email.value.trim(), password.value)
  if (!ok) {
    error.value = 'Credenciales incorrectas. Verifica correo y contraseña.'
    return
  }
  const redirect = route.query.redirect
  router.push(typeof redirect === 'string' ? redirect : { name: 'dashboard' })
}
</script>

<template>
  <section class="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
    <div class="mb-6 text-center">
      <router-link
        class="font-brand inline-flex items-center gap-2 text-xl font-semibold text-ink no-underline"
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
      <p class="mt-2 text-sm text-slate-500">Entra a administrar tus propiedades</p>
    </div>
    <form @submit.prevent="onSubmit">
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Correo</span>
        <input
          v-model="email"
          type="email"
          required
          autocomplete="username"
          class="rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:outline-2 focus:outline-primary"
        />
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Contraseña</span>
        <input
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
          class="rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:outline-2 focus:outline-primary"
        />
      </label>
      <p v-if="error" class="mb-4 text-sm text-red-600">{{ error }}</p>
      <button
        class="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark"
        type="submit"
      >
        Entrar
      </button>
    </form>
    <p class="mt-4 text-sm text-slate-500">
      Demo: <code>admin@keyring.co / admin123</code> · <code>user@keyring.co / user123</code>
    </p>
  </section>
</template>
