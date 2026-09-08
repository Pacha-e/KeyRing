<script setup lang="ts">
// Formulario de propiedad: sirve para crear (/properties/new) y editar (/properties/:id/edit).
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SelectField, { type SelectOption } from '../components/SelectField.vue'
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

// Las opciones llevan ya su etiqueta en español: el selector solo dibuja lo que
// se le pasa y no tiene que conocer las tablas de traducción del dominio.
const typeOptions: SelectOption<PropertyType>[] = Object.values(PropertyType).map((type) => ({
  value: type,
  label: PropertyTypeLabel[type],
}))
const modeOptions: SelectOption<RentalMode>[] = Object.values(RentalMode).map((mode) => ({
  value: mode,
  label: RentalModeLabel[mode],
}))
const statusOptions: SelectOption<PropertyStatus>[] = Object.values(PropertyStatus).map(
  (status) => ({ value: status, label: PropertyStatusLabel[status] }),
)

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
  <section
    class="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
  >
    <h1 class="font-brand mt-0 mb-1 text-2xl font-semibold text-ink">
      {{ isEditing ? 'Editar propiedad' : 'Nueva propiedad' }}
    </h1>
    <p class="mt-0 mb-6 text-sm text-slate-500">
      Datos del inmueble, su modalidad de arriendo y sus costos fijos.
    </p>

    <form class="grid gap-4 sm:grid-cols-2" @submit.prevent="saveProperty">
      <label class="col-span-full flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">Nombre</span>
        <input v-model="propertyForm.name" required class="field-input" />
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">Dirección</span>
        <input v-model="propertyForm.address" required class="field-input" />
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">Ciudad</span>
        <input v-model="propertyForm.city" required class="field-input" />
      </label>

      <SelectField v-model="propertyForm.type" label="Tipo" :options="typeOptions" />
      <SelectField
        v-model="propertyForm.rentalMode"
        label="Modalidad de arriendo"
        :options="modeOptions"
      />
      <SelectField v-model="propertyForm.status" label="Estado" :options="statusOptions" />

      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">Arriendo mensual estimado (COP)</span>
        <input
          v-model.number="propertyForm.estimatedMonthlyRent"
          type="number"
          min="0"
          class="field-input"
        />
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">Cuota de administración (COP)</span>
        <input v-model.number="propertyForm.adminFee" type="number" min="0" class="field-input" />
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">Otros costos fijos (COP)</span>
        <input
          v-model.number="propertyForm.otherFixedCosts"
          type="number"
          min="0"
          class="field-input"
        />
      </label>

      <p
        v-if="formError"
        aria-live="polite"
        class="col-span-full m-0 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
      >
        {{ formError }}
      </p>

      <div class="col-span-full mt-2 flex gap-3 border-t border-slate-200 pt-5">
        <button
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark"
          type="submit"
        >
          Guardar
        </button>
        <router-link
          class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 no-underline transition hover:bg-slate-50"
          :to="{ name: 'properties' }"
        >
          Cancelar
        </router-link>
      </div>
    </form>
  </section>
</template>
