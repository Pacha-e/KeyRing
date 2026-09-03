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
  <section
    class="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
  >
    <h1 class="mb-4 text-2xl font-bold">Ingresar</h1>
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
