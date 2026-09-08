<script setup lang="ts">
// Formulario de contrato: sirve para crear (/contracts/new) y editar (/contracts/:id/edit).
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as contractService from '../services/contract.service'
import * as propertyService from '../services/property.service'
import { ContractStatus, ContractStatusLabel } from '../interfaces/enums'
import { useAuthStore } from '../stores/auth'
import type { CreateContractDTO } from '../dtos/CreateContractDTO'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const properties = computed(() => propertyService.listForUser(authStore.user))
const statusOptions = Object.values(ContractStatus)

const contractId = computed(() => String(route.params.id ?? ''))
const isEditing = computed(() => Boolean(contractId.value))
const formError = ref('')

/** Contrato vacío, con la primera propiedad disponible preseleccionada. */
function buildEmptyContract(): CreateContractDTO {
  return {
    propertyId: properties.value[0]?.id ?? '',
    fixedRent: 0,
    startDate: '',
    endDate: '',
    tenantName: '',
    tenantContact: '',
    status: ContractStatus.ACTIVE,
  }
}

const contractForm = ref<CreateContractDTO>(buildEmptyContract())

/**
 * Carga en el formulario el contrato indicado por la ruta.
 * Si el id no existe, redirige a la lista en lugar de guardar sobre la nada.
 */
function loadFormFromRoute(): void {
  formError.value = ''
  if (!isEditing.value) {
    contractForm.value = buildEmptyContract()
    return
  }
  const existing = contractService.findById(contractId.value)
  if (!existing) {
    router.replace({ name: 'contracts' })
    return
  }
  const { id: _id, ...editableFields } = existing
  contractForm.value = editableFields
}

// Recargar también al navegar entre /contracts/:id/edit sin desmontar la vista
watch(contractId, loadFormFromRoute, { immediate: true })

/**
 * Valida las reglas de negocio del contrato.
 * @returns mensaje de error en español, o null si el formulario es válido
 */
function findValidationError(): string | null {
  if (!contractForm.value.propertyId) return 'Selecciona la propiedad del contrato.'
  if (contractForm.value.fixedRent <= 0) return 'El canon debe ser mayor que cero.'
  if (!contractForm.value.startDate || !contractForm.value.endDate)
    return 'Indica las fechas de inicio y fin.'
  if (contractForm.value.startDate >= contractForm.value.endDate) {
    return 'La fecha de inicio debe ser anterior a la de fin.'
  }
  return null
}

/** Valida y persiste el contrato, luego vuelve al listado. */
function saveContract(): void {
  const validationError = findValidationError()
  if (validationError) {
    formError.value = validationError
    return
  }
  if (isEditing.value) {
    contractService.update(contractId.value, contractForm.value)
  } else {
    contractService.create(contractForm.value)
  }
  router.push({ name: 'contracts' })
}

const inputClasses =
  'rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:outline-2 focus:outline-primary'
</script>

<template>
  <section class="max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
    <h1 class="mb-4 text-2xl font-bold">{{ isEditing ? 'Editar contrato' : 'Nuevo contrato' }}</h1>

    <p v-if="properties.length === 0" class="text-slate-500">
      Primero registra una propiedad para poder crear contratos.
    </p>

    <form v-else @submit.prevent="saveContract">
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Propiedad</span>
        <select v-model="contractForm.propertyId" :class="inputClasses">
          <option v-for="p in properties" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Arrendatario</span>
        <input v-model="contractForm.tenantName" required :class="inputClasses" />
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Contacto del arrendatario</span>
        <input v-model="contractForm.tenantContact" required :class="inputClasses" />
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Canon mensual (COP)</span>
        <input
          v-model.number="contractForm.fixedRent"
          type="number"
          min="0"
          :class="inputClasses"
        />
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Fecha de inicio</span>
        <input v-model="contractForm.startDate" type="date" required :class="inputClasses" />
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Fecha de fin</span>
        <input v-model="contractForm.endDate" type="date" required :class="inputClasses" />
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Estado</span>
        <select v-model="contractForm.status" :class="inputClasses">
          <option v-for="s in statusOptions" :key="s" :value="s">
            {{ ContractStatusLabel[s] }}
          </option>
        </select>
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
          :to="{ name: 'contracts' }"
        >
          Cancelar
        </router-link>
      </div>
    </form>
  </section>
</template>
