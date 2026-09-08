<script setup lang="ts">
// Formulario de contrato: sirve para crear (/contracts/new) y editar (/contracts/:id/edit).
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SelectField, { type SelectOption } from '../components/SelectField.vue'
import * as contractService from '../services/contract.service'
import * as propertyService from '../services/property.service'
import { ContractStatus, ContractStatusLabel } from '../interfaces/enums'
import { useAuthStore } from '../stores/auth'
import type { CreateContractDTO } from '../dtos/CreateContractDTO'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const properties = computed(() => propertyService.listForUser(authStore.user))

// Las opciones llevan ya su etiqueta en español: el selector solo dibuja lo que
// se le pasa y no tiene que conocer las tablas de traducción del dominio.
const propertyOptions = computed<SelectOption<string>[]>(() =>
  properties.value.map((property) => ({ value: property.id, label: property.name })),
)
const statusOptions: SelectOption<ContractStatus>[] = Object.values(ContractStatus).map(
  (status) => ({ value: status, label: ContractStatusLabel[status] }),
)

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
</script>

<template>
  <section
    class="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
  >
    <h1 class="font-brand mt-0 mb-1 text-2xl font-semibold text-ink">
      {{ isEditing ? 'Editar contrato' : 'Nuevo contrato' }}
    </h1>
    <p class="mt-0 mb-6 text-sm text-slate-500">
      Arrendatario, canon y vigencia del acuerdo sobre una propiedad.
    </p>

    <p v-if="properties.length === 0" class="text-slate-500">
      Primero registra una propiedad para poder crear contratos.
    </p>

    <form v-else class="grid gap-4 sm:grid-cols-2" @submit.prevent="saveContract">
      <SelectField
        v-model="contractForm.propertyId"
        class="col-span-full"
        label="Propiedad"
        :options="propertyOptions"
      />
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">Arrendatario</span>
        <input v-model="contractForm.tenantName" required class="field-input" />
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">Contacto del arrendatario</span>
        <input v-model="contractForm.tenantContact" required class="field-input" />
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">Canon mensual (COP)</span>
        <input v-model.number="contractForm.fixedRent" type="number" min="0" class="field-input" />
      </label>
      <SelectField v-model="contractForm.status" label="Estado" :options="statusOptions" />
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">Fecha de inicio</span>
        <input v-model="contractForm.startDate" type="date" required class="field-input" />
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">Fecha de fin</span>
        <input v-model="contractForm.endDate" type="date" required class="field-input" />
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
          :to="{ name: 'contracts' }"
        >
          Cancelar
        </router-link>
      </div>
    </form>
  </section>
</template>
