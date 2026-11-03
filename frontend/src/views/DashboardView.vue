<script setup lang="ts">
// --- External imports ---
import type { ChartData } from 'chart.js';
import { computed, onMounted, ref } from 'vue';

// --- Internal imports ---
import ChartCard from '../components/ChartCard.vue';
import PageHeader from '../components/PageHeader.vue';
import StatCard from '../components/StatCard.vue';
import StatusBadge from '../components/StatusBadge.vue';
import {
  CHART_EXPENSE,
  CHART_EXPENSE_FILL,
  CHART_INCOME,
  CHART_INCOME_FILL,
} from '../config/chart.config';
import { CONTRACT_STATUS_TONE } from '../enums/badge-tones';
import { ContractStatus, ContractStatusLabel } from '../enums/ContractStatus';
import { PropertyStatus } from '../enums/PropertyStatus';
import { TransactionType } from '../enums/TransactionType';
import type { ContractInterface } from '../interfaces/ContractInterface';
import type { PropertyInterface } from '../interfaces/PropertyInterface';
import type { TransactionInterface } from '../interfaces/TransactionInterface';
import { ContractService as contractService } from '../services/contract.service';
import { PropertyService as propertyService } from '../services/property.service';
import { TransactionService as transactionService } from '../services/transaction.service';
import { useAuthStore } from '../stores/auth';
import { FinanceCalculator } from '../utils/finance';
import { CurrencyFormatter } from '../utils/format';
import { HttpClient } from '../utils/HttpClient';

// --- Types ---
interface UpcomingContractRow {
  endDate: string;
  id: string;
  propertyName: string;
  status: ContractStatus;
  statusLabel: string;
}

// --- Stores ---
const authStore = useAuthStore();

// --- State ---
const contracts = ref<ContractInterface[]>([]);
const pageError = ref('');
const properties = ref<PropertyInterface[]>([]);
const transactions = ref<TransactionInterface[]>([]);

// --- Computed ---
const activeContracts = computed(() => contractService.countActive(contracts.value));
const balance = computed(() => FinanceCalculator.summarizeTransactions(transactions.value));
const monthlyChart = computed<ChartData<'line'>>(() => {
  const months = FinanceCalculator.listMonthsPresent(transactions.value);
  return {
    labels: months,
    datasets: [
      {
        label: 'Income',
        borderColor: CHART_INCOME,
        backgroundColor: CHART_INCOME_FILL,
        fill: true,
        tension: 0.3,
        data: months.map((month) =>
          FinanceCalculator.sumAmountsByMonth(transactions.value, TransactionType.INCOME, month),
        ),
      },
      {
        label: 'Expenses',
        borderColor: CHART_EXPENSE,
        backgroundColor: CHART_EXPENSE_FILL,
        fill: true,
        tension: 0.3,
        data: months.map((month) =>
          FinanceCalculator.sumAmountsByMonth(transactions.value, TransactionType.EXPENSE, month),
        ),
      },
    ],
  };
});

const monthlyIncome = computed(() =>
  FinanceCalculator.sumIncomeForCurrentMonth(transactions.value),
);

const upcomingContracts = computed<UpcomingContractRow[]>(() =>
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
);

const vacantCount = computed(
  () => properties.value.filter((property) => property.status === PropertyStatus.VACANT).length,
);

// --- Methods ---
/** Reloads data visible to the current session. */
async function reloadFromApi(): Promise<void> {
  try {
    properties.value = await propertyService.listForUser(authStore.user);
    contracts.value = await contractService.listForUser(authStore.user);
    transactions.value = await transactionService.listForUser(authStore.user);
    pageError.value = '';
  } catch (error) {
    pageError.value = HttpClient.apiErrorMessage(error);
  }
}

// --- Lifecycle ---
onMounted(() => void reloadFromApi());
</script>

<template>
  <section>
    <p v-if="pageError" role="alert" class="mb-4 text-sm text-red-700">{{ pageError }}</p>
    <PageHeader
      title="Dashboard"
      :subtitle="`Business summary for ${authStore.user?.fullName ?? ''}`"
    />

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Properties"
        icon="home"
        :value="properties.length"
        :hint="vacantCount ? `${vacantCount} vacant` : 'all occupied'"
        :to="{ name: 'properties' }"
      />
      <StatCard
        title="Active contracts"
        icon="contract"
        :value="activeContracts"
        :hint="`of ${contracts.length} registered`"
        :to="{ name: 'contracts' }"
      />
      <StatCard
        title="Monthly income"
        icon="income"
        :value="CurrencyFormatter.formatCOP(monthlyIncome)"
        hint="current month"
        :to="{ name: 'transactions' }"
      />
      <StatCard
        title="Net balance"
        icon="balance"
        :value="CurrencyFormatter.formatCOP(balance.net)"
        :hint="`${CurrencyFormatter.formatCOP(balance.income)} in income`"
        :to="{ name: 'transactions' }"
      />
    </div>

    <div class="mt-6 grid gap-4 lg:grid-cols-3">
      <ChartCard
        class="lg:col-span-2"
        title="Income and expenses by month"
        type="line"
        :chart-data="monthlyChart"
      />

      <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 class="mt-0 mb-1 text-base font-semibold text-ink">Upcoming expirations</h2>
        <p class="mt-0 mb-4 text-xs text-slate-500">Active contracts, nearest first</p>

        <ul v-if="upcomingContracts.length > 0" class="m-0 flex list-none flex-col gap-2 p-0">
          <li v-for="contract in upcomingContracts" :key="contract.id">
            <router-link
              class="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2.5 no-underline transition hover:border-primary hover:bg-primary/[0.04]"
              :to="{ name: 'contract-edit', params: { id: contract.id } }"
            >
              <span class="min-w-0">
                <span class="block truncate text-sm font-medium text-ink">
                  {{ contract.propertyName }}
                </span>
                <span class="mt-0.5 block text-xs text-slate-500">
                  Expires on {{ contract.endDate }}
                </span>
              </span>
              <StatusBadge
                :label="contract.statusLabel"
                :tone="CONTRACT_STATUS_TONE[contract.status]"
              />
            </router-link>
          </li>
        </ul>

        <div v-else class="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center">
          <p class="m-0 text-sm font-medium text-slate-500">No active contracts</p>
          <p class="mt-1 mb-0 text-sm text-slate-400">
            When you register one, its expiration date will appear here.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
