<script setup>
// Administración de usuarios (solo admin).
// TODO equipo: crear/editar usuarios y cambiar roles.
import DataTable from '../components/DataTable.vue'
import { getAll, KEYS } from '../services/storage'

const users = getAll(KEYS.users).map((u) => ({
  ...u,
  propertiesCount: (u.properties ?? []).length,
}))

const columns = [
  { key: 'fullName', label: 'Nombre' },
  { key: 'email', label: 'Correo' },
  { key: 'phone', label: 'Teléfono' },
  { key: 'city', label: 'Ciudad' },
  { key: 'role', label: 'Rol' },
  { key: 'memberSince', label: 'Miembro desde' },
  { key: 'propertiesCount', label: 'Propiedades' },
]
</script>

<template>
  <section>
    <h1>Administración de usuarios</h1>
    <p class="text-muted">Página exclusiva para administradores.</p>
    <DataTable :columns="columns" :rows="users" />
  </section>
</template>
