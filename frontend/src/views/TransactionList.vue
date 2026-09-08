<script setup lang="ts">
// Transacciones: filtros + tabla + gráfico + alta, edición y eliminación.
// Junto con Propiedades, es una de las páginas que combinan selector, tabla y Chart.js.
import { computed, reactive, ref } from 'vue'
import DataTable, { type TableColumn } from '../components/DataTable.vue'
import FilterSelect, { type SelectOption } from '../components/FilterSelect.vue'
import ChartCard from '../components/ChartCard.vue'
import * as transactionService from '../services/transaction.service'
import * as propertyService from '../services/property.service'
import { listMonthsPresent, sumAmountsByMonth } from '../utils/finance'
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

const typeFilterOptions: SelectOption[] = Object.values(TransactionType).map((type) => ({
  value: type,
  label: TransactionTypeLabel[type],
}))
const sourceFilterOptions: SelectOption[] = Object.values(TransactionSource).map((source) => ({
  value: source,
  label: TransactionSourceLabel[source],
}))
const monthFilterOptions = computed(() =>
  listMonthsPresent(visibleTransactions.value).slice().reverse(),
)

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
  { key: 'formattedAmount', label: 'Monto (COP)' },
  { key: 'description', label: 'Descripción' },
]

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
      formattedAmount: transaction.amount.toLocaleString('es-CO'),
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
        backgroundColor: '#16a34a',
        data: months.map((month) =>
          sumAmountsByMonth(matchingTransactions.value, TransactionType.INCOME, month),
        ),
      },
      {
        label: 'Gastos',
        backgroundColor: '#dc2626',
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

const propertySelectOptions = computed<SelectOption[]>(() =>
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

const inputClasses =
  'rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:outline-2 focus:outline-primary'
</script>

<template>
  <section>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold">Transacciones</h1>
      <button
        class="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark"
        type="button"
        @click="startCreating"
      >
        + Nueva transacción
      </button>
    </div>

    <form
      v-if="isFormVisible"
      class="mb-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2"
      @submit.prevent="saveTransaction"
    >
      <h2 class="col-span-full text-lg font-semibold">
        {{ editingTransactionId ? 'Editar transacción' : 'Nueva transacción' }}
      </h2>
      <label class="flex flex-col gap-1">
        <span class="text-sm font-medium">Propiedad</span>
        <select v-model="transactionForm.propertyId" :class="inputClasses">
          <option v-for="option in propertySelectOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-sm font-medium">Tipo</span>
        <select v-model="transactionForm.type" :class="inputClasses">
          <option v-for="option in typeFilterOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-sm font-medium">Fuente</span>
        <select v-model="transactionForm.source" :class="inputClasses">
          <option v-for="option in sourceFilterOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-sm font-medium">Monto (COP)</span>
        <input
          v-model.number="transactionForm.amount"
          type="number"
          min="0"
          :class="inputClasses"
        />
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-sm font-medium">Fecha</span>
        <input v-model="transactionForm.date" type="date" :class="inputClasses" />
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-sm font-medium">Descripción</span>
        <input v-model="transactionForm.description" :class="inputClasses" />
      </label>

      <p v-if="formError" aria-live="polite" class="col-span-full text-sm text-red-600">
        {{ formError }}
      </p>

      <div class="col-span-full flex gap-3">
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

    <div class="mb-4 flex flex-wrap items-end gap-4">
      <FilterSelect v-model="selectedType" label="Tipo" :options="typeFilterOptions" />
      <FilterSelect v-model="selectedSource" label="Fuente" :options="sourceFilterOptions" />
      <FilterSelect v-model="selectedMonth" label="Mes" :options="monthFilterOptions" />
    </div>

    <ChartCard title="Ingresos vs gastos por mes" type="bar" :chart-data="incomeVsExpenseChart" />

    <div class="mt-6">
      <DataTable :columns="tableColumns" :rows="tableRows">
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
