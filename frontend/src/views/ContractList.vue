<script setup lang="ts">
// Contratos: filtro por estado + tabla, con CRUD completo vía ContractForm.
import { computed, ref } from 'vue'
import DataTable, { type TableColumn } from '../components/DataTable.vue'
import FilterSelect, { type SelectOption } from '../components/FilterSelect.vue'
import FilterBar from '../components/FilterBar.vue'
import PageHeader from '../components/PageHeader.vue'
import StatusBadge from '../components/StatusBadge.vue'
import * as contractService from '../services/contract.service'
import * as propertyService from '../services/property.service'
import { formatNumber } from '../utils/format'
import { CONTRACT_STATUS_TONE } from '../utils/badges'
import { ContractStatus, ContractStatusLabel } from '../interfaces/enums'
import { useAuthStore } from '../stores/auth'
import type { ContractInterface } from '../interfaces/ContractInterface'
import type { PropertyInterface } from '../interfaces/PropertyInterface'

const authStore = useAuthStore()

const contracts = ref<ContractInterface[]>([])
const properties = ref<PropertyInterface[]>([])
const selectedStatus = ref('')

/** Recarga los contratos y propiedades visibles para la sesión actual. */
function reloadFromStorage(): void {
  contracts.value = contractService.listForUser(authStore.user)
  properties.value = propertyService.listForUser(authStore.user)
}

// Se carga aqui y no en onMounted: LocalStorage responde de inmediato,
// asi la primera pintada ya trae los datos en vez de una tabla vacia.
reloadFromStorage()

const statusFilterOptions: SelectOption[] = Object.values(ContractStatus).map((v) => ({
  value: v,
  label: ContractStatusLabel[v],
}))

const tableColumns: TableColumn[] = [
  { key: 'propertyName', label: 'Propiedad' },
  { key: 'tenantName', label: 'Arrendatario' },
  { key: 'tenantContact', label: 'Contacto' },
  { key: 'rent', label: 'Canon (COP)', align: 'right' },
  { key: 'startDate', label: 'Inicio' },
  { key: 'endDate', label: 'Fin' },
  { key: 'statusLabel', label: 'Estado' },
]

const activeCount = computed(() => contractService.countActive(contracts.value))

const tableRows = computed(() =>
  contracts.value
    .filter((c) => !selectedStatus.value || c.status === selectedStatus.value)
    .map((c) => ({
      ...c,
      propertyName: properties.value.find((p) => p.id === c.propertyId)?.name ?? '—',
      rent: formatNumber(c.fixedRent),
      statusLabel: ContractStatusLabel[c.status] ?? c.status,
    })),
)

/**
 * Elimina un contrato tras confirmación del usuario.
 * @param id identificador del contrato
 * @param arrendatario nombre mostrado en la confirmación
 */
function onDelete(id: string, arrendatario: string): void {
  if (!window.confirm(`¿Eliminar el contrato de "${arrendatario}"? No se puede deshacer.`)) return
  contractService.remove(id)
  reloadFromStorage()
}
</script>

<template>
  <section>
    <PageHeader
      title="Contratos"
      :subtitle="`${activeCount} activo(s) de ${contracts.length} registrados`"
    >
      <template #actions>
        <router-link
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white no-underline transition hover:bg-primary-dark"
          :to="{ name: 'contract-new' }"
        >
          + Nuevo contrato
        </router-link>
      </template>
    </PageHeader>

    <FilterBar>
      <FilterSelect v-model="selectedStatus" label="Estado" :options="statusFilterOptions" />
    </FilterBar>

    <DataTable
      :columns="tableColumns"
      :rows="tableRows"
      :empty-message="selectedStatus ? 'Ningún contrato en ese estado' : 'Todavía no hay contratos'"
      :empty-hint="
        selectedStatus
          ? 'Cambia el filtro de estado para ver los demás.'
          : 'Registra el primero con el botón “Nuevo contrato”.'
      "
    >
      <template #cell-statusLabel="{ value, row }">
        <StatusBadge
          :label="String(value)"
          :tone="CONTRACT_STATUS_TONE[row.status as ContractStatus]"
        />
      </template>
      <template #actions="{ row }">
        <div class="flex gap-3">
          <router-link
            class="text-primary hover:underline"
            :to="{ name: 'contract-edit', params: { id: String(row.id) } }"
          >
            Editar
          </router-link>
          <button
            class="text-red-600 hover:underline"
            type="button"
            @click="onDelete(String(row.id), String(row.tenantName))"
          >
            Eliminar
          </button>
        </div>
      </template>
    </DataTable>
  </section>
</template>
