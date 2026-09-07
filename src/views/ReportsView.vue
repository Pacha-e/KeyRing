<script setup lang="ts">
// Reportes (solo admin): selectores (ciudad, tipo de propiedad, rango de meses) + gráficos
// Chart.js (utilidad por ciudad, ingreso por fuente) + tabla resumen por propiedad + export CSV.
import { computed, ref } from 'vue'
import ChartCard from '../components/ChartCard.vue'
import FilterSelect, { type SelectOption } from '../components/FilterSelect.vue'
import DataTable, { type TableColumn } from '../components/DataTable.vue'
import { getProperties } from '../services/property.service'
import { getTransactions } from '../services/transaction.service'
import { calculateProfitByCity, calculatePropertyBalance } from '../utils/finance'
import {
  PropertyType,
  PropertyTypeLabel,
  TransactionType,
  TransactionSourceLabel,
} from '../interfaces/enums'
import type { ChartData } from 'chart.js'

const properties = getProperties()
const transactions = getTransactions()

const city = ref('')
const propertyType = ref('')
const monthFrom = ref('')
const monthTo = ref('')

const cities = [...new Set(properties.map((p) => p.city))]
const typeOptions: SelectOption[] = Object.values(PropertyType).map((v) => ({
  value: v,
  label: PropertyTypeLabel[v] ?? v,
}))
// Meses reales presentes en los datos (evita depender de <input type="month">, que Safari no soporta)
const monthOptions = [...new Set(transactions.map((t) => t.date.slice(0, 7)))].sort()

const cityProperties = computed(() =>
  properties.filter(
    (p) =>
      (!city.value || p.city === city.value) &&
      (!propertyType.value || p.type === propertyType.value),
  ),
)

const cityTransactions = computed(() => {
  const ids = new Set(cityProperties.value.map((p) => p.id))
  return transactions.filter((t) => {
    if (!ids.has(t.propertyId)) return false
    const month = t.date.slice(0, 7)
    if (monthFrom.value && month < monthFrom.value) return false
    if (monthTo.value && month > monthTo.value) return false
    return true
  })
})

// Gráfico 1: utilidad (ingresos - gastos) por ciudad, sobre las propiedades filtradas
const profitChart = computed<ChartData<'bar'>>(() => {
  const byCity = calculateProfitByCity(cityProperties.value, cityTransactions.value)
  return {
    labels: byCity.map((c) => c.city),
    datasets: [
      { label: 'Utilidad (COP)', backgroundColor: '#b3543a', data: byCity.map((c) => c.profit) },
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
    const { income, expense, net } = calculatePropertyBalance(p.id, cityTransactions.value)
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

// Exporta la tabla resumen actual (según los filtros activos) a un archivo CSV
function exportCsv() {
  const headers = columns.map((c) => c.label)
  const lines = rows.value.map((r) =>
    columns
      .map((c) => `"${String((r as Record<string, unknown>)[c.key]).replace(/"/g, '""')}"`)
      .join(','),
  )
  const csv = [headers.join(','), ...lines].join('\n')
  const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `reporte-keyring-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <section>
    <h1 class="mb-4 text-2xl font-bold">Reportes</h1>
    <p class="mb-4 text-slate-500">Página exclusiva para administradores.</p>

    <div class="mb-4 flex flex-wrap items-end justify-between gap-4">
      <div class="flex flex-wrap items-end gap-4">
        <FilterSelect v-model="city" label="Ciudad" :options="cities" />
        <FilterSelect v-model="propertyType" label="Tipo de propiedad" :options="typeOptions" />
        <FilterSelect v-model="monthFrom" label="Desde (mes)" :options="monthOptions" />
        <FilterSelect v-model="monthTo" label="Hasta (mes)" :options="monthOptions" />
      </div>
      <button
        class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        type="button"
        @click="exportCsv"
      >
        Exportar CSV
      </button>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <ChartCard title="Utilidad por ciudad" type="bar" :chart-data="profitChart" />
      <ChartCard title="Ingresos por fuente" type="doughnut" :chart-data="sourceChart" />
    </div>

    <div class="mt-6">
      <DataTable :columns="columns" :rows="rows" />
    </div>
  </section>
</template>
