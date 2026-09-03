<script setup>
// Transacciones: filtro por tipo + tabla + gráfico ingresos vs gastos por mes.
// TODO equipo: formulario para registrar transacciones y filtro por rango de fechas.
import { computed, ref } from 'vue'
import DataTable from '../components/DataTable.vue'
import FilterSelect from '../components/FilterSelect.vue'
import ChartCard from '../components/ChartCard.vue'
import { getAll, KEYS } from '../services/storage'
import { TransactionType, TransactionTypeLabel, TransactionSourceLabel } from '../models/enums'

const transactions = getAll(KEYS.transactions)
const properties = getAll(KEYS.properties)

const type = ref('')
const typeOptions = Object.values(TransactionType).map((v) => ({
  value: v,
  label: TransactionTypeLabel[v] ?? v,
}))

const columns = [
  { key: 'date', label: 'Fecha' },
  { key: 'propertyName', label: 'Propiedad' },
  { key: 'typeLabel', label: 'Tipo' },
  { key: 'sourceLabel', label: 'Fuente' },
  { key: 'amount', label: 'Monto (COP)' },
  { key: 'description', label: 'Descripción' },
]

const filtered = computed(() =>
  transactions.filter((t) => !type.value || t.type === type.value),
)

const rows = computed(() =>
  filtered.value
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((t) => ({
      ...t,
      propertyName: properties.find((p) => p.id === t.propertyId)?.name ?? '—',
      typeLabel: TransactionTypeLabel[t.type] ?? t.type,
      sourceLabel: TransactionSourceLabel[t.source] ?? t.source,
      amount: t.amount.toLocaleString('es-CO'),
    })),
)

// Gráfico: ingresos vs gastos agrupados por mes (YYYY-MM)
const chartData = computed(() => {
  const months = [...new Set(transactions.map((t) => t.date.slice(0, 7)))].sort()
  const sumBy = (tt, month) =>
    transactions
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
</script>

<template>
  <section>
    <h1>Transacciones</h1>

    <div class="filters-bar">
      <FilterSelect v-model="type" label="Tipo" :options="typeOptions" />
    </div>

    <ChartCard title="Ingresos vs gastos por mes" type="bar" :chart-data="chartData" />

    <div style="margin-top: var(--space-lg)">
      <DataTable :columns="columns" :rows="rows" />
    </div>
  </section>
</template>
