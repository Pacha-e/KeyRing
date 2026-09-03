<script setup lang="ts">
// Administración de usuarios (solo admin).
// TODO equipo: crear/editar usuarios y cambiar roles.
import DataTable, { type TableColumn } from '../components/DataTable.vue'
import { getAll, KEYS } from '../services/storage'
import type { UserInterface } from '../interfaces/UserInterface'

const users = getAll<UserInterface>(KEYS.users).map((u) => ({
  ...u,
  password: '••••••••', // nunca mostrar el password real
  propertiesCount: (u.properties ?? []).length,
}))

const columns: TableColumn[] = [
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
    <h1 class="mb-4 text-2xl font-bold">Administración de usuarios</h1>
    <p class="mb-4 text-slate-500">Página exclusiva para administradores.</p>
    <DataTable :columns="columns" :rows="users" />
  </section>
</template>
