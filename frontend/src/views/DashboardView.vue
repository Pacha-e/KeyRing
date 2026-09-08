<script setup lang="ts">
// Dashboard: resumen del negocio del usuario en sesión.
// Cada tarjeta lleva a la pantalla donde se gestiona ese dato, y debajo se
// muestra la evolución mensual y los contratos que vencen antes.
import { computed, ref } from 'vue'
import PageHeader from '../components/PageHeader.vue'
import StatCard from '../components/StatCard.vue'
import ChartCard from '../components/ChartCard.vue'
import DataTable, { type TableColumn } from '../components/DataTable.vue'
import StatusBadge from '../components/StatusBadge.vue'
import * as propertyService from '../services/property.service'
import * as contractService from '../services/contract.service'
import * as transactionService from '../services/transaction.service'
import {
  listMonthsPresent,
  sumAmountsByMonth,
  sumIncomeForCurrentMonth,
  summarizeTransactions,
} from '../utils/finance'
import { formatCOP } from '../utils/format'
import {
  CHART_EXPENSE,
  CHART_EXPENSE_FILL,
  CHART_INCOME,
  CHART_INCOME_FILL,
} from '../config/chart.config'
import { CONTRACT_STATUS_TONE } from '../utils/badges'
import {
  ContractStatus,
  ContractStatusLabel,
  PropertyStatus,
  TransactionType,
} from '../interfaces/enums'
import { useAuthStore } from '../stores/auth'
import type { PropertyInterface } from '../interfaces/PropertyInterface'
import type { ContractInterface } from '../interfaces/ContractInterface'
import type { TransactionInterface } from '../interfaces/TransactionInterface'
import type { ChartData } from 'chart.js'

const authStore = useAuthStore()

const properties = ref<PropertyInterface[]>([])
const contracts = ref<ContractInterface[]>([])
const transactions = ref<TransactionInterface[]>([])

/** Recarga los datos visibles para la sesión actual. */
function reloadFromStorage(): void {
  properties.value = propertyService.listForUser(authStore.user)
  contracts.value = contractService.listForUser(authStore.user)
  transactions.value = transactionService.listForUser(authStore.user)
}

// Se carga aquí y no en onMounted: LocalStorage responde de inmediato,
// así la primera pintada ya trae los datos en vez de tarjetas en cero.
reloadFromStorage()

const activeContracts = computed(() => contractService.countActive(contracts.value))
const monthlyIncome = computed(() => sumIncomeForCurrentMonth(transactions.value))
const balance = computed(() => summarizeTransactions(transactions.value))
const vacantCount = computed(
  () => properties.value.filter((property) => property.status === PropertyStatus.VACANT).length,
)

// Evolución mensual: la misma lectura de los reportes, resumida
const monthlyChart = computed<ChartData<'line'>>(() => {
  const months = listMonthsPresent(transactions.value)
  return {
    labels: months,
    datasets: [
      {
        label: 'Ingresos',
        borderColor: CHART_INCOME,
        backgroundColor: CHART_INCOME_FILL,
        fill: true,
        tension: 0.3,
        data: months.map((month) =>
          sumAmountsByMonth(transactions.value, TransactionType.INCOME, month),
        ),
      },
      {
        label: 'Gastos',
        borderColor: CHART_EXPENSE,
        backgroundColor: CHART_EXPENSE_FILL,
        fill: true,
        tension: 0.3,
        data: months.map((month) =>
          sumAmountsByMonth(transactions.value, TransactionType.EXPENSE, month),
        ),
      },
    ],
  }
})

// Contratos que vencen antes: es lo primero que un propietario necesita ver
const contractColumns: TableColumn[] = [
  { key: 'propertyName', label: 'Propiedad' },
  { key: 'endDate', label: 'Vence', align: 'right' },
  { key: 'statusLabel', label: 'Estado' },
]

const upcomingContracts = computed(() =>
  contracts.value
    .filter((contract) => contract.status === ContractStatus.ACTIVE)
    .slice()
    .sort((a, b) => a.endDate.localeCompare(b.endDate))
    .slice(0, 5)
    .map((contract) => ({
      id: contract.id,
      propertyName:
        properties.value.find((property) => property.id === contract.propertyId)?.name ?? '—',
      endDate: contract.endDate,
      status: contract.status,
      statusLabel: ContractStatusLabel[contract.status],
    })),
)
</script>

<template>
  <section>
    <PageHeader
      title="Dashboard"
      :subtitle="`Resumen del negocio de ${authStore.user?.fullName ?? ''}`"
    />

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Propiedades"
        icon="home"
        :value="properties.length"
        :hint="vacantCount ? `${vacantCount} vacante(s)` : 'todas ocupadas'"
        :to="{ name: 'properties' }"
      />
      <StatCard
        title="Contratos activos"
        icon="contract"
        :value="activeContracts"
        :hint="`de ${contracts.length} registrados`"
        :to="{ name: 'contracts' }"
      />
      <StatCard
        title="Ingresos del mes"
        icon="income"
        :value="formatCOP(monthlyIncome)"
        hint="mes en curso"
        :to="{ name: 'transactions' }"
      />
      <StatCard
        title="Balance neto"
        icon="balance"
        :value="formatCOP(balance.net)"
        :hint="`${formatCOP(balance.income)} en ingresos`"
        :to="{ name: 'transactions' }"
      />
    </div>

    <div class="mt-6 grid gap-4 lg:grid-cols-3">
      <ChartCard
        class="lg:col-span-2"
        title="Ingresos y gastos por mes"
        type="line"
        :chart-data="monthlyChart"
      />

      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 class="mt-0 mb-1 text-base font-semibold text-ink">Próximos vencimientos</h2>
        <p class="mt-0 mb-4 text-xs text-slate-500">
          Contratos activos, del más cercano al más lejano
        </p>
        <DataTable
          :columns="contractColumns"
          :rows="upcomingContracts"
          empty-message="No hay contratos activos"
          empty-hint="Cuando registres uno, aparecerá aquí su fecha de vencimiento."
        >
          <template #cell-statusLabel="{ value, row }">
            <StatusBadge
              :label="String(value)"
              :tone="CONTRACT_STATUS_TONE[row.status as ContractStatus]"
            />
          </template>
        </DataTable>
      </div>
    </div>
  </section>
</template>
