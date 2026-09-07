<script setup lang="ts">
// Administración de usuarios (solo admin).
import { computed, onMounted, ref } from 'vue'
import DataTable, { type TableColumn } from '../components/DataTable.vue'
import FilterSelect, { type SelectOption } from '../components/FilterSelect.vue'
import * as userService from '../services/user.service'
import { UserRole } from '../interfaces/enums'
import { useAuthStore } from '../stores/auth'
import type { UserInterface } from '../interfaces/UserInterface'

const auth = useAuthStore()

const users = ref<UserInterface[]>([])
const role = ref('')
const error = ref('')

/** Recarga el listado de usuarios. */
function load(): void {
  users.value = userService.list()
}

onMounted(load)

const roleOptions: SelectOption[] = [
  { value: UserRole.ADMIN, label: 'Administrador' },
  { value: UserRole.USER, label: 'Propietario' },
]

const columns: TableColumn[] = [
  { key: 'fullName', label: 'Nombre' },
  { key: 'email', label: 'Correo' },
  { key: 'phone', label: 'Teléfono' },
  { key: 'city', label: 'Ciudad' },
  { key: 'roleLabel', label: 'Rol' },
  { key: 'memberSince', label: 'Miembro desde' },
  { key: 'propertiesCount', label: 'Propiedades' },
]

// La fila se arma campo por campo: las credenciales nunca salen del servicio.
const rows = computed(() =>
  users.value
    .filter((u) => !role.value || u.role === role.value)
    .map((u) => ({
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      city: u.city,
      memberSince: u.memberSince,
      role: u.role,
      roleLabel: u.role === UserRole.ADMIN ? 'Administrador' : 'Propietario',
      propertiesCount: (u.properties ?? []).length,
    })),
)

/**
 * Alterna el rol de un usuario entre administrador y propietario.
 * Impide degradar al último administrador del sistema.
 * @param id identificador del usuario
 * @param actual rol vigente del usuario
 */
function onToggleRole(id: string, actual: UserRole): void {
  error.value = ''
  if (actual === UserRole.ADMIN && userService.countAdmins() <= 1) {
    error.value = 'No puedes quitarle el rol al último administrador del sistema.'
    return
  }
  userService.update(id, { role: actual === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN })
  load()
}

/**
 * Elimina un usuario si las guardas de integridad lo permiten.
 * @param id identificador del usuario
 * @param nombre nombre mostrado en la confirmación
 */
function onDelete(id: string, nombre: string): void {
  error.value = ''
  const bloqueo = userService.blockedFromRemoval(id, auth.user?.id ?? '')
  if (bloqueo) {
    error.value = bloqueo
    return
  }
  if (!window.confirm(`¿Eliminar al usuario "${nombre}"? Esta acción no se puede deshacer.`)) return
  userService.remove(id)
  load()
}
</script>

<template>
  <section>
    <h1 class="mb-4 text-2xl font-bold">Administración de usuarios</h1>
    <p class="mb-4 text-slate-500">Página exclusiva para administradores.</p>

    <div class="mb-4 flex flex-wrap items-end gap-4">
      <FilterSelect v-model="role" label="Rol" :options="roleOptions" />
    </div>

    <p v-if="error" aria-live="polite" class="mb-4 text-sm text-red-600">{{ error }}</p>

    <DataTable :columns="columns" :rows="rows">
      <template #actions="{ row }">
        <div class="flex gap-3">
          <button
            class="text-primary hover:underline"
            type="button"
            @click="onToggleRole(String(row.id), row.role as UserRole)"
          >
            Cambiar rol
          </button>
          <button
            class="text-red-600 hover:underline"
            type="button"
            @click="onDelete(String(row.id), String(row.fullName))"
          >
            Eliminar
          </button>
        </div>
      </template>
    </DataTable>
  </section>
</template>
