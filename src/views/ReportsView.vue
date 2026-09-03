<script setup lang="ts">
// Reportes (solo admin): filtros + gráficos Chart.js + tabla resumen por propiedad.
// TODO equipo: exportar a CSV/PDF y más métricas (ocupación, rentabilidad neta).
import { computed, ref } from 'vue'
import ChartCard from '../components/ChartCard.vue'
import FilterSelect from '../components/FilterSelect.vue'
import DataTable, { type TableColumn } from '../components/DataTable.vue'
import { getAll, KEYS } from '../services/storage'
import { TransactionType, TransactionSourceLabel } from '../interfaces/enums'
import type { PropertyInterface } from '../interfaces/PropertyInterface'
import type { TransactionInterface } from '../interfaces/TransactionInterface'
import type { ChartData } from 'chart.js'

const properties = getAll<PropertyInterface>(KEYS.properties)
const transactions = getAll<TransactionInterface>(KEYS.transactions)

const city = ref('')
const cities = [...new Set(properties.map((p) => p.city))]

const cityProperties = computed(() => properties.filter((p) => !city.value || p.city === city.value))
const cityTransactions = computed(() => {
  const ids = new Set(cityProperties.value.map((p) => p.id))
  return transactions.filter((t) => ids.has(t.propertyId))
})

// Gráfico 1: ingresos vs gastos por mes (filtrado por ciudad)
const monthlyChart = computed<ChartData<'bar'>>(() => {
  const months = [...new Set(cityTransactions.value.map((t) => t.date.slice(0, 7)))].sort()
  const sumBy = (tt: TransactionType, month: string) =>
    cityTransactions.value
      .filter((t) => t.type === tt && t.date.startsWith(month))
      .reduce((s, t) => s + t.amount, 0)
  return {
    labels: months,
    datasets: [
      {
        label: 'Ingresos',
        backgroundColor: '#16a34a',
        data: months.map((m) => sumBy(TransactionType.INCOME, m)),
      },
      {
        label: 'Gastos',
        backgroundColor: '#dc2626',
        data: months.map((m) => sumBy(TransactionType.EXPENSE, m)),
      },
    ],
  }
})

// Gráfico 2: distribución de ingresos por fuente
const sourceChart = computed<ChartData<'doughnut'>>(() => {
  const bySource: Record<string, number> = {}
  cityTransactions.value
    .filter((t) => t.type === TransactionType.INCOME)
    .forEach((t) => {
      bySource[t.source] = (bySource[t.source] ?? 0) + t.amount
    })
  return {
    labels: Object.keys(bySource).map(
      (s) => TransactionSourceLabel[s as keyof typeof TransactionSourceLabel] ?? s,
    ),
    datasets: [
      { backgroundColor: ['#2563eb', '#f59e0b', '#6b7280'], data: Object.values(bySource) },
    ],
  }
})

// Tabla resumen por propiedad
const columns: TableColumn[] = [
  { key: 'name', label: 'Propiedad' },
  { key: 'city', label: 'Ciudad' },
  { key: 'income', label: 'Ingresos (COP)' },
  { key: 'expense', label: 'Gastos (COP)' },
  { key: 'net', label: 'Neto (COP)' },
]

const rows = computed(() =>
  cityProperties.value.map((p) => {
    const tx = transactions.filter((t) => t.propertyId === p.id)
    const income = tx
      .filter((t) => t.type === TransactionType.INCOME)
      .reduce((s, t) => s + t.amount, 0)
    const expense = tx
      .filter((t) => t.type === TransactionType.EXPENSE)
      .reduce((s, t) => s + t.amount, 0)
    return {
      id: p.id,
      name: p.name,
      city: p.city,
      income: income.toLocaleString('es-CO'),
      expense: expense.toLocaleString('es-CO'),
      net: (income - expense).toLocaleString('es-CO'),
    }
  }),
)
</script>

<template>
  <section>
    <h1 class="mb-4 text-2xl font-bold">Reportes</h1>
    <p class="mb-4 text-slate-500">Página exclusiva para administradores.</p>

    <div class="mb-4 flex flex-wrap items-end gap-4">
      <FilterSelect v-model="city" label="Ciudad" :options="cities" />
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <ChartCard title="Ingresos vs gastos por mes" type="bar" :chart-data="monthlyChart" />
      <ChartCard title="Ingresos por fuente" type="doughnut" :chart-data="sourceChart" />
    </div>

    <div class="mt-6">
      <DataTable :columns="columns" :rows="rows" />
    </div>
  </section>
</template>
