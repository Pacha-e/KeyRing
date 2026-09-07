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
const auth = useAuthStore()

const properties = computed(() => propertyService.listForUser(auth.user))
const statusOptions = Object.values(ContractStatus)

const contractId = computed(() => String(route.params.id ?? ''))
const editing = computed(() => Boolean(contractId.value))
const error = ref('')

/** Contrato vacío, con la primera propiedad disponible preseleccionada. */
function emptyForm(): CreateContractDTO {
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

const form = ref<CreateContractDTO>(emptyForm())

/**
 * Carga en el formulario el contrato indicado por la ruta.
 * Si el id no existe, redirige a la lista en lugar de guardar sobre la nada.
 */
function load(): void {
  error.value = ''
  if (!editing.value) {
    form.value = emptyForm()
    return
  }
  const existente = contractService.findById(contractId.value)
  if (!existente) {
    router.replace({ name: 'contracts' })
    return
  }
  const { id: _id, ...datos } = existente
  form.value = datos
}

// Recargar también al navegar entre /contracts/:id/edit sin desmontar la vista
watch(contractId, load, { immediate: true })

/**
 * Valida las reglas de negocio del contrato.
 * @returns mensaje de error en español, o null si el formulario es válido
 */
function validate(): string | null {
  if (!form.value.propertyId) return 'Selecciona la propiedad del contrato.'
  if (form.value.fixedRent <= 0) return 'El canon debe ser mayor que cero.'
  if (!form.value.startDate || !form.value.endDate) return 'Indica las fechas de inicio y fin.'
  if (form.value.startDate >= form.value.endDate) {
    return 'La fecha de inicio debe ser anterior a la de fin.'
  }
  return null
}

/** Valida y persiste el contrato, luego vuelve al listado. */
function onSubmit(): void {
  const problema = validate()
  if (problema) {
    error.value = problema
    return
  }
  if (editing.value) {
    contractService.update(contractId.value, form.value)
  } else {
    contractService.create(form.value)
  }
  router.push({ name: 'contracts' })
}

const inputClass =
  'rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:outline-2 focus:outline-primary'
</script>

<template>
  <section class="max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
    <h1 class="mb-4 text-2xl font-bold">{{ editing ? 'Editar contrato' : 'Nuevo contrato' }}</h1>

    <p v-if="properties.length === 0" class="text-slate-500">
      Primero registra una propiedad para poder crear contratos.
    </p>

    <form v-else @submit.prevent="onSubmit">
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Propiedad</span>
        <select v-model="form.propertyId" :class="inputClass">
          <option v-for="p in properties" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Arrendatario</span>
        <input v-model="form.tenantName" required :class="inputClass" />
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Contacto del arrendatario</span>
        <input v-model="form.tenantContact" required :class="inputClass" />
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Canon mensual (COP)</span>
        <input v-model.number="form.fixedRent" type="number" min="0" :class="inputClass" />
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Fecha de inicio</span>
        <input v-model="form.startDate" type="date" required :class="inputClass" />
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Fecha de fin</span>
        <input v-model="form.endDate" type="date" required :class="inputClass" />
      </label>
      <label class="mb-4 flex flex-col gap-1">
        <span class="text-sm font-medium">Estado</span>
        <select v-model="form.status" :class="inputClass">
          <option v-for="s in statusOptions" :key="s" :value="s">
            {{ ContractStatusLabel[s] }}
          </option>
        </select>
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
          :to="{ name: 'contracts' }"
        >
          Cancelar
        </router-link>
      </div>
    </form>
  </section>
</template>
