<script setup lang="ts">
// Dashboard: resumen del negocio del usuario en sesión.
import { computed, onMounted, ref } from 'vue'
import StatCard from '../components/StatCard.vue'
import * as propertyService from '../services/property.service'
import * as contractService from '../services/contract.service'
import * as transactionService from '../services/transaction.service'
import { TransactionType } from '../interfaces/enums'
import { useAuthStore } from '../stores/auth'
import type { PropertyInterface } from '../interfaces/PropertyInterface'
import type { ContractInterface } from '../interfaces/ContractInterface'
import type { TransactionInterface } from '../interfaces/TransactionInterface'

const auth = useAuthStore()

const properties = ref<PropertyInterface[]>([])
const contracts = ref<ContractInterface[]>([])
const transactions = ref<TransactionInterface[]>([])

/** Recarga los datos visibles para la sesión actual. */
function load(): void {
  properties.value = propertyService.listForUser(auth.user)
  contracts.value = contractService.listForUser(auth.user)
  transactions.value = transactionService.listForUser(auth.user)
}

onMounted(load)

const activeContracts = computed(() => contractService.countActive(contracts.value))

// Ingresos del mes en curso
const monthlyIncome = computed(() => {
  const mesActual = new Date().toISOString().slice(0, 7) // 'YYYY-MM'
  return transactionService.sumByMonth(transactions.value, TransactionType.INCOME, mesActual)
})

const net = computed(() => transactionService.totals(transactions.value).net)

/**
 * Formatea un monto en pesos colombianos.
 * @param n monto a formatear
 * @returns el monto como texto en formato COP
 */
function formatCOP(n: number): string {
  return n.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  })
}
</script>

<template>
  <section>
    <h1 class="mb-4 text-2xl font-bold">Dashboard</h1>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Propiedades" :value="properties.length" icon="🏠" />
      <StatCard title="Contratos activos" :value="activeContracts" icon="📄" />
      <StatCard title="Ingresos del mes" :value="formatCOP(monthlyIncome)" icon="💰" />
      <StatCard title="Balance neto" :value="formatCOP(net)" icon="📊" />
    </div>
  </section>
</template>
