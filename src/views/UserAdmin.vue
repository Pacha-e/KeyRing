<script setup lang="ts">
// Administración de usuarios (solo admin): listar, crear, editar y cambiar roles.
import { reactive, ref } from 'vue'
import DataTable, { type TableColumn } from '../components/DataTable.vue'
import { getAll, create, update, remove, KEYS } from '../services/storage'
import { UserRole } from '../interfaces/enums'
import { useAuthStore } from '../stores/auth'
import type { UserInterface } from '../interfaces/UserInterface'
import type { CreateUserDTO } from '../dtos/CreateUserDTO'

const auth = useAuthStore()
const users = ref<UserInterface[]>(getAll<UserInterface>(KEYS.users))

const rows = () =>
  users.value.map((u) => ({
    ...u,
    password: '••••••••', // nunca mostrar el password real
    propertiesCount: (u.properties ?? []).length,
    roleLabel: u.role === UserRole.ADMIN ? 'Administrador' : 'Usuario',
  }))

const columns: TableColumn[] = [
  { key: 'fullName', label: 'Nombre' },
  { key: 'email', label: 'Correo' },
  { key: 'phone', label: 'Teléfono' },
  { key: 'city', label: 'Ciudad' },
  { key: 'roleLabel', label: 'Rol' },
  { key: 'memberSince', label: 'Miembro desde' },
  { key: 'propertiesCount', label: 'Propiedades' },
]

const roleOptions = Object.values(UserRole)

// --- formulario crear / editar ---
const showForm = ref(false)
const editingId = ref<string | null>(null)

function emptyForm(): CreateUserDTO {
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

const form = reactive<CreateUserDTO>(emptyForm())

function onNew() {
  editingId.value = null
  Object.assign(form, emptyForm())
  showForm.value = true
}

function onEdit(row: Record<string, unknown>) {
  const original = users.value.find((u) => u.id === row.id)
  if (!original) return
  editingId.value = original.id
  Object.assign(form, {
    fullName: original.fullName,
    email: original.email,
    password: original.password,
    phone: original.phone,
    city: original.city,
    memberSince: original.memberSince,
    role: original.role,
    properties: original.properties,
  })
  showForm.value = true
}

function onCancel() {
  showForm.value = false
  editingId.value = null
}

function onSubmit() {
  if (editingId.value) {
    update<UserInterface>(KEYS.users, editingId.value, { ...form })
  } else {
    create<UserInterface>(KEYS.users, { ...form })
  }
  users.value = getAll<UserInterface>(KEYS.users)
  showForm.value = false
  editingId.value = null
}

function onDelete(id: string, name: string) {
  if (id === auth.user?.id) {
    alert('No puedes eliminar tu propio usuario mientras tienes la sesión iniciada.')
    return
  }
  if (!confirm(`¿Eliminar al usuario "${name}"? Esta acción no se puede deshacer.`)) return
  remove(KEYS.users, id)
  users.value = getAll<UserInterface>(KEYS.users)
}

const inputClass =
  'rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:outline-2 focus:outline-primary'
</script>

<template>
  <section>
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-2xl font-bold">Administración de usuarios</h1>
      <button
        class="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark"
        type="button"
        @click="onNew"
      >
        + Nuevo usuario
      </button>
    </div>
    <p class="mb-4 text-slate-500">Página exclusiva para administradores.</p>

    <form
      v-if="showForm"
      class="mb-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2"
      @submit.prevent="onSubmit"
    >
      <h2 class="col-span-full text-lg font-semibold">
        {{ editingId ? 'Editar usuario' : 'Nuevo usuario' }}
      </h2>
      <label class="flex flex-col gap-1">
        <span class="text-sm font-medium">Nombre completo</span>
        <input v-model="form.fullName" required :class="inputClass" />
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-sm font-medium">Correo</span>
        <input v-model="form.email" type="email" required :class="inputClass" />
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-sm font-medium">Contraseña</span>
        <input v-model="form.password" type="text" required :class="inputClass" />
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-sm font-medium">Teléfono</span>
        <input v-model="form.phone" :class="inputClass" />
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-sm font-medium">Ciudad</span>
        <input v-model="form.city" :class="inputClass" />
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-sm font-medium">Rol</span>
        <select v-model="form.role" :class="inputClass">
          <option v-for="r in roleOptions" :key="r" :value="r">
            {{ r === 'admin' ? 'Administrador' : 'Usuario' }}
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
          @click="onCancel"
        >
          Cancelar
        </button>
      </div>
    </form>

    <DataTable :columns="columns" :rows="rows()">
      <template #actions="{ row }">
        <button class="text-primary hover:underline" type="button" @click="onEdit(row)">
          Editar
        </button>
        <button
          v-if="row.id !== auth.user?.id"
          class="ml-3 text-red-600 hover:underline"
          type="button"
          @click="onDelete(String(row.id), String(row.fullName))"
        >
          Eliminar
        </button>
      </template>
    </DataTable>
  </section>
</template>
