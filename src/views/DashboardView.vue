<script setup lang="ts">
// Dashboard: resumen general con StatCards calculadas desde los datos semilla.
// TODO equipo: agregar gráficos de evolución mensual y ocupación.
import { computed } from 'vue'
import StatCard from '../components/StatCard.vue'
import { getAll, KEYS } from '../services/storage'
import { ContractStatus, TransactionType } from '../interfaces/enums'
import type { PropertyInterface } from '../interfaces/PropertyInterface'
import type { ContractInterface } from '../interfaces/ContractInterface'
import type { TransactionInterface } from '../interfaces/TransactionInterface'

const properties = getAll<PropertyInterface>(KEYS.properties)
const contracts = getAll<ContractInterface>(KEYS.contracts)
const transactions = getAll<TransactionInterface>(KEYS.transactions)

const activeContracts = computed(
  () => contracts.filter((c) => c.status === ContractStatus.ACTIVE).length,
)

// Ingresos del mes en curso
const monthlyIncome = computed(() => {
  const prefix = new Date().toISOString().slice(0, 7) // 'YYYY-MM'
  return transactions
    .filter((t) => t.type === TransactionType.INCOME && t.date.startsWith(prefix))
    .reduce((sum, t) => sum + t.amount, 0)
})

const formatCOP = (n: number): string =>
  n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
</script>

<template>
  <section>
    <h1 class="mb-4 text-2xl font-bold">Dashboard</h1>
    <div class="grid gap-4 sm:grid-cols-3">
      <StatCard title="Propiedades" :value="properties.length" icon="🏠" />
      <StatCard title="Contratos activos" :value="activeContracts" icon="📄" />
      <StatCard title="Ingresos del mes" :value="formatCOP(monthlyIncome)" icon="💰" />
    </div>
  </section>
</template>
