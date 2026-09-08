<script setup lang="ts">
// Reportes (solo admin): filtros + gráficos Chart.js + tabla resumen por propiedad.
// Es la vista global del negocio, por eso no se filtra por propietario.
import { computed, onMounted, ref } from 'vue'
import ChartCard from '../components/ChartCard.vue'
import FilterSelect from '../components/FilterSelect.vue'
import DataTable, { type TableColumn } from '../components/DataTable.vue'
import * as propertyService from '../services/property.service'
import * as transactionService from '../services/transaction.service'
import {
  listMonthsPresent,
  sumAmountsByMonth,
  sumIncomeBySource,
  summarizePropertyBalance,
} from '../utils/finance'
import { TransactionType, TransactionSourceLabel } from '../interfaces/enums'
import type { PropertyInterface } from '../interfaces/PropertyInterface'
import type { TransactionInterface } from '../interfaces/TransactionInterface'
import type { ChartData } from 'chart.js'

const properties = ref<PropertyInterface[]>([])
const transactions = ref<TransactionInterface[]>([])

/** Recarga los datos globales del reporte. */
function reloadFromStorage(): void {
  properties.value = propertyService.list()
  transactions.value = transactionService.list()
}

onMounted(reloadFromStorage)

const selectedCity = ref('')
const cities = computed(() => propertyService.cities(properties.value))

const propertiesInSelectedCity = computed(() =>
  properties.value.filter((p) => !selectedCity.value || p.city === selectedCity.value),
)
const transactionsInSelectedCity = computed(() => {
  const ids = new Set(propertiesInSelectedCity.value.map((p) => p.id))
  return transactions.value.filter((t) => ids.has(t.propertyId))
})

// Gráfico 1: ingresos vs gastos por mes, dentro de la ciudad seleccionada
const incomeVsExpenseChart = computed<ChartData<'bar'>>(() => {
  const months = listMonthsPresent(transactionsInSelectedCity.value)
  return {
    labels: months,
    datasets: [
      {
        label: 'Ingresos',
        backgroundColor: '#16a34a',
        data: months.map((month) =>
          sumAmountsByMonth(transactionsInSelectedCity.value, TransactionType.INCOME, month),
        ),
      },
      {
        label: 'Gastos',
        backgroundColor: '#dc2626',
        data: months.map((month) =>
          sumAmountsByMonth(transactionsInSelectedCity.value, TransactionType.EXPENSE, month),
        ),
      },
    ],
  }
})

// Gráfico 2: de dónde vienen los ingresos
const incomeBySourceChart = computed<ChartData<'doughnut'>>(() => {
  const totalsBySource = sumIncomeBySource(transactionsInSelectedCity.value)
  return {
    labels: Object.keys(totalsBySource).map(
      (source) => TransactionSourceLabel[source as keyof typeof TransactionSourceLabel] ?? source,
    ),
    datasets: [
      { backgroundColor: ['#2563eb', '#f59e0b', '#6b7280'], data: Object.values(totalsBySource) },
    ],
  }
})

// Tabla resumen por propiedad
const tableColumns: TableColumn[] = [
  { key: 'name', label: 'Propiedad' },
  { key: 'city', label: 'Ciudad' },
  { key: 'income', label: 'Ingresos (COP)' },
  { key: 'expense', label: 'Gastos (COP)' },
  { key: 'net', label: 'Neto (COP)' },
]

const tableRows = computed(() =>
  propertiesInSelectedCity.value.map((p) => {
    const { income, expense, net } = summarizePropertyBalance(p.id, transactions.value)
    return {
      id: p.id,
      name: p.name,
      city: p.city,
      income: income.toLocaleString('es-CO'),
      expense: expense.toLocaleString('es-CO'),
      net: net.toLocaleString('es-CO'),
    }
  }),
)
</script>

<template>
  <section>
    <h1 class="mb-4 text-2xl font-bold">Reportes</h1>
    <p class="mb-4 text-slate-500">Página exclusiva para administradores.</p>

    <div class="mb-4 flex flex-wrap items-end gap-4">
      <FilterSelect v-model="selectedCity" label="Ciudad" :options="cities" />
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <ChartCard title="Ingresos vs gastos por mes" type="bar" :chart-data="incomeVsExpenseChart" />
      <ChartCard title="Ingresos por fuente" type="doughnut" :chart-data="incomeBySourceChart" />
    </div>

    <div class="mt-6">
      <DataTable :columns="tableColumns" :rows="tableRows" />
    </div>
  </section>
</template>
