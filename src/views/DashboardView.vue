<script setup lang="ts">
// Dashboard: resumen general con StatCards + gráficos de evolución mensual y ocupación.
import { computed } from 'vue'
import StatCard from '../components/StatCard.vue'
import ChartCard from '../components/ChartCard.vue'
import { getAll, KEYS } from '../services/storage'
import { calculateMonthlyIncome } from '../utils/finance'
import { ContractStatus, PropertyStatus, TransactionType } from '../interfaces/enums'
import type { PropertyInterface } from '../interfaces/PropertyInterface'
import type { ContractInterface } from '../interfaces/ContractInterface'
import type { TransactionInterface } from '../interfaces/TransactionInterface'
import type { ChartData } from 'chart.js'

const properties = getAll<PropertyInterface>(KEYS.properties)
const contracts = getAll<ContractInterface>(KEYS.contracts)
const transactions = getAll<TransactionInterface>(KEYS.transactions)

const activeContracts = computed(
  () => contracts.filter((c) => c.status === ContractStatus.ACTIVE).length,
)

// Ingresos del mes en curso (Capa Util: src/utils/finance.ts)
const monthlyIncome = computed(() => calculateMonthlyIncome(transactions))

const formatCOP = (n: number): string =>
  n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

// Gráfico 1: evolución mensual de ingresos vs gastos (todas las propiedades)
const evolutionChart = computed<ChartData<'line'>>(() => {
  const months = [...new Set(transactions.map((t) => t.date.slice(0, 7)))].sort()
  const sumBy = (type: TransactionType, month: string) =>
    transactions
      .filter((t) => t.type === type && t.date.startsWith(month))
      .reduce((s, t) => s + t.amount, 0)
  return {
    labels: months,
    datasets: [
      {
        label: 'Ingresos',
        borderColor: '#16a34a',
        backgroundColor: '#16a34a',
        data: months.map((m) => sumBy(TransactionType.INCOME, m)),
      },
      {
        label: 'Gastos',
        borderColor: '#dc2626',
        backgroundColor: '#dc2626',
        data: months.map((m) => sumBy(TransactionType.EXPENSE, m)),
      },
    ],
  }
})

// Gráfico 2: ocupación — propiedades activas vs vacantes
const occupancyChart = computed<ChartData<'doughnut'>>(() => {
  const active = properties.filter((p) => p.status === PropertyStatus.ACTIVE).length
  const vacant = properties.filter((p) => p.status === PropertyStatus.VACANT).length
  return {
    labels: ['Activas', 'Vacantes'],
    datasets: [{ backgroundColor: ['#2563eb', '#f59e0b'], data: [active, vacant] }],
  }
})
</script>

<template>
  <section>
    <h1 class="mb-4 text-2xl font-bold">Dashboard</h1>
    <div class="grid gap-4 sm:grid-cols-3">
      <StatCard title="Propiedades" :value="properties.length" icon="🏠" />
      <StatCard title="Contratos activos" :value="activeContracts" icon="📄" />
      <StatCard title="Ingresos del mes" :value="formatCOP(monthlyIncome)" icon="💰" />
    </div>

    <div class="mt-6 grid gap-4 md:grid-cols-2">
      <ChartCard title="Evolución mensual: ingresos vs gastos" type="line" :chart-data="evolutionChart" />
      <ChartCard title="Ocupación de propiedades" type="doughnut" :chart-data="occupancyChart" />
    </div>
  </section>
</template>
