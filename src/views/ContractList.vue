<script setup lang="ts">
// Contratos: filtro por estado + tabla + CRUD completo contra contract.service.
import { computed, reactive, ref } from 'vue'
import DataTable, { type TableColumn } from '../components/DataTable.vue'
import FilterSelect, { type SelectOption } from '../components/FilterSelect.vue'
import StatusBadge, { type BadgeTone } from '../components/StatusBadge.vue'
import {
  getContracts,
  createContract,
  updateContract,
  deleteContract,
} from '../services/contract.service'
import { getProperties } from '../services/property.service'
import { ContractStatus, ContractStatusLabel } from '../interfaces/enums'
import type { CreateContractDTO } from '../dtos/CreateContractDTO'
import type { ContractInterface } from '../interfaces/ContractInterface'

const contracts = ref<ContractInterface[]>(getContracts())
const properties = getProperties()

const status = ref('')
const statusOptions: SelectOption[] = Object.values(ContractStatus).map((v) => ({
  value: v,
  label: ContractStatusLabel[v] ?? v,
}))

const columns: TableColumn[] = [
  { key: 'propertyName', label: 'Propiedad' },
  { key: 'tenantName', label: 'Arrendatario' },
  { key: 'tenantContact', label: 'Contacto' },
  { key: 'fixedRent', label: 'Canon (COP)' },
  { key: 'startDate', label: 'Inicio' },
  { key: 'endDate', label: 'Fin' },
  { key: 'statusLabel', label: 'Estado' },
]

const rows = computed(() =>
  contracts.value
    .filter((c) => !status.value || c.status === status.value)
    .map((c) => ({
      ...c,
      propertyName: properties.find((p) => p.id === c.propertyId)?.name ?? '—',
      fixedRent: c.fixedRent.toLocaleString('es-CO'),
      statusLabel: ContractStatusLabel[c.status] ?? c.status,
    })),
)

const statusTone: Record<ContractStatus, BadgeTone> = {
  [ContractStatus.ACTIVE]: 'green',
  [ContractStatus.EXPIRED]: 'gray',
  [ContractStatus.TERMINATED]: 'red',
}

// --- formulario crear / editar ---
const showForm = ref(false)
const editingId = ref<string | null>(null)
const propertyOptions = properties.map((p) => ({ value: p.id, label: p.name }))

function emptyForm(): CreateContractDTO {
  return {
    propertyId: properties[0]?.id ?? '',
    fixedRent: 0,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    tenantName: '',
    tenantContact: '',
    status: ContractStatus.ACTIVE,
  }
}

const form = reactive<CreateContractDTO>(emptyForm())

function onNew() {
  editingId.value = null
  Object.assign(form, emptyForm())
  showForm.value = true
}

function onEdit(row: Record<string, unknown>) {
  const original = contracts.value.find((c) => c.id === row.id)
  if (!original) return
  editingId.value = original.id
  Object.assign(form, {
    propertyId: original.propertyId,
    fixedRent: original.fixedRent,
    startDate: original.startDate,
    endDate: original.endDate,
    tenantName: original.tenantName,
    tenantContact: original.tenantContact,
    status: original.status,
  })
  showForm.value = true
}

function onCancel() {
  showForm.value = false
  editingId.value = null
}

function onSubmit() {
  if (editingId.value) {
    updateContract(editingId.value, { ...form })
  } else {
    createContract({ ...form })
  }
  contracts.value = getContracts()
  showForm.value = false
  editingId.value = null
}

function onDelete(id: string, tenant: string) {
  if (!confirm(`¿Eliminar el contrato de "${tenant}"? Esta acción no se puede deshacer.`)) return
  deleteContract(id)
  contracts.value = getContracts()
}

const inputClass =
  'rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:outline-2 focus:outline-primary'
</script>

<template>
  <section>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold">Contratos</h1>
      <button
        class="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark"
        type="button"
        @click="onNew"
      >
        + Nuevo contrato
      </button>
    </div>

    <form
      v-if="showForm"
      class="mb-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2"
      @submit.prevent="onSubmit"
    >
      <h2 class="col-span-full text-lg font-semibold">
        {{ editingId ? 'Editar contrato' : 'Nuevo contrato' }}
      </h2>
      <label class="flex flex-col gap-1">
        <span class="text-sm font-medium">Propiedad</span>
        <select v-model="form.propertyId" required :class="inputClass">
          <option v-for="p in propertyOptions" :key="p.value" :value="p.value">
            {{ p.label }}
          </option>
        </select>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-sm font-medium">Canon fijo (COP)</span>
        <input v-model.number="form.fixedRent" type="number" min="0" required :class="inputClass" />
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-sm font-medium">Arrendatario</span>
        <input v-model="form.tenantName" required :class="inputClass" />
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-sm font-medium">Contacto</span>
        <input v-model="form.tenantContact" required :class="inputClass" />
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-sm font-medium">Inicio</span>
        <input v-model="form.startDate" type="date" required :class="inputClass" />
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-sm font-medium">Fin</span>
        <input v-model="form.endDate" type="date" required :class="inputClass" />
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-sm font-medium">Estado</span>
        <select v-model="form.status" :class="inputClass">
          <option v-for="s in statusOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
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

    <div class="mb-4 flex flex-wrap items-end gap-4">
      <FilterSelect v-model="status" label="Estado" :options="statusOptions" />
    </div>

    <DataTable :columns="columns" :rows="rows">
      <template #cell-statusLabel="{ value, row }">
        <StatusBadge :label="String(value)" :tone="statusTone[row.status as ContractStatus]" />
      </template>
      <template #actions="{ row }">
        <button class="text-primary hover:underline" type="button" @click="onEdit(row)">
          Editar
        </button>
        <button
          class="ml-3 text-red-600 hover:underline"
          type="button"
          @click="onDelete(String(row.id), String(row.tenantName))"
        >
          Eliminar
        </button>
      </template>
    </DataTable>
  </section>
</template>
