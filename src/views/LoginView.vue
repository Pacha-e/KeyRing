<script setup>
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
  router.push(route.query.redirect ?? { name: 'dashboard' })
}
</script>

<template>
  <section class="card" style="max-width: 420px; margin-inline: auto">
    <h1>Ingresar</h1>
    <form @submit.prevent="onSubmit">
      <label class="form-group">
        <span>Correo</span>
        <input v-model="email" type="email" required autocomplete="username" />
      </label>
      <label class="form-group">
        <span>Contraseña</span>
        <input v-model="password" type="password" required autocomplete="current-password" />
      </label>
      <p v-if="error" class="error-msg">{{ error }}</p>
      <button class="btn" type="submit">Entrar</button>
    </form>
    <p class="text-muted">
      Demo: <code>admin@keyring.co / admin123</code> · <code>user@keyring.co / user123</code>
    </p>
  </section>
</template>
