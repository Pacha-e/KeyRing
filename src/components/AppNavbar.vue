<script setup>
// Barra de navegación: enlaces según autenticación y rol
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

function onLogout() {
  auth.logout()
  router.push({ name: 'home' })
}
</script>

<template>
  <nav class="navbar">
    <div class="container navbar-inner">
      <router-link class="navbar-brand" :to="{ name: 'home' }">🔑 KeyRing</router-link>

      <template v-if="auth.isAuthenticated">
        <router-link :to="{ name: 'dashboard' }">Dashboard</router-link>
        <router-link :to="{ name: 'properties' }">Propiedades</router-link>
        <router-link :to="{ name: 'contracts' }">Contratos</router-link>
        <router-link :to="{ name: 'transactions' }">Transacciones</router-link>
        <router-link :to="{ name: 'map' }">Mapa</router-link>
        <router-link v-if="auth.isAdmin" :to="{ name: 'reports' }">Reportes</router-link>
        <router-link v-if="auth.isAdmin" :to="{ name: 'admin-users' }">Usuarios</router-link>
      </template>

      <span class="navbar-spacer"></span>

      <template v-if="auth.isAuthenticated">
        <span>{{ auth.user?.fullName }}</span>
        <button class="btn btn-secondary" @click="onLogout">Salir</button>
      </template>
      <router-link v-else :to="{ name: 'login' }">Ingresar</router-link>
    </div>
  </nav>
</template>
