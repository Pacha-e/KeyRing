<script setup lang="ts">
// --- External imports ---
import type { ChartData } from 'chart.js';
import { computed, onMounted, ref } from 'vue';

// --- Internal imports ---
import ChartCard from '../components/ChartCard.vue';
import FilterBar from '../components/FilterBar.vue';
import FilterSelect from '../components/FilterSelect.vue';
import PageHeader from '../components/PageHeader.vue';
import { CHART_CATEGORICAL, CHART_EXPENSE, CHART_INCOME, CHART_NAVY } from '../config/chart.config';
import { PropertyType, PropertyTypeLabel } from '../enums/PropertyType';
import { TransactionSourceLabel } from '../enums/TransactionSource';
import { TransactionType } from '../enums/TransactionType';
import type { PropertyInterface } from '../interfaces/PropertyInterface';
import type { SelectOption } from '../interfaces/SelectOption';
import type { TransactionInterface } from '../interfaces/TransactionInterface';
import { PropertyService as propertyService } from '../services/property.service';
import { TransactionService as transactionService } from '../services/transaction.service';
import { FinanceCalculator } from '../utils/finance';
import { CurrencyFormatter } from '../utils/format';

// --- Types ---
interface PropertyReportRow {
  id: string;
  name: string;
  city: string;
  income: string;
  expense: string;
  net: string;
}

// --- State ---
const monthFrom = ref('');
const monthTo = ref('');
const properties = ref<PropertyInterface[]>([]);
const selectedCity = ref('');
const selectedPropertyType = ref('');
const transactions = ref<TransactionInterface[]>([]);

// --- Computed ---
const availableMonths = computed(() => FinanceCalculator.listMonthsPresent(transactions.value));
const cities = computed(() => propertyService.cities(properties.value));

const filteredBalance = computed(() =>
  FinanceCalculator.summarizeTransactions(filteredTransactions.value),
);

const filteredProperties = computed(() =>
  properties.value.filter(
    (property) =>
      (!selectedCity.value || property.city === selectedCity.value) &&
      (!selectedPropertyType.value || property.type === selectedPropertyType.value),
  ),
);

const filteredTransactions = computed(() => {
  const visibleIds = new Set(filteredProperties.value.map((property) => property.id));
  return transactions.value.filter((transaction) => {
    if (!visibleIds.has(transaction.propertyId)) return false;
    const month = transaction.date.slice(0, 7);
    if (monthFrom.value && month < monthFrom.value) return false;
    if (monthTo.value && month > monthTo.value) return false;
    return true;
  });
});

const hasActiveFilters = computed(() =>
  Boolean(selectedCity.value || selectedPropertyType.value || monthFrom.value || monthTo.value),
);

const incomeBySourceChart = computed<ChartData<'doughnut'>>(() => {
  const totalsBySource = FinanceCalculator.sumIncomeBySource(filteredTransactions.value);
  return {
    labels: Object.keys(totalsBySource).map(
      (source) => TransactionSourceLabel[source as keyof typeof TransactionSourceLabel] ?? source,
    ),
    datasets: [{ backgroundColor: CHART_CATEGORICAL, data: Object.values(totalsBySource) }],
  };
});

const incomeVsExpenseChart = computed<ChartData<'bar'>>(() => {
  const months = FinanceCalculator.listMonthsPresent(filteredTransactions.value);
  return {
    labels: months,
    datasets: [
      {
        label: 'Income',
        backgroundColor: CHART_INCOME,
        data: months.map((month) =>
          FinanceCalculator.sumAmountsByMonth(
            filteredTransactions.value,
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
            filteredTransactions.value,
            TransactionType.EXPENSE,
            month,
          ),
        ),
      },
    ],
  };
});

const netProfitByCityChart = computed<ChartData<'bar'>>(() => {
  const profitByCity = FinanceCalculator.sumNetProfitByCity(
    filteredProperties.value,
    filteredTransactions.value,
  );
  return {
    labels: profitByCity.map((row) => row.city),
    datasets: [
      {
        label: 'Net profit (COP)',
        backgroundColor: CHART_NAVY,
        data: profitByCity.map((row) => row.profit),
      },
    ],
  };
});

const propertyTypeOptions: SelectOption[] = Object.values(PropertyType).map((type) => ({
  value: type,
  label: PropertyTypeLabel[type],
}));

const tableRows = computed<PropertyReportRow[]>(() =>
  filteredProperties.value.map((property) => {
    const { income, expense, net } = FinanceCalculator.summarizePropertyBalance(
      property.id,
      transactions.value,
    );
    return {
      id: property.id,
      name: property.name,
      city: property.city,
      income: CurrencyFormatter.formatNumber(income),
      expense: CurrencyFormatter.formatNumber(expense),
      net: CurrencyFormatter.formatNumber(net),
    };
  }),
);

// --- Methods ---
/** Resets all filters to their initial state. */
function clearFilters(): void {
  selectedCity.value = '';
  selectedPropertyType.value = '';
  monthFrom.value = '';
  monthTo.value = '';
}

/** Reloads global report data. */
async function reloadFromApi(): Promise<void> {
  properties.value = await propertyService.findAll();
  transactions.value = await transactionService.findAll();
}

// --- Lifecycle ---
onMounted(() => void reloadFromApi());
</script>

<template>
  <section>
    <PageHeader
      title="Reports"
      :subtitle="`${filteredProperties.length} property(ies) · profit ${CurrencyFormatter.formatCOP(filteredBalance.net)} · admin only`"
    />

    <FilterBar>
      <FilterSelect v-model="selectedCity" label="City" :options="cities" />
      <FilterSelect
        v-model="selectedPropertyType"
        label="Property type"
        :options="propertyTypeOptions"
      />
      <FilterSelect
        v-model="monthFrom"
        label="From (month)"
        :options="availableMonths"
        all-label="No limit"
      />
      <FilterSelect
        v-model="monthTo"
        label="To (month)"
        :options="availableMonths"
        all-label="No limit"
      />
      <button
        v-if="hasActiveFilters"
        class="py-2 text-sm text-primary underline-offset-4 hover:underline"
        type="button"
        @click="clearFilters"
      >
        Clear filters
      </button>
    </FilterBar>

    <div class="grid gap-4 md:grid-cols-2">
      <ChartCard
        title="Income vs expenses by month"
        type="bar"
        :chart-data="incomeVsExpenseChart"
      />
      <ChartCard title="Income by source" type="doughnut" :chart-data="incomeBySourceChart" />
      <ChartCard
        class="md:col-span-2"
        title="Net profit by city"
        type="bar"
        :chart-data="netProfitByCityChart"
      />
    </div>

    <div class="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-sidebar/[0.04]">
            <th
              class="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              Property
            </th>
            <th
              class="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              City
            </th>
            <th
              class="border-b border-slate-200 px-4 py-3 text-right text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              Income (COP)
            </th>
            <th
              class="border-b border-slate-200 px-4 py-3 text-right text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              Expenses (COP)
            </th>
            <th
              class="border-b border-slate-200 px-4 py-3 text-right text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              Net (COP)
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, index) in tableRows"
            :key="String(row.id ?? index)"
            class="transition-colors odd:bg-white even:bg-slate-50/60 hover:bg-primary/[0.06]"
          >
            <td class="border-b border-slate-100 px-4 py-3">{{ row.name }}</td>
            <td class="border-b border-slate-100 px-4 py-3">{{ row.city }}</td>
            <td
              class="border-b border-slate-100 px-4 py-3 text-right tabular-nums whitespace-nowrap"
            >
              {{ row.income }}
            </td>
            <td
              class="border-b border-slate-100 px-4 py-3 text-right tabular-nums whitespace-nowrap"
            >
              {{ row.expense }}
            </td>
            <td
              class="border-b border-slate-100 px-4 py-3 text-right tabular-nums whitespace-nowrap"
            >
              {{ row.net }}
            </td>
          </tr>
          <tr v-if="tableRows.length === 0">
            <td class="px-4 py-12 text-center" colspan="5">
              <p class="m-0 text-sm font-medium text-slate-500">No properties match the filter</p>
              <p class="mt-1 mb-0 text-sm text-slate-400">
                Widen the month range or remove the city filter.
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
