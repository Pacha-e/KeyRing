<script setup lang="ts">
// Reportes (solo admin): filtros + gráficos Chart.js + tabla resumen por propiedad.
// Es la vista global del negocio, por eso no se filtra por propietario.
import { computed, ref } from 'vue'
import ChartCard from '../components/ChartCard.vue'
import FilterSelect, { type SelectOption } from '../components/FilterSelect.vue'
import FilterBar from '../components/FilterBar.vue'
import PageHeader from '../components/PageHeader.vue'
import DataTable, { type TableColumn } from '../components/DataTable.vue'
import * as propertyService from '../services/property.service'
import * as transactionService from '../services/transaction.service'
import {
  listMonthsPresent,
  sumAmountsByMonth,
  sumIncomeBySource,
  sumNetProfitByCity,
  summarizePropertyBalance,
  summarizeTransactions,
} from '../utils/finance'
import { formatCOP, formatNumber } from '../utils/format'
import { CHART_CATEGORICAL, CHART_EXPENSE, CHART_INCOME, CHART_NAVY } from '../config/chart.config'
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

/** Hay algún filtro puesto, y por tanto algo que limpiar. */
const hasActiveFilters = computed(() =>
  Boolean(selectedCity.value || selectedPropertyType.value || monthFrom.value || monthTo.value),
)

/** Devuelve los cuatro filtros a su estado inicial. */
function clearFilters(): void {
  selectedCity.value = ''
  selectedPropertyType.value = ''
  monthFrom.value = ''
  monthTo.value = ''
}

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
        backgroundColor: CHART_INCOME,
        data: months.map((month) =>
          sumAmountsByMonth(filteredTransactions.value, TransactionType.INCOME, month),
        ),
      },
      {
        label: 'Gastos',
        backgroundColor: CHART_EXPENSE,
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
    datasets: [{ backgroundColor: CHART_CATEGORICAL, data: Object.values(totalsBySource) }],
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
        backgroundColor: CHART_NAVY,
        data: profitByCity.map((row) => row.profit),
      },
    ],
  }
})

// Tabla resumen por propiedad
const tableColumns: TableColumn[] = [
  { key: 'name', label: 'Propiedad' },
  { key: 'city', label: 'Ciudad' },
  { key: 'income', label: 'Ingresos (COP)', align: 'right' },
  { key: 'expense', label: 'Gastos (COP)', align: 'right' },
  { key: 'net', label: 'Neto (COP)', align: 'right' },
]

/** Balance de lo filtrado, para que el subtítulo hable de lo que se está viendo. */
const filteredBalance = computed(() => summarizeTransactions(filteredTransactions.value))

const tableRows = computed(() =>
  filteredProperties.value.map((p) => {
    const { income, expense, net } = summarizePropertyBalance(p.id, transactions.value)
    return {
      id: p.id,
      name: p.name,
      city: p.city,
      income: formatNumber(income),
      expense: formatNumber(expense),
      net: formatNumber(net),
    }
  }),
)
</script>

<template>
  <section>
    <PageHeader
      title="Reportes"
      :subtitle="`${filteredProperties.length} propiedad(es) · utilidad ${formatCOP(filteredBalance.net)} · página exclusiva para administradores`"
    />

    <FilterBar>
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
      <button
        v-if="hasActiveFilters"
        class="py-2 text-sm text-primary underline-offset-4 hover:underline"
        type="button"
        @click="clearFilters"
      >
        Limpiar filtros
      </button>
    </FilterBar>

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
      <DataTable
        :columns="tableColumns"
        :rows="tableRows"
        empty-message="Ninguna propiedad coincide con el filtro"
        empty-hint="Abre el rango de meses o quita el filtro de ciudad."
      />
    </div>
  </section>
</template>
