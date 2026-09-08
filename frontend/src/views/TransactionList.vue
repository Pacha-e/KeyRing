<script setup lang="ts">
// Transacciones: filtros + tabla + gráfico + alta, edición y eliminación.
// Junto con Propiedades, es una de las páginas que combinan selector, tabla y Chart.js.
import { computed, reactive, ref } from 'vue'
import DataTable, { type TableColumn } from '../components/DataTable.vue'
import FilterSelect, { type SelectOption } from '../components/FilterSelect.vue'
import SelectField from '../components/SelectField.vue'
import FilterBar from '../components/FilterBar.vue'
import PageHeader from '../components/PageHeader.vue'
import StatusBadge from '../components/StatusBadge.vue'
import ChartCard from '../components/ChartCard.vue'
import * as transactionService from '../services/transaction.service'
import * as propertyService from '../services/property.service'
import { listMonthsPresent, sumAmountsByMonth, summarizeTransactions } from '../utils/finance'
import { formatCOP, formatNumber } from '../utils/format'
import { CHART_EXPENSE, CHART_INCOME } from '../config/chart.config'
import { TRANSACTION_SOURCE_TONE, TRANSACTION_TYPE_TONE } from '../utils/badges'
import {
  TransactionType,
  TransactionTypeLabel,
  TransactionSource,
  TransactionSourceLabel,
} from '../interfaces/enums'
import { useAuthStore } from '../stores/auth'
import type { TransactionInterface } from '../interfaces/TransactionInterface'
import type { PropertyInterface } from '../interfaces/PropertyInterface'
import type { CreateTransactionDTO } from '../dtos/CreateTransactionDTO'
import type { ChartData } from 'chart.js'

const authStore = useAuthStore()

const visibleTransactions = ref<TransactionInterface[]>([])
const visibleProperties = ref<PropertyInterface[]>([])

/** Recarga las transacciones y propiedades que la sesión actual puede ver. */
function reloadFromStorage(): void {
  visibleTransactions.value = transactionService.listForUser(authStore.user)
  visibleProperties.value = propertyService.listForUser(authStore.user)
}

// Se carga aqui y no en onMounted: LocalStorage responde de inmediato,
// asi la primera pintada ya trae los datos en vez de una tabla vacia.
reloadFromStorage()

// --- Filtros ---
const selectedType = ref('')
const selectedSource = ref('')
const selectedMonth = ref('')

// Se tipan con el enum del dominio y no con SelectOption a secas: así lo que
// devuelve el selector sigue siendo un TransactionType y no una cadena suelta.
const typeFilterOptions: SelectOption<TransactionType>[] = Object.values(TransactionType).map(
  (type) => ({ value: type, label: TransactionTypeLabel[type] }),
)
const sourceFilterOptions: SelectOption<TransactionSource>[] = Object.values(TransactionSource).map(
  (source) => ({ value: source, label: TransactionSourceLabel[source] }),
)
const monthFilterOptions = computed(() =>
  listMonthsPresent(visibleTransactions.value).slice().reverse(),
)

/** Hay algún filtro puesto, y por tanto algo que limpiar. */
const hasActiveFilters = computed(() =>
  Boolean(selectedType.value || selectedSource.value || selectedMonth.value),
)

/** Devuelve los tres filtros a su estado inicial. */
function clearFilters(): void {
  selectedType.value = ''
  selectedSource.value = ''
  selectedMonth.value = ''
}

const matchingTransactions = computed(() =>
  visibleTransactions.value.filter((transaction) => {
    if (selectedType.value && transaction.type !== selectedType.value) return false
    if (selectedSource.value && transaction.source !== selectedSource.value) return false
    if (selectedMonth.value && !transaction.date.startsWith(selectedMonth.value)) return false
    return true
  }),
)

// --- Tabla ---
const tableColumns: TableColumn[] = [
  { key: 'date', label: 'Fecha' },
  { key: 'propertyName', label: 'Propiedad' },
  { key: 'typeLabel', label: 'Tipo' },
  { key: 'sourceLabel', label: 'Fuente' },
  { key: 'formattedAmount', label: 'Monto (COP)', align: 'right' },
  { key: 'description', label: 'Descripción' },
]

/** Balance de lo que se está viendo, para que el subtítulo hable de lo filtrado. */
const filteredBalance = computed(() => summarizeTransactions(matchingTransactions.value))

const tableRows = computed(() =>
  matchingTransactions.value
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((transaction) => ({
      ...transaction,
      propertyName:
        visibleProperties.value.find((p) => p.id === transaction.propertyId)?.name ?? '—',
      typeLabel: TransactionTypeLabel[transaction.type] ?? transaction.type,
      sourceLabel: TransactionSourceLabel[transaction.source] ?? transaction.source,
      formattedAmount: formatNumber(transaction.amount),
    })),
)

// --- Gráfico: ingresos frente a gastos, mes a mes, sobre lo filtrado ---
const incomeVsExpenseChart = computed<ChartData<'bar'>>(() => {
  const months = listMonthsPresent(matchingTransactions.value)
  return {
    labels: months,
    datasets: [
      {
        label: 'Ingresos',
        backgroundColor: CHART_INCOME,
        data: months.map((month) =>
          sumAmountsByMonth(matchingTransactions.value, TransactionType.INCOME, month),
        ),
      },
      {
        label: 'Gastos',
        backgroundColor: CHART_EXPENSE,
        data: months.map((month) =>
          sumAmountsByMonth(matchingTransactions.value, TransactionType.EXPENSE, month),
        ),
      },
    ],
  }
})

// --- Formulario de alta y edición (se muestra dentro de la misma página) ---
const isFormVisible = ref(false)
const editingTransactionId = ref<string | null>(null)
const formError = ref('')

const propertySelectOptions = computed<SelectOption<string>[]>(() =>
  visibleProperties.value.map((property) => ({ value: property.id, label: property.name })),
)

/** Transacción en blanco, con la primera propiedad disponible preseleccionada. */
function buildEmptyTransaction(): CreateTransactionDTO {
  return {
    propertyId: visibleProperties.value[0]?.id ?? '',
    type: TransactionType.INCOME,
    source: TransactionSource.AIRBNB,
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    description: '',
  }
}

const transactionForm = reactive<CreateTransactionDTO>(buildEmptyTransaction())

/** Abre el formulario vacío para registrar una transacción nueva. */
function startCreating(): void {
  editingTransactionId.value = null
  formError.value = ''
  Object.assign(transactionForm, buildEmptyTransaction())
  isFormVisible.value = true
}

/**
 * Abre el formulario cargado con una transacción existente.
 * @param transactionId identificador de la transacción a editar
 */
function startEditing(transactionId: string): void {
  const existing = visibleTransactions.value.find((t) => t.id === transactionId)
  if (!existing) return
  const { id: _id, ...editableFields } = existing
  editingTransactionId.value = existing.id
  formError.value = ''
  Object.assign(transactionForm, editableFields)
  isFormVisible.value = true
}

/** Cierra el formulario descartando los cambios. */
function cancelEditing(): void {
  isFormVisible.value = false
  editingTransactionId.value = null
  formError.value = ''
}

/**
 * Valida las reglas de negocio de la transacción.
 * @returns mensaje de error en español, o null si es válida
 */
function findValidationError(): string | null {
  if (!transactionForm.propertyId) return 'Selecciona la propiedad del movimiento.'
  if (transactionForm.amount <= 0) return 'El monto debe ser mayor que cero.'
  if (!transactionForm.date) return 'Indica la fecha del movimiento.'
  if (!transactionForm.description.trim()) return 'Describe brevemente el movimiento.'
  return null
}

/** Valida y guarda la transacción, luego recarga la tabla y el gráfico. */
function saveTransaction(): void {
  const validationError = findValidationError()
  if (validationError) {
    formError.value = validationError
    return
  }
  if (editingTransactionId.value) {
    transactionService.update(editingTransactionId.value, { ...transactionForm })
  } else {
    transactionService.create({ ...transactionForm })
  }
  reloadFromStorage()
  cancelEditing()
}

/**
 * Elimina una transacción tras confirmación del usuario.
 * @param transactionId identificador de la transacción
 */
function deleteTransaction(transactionId: string): void {
  if (!window.confirm('¿Eliminar esta transacción? Esta acción no se puede deshacer.')) return
  transactionService.remove(transactionId)
  reloadFromStorage()
}
</script>

<template>
  <section>
    <PageHeader
      title="Transacciones"
      :subtitle="`${matchingTransactions.length} movimiento(s) · balance ${formatCOP(filteredBalance.net)}`"
    >
      <template #actions>
        <button
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark"
          type="button"
          @click="startCreating"
        >
          + Nueva transacción
        </button>
      </template>
    </PageHeader>

    <form
      v-if="isFormVisible"
      class="mb-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2"
      @submit.prevent="saveTransaction"
    >
      <h2 class="font-brand col-span-full m-0 text-lg font-semibold text-ink">
        {{ editingTransactionId ? 'Editar transacción' : 'Nueva transacción' }}
      </h2>
      <SelectField
        v-model="transactionForm.propertyId"
        label="Propiedad"
        :options="propertySelectOptions"
      />
      <SelectField v-model="transactionForm.type" label="Tipo" :options="typeFilterOptions" />
      <SelectField v-model="transactionForm.source" label="Fuente" :options="sourceFilterOptions" />
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">Monto (COP)</span>
        <input v-model.number="transactionForm.amount" type="number" min="0" class="field-input" />
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">Fecha</span>
        <input v-model="transactionForm.date" type="date" class="field-input" />
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">Descripción</span>
        <input v-model="transactionForm.description" class="field-input" />
      </label>

      <p
        v-if="formError"
        aria-live="polite"
        class="col-span-full m-0 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
      >
        {{ formError }}
      </p>

      <div class="col-span-full mt-2 flex gap-3 border-t border-slate-200 pt-5">
        <button
          class="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark"
          type="submit"
        >
          Guardar
        </button>
        <button
          class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          type="button"
          @click="cancelEditing"
        >
          Cancelar
        </button>
      </div>
    </form>

    <FilterBar>
      <FilterSelect v-model="selectedType" label="Tipo" :options="typeFilterOptions" />
      <FilterSelect v-model="selectedSource" label="Fuente" :options="sourceFilterOptions" />
      <FilterSelect v-model="selectedMonth" label="Mes" :options="monthFilterOptions" />
      <button
        v-if="hasActiveFilters"
        class="py-2 text-sm text-primary underline-offset-4 hover:underline"
        type="button"
        @click="clearFilters"
      >
        Limpiar filtros
      </button>
    </FilterBar>

    <ChartCard title="Ingresos vs gastos por mes" type="bar" :chart-data="incomeVsExpenseChart" />

    <div class="mt-6">
      <DataTable
        :columns="tableColumns"
        :rows="tableRows"
        :empty-message="
          hasActiveFilters
            ? 'Ningún movimiento coincide con el filtro'
            : 'Todavía no hay movimientos'
        "
        :empty-hint="
          hasActiveFilters
            ? 'Prueba a quitar alguno de los filtros.'
            : 'Registra el primero con el botón “Nueva transacción”.'
        "
      >
        <template #cell-typeLabel="{ value, row }">
          <StatusBadge
            :label="String(value)"
            :tone="TRANSACTION_TYPE_TONE[row.type as TransactionType]"
          />
        </template>
        <template #cell-sourceLabel="{ value, row }">
          <StatusBadge
            :label="String(value)"
            :tone="TRANSACTION_SOURCE_TONE[row.source as TransactionSource]"
          />
        </template>
        <template #actions="{ row }">
          <div class="flex gap-3">
            <button
              class="text-primary hover:underline"
              type="button"
              @click="startEditing(String(row.id))"
            >
              Editar
            </button>
            <button
              class="text-red-600 hover:underline"
              type="button"
              @click="deleteTransaction(String(row.id))"
            >
              Eliminar
            </button>
          </div>
        </template>
      </DataTable>
    </div>
  </section>
</template>
