<script setup lang="ts">
// Administración de usuarios (solo admin): listar, filtrar por rol, crear,
// editar, cambiar de rol y eliminar, con las guardas que impiden dejar el
// sistema en un estado inconsistente.
import { computed, reactive, ref } from 'vue'
import DataTable, { type TableColumn } from '../components/DataTable.vue'
import FilterSelect, { type SelectOption } from '../components/FilterSelect.vue'
import * as userService from '../services/user.service'
import { UserRole, UserRoleLabel } from '../interfaces/enums'
import { useAuthStore } from '../stores/auth'
import type { UserInterface } from '../interfaces/UserInterface'
import type { CreateUserDTO } from '../dtos/CreateUserDTO'

const authStore = useAuthStore()

const allUsers = ref<UserInterface[]>([])
const selectedRole = ref('')
const feedbackMessage = ref('')

/** Recarga el listado completo de usuarios. */
function reloadFromStorage(): void {
  allUsers.value = userService.list()
}

// Se carga aqui y no en onMounted: LocalStorage responde de inmediato,
// asi la primera pintada ya trae los datos en vez de una tabla vacia.
reloadFromStorage()

const roleFilterOptions: SelectOption[] = Object.values(UserRole).map((role) => ({
  value: role,
  label: UserRoleLabel[role],
}))

const tableColumns: TableColumn[] = [
  { key: 'fullName', label: 'Nombre' },
  { key: 'email', label: 'Correo' },
  { key: 'phone', label: 'Teléfono' },
  { key: 'city', label: 'Ciudad' },
  { key: 'roleLabel', label: 'Rol' },
  { key: 'memberSince', label: 'Miembro desde' },
  { key: 'propertyCount', label: 'Propiedades' },
]

// La fila se arma campo por campo: las credenciales nunca salen del servicio.
const tableRows = computed(() =>
  allUsers.value
    .filter((user) => !selectedRole.value || user.role === selectedRole.value)
    .map((user) => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      city: user.city,
      memberSince: user.memberSince,
      role: user.role,
      roleLabel: UserRoleLabel[user.role] ?? user.role,
      propertyCount: (user.properties ?? []).length,
    })),
)

// --- Formulario de alta y edición ---
const isFormVisible = ref(false)
const editingUserId = ref<string | null>(null)

/** Usuario en blanco, con rol de propietario por defecto. */
function buildEmptyUser(): CreateUserDTO {
  return {
    fullName: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    memberSince: new Date().toISOString().slice(0, 10),
    role: UserRole.USER,
    properties: [],
  }
}

const userForm = reactive<CreateUserDTO>(buildEmptyUser())

/** Abre el formulario vacío para registrar un usuario nuevo. */
function startCreating(): void {
  editingUserId.value = null
  feedbackMessage.value = ''
  Object.assign(userForm, buildEmptyUser())
  isFormVisible.value = true
}

/**
 * Abre el formulario cargado con un usuario existente.
 * @param userId identificador del usuario a editar
 */
function startEditing(userId: string): void {
  const existing = userService.findById(userId)
  if (!existing) return
  const { id: _id, ...editableFields } = existing
  editingUserId.value = existing.id
  feedbackMessage.value = ''
  Object.assign(userForm, editableFields)
  isFormVisible.value = true
}

/** Cierra el formulario descartando los cambios. */
function cancelEditing(): void {
  isFormVisible.value = false
  editingUserId.value = null
  feedbackMessage.value = ''
}

/**
 * Valida las reglas de negocio del usuario.
 * @returns mensaje de error en español, o null si es válido
 */
function findValidationError(): string | null {
  if (!userForm.fullName.trim()) return 'El nombre completo es obligatorio.'
  if (!userForm.email.trim()) return 'El correo es obligatorio.'
  if (userService.emailTaken(userForm.email, editingUserId.value ?? undefined)) {
    return 'Ya existe otro usuario registrado con ese correo.'
  }
  if (!editingUserId.value && !userForm.password) {
    return 'Asigna una contraseña inicial al usuario nuevo.'
  }
  return null
}

/** Valida y guarda el usuario, luego recarga la tabla. */
function saveUser(): void {
  const validationError = findValidationError()
  if (validationError) {
    feedbackMessage.value = validationError
    return
  }
  if (editingUserId.value) {
    userService.update(editingUserId.value, { ...userForm })
  } else {
    userService.create({ ...userForm })
  }
  reloadFromStorage()
  cancelEditing()
}

/**
 * Alterna el rol entre administrador y propietario.
 * No permite degradar al último administrador del sistema.
 * @param userId identificador del usuario
 * @param currentRole rol vigente
 */
function toggleRole(userId: string, currentRole: UserRole): void {
  feedbackMessage.value = ''
  if (currentRole === UserRole.ADMIN && userService.countAdmins() <= 1) {
    feedbackMessage.value = 'No puedes quitarle el rol al último administrador del sistema.'
    return
  }
  userService.update(userId, {
    role: currentRole === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN,
  })
  reloadFromStorage()
}

/**
 * Elimina un usuario si las guardas de integridad lo permiten.
 * @param userId identificador del usuario
 * @param fullName nombre mostrado en la confirmación
 */
function deleteUser(userId: string, fullName: string): void {
  feedbackMessage.value = ''
  const blockingReason = userService.blockedFromRemoval(userId, authStore.user?.id ?? '')
  if (blockingReason) {
    feedbackMessage.value = blockingReason
    return
  }
  if (!window.confirm(`¿Eliminar al usuario "${fullName}"? Esta acción no se puede deshacer.`)) {
    return
  }
  userService.remove(userId)
  reloadFromStorage()
}

const inputClasses =
  'rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:outline-2 focus:outline-primary'
</script>

<template>
  <section>
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-2xl font-bold">Administración de usuarios</h1>
      <button
        class="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark"
        type="button"
        @click="startCreating"
      >
        + Nuevo usuario
      </button>
    </div>
    <p class="mb-4 text-slate-500">Página exclusiva para administradores.</p>

    <form
      v-if="isFormVisible"
      class="mb-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2"
      @submit.prevent="saveUser"
    >
      <h2 class="col-span-full text-lg font-semibold">
        {{ editingUserId ? 'Editar usuario' : 'Nuevo usuario' }}
      </h2>
      <label class="flex flex-col gap-1">
        <span class="text-sm font-medium">Nombre completo</span>
        <input v-model="userForm.fullName" :class="inputClasses" />
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-sm font-medium">Correo</span>
        <input v-model="userForm.email" type="email" :class="inputClasses" />
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-sm font-medium">Contraseña</span>
        <input
          v-model="userForm.password"
          type="password"
          autocomplete="new-password"
          :class="inputClasses"
        />
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-sm font-medium">Teléfono</span>
        <input v-model="userForm.phone" :class="inputClasses" />
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-sm font-medium">Ciudad</span>
        <input v-model="userForm.city" :class="inputClasses" />
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-sm font-medium">Rol</span>
        <select v-model="userForm.role" :class="inputClasses">
          <option v-for="option in roleFilterOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>

      <div class="col-span-full flex gap-3">
        <button
          class="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark"
          type="submit"
        >
          Guardar
        </button>
        <button
          class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          type="button"
          @click="cancelEditing"
        >
          Cancelar
        </button>
      </div>
    </form>

    <div class="mb-4 flex flex-wrap items-end gap-4">
      <FilterSelect v-model="selectedRole" label="Rol" :options="roleFilterOptions" />
    </div>

    <p v-if="feedbackMessage" aria-live="polite" class="mb-4 text-sm text-red-600">
      {{ feedbackMessage }}
    </p>

    <DataTable :columns="tableColumns" :rows="tableRows">
      <template #actions="{ row }">
        <div class="flex gap-3">
          <button
            class="text-primary hover:underline"
            type="button"
            @click="startEditing(String(row.id))"
          >
            Editar
          </button>
          <button
            class="text-primary hover:underline"
            type="button"
            @click="toggleRole(String(row.id), row.role as UserRole)"
          >
            Cambiar rol
          </button>
          <!-- El botón no se ofrece cuando la acción nunca podría completarse:
               sobre el propio usuario en sesión o sobre el último administrador -->
          <button
            v-if="!userService.blockedFromRemoval(String(row.id), authStore.user?.id ?? '')"
            class="text-red-600 hover:underline"
            type="button"
            @click="deleteUser(String(row.id), String(row.fullName))"
          >
            Eliminar
          </button>
        </div>
      </template>
    </DataTable>
  </section>
</template>
