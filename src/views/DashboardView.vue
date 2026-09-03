<script setup>
// Dashboard: resumen general con StatCards calculadas desde los datos semilla.
// TODO equipo: agregar gráficos de evolución mensual y ocupación.
import { computed } from 'vue'
import StatCard from '../components/StatCard.vue'
import { getAll, KEYS } from '../services/storage'
import { ContractStatus, TransactionType } from '../models/enums'

const properties = getAll(KEYS.properties)
const contracts = getAll(KEYS.contracts)
const transactions = getAll(KEYS.transactions)

const activeContracts = computed(
  () => contracts.filter((c) => c.status === ContractStatus.ACTIVE).length,
)

// Ingresos del mes en curso
const monthlyIncome = computed(() => {
  const now = new Date()
  const prefix = now.toISOString().slice(0, 7) // 'YYYY-MM'
  return transactions
    .filter((t) => t.type === TransactionType.INCOME && t.date.startsWith(prefix))
    .reduce((sum, t) => sum + t.amount, 0)
})

const formatCOP = (n) =>
  n.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
</script>

<template>
  <section>
    <h1>Dashboard</h1>
    <div class="grid grid-3">
      <StatCard title="Propiedades" :value="properties.length" icon="🏠" />
      <StatCard title="Contratos activos" :value="activeContracts" icon="📄" />
      <StatCard title="Ingresos del mes" :value="formatCOP(monthlyIncome)" icon="💰" />
    </div>
  </section>
</template>
