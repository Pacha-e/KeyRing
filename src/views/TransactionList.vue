<script setup lang="ts">
// Transacciones: selector (tipo, fuente, mes) + tabla + gráfico + CRUD completo.
// La otra página obligatoria con selector + tabla + gráfico (junto con Propiedades).
import { computed, reactive, ref } from 'vue'
import DataTable, { type TableColumn } from '../components/DataTable.vue'
import FilterSelect, { type SelectOption } from '../components/FilterSelect.vue'
import ChartCard from '../components/ChartCard.vue'
import StatusBadge from '../components/StatusBadge.vue'
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../services/transaction.service'
import { getProperties } from '../services/property.service'
import {
  TransactionType,
  TransactionTypeLabel,
  TransactionSource,
  TransactionSourceLabel,
} from '../interfaces/enums'
import type { TransactionInterface } from '../interfaces/TransactionInterface'
import type { CreateTransactionDTO } from '../dtos/CreateTransactionDTO'
import type { ChartData } from 'chart.js'

const transactions = ref<TransactionInterface[]>(getTransactions())
const properties = getProperties()

// --- filtros ---
const type = ref('')
const source = ref('')
const month = ref('')

const typeOptions: SelectOption[] = Object.values(TransactionType).map((v) => ({
  value: v,
  label: TransactionTypeLabel[v] ?? v,
}))
const sourceOptions: SelectOption[] = Object.values(TransactionSource).map((v) => ({
  value: v,
  label: TransactionSourceLabel[v] ?? v,
}))
const monthOptions = computed(() =>
  [...new Set(transactions.value.map((t) => t.date.slice(0, 7)))].sort().reverse(),
)

const columns: TableColumn[] = [
  { key: 'date', label: 'Fecha' },
  { key: 'propertyName', label: 'Propiedad' },
  { key: 'typeLabel', label: 'Tipo' },
  { key: 'sourceLabel', label: 'Fuente' },
  { key: 'amount', label: 'Monto (COP)' },
  { key: 'description', label: 'Descripción' },
]

const filtered = computed(() =>
  transactions.value.filter((t) => {
    if (type.value && t.type !== type.value) return false
    if (source.value && t.source !== source.value) return false
    if (month.value && !t.date.startsWith(month.value)) return false
    return true
  }),
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

// Gráfico: ingresos vs gastos agrupados por mes, sobre el conjunto filtrado
const chartData = computed<ChartData<'bar'>>(() => {
  const months = [...new Set(filtered.value.map((t) => t.date.slice(0, 7)))].sort()
  const sumBy = (tt: TransactionType, m: string) =>
    filtered.value
      .filter((t) => t.type === tt && t.date.startsWith(m))
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

// --- formulario crear / editar ---
const showForm = ref(false)
const editingId = ref<string | null>(null)
const propertyOptions = properties.map((p) => ({ value: p.id, label: p.name }))

function emptyForm(): CreateTransactionDTO {
  return {
    propertyId: properties[0]?.id ?? '',
    type: TransactionType.INCOME,
    source: TransactionSource.AIRBNB,
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    description: '',
  }
}

const form = reactive<CreateTransactionDTO>(emptyForm())

function onNew() {
  editingId.value = null
  Object.assign(form, emptyForm())
  showForm.value = true
}

function onEdit(row: Record<string, unknown>) {
  const original = transactions.value.find((t) => t.id === row.id)
  if (!original) return
  editingId.value = original.id
  Object.assign(form, {
    propertyId: original.propertyId,
    type: original.type,
    source: original.source,
    amount: original.amount,
    date: original.date,
    description: original.description,
  })
  showForm.value = true
}

function onCancel() {
  showForm.value = false
  editingId.value = null
}

function onSubmit() {
  if (editingId.value) {
    updateTransaction(editingId.value, { ...form })
  } else {
    createTransaction({ ...form })
  }
  transactions.value = getTransactions()
  showForm.value = false
  editingId.value = null
}

function onDelete(id: string) {
  if (!confirm('¿Eliminar esta transacción?')) return
  deleteTransaction(id)
  transactions.value = getTransactions()
}

const inputClass =
  'rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:outline-2 focus:outline-primary'
</script>

<template>
  <section>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold">Transacciones</h1>
      <button
        class="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary-dark"
        type="button"
        @click="onNew"
      >
        + Nueva transacción
      </button>
    </div>

    <form
      v-if="showForm"
      class="mb-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2"
      @submit.prevent="onSubmit"
    >
      <h2 class="col-span-full text-lg font-semibold">
        {{ editingId ? 'Editar transacción' : 'Nueva transacción' }}
      </h2>
      <label class="flex flex-col gap-1">
        <span class="text-sm font-medium">Propiedad</span>
        <select v-model="form.propertyId" required :class="inputClass">
          <option v-for="p in propertyOptions" :key="p.value" :value="p.value">{{ p.label }}</option>
        </select>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-sm font-medium">Tipo</span>
        <select v-model="form.type" :class="inputClass">
          <option v-for="t in typeOptions" :key="t.value" :value="t.value">{{ t.label }}</option>
        </select>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-sm font-medium">Fuente</span>
        <select v-model="form.source" :class="inputClass">
          <option v-for="s in sourceOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
        </select>
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-sm font-medium">Monto (COP)</span>
        <input v-model.number="form.amount" type="number" min="0" required :class="inputClass" />
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-sm font-medium">Fecha</span>
        <input v-model="form.date" type="date" required :class="inputClass" />
      </label>
      <label class="flex flex-col gap-1 sm:col-span-2">
        <span class="text-sm font-medium">Descripción</span>
        <input v-model="form.description" required :class="inputClass" />
      </label>
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
          @click="onCancel"
        >
          Cancelar
        </button>
      </div>
    </form>

    <div class="mb-4 flex flex-wrap items-end gap-4">
      <FilterSelect v-model="type" label="Tipo" :options="typeOptions" />
      <FilterSelect v-model="source" label="Fuente" :options="sourceOptions" />
      <FilterSelect v-model="month" label="Mes" :options="monthOptions" />
    </div>

    <ChartCard title="Ingresos vs gastos por mes" type="bar" :chart-data="chartData" />

    <div class="mt-6">
      <DataTable :columns="columns" :rows="rows">
        <template #cell-typeLabel="{ value, row }">
          <StatusBadge
            :label="String(value)"
            :tone="row.type === TransactionType.INCOME ? 'green' : 'red'"
          />
        </template>
        <template #actions="{ row }">
          <button class="text-primary hover:underline" type="button" @click="onEdit(row)">
            Editar
          </button>
          <button
            class="ml-3 text-red-600 hover:underline"
            type="button"
            @click="onDelete(String(row.id))"
          >
            Eliminar
          </button>
        </template>
      </DataTable>
    </div>
  </section>
</template>
