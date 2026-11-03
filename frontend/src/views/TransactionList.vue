<script setup lang="ts">
// --- External imports ---
import type { ChartData } from 'chart.js';
import { computed, onMounted, reactive, ref } from 'vue';

// --- Internal imports ---
import ChartCard from '../components/ChartCard.vue';
import FilterBar from '../components/FilterBar.vue';
import FilterSelect from '../components/FilterSelect.vue';
import PageHeader from '../components/PageHeader.vue';
import SelectField from '../components/SelectField.vue';
import StatusBadge from '../components/StatusBadge.vue';
import { CHART_EXPENSE, CHART_INCOME } from '../config/chart.config';
import type { CreateTransactionDto as CreateTransactionDTO } from '../dtos/CreateTransactionDto';
import { TRANSACTION_SOURCE_TONE, TRANSACTION_TYPE_TONE } from '../enums/badge-tones';
import { TransactionSource, TransactionSourceLabel } from '../enums/TransactionSource';
import { TransactionType, TransactionTypeLabel } from '../enums/TransactionType';
import type { PropertyInterface } from '../interfaces/PropertyInterface';
import type { SelectOption } from '../interfaces/SelectOption';
import type { TransactionInterface } from '../interfaces/TransactionInterface';
import { PropertyService as propertyService } from '../services/property.service';
import { TransactionService as transactionService } from '../services/transaction.service';
import { useAuthStore } from '../stores/auth';
import { FinanceCalculator } from '../utils/finance';
import { CurrencyFormatter, DateFormatter } from '../utils/format';
import { HttpClient } from '../utils/HttpClient';

// --- Types ---
interface TransactionTableRow extends TransactionInterface {
  formattedAmount: string;
  propertyName: string;
  sourceLabel: string;
  typeLabel: string;
}

// --- Stores ---
const authStore = useAuthStore();

// --- State ---
const editingTransactionId = ref<string | null>(null);
const formError = ref('');
const isFormVisible = ref(false);
const pageError = ref('');
const selectedMonth = ref('');
const selectedSource = ref('');
const selectedType = ref('');
const visibleProperties = ref<PropertyInterface[]>([]);
// Order kept: transactionForm initializer reads visibleProperties.
const transactionForm = reactive<CreateTransactionDTO>(buildEmptyTransaction());
const visibleTransactions = ref<TransactionInterface[]>([]);

// --- Computed ---
const filteredBalance = computed(() =>
  FinanceCalculator.summarizeTransactions(matchingTransactions.value),
);

const hasActiveFilters = computed(() =>
  Boolean(selectedType.value || selectedSource.value || selectedMonth.value),
);

const incomeVsExpenseChart = computed<ChartData<'bar'>>(() => {
  const months = FinanceCalculator.listMonthsPresent(matchingTransactions.value);
  return {
    labels: months,
    datasets: [
      {
        label: 'Income',
        backgroundColor: CHART_INCOME,
        data: months.map((month) =>
          FinanceCalculator.sumAmountsByMonth(
            matchingTransactions.value,
            TransactionType.INCOME,
            month,
          ),
        ),
      },
      {
        label: 'Expenses',
        backgroundColor: CHART_EXPENSE,
        data: months.map((month) =>
          FinanceCalculator.sumAmountsByMonth(
            matchingTransactions.value,
            TransactionType.EXPENSE,
            month,
          ),
        ),
      },
    ],
  };
});

const matchingTransactions = computed(() =>
  visibleTransactions.value.filter((transaction) => {
    if (selectedType.value && transaction.type !== selectedType.value) return false;
    if (selectedSource.value && transaction.source !== selectedSource.value) return false;
    if (selectedMonth.value && !transaction.date.startsWith(selectedMonth.value)) return false;
    return true;
  }),
);

const monthFilterOptions = computed(() =>
  FinanceCalculator.listMonthsPresent(visibleTransactions.value).slice().reverse(),
);

const propertySelectOptions = computed<SelectOption[]>(() =>
  visibleProperties.value.map((property) => ({ value: property.id, label: property.name })),
);

const sourceFilterOptions: SelectOption[] = Object.values(TransactionSource).map((source) => ({
  value: source,
  label: TransactionSourceLabel[source],
}));

const tableRows = computed<TransactionTableRow[]>(() =>
  matchingTransactions.value
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((transaction) => ({
      ...transaction,
      propertyName:
        visibleProperties.value.find((p) => p.id === transaction.propertyId)?.name ?? '—',
      typeLabel: TransactionTypeLabel[transaction.type] ?? transaction.type,
      sourceLabel: TransactionSourceLabel[transaction.source] ?? transaction.source,
      formattedAmount: CurrencyFormatter.formatNumber(transaction.amount),
    })),
);

const typeFilterOptions: SelectOption[] = Object.values(TransactionType).map((type) => ({
  value: type,
  label: TransactionTypeLabel[type],
}));

// --- Methods ---
/** Empty transaction with the first available property preselected. */
function buildEmptyTransaction(): CreateTransactionDTO {
  return {
    propertyId: visibleProperties.value[0]?.id ?? '',
    type: TransactionType.INCOME,
    source: TransactionSource.AIRBNB,
    amount: 0,
    date: DateFormatter.bogotaDate(),
    description: '',
  };
}

/** Closes the form discarding changes. */
function cancelEditing(): void {
  isFormVisible.value = false;
  editingTransactionId.value = null;
  formError.value = '';
}

/** Resets the filters to their initial state. */
function clearFilters(): void {
  selectedType.value = '';
  selectedSource.value = '';
  selectedMonth.value = '';
}

/** Deletes a transaction after user confirmation. */
function deleteTransaction(transactionId: string): void {
  if (!window.confirm('Delete this transaction? This action cannot be undone.')) return;
  void transactionService
    .remove(transactionId)
    .then(reloadFromApi)
    .catch((error: unknown) => {
      pageError.value = HttpClient.apiErrorMessage(error);
    });
}

/** Returns the first validation error, or null if the form is valid. */
function findValidationError(): string | null {
  if (!transactionForm.propertyId) return 'Select the transaction property.';
  if (transactionForm.amount <= 0) return 'Amount must be greater than zero.';
  if (!transactionForm.date) return 'Enter the transaction date.';
  if (!transactionForm.description.trim()) return 'Briefly describe the transaction.';
  return null;
}

/** Reloads transactions and properties visible to the current session. */
async function reloadFromApi(): Promise<void> {
  try {
    const [transactions, properties] = await Promise.all([
      transactionService.listForUser(authStore.user),
      propertyService.listForUser(authStore.user),
    ]);
    visibleTransactions.value = transactions;
    visibleProperties.value = properties;
    pageError.value = '';
  } catch (error) {
    pageError.value = HttpClient.apiErrorMessage(error);
  }
}

/** Validates and saves the transaction, then reloads the table and chart. */
async function saveTransaction(): Promise<void> {
  const validationError = findValidationError();
  if (validationError) {
    formError.value = validationError;
    return;
  }
  try {
    if (editingTransactionId.value) {
      await transactionService.update(editingTransactionId.value, { ...transactionForm });
    } else {
      await transactionService.create({ ...transactionForm });
    }
  } catch (error) {
    formError.value = HttpClient.apiErrorMessage(error);
    return;
  }
  cancelEditing();
  await reloadFromApi();
}

/** Opens the empty form to register a new transaction. */
function startCreating(): void {
  editingTransactionId.value = null;
  formError.value = '';
  Object.assign(transactionForm, buildEmptyTransaction());
  isFormVisible.value = true;
}

/** Opens the form loaded with an existing transaction. */
function startEditing(transactionId: string): void {
  const existing = visibleTransactions.value.find(
    (transaction) => transaction.id === transactionId,
  );
  if (!existing) return;
  const { id: _id, ...editableFields } = existing;
  editingTransactionId.value = existing.id;
  formError.value = '';
  Object.assign(transactionForm, editableFields);
  isFormVisible.value = true;
}

// --- Lifecycle ---
onMounted(() => void reloadFromApi());
</script>

<template>
  <section>
    <PageHeader
      title="Transactions"
      :subtitle="`${matchingTransactions.length} movement(s) · balance ${CurrencyFormatter.formatCOP(filteredBalance.net)}`"
    >
      <template #actions>
        <button
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-dark"
          type="button"
          @click="startCreating"
        >
          + New transaction
        </button>
      </template>
    </PageHeader>

    <p v-if="pageError" role="alert" class="mb-4 text-sm text-red-700">{{ pageError }}</p>

    <form
      v-if="isFormVisible"
      class="mb-6 grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2"
      @submit.prevent="saveTransaction"
    >
      <h2 class="font-brand col-span-full m-0 text-lg font-semibold text-ink">
        {{ editingTransactionId ? 'Edit transaction' : 'New transaction' }}
      </h2>
      <SelectField
        v-model="transactionForm.propertyId"
        label="Property"
        :options="propertySelectOptions"
      />
      <SelectField v-model="transactionForm.type" label="Type" :options="typeFilterOptions" />
      <SelectField v-model="transactionForm.source" label="Source" :options="sourceFilterOptions" />
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">Amount (COP)</span>
        <input v-model.number="transactionForm.amount" type="number" min="0" class="field-input" />
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">Date</span>
        <input v-model="transactionForm.date" type="date" class="field-input" />
      </label>
      <label class="flex flex-col gap-1.5">
        <span class="text-sm font-medium text-ink">Description</span>
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
          Save
        </button>
        <button
          class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          type="button"
          @click="cancelEditing"
        >
          Cancel
        </button>
      </div>
    </form>

    <FilterBar>
      <FilterSelect v-model="selectedType" label="Type" :options="typeFilterOptions" />
      <FilterSelect v-model="selectedSource" label="Source" :options="sourceFilterOptions" />
      <FilterSelect v-model="selectedMonth" label="Month" :options="monthFilterOptions" />
      <button
        v-if="hasActiveFilters"
        class="py-2 text-sm text-primary underline-offset-4 hover:underline"
        type="button"
        @click="clearFilters"
      >
        Clear filters
      </button>
    </FilterBar>

    <ChartCard title="Income vs expenses by month" type="bar" :chart-data="incomeVsExpenseChart" />

    <div class="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-sidebar/[0.04]">
            <th
              class="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              Date
            </th>
            <th
              class="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              Property
            </th>
            <th
              class="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              Type
            </th>
            <th
              class="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              Source
            </th>
            <th
              class="border-b border-slate-200 px-4 py-3 text-right text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              Amount (COP)
            </th>
            <th
              class="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              Description
            </th>
            <th
              class="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in tableRows"
            :key="String(row.id ?? index)"
            class="transition-colors odd:bg-white even:bg-slate-50/60 hover:bg-primary/[0.06]"
          >
            <td class="border-b border-slate-100 px-4 py-3">{{ row.date }}</td>
            <td class="border-b border-slate-100 px-4 py-3">{{ row.propertyName }}</td>
            <td class="border-b border-slate-100 px-4 py-3">
              <StatusBadge
                :label="row.typeLabel"
                :tone="TRANSACTION_TYPE_TONE[row.type as TransactionType]"
              />
            </td>
            <td class="border-b border-slate-100 px-4 py-3">
              <StatusBadge
                :label="row.sourceLabel"
                :tone="TRANSACTION_SOURCE_TONE[row.source as TransactionSource]"
              />
            </td>
            <td
              class="border-b border-slate-100 px-4 py-3 text-right tabular-nums whitespace-nowrap"
            >
              {{ row.formattedAmount }}
            </td>
            <td class="border-b border-slate-100 px-4 py-3">{{ row.description }}</td>
            <td class="border-b border-slate-100 px-4 py-3 whitespace-nowrap">
              <div class="flex gap-3">
                <button
                  class="text-primary hover:underline"
                  type="button"
                  @click="startEditing(String(row.id))"
                >
                  Edit
                </button>
                <button
                  class="text-red-600 hover:underline"
                  type="button"
                  @click="deleteTransaction(String(row.id))"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="tableRows.length === 0">
            <td class="px-4 py-12 text-center" colspan="7">
              <p class="m-0 text-sm font-medium text-slate-500">
                {{ hasActiveFilters ? 'No movements match the filter' : 'No movements yet' }}
              </p>
              <p class="mt-1 mb-0 text-sm text-slate-400">
                {{
                  hasActiveFilters
                    ? 'Try removing one of the filters.'
                    : 'Register the first one with the “New transaction” button.'
                }}
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
