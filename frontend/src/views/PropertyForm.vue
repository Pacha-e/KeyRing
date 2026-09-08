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
const authStore = useAuthStore()

const propertyId = computed(() => String(route.params.id ?? ''))
const isEditing = computed(() => Boolean(propertyId.value))
const formError = ref('')

/** Propiedad vacía con los valores por defecto del dominio. */
function buildEmptyProperty(): CreatePropertyDTO {
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

const propertyForm = ref<CreatePropertyDTO>(buildEmptyProperty())

/**
 * Carga en el formulario la propiedad indicada por la ruta.
 * Si el id no existe, redirige al listado en lugar de guardar sobre la nada.
 */
function loadFormFromRoute(): void {
  formError.value = ''
  if (!isEditing.value) {
    propertyForm.value = buildEmptyProperty()
    return
  }
  const existing = propertyService.findById(propertyId.value)
  if (!existing) {
    router.replace({ name: 'properties' })
    return
  }
  const { id: _id, ...editableFields } = existing
  propertyForm.value = editableFields
}

// Recargar también al navegar entre /properties/:id/edit sin desmontar la vista
watch(propertyId, loadFormFromRoute, { immediate: true })

const typeOptions = Object.values(PropertyType)
const modeOptions = Object.values(RentalMode)
const statusOptions = Object.values(PropertyStatus)

/**
 * Valida las reglas de negocio de la propiedad.
 * @returns mensaje de error en español, o null si el formulario es válido
 */
function findValidationError(): string | null {
  if (!propertyForm.value.name.trim()) return 'El nombre de la propiedad es obligatorio.'
  if (!propertyForm.value.city.trim()) return 'La ciudad es obligatoria.'
  if (propertyForm.value.estimatedMonthlyRent < 0 || propertyForm.value.adminFee < 0) {
    return 'Los montos no pueden ser negativos.'
  }
  if (propertyForm.value.otherFixedCosts < 0) return 'Los montos no pueden ser negativos.'
  return null
}

/** Valida y persiste la propiedad, luego vuelve al listado. */
function saveProperty(): void {
  const validationError = findValidationError()
  if (validationError) {
    formError.value = validationError
    return
  }
  const values: CreatePropertyDTO = {
    ...propertyForm.value,
    ownerId: propertyForm.value.ownerId ?? authStore.user?.id ?? null,
  }
  if (isEditing.value) {
    propertyService.update(propertyId.value, values)
  } else {
    propertyService.create(values)
  }
  router.push({ name: 'properties' })
}
</script>

<template>
  <section class="max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <h1 class="font-brand mt-0 mb-1 text-2xl font-semibold text-ink">
      {{ isEditing ? 'Editar propiedad' : 'Nueva propiedad' }}
    </h1>
    <p class="mt-0 mb-6 text-sm text-slate-500">
      Datos del inmueble, su modalidad de arriendo y sus costos fijos.
    </p>
    <form @submit.prevent="saveProperty">
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Nombre</span>
        <input v-model="propertyForm.name" required class="field-input" />
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Dirección</span>
        <input v-model="propertyForm.address" required class="field-input" />
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Ciudad</span>
        <input v-model="propertyForm.city" required class="field-input" />
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Tipo</span>
        <select v-model="propertyForm.type" class="field-input">
          <option v-for="t in typeOptions" :key="t" :value="t">{{ PropertyTypeLabel[t] }}</option>
        </select>
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Modalidad de arriendo</span>
        <select v-model="propertyForm.rentalMode" class="field-input">
          <option v-for="m in modeOptions" :key="m" :value="m">{{ RentalModeLabel[m] }}</option>
        </select>
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Estado</span>
        <select v-model="propertyForm.status" class="field-input">
          <option v-for="s in statusOptions" :key="s" :value="s">
            {{ PropertyStatusLabel[s] }}
          </option>
        </select>
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Arriendo mensual estimado (COP)</span>
        <input
          v-model.number="propertyForm.estimatedMonthlyRent"
          type="number"
          min="0"
          class="field-input"
        />
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Cuota de administración (COP)</span>
        <input v-model.number="propertyForm.adminFee" type="number" min="0" class="field-input" />
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Otros costos fijos (COP)</span>
        <input
          v-model.number="propertyForm.otherFixedCosts"
          type="number"
          min="0"
          class="field-input"
        />
      </label>
      <p v-if="formError" aria-live="polite" class="mb-4 text-sm text-red-600">{{ formError }}</p>

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
