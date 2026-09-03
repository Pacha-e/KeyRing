<script setup>
// Lista de contratos con filtro por estado.
// TODO equipo: crear/editar contratos y asociarlos a propiedades desde un formulario.
import { computed, ref } from 'vue'
import DataTable from '../components/DataTable.vue'
import FilterSelect from '../components/FilterSelect.vue'
import { getAll, KEYS } from '../services/storage'
import { ContractStatus, ContractStatusLabel } from '../models/enums'

const contracts = getAll(KEYS.contracts)
const properties = getAll(KEYS.properties)

const status = ref('')
const statusOptions = Object.values(ContractStatus).map((v) => ({
  value: v,
  label: ContractStatusLabel[v] ?? v,
}))

const columns = [
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
      propertyName:
        properties.find((p) => p.id === c.propertyId)?.name ?? '—',
      fixedRent: c.fixedRent.toLocaleString('es-CO'),
      statusLabel: ContractStatusLabel[c.status] ?? c.status,
    })),
)
</script>

<template>
  <section>
    <h1>Contratos</h1>

    <div class="filters-bar">
      <FilterSelect v-model="status" label="Estado" :options="statusOptions" />
    </div>

    <DataTable :columns="columns" :rows="rows" />
  </section>
</template>
