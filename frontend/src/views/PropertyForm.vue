<script setup lang="ts">
// Formulario de propiedad: sirve para crear (/properties/new) y editar (/properties/:id/edit).
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as propertyService from '../services/property.service'
import {
  PropertyType,
  PropertyTypeLabel,
  RentalMode,
  RentalModeLabel,
  PropertyStatus,
  PropertyStatusLabel,
} from '../interfaces/enums'
import type { CreatePropertyDTO } from '../dtos/CreatePropertyDTO'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const propertyId = computed(() => String(route.params.id ?? ''))
const editing = computed(() => Boolean(propertyId.value))
const error = ref('')

/** Propiedad vacía con los valores por defecto del dominio. */
function emptyForm(): CreatePropertyDTO {
  return {
    name: '',
    address: '',
    city: '',
    type: PropertyType.APARTMENT,
    rentalMode: RentalMode.AIRBNB,
    status: PropertyStatus.VACANT,
    estimatedMonthlyRent: 0,
    adminFee: 0,
    otherFixedCosts: 0,
    ownerId: null,
  }
}

const form = ref<CreatePropertyDTO>(emptyForm())

/**
 * Carga en el formulario la propiedad indicada por la ruta.
 * Si el id no existe, redirige al listado en lugar de guardar sobre la nada.
 */
function loadFormFromRoute(): void {
  error.value = ''
  if (!editing.value) {
    form.value = emptyForm()
    return
  }
  const existing = propertyService.findById(propertyId.value)
  if (!existing) {
    router.replace({ name: 'properties' })
    return
  }
  const { id: _id, ...editableFields } = existing
  form.value = editableFields
}

// Recargar también al navegar entre /properties/:id/edit sin desmontar la vista
watch(propertyId, loadFormFromRoute, { immediate: true })

const typeOptions = Object.values(PropertyType)
const modeOptions = Object.values(RentalMode)
const statusOptions = Object.values(PropertyStatus)

const inputClasses =
  'rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:outline-2 focus:outline-primary'

/**
 * Valida las reglas de negocio de la propiedad.
 * @returns mensaje de error en español, o null si el formulario es válido
 */
function validate(): string | null {
  if (!form.value.name.trim()) return 'El nombre de la propiedad es obligatorio.'
  if (!form.value.city.trim()) return 'La ciudad es obligatoria.'
  if (form.value.estimatedMonthlyRent < 0 || form.value.adminFee < 0) {
    return 'Los montos no pueden ser negativos.'
  }
  if (form.value.otherFixedCosts < 0) return 'Los montos no pueden ser negativos.'
  return null
}

/** Valida y persiste la propiedad, luego vuelve al listado. */
function onSubmit(): void {
  const validationError = validate()
  if (validationError) {
    error.value = validationError
    return
  }
  const values: CreatePropertyDTO = {
    ...form.value,
    ownerId: form.value.ownerId ?? auth.user?.id ?? null,
  }
  if (editing.value) {
    propertyService.update(propertyId.value, values)
  } else {
    propertyService.create(values)
  }
  router.push({ name: 'properties' })
}
</script>

<template>
  <section class="max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
    <h1 class="mb-4 text-2xl font-bold">{{ editing ? 'Editar propiedad' : 'Nueva propiedad' }}</h1>
    <form @submit.prevent="onSubmit">
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Nombre</span>
        <input v-model="form.name" required :class="inputClasses" />
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Dirección</span>
        <input v-model="form.address" required :class="inputClasses" />
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Ciudad</span>
        <input v-model="form.city" required :class="inputClasses" />
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Tipo</span>
        <select v-model="form.type" :class="inputClasses">
          <option v-for="t in typeOptions" :key="t" :value="t">{{ PropertyTypeLabel[t] }}</option>
        </select>
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Modalidad de arriendo</span>
        <select v-model="form.rentalMode" :class="inputClasses">
          <option v-for="m in modeOptions" :key="m" :value="m">{{ RentalModeLabel[m] }}</option>
        </select>
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Estado</span>
        <select v-model="form.status" :class="inputClasses">
          <option v-for="s in statusOptions" :key="s" :value="s">
            {{ PropertyStatusLabel[s] }}
          </option>
        </select>
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Arriendo mensual estimado (COP)</span>
        <input
          v-model.number="form.estimatedMonthlyRent"
          type="number"
          min="0"
          :class="inputClasses"
        />
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Cuota de administración (COP)</span>
        <input v-model.number="form.adminFee" type="number" min="0" :class="inputClasses" />
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Otros costos fijos (COP)</span>
        <input v-model.number="form.otherFixedCosts" type="number" min="0" :class="inputClasses" />
      </label>
      <p v-if="error" aria-live="polite" class="mb-4 text-sm text-red-600">{{ error }}</p>

      <div class="flex gap-3">
        <button
          class="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark"
          type="submit"
        >
          Guardar
        </button>
        <router-link
          class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 no-underline hover:bg-slate-50"
          :to="{ name: 'properties' }"
        >
          Cancelar
        </router-link>
      </div>
    </form>
  </section>
</template>
