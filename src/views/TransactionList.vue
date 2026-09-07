<script setup lang="ts">
// Transacciones: selector + tabla + gráfico de ingresos vs gastos por mes.
import { computed, onMounted, ref } from 'vue'
import DataTable, { type TableColumn } from '../components/DataTable.vue'
import FilterSelect, { type SelectOption } from '../components/FilterSelect.vue'
import ChartCard from '../components/ChartCard.vue'
import * as transactionService from '../services/transaction.service'
import * as propertyService from '../services/property.service'
import { TransactionType, TransactionTypeLabel, TransactionSourceLabel } from '../interfaces/enums'
import { useAuthStore } from '../stores/auth'
import type { TransactionInterface } from '../interfaces/TransactionInterface'
import type { PropertyInterface } from '../interfaces/PropertyInterface'
import type { ChartData } from 'chart.js'

const auth = useAuthStore()

const transactions = ref<TransactionInterface[]>([])
const properties = ref<PropertyInterface[]>([])
const type = ref('')
const propertyId = ref('')

/** Recarga las transacciones y propiedades visibles para la sesión actual. */
function load(): void {
  transactions.value = transactionService.listForUser(auth.user)
  properties.value = propertyService.listForUser(auth.user)
}

onMounted(load)

const typeOptions: SelectOption[] = Object.values(TransactionType).map((v) => ({
  value: v,
  label: TransactionTypeLabel[v],
}))

const propertyOptions = computed<SelectOption[]>(() =>
  properties.value.map((p) => ({ value: p.id, label: p.name })),
)

const columns: TableColumn[] = [
  { key: 'date', label: 'Fecha' },
  { key: 'propertyName', label: 'Propiedad' },
  { key: 'typeLabel', label: 'Tipo' },
  { key: 'sourceLabel', label: 'Fuente' },
  { key: 'amount', label: 'Monto (COP)' },
  { key: 'description', label: 'Descripción' },
]

const filtered = computed(() =>
  transactions.value.filter(
    (t) =>
      (!type.value || t.type === type.value) &&
      (!propertyId.value || t.propertyId === propertyId.value),
  ),
)

const rows = computed(() =>
  filtered.value
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((t) => ({
      ...t,
      propertyName: properties.value.find((p) => p.id === t.propertyId)?.name ?? '—',
      typeLabel: TransactionTypeLabel[t.type] ?? t.type,
      sourceLabel: TransactionSourceLabel[t.source] ?? t.source,
      amount: t.amount.toLocaleString('es-CO'),
    })),
)

// Gráfico: ingresos vs gastos agrupados por mes (YYYY-MM)
const chartData = computed<ChartData<'bar'>>(() => {
  const meses = transactionService.months(filtered.value)
  return {
    labels: meses,
    datasets: [
      {
        label: 'Ingresos',
        backgroundColor: '#16a34a',
        data: meses.map((m) =>
          transactionService.sumByMonth(filtered.value, TransactionType.INCOME, m),
        ),
      },
      {
        label: 'Gastos',
        backgroundColor: '#dc2626',
        data: meses.map((m) =>
          transactionService.sumByMonth(filtered.value, TransactionType.EXPENSE, m),
        ),
      },
    ],
  }
})

/**
 * Elimina una transacción tras confirmación del usuario.
 * @param id identificador de la transacción
 */
function onDelete(id: string): void {
  if (!window.confirm('¿Eliminar esta transacción? Esta acción no se puede deshacer.')) return
  transactionService.remove(id)
  load()
}
</script>

<template>
  <section>
    <h1 class="mb-4 text-2xl font-bold">Transacciones</h1>

    <div class="mb-4 flex flex-wrap items-end gap-4">
      <FilterSelect v-model="type" label="Tipo" :options="typeOptions" />
      <FilterSelect v-model="propertyId" label="Propiedad" :options="propertyOptions" />
    </div>

    <ChartCard title="Ingresos vs gastos por mes" type="bar" :chart-data="chartData" />

    <div class="mt-6">
      <DataTable :columns="columns" :rows="rows">
        <template #actions="{ row }">
          <button
            class="text-red-600 hover:underline"
            type="button"
            @click="onDelete(String(row.id))"
          >
            Eliminar
          </button>
        </template>
      </DataTable>
    </div>
  </section>
</template>
