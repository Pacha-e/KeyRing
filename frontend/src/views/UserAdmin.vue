<script setup lang="ts">
// Administración de usuarios (solo admin): listar, filtrar por rol, crear,
// editar, cambiar de rol y eliminar, con las guardas que impiden dejar el
// sistema en un estado inconsistente. Las guardas viven en la API; aquí se
// consultan para decidir qué botones mostrar.
import { computed, onMounted, reactive, ref } from 'vue'
import DataTable, { type TableColumn } from '../components/DataTable.vue'
import FilterSelect, { type SelectOption } from '../components/FilterSelect.vue'
import SelectField from '../components/SelectField.vue'
import FilterBar from '../components/FilterBar.vue'
import PageHeader from '../components/PageHeader.vue'
import StatusBadge from '../components/StatusBadge.vue'
import * as userService from '../services/user.service'
import { apiErrorMessage } from '../services/http'
import { USER_ROLE_TONE } from '../utils/badges'
import { UserRole, UserRoleLabel } from '../interfaces/enums'
import { useAuthStore } from '../stores/auth'
import type { SessionUser } from '../services/auth.service'

const authStore = useAuthStore()

const allUsers = ref<SessionUser[]>([])
const selectedRole = ref('')
const feedbackMessage = ref('')

/** Recarga el listado completo de usuarios (sin contraseñas). */
async function reloadFromApi(): Promise<void> {
  try {
    allUsers.value = await userService.list()
  } catch (error) {
    feedbackMessage.value = apiErrorMessage(error)
  }
}

// La API responde de forma asíncrona: se carga al montar la vista.
onMounted(() => void reloadFromApi())

// Se tipan con el enum del dominio y no con SelectOption a secas: así lo que
// devuelve el selector sigue siendo un UserRole y no una cadena suelta.
const roleFilterOptions: SelectOption<UserRole>[] = Object.values(UserRole).map((role) => ({
  value: role,
  label: UserRoleLabel[role],
}))

const tableColumns: TableColumn[] = [
  { key: 'fullName', label: 'Nombre' },
  { key: 'email', label: 'Correo' },
  { key: 'phone', label: 'Teléfono' },
  { key: 'city', label: 'Ciudad' },
  { key: 'roleLabel', label: 'Rol' },
  { key: 'memberSince', label: 'Miembro desde', align: 'right' },
]

// La fila se arma campo por campo: la API nunca envía contraseñas y aquí
// tampoco hay nada sensible que pintar.
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
    })),
)

// --- Formulario de alta y edición ---
const isFormVisible = ref(false)
const editingUserId = ref<string | null>(null)

/** Usuario en blanco, con rol de propietario por defecto. */
function buildEmptyUser(): Omit<SessionUser, 'id'> & { password: string } {
  return {
    fullName: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    memberSince: new Date().toISOString().slice(0, 10),
    role: UserRole.USER,
  }
}

const userForm = reactive<Omit<SessionUser, 'id'> & { password: string }>(buildEmptyUser())

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
  const existing = allUsers.value.find((user) => user.id === userId)
  if (!existing) return
  editingUserId.value = existing.id
  feedbackMessage.value = ''
  Object.assign(userForm, buildEmptyUser(), existing)
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
async function findValidationError(): Promise<string | null> {
  if (!userForm.fullName.trim()) return 'El nombre completo es obligatorio.'
  if (!userForm.email.trim()) return 'El correo es obligatorio.'
  if (await userService.emailTaken(userForm.email, editingUserId.value ?? undefined)) {
    return 'Ya existe otro usuario registrado con ese correo.'
  }
  if (!editingUserId.value && !userForm.password) {
    return 'Asigna una contraseña inicial al usuario nuevo.'
  }
  return null
}

/** Valida y guarda el usuario, luego recarga la tabla. */
async function saveUser(): Promise<void> {
  const validationError = await findValidationError()
  if (validationError) {
    feedbackMessage.value = validationError
    return
  }
  try {
    if (editingUserId.value) {
      await userService.update(editingUserId.value, { ...userForm })
    } else {
      await userService.create({ ...userForm })
    }
  } catch (error) {
    feedbackMessage.value = apiErrorMessage(error)
    return
  }
  await reloadFromApi()
  cancelEditing()
}

/**
 * Alterna el rol entre administrador y propietario.
 * No permite degradar al último administrador del sistema.
 * @param userId identificador del usuario
 * @param currentRole rol vigente
 */
async function toggleRole(userId: string, currentRole: UserRole): Promise<void> {
  feedbackMessage.value = ''
  const admins = allUsers.value.filter((user) => user.role === UserRole.ADMIN).length
  if (currentRole === UserRole.ADMIN && admins <= 1) {
    feedbackMessage.value = 'No puedes quitarle el rol al último administrador del sistema.'
    return
  }
  try {
    await userService.update(userId, {
      role: currentRole === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN,
    })
  } catch (error) {
    feedbackMessage.value = apiErrorMessage(error)
    return
  }
  await reloadFromApi()
}

// Ids que nunca ofrecen botón de eliminar: el propio usuario en sesión y el
// último administrador. Se calcula en el script y no en el template, para
// que la vista no llame servicios (regla 10 de la wiki).
const currentUserId = computed(() => authStore.user?.id ?? '')
const adminIds = computed(() =>
  allUsers.value.filter((user) => user.role === UserRole.ADMIN).map((user) => user.id),
)
const undeletableIds = computed(
  () => new Set<string>([currentUserId.value, ...(adminIds.value.length <= 1 ? adminIds.value : [])]),
)

/**
 * Elimina un usuario si las guardas de integridad lo permiten.
 * @param userId identificador del usuario
 * @param fullName nombre mostrado en la confirmación
 */
async function deleteUser(userId: string, fullName: string): Promise<void> {
  feedbackMessage.value = ''
  const blockingReason = await userService.blockedFromRemoval(userId, currentUserId.value)
  if (blockingReason) {
    feedbackMessage.value = blockingReason
    return
  }
  if (!window.confirm(`¿Eliminar al usuario "${fullName}"? Esta acción no se puede deshacer.`)) {
    return
  }
  try {
    await userService.remove(userId)
  } catch (error) {
    feedbackMessage.value = apiErrorMessage(error)
    return
  }
  await reloadFromApi()
}
</script>

<template>
  <section>
    <PageHeader
      title="Administración de usuarios"
      :subtitle="`${allUsers.length} cuenta(s) registradas · página exclusiva para administradores`"
    >
      <template #actions>
        <button
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark"
          type="button"
          @click="startCreating"
        >
          + Nuevo usuario
        </button>
      </template>
    </PageHeader>

    <form
      v-if="isFormVisible"
      class="mb-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2"
      @submit.prevent="saveUser"
    >
      <h2 class="font-brand col-span-full m-0 text-lg font-semibold text-ink">
        {{ editingUserId ? 'Editar usuario' : 'Nuevo usuario' }}
      </h2>
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">Nombre completo</span>
        <input v-model="userForm.fullName" class="field-input" />
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">Correo</span>
        <input v-model="userForm.email" type="email" class="field-input" />
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">Contraseña</span>
        <input
          v-model="userForm.password"
          type="password"
          autocomplete="new-password"
          class="field-input"
        />
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">Teléfono</span>
        <input v-model="userForm.phone" class="field-input" />
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">Ciudad</span>
        <input v-model="userForm.city" class="field-input" />
      </label>
      <SelectField v-model="userForm.role" label="Rol" :options="roleFilterOptions" />

      <div class="col-span-full mt-2 flex gap-3 border-t border-slate-200 pt-5">
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

    <FilterBar>
      <FilterSelect v-model="selectedRole" label="Rol" :options="roleFilterOptions" />
    </FilterBar>

    <p
      v-if="feedbackMessage"
      aria-live="polite"
      class="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
    >
      {{ feedbackMessage }}
    </p>

    <DataTable
      :columns="tableColumns"
      :rows="tableRows"
      :empty-message="selectedRole ? 'Ningún usuario con ese rol' : 'Todavía no hay usuarios'"
      empty-hint="Crea una cuenta con el botón “Nuevo usuario”."
    >
      <template #cell-roleLabel="{ value, row }">
        <StatusBadge :label="String(value)" :tone="USER_ROLE_TONE[row.role as UserRole]" />
      </template>
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
            v-if="!undeletableIds.has(String(row.id))"
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
