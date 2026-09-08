<script setup lang="ts">
// Reportes (solo admin): filtros + gráficos Chart.js + tabla resumen por propiedad.
// Es la vista global del negocio, por eso no se filtra por propietario.
import { computed, ref } from 'vue'
import ChartCard from '../components/ChartCard.vue'
import FilterSelect, { type SelectOption } from '../components/FilterSelect.vue'
import DataTable, { type TableColumn } from '../components/DataTable.vue'
import * as propertyService from '../services/property.service'
import * as transactionService from '../services/transaction.service'
import {
  listMonthsPresent,
  sumAmountsByMonth,
  sumIncomeBySource,
  sumNetProfitByCity,
  summarizePropertyBalance,
} from '../utils/finance'
import {
  TransactionType,
  TransactionSourceLabel,
  PropertyType,
  PropertyTypeLabel,
} from '../interfaces/enums'
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

// Se carga aqui y no en onMounted: LocalStorage responde de inmediato,
// asi la primera pintada ya trae los datos en vez de una tabla vacia.
reloadFromStorage()

// --- Filtros ---
const selectedCity = ref('')
const selectedPropertyType = ref('')
const monthFrom = ref('')
const monthTo = ref('')

const cities = computed(() => propertyService.cities(properties.value))
const propertyTypeOptions: SelectOption[] = Object.values(PropertyType).map((type) => ({
  value: type,
  label: PropertyTypeLabel[type],
}))
const availableMonths = computed(() => listMonthsPresent(transactions.value))

/** Propiedades que pasan los filtros de ciudad y tipo. */
const filteredProperties = computed(() =>
  properties.value.filter(
    (property) =>
      (!selectedCity.value || property.city === selectedCity.value) &&
      (!selectedPropertyType.value || property.type === selectedPropertyType.value),
  ),
)

/**
 * Movimientos de esas propiedades, acotados además al rango de meses.
 * Los extremos son opcionales: se puede abrir solo por un lado.
 */
const filteredTransactions = computed(() => {
  const visibleIds = new Set(filteredProperties.value.map((property) => property.id))
  return transactions.value.filter((transaction) => {
    if (!visibleIds.has(transaction.propertyId)) return false
    const month = transaction.date.slice(0, 7)
    if (monthFrom.value && month < monthFrom.value) return false
    if (monthTo.value && month > monthTo.value) return false
    return true
  })
})

// Gráfico 1: ingresos vs gastos por mes, dentro de la ciudad seleccionada
const incomeVsExpenseChart = computed<ChartData<'bar'>>(() => {
  const months = listMonthsPresent(filteredTransactions.value)
  return {
    labels: months,
    datasets: [
      {
        label: 'Ingresos',
        backgroundColor: '#16a34a',
        data: months.map((month) =>
          sumAmountsByMonth(filteredTransactions.value, TransactionType.INCOME, month),
        ),
      },
      {
        label: 'Gastos',
        backgroundColor: '#dc2626',
        data: months.map((month) =>
          sumAmountsByMonth(filteredTransactions.value, TransactionType.EXPENSE, month),
        ),
      },
    ],
  }
})

// Gráfico 2: de dónde vienen los ingresos
const incomeBySourceChart = computed<ChartData<'doughnut'>>(() => {
  const totalsBySource = sumIncomeBySource(filteredTransactions.value)
  return {
    labels: Object.keys(totalsBySource).map(
      (source) => TransactionSourceLabel[source as keyof typeof TransactionSourceLabel] ?? source,
    ),
    datasets: [
      { backgroundColor: ['#2563eb', '#f59e0b', '#6b7280'], data: Object.values(totalsBySource) },
    ],
  }
})

// Gráfico 3: qué ciudad deja más utilidad, ya descontados los gastos
const netProfitByCityChart = computed<ChartData<'bar'>>(() => {
  const profitByCity = sumNetProfitByCity(filteredProperties.value, filteredTransactions.value)
  return {
    labels: profitByCity.map((row) => row.city),
    datasets: [
      {
        label: 'Utilidad neta (COP)',
        backgroundColor: '#1b2438',
        data: profitByCity.map((row) => row.profit),
      },
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
  filteredProperties.value.map((p) => {
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
      <FilterSelect
        v-model="selectedPropertyType"
        label="Tipo de propiedad"
        :options="propertyTypeOptions"
      />
      <FilterSelect
        v-model="monthFrom"
        label="Desde (mes)"
        :options="availableMonths"
        all-label="Sin límite"
      />
      <FilterSelect
        v-model="monthTo"
        label="Hasta (mes)"
        :options="availableMonths"
        all-label="Sin límite"
      />
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <ChartCard title="Ingresos vs gastos por mes" type="bar" :chart-data="incomeVsExpenseChart" />
      <ChartCard title="Ingresos por fuente" type="doughnut" :chart-data="incomeBySourceChart" />
      <ChartCard
        class="md:col-span-2"
        title="Utilidad por ciudad"
        type="bar"
        :chart-data="netProfitByCityChart"
      />
    </div>

    <div class="mt-6">
      <DataTable :columns="tableColumns" :rows="tableRows" />
    </div>
  </section>
</template>
