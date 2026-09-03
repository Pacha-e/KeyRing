<script setup lang="ts">
// Lista de contratos con filtro por estado.
// TODO equipo: crear/editar contratos y asociarlos a propiedades desde un formulario.
import { computed, ref } from 'vue'
import DataTable, { type TableColumn } from '../components/DataTable.vue'
import FilterSelect, { type SelectOption } from '../components/FilterSelect.vue'
import { getAll, KEYS } from '../services/storage'
import { ContractStatus, ContractStatusLabel } from '../interfaces/enums'
import type { ContractInterface } from '../interfaces/ContractInterface'
import type { PropertyInterface } from '../interfaces/PropertyInterface'

const contracts = getAll<ContractInterface>(KEYS.contracts)
const properties = getAll<PropertyInterface>(KEYS.properties)

const status = ref('')
const statusOptions: SelectOption[] = Object.values(ContractStatus).map((v) => ({
  value: v,
  label: ContractStatusLabel[v] ?? v,
}))

const columns: TableColumn[] = [
  { key: 'propertyName', label: 'Propiedad' },
  { key: 'tenantName', label: 'Arrendatario' },
  { key: 'fixedRent', label: 'Canon (COP)' },
  { key: 'startDate', label: 'Inicio' },
  { key: 'endDate', label: 'Fin' },
  { key: 'statusLabel', label: 'Estado' },
]

const rows = computed(() =>
  contracts
    .filter((c) => !status.value || c.status === status.value)
    .map((c) => ({
      ...c,
      propertyName: properties.find((p) => p.id === c.propertyId)?.name ?? '—',
      fixedRent: c.fixedRent.toLocaleString('es-CO'),
      statusLabel: ContractStatusLabel[c.status] ?? c.status,
    })),
)
</script>

<template>
  <section>
    <h1 class="mb-4 text-2xl font-bold">Contratos</h1>

    <div class="mb-4 flex flex-wrap items-end gap-4">
      <FilterSelect v-model="status" label="Estado" :options="statusOptions" />
    </div>

    <DataTable :columns="columns" :rows="rows" />
  </section>
</template>
