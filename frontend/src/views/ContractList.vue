<script setup lang="ts">
// --- External imports ---
import { computed, onMounted, ref } from 'vue';

// --- Internal imports ---
import FilterBar from '../components/FilterBar.vue';
import FilterSelect from '../components/FilterSelect.vue';
import PageHeader from '../components/PageHeader.vue';
import StatusBadge from '../components/StatusBadge.vue';
import { CONTRACT_STATUS_TONE } from '../enums/badge-tones';
import { ContractStatus, ContractStatusLabel } from '../enums/ContractStatus';
import type { ContractInterface } from '../interfaces/ContractInterface';
import type { PropertyInterface } from '../interfaces/PropertyInterface';
import type { SelectOption } from '../interfaces/SelectOption';
import { ContractService as contractService } from '../services/contract.service';
import { PropertyService as propertyService } from '../services/property.service';
import { useAuthStore } from '../stores/auth';
import { CurrencyFormatter } from '../utils/format';
import { HttpClient } from '../utils/HttpClient';

// --- Types ---
interface ContractTableRow extends ContractInterface {
  propertyName: string;
  rent: string;
  statusLabel: string;
}

// --- Stores ---
const authStore = useAuthStore();

// --- State ---
const contracts = ref<ContractInterface[]>([]);
const pageError = ref('');
const properties = ref<PropertyInterface[]>([]);
const selectedStatus = ref('');

// --- Computed ---
const activeCount = computed(() => contractService.countActive(contracts.value));

const statusFilterOptions: SelectOption[] = Object.values(ContractStatus).map((status) => ({
  value: status,
  label: ContractStatusLabel[status],
}));

const tableRows = computed<ContractTableRow[]>(() =>
  contracts.value
    .filter((contract) => !selectedStatus.value || contract.status === selectedStatus.value)
    .map((contract) => ({
      ...contract,
      propertyName:
        properties.value.find((property) => property.id === contract.propertyId)?.name ?? '—',
      rent: CurrencyFormatter.formatNumber(contract.fixedRent),
      statusLabel: ContractStatusLabel[contract.status] ?? contract.status,
    })),
);

// --- Methods ---
/** Deletes a contract after user confirmation. */
function onDelete(id: string, tenantName: string): void {
  if (!window.confirm(`Delete contract for "${tenantName}"? This cannot be undone.`)) return;
  void contractService
    .remove(id)
    .then(reloadFromApi)
    .catch((error: unknown) => {
      pageError.value = HttpClient.apiErrorMessage(error);
    });
}

/** Reloads contracts and properties visible to the current session. */
async function reloadFromApi(): Promise<void> {
  try {
    contracts.value = await contractService.listForUser(authStore.user);
    properties.value = await propertyService.listForUser(authStore.user);
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
    <PageHeader
      title="Contracts"
      :subtitle="`${activeCount} active of ${contracts.length} registered`"
    >
      <template #actions>
        <router-link
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white no-underline transition hover:bg-primary-dark"
          :to="{ name: 'contract-new' }"
        >
          + New contract
        </router-link>
      </template>
    </PageHeader>

    <p v-if="pageError" role="alert" class="mb-4 text-sm text-red-700">{{ pageError }}</p>

    <FilterBar>
      <FilterSelect v-model="selectedStatus" label="Status" :options="statusFilterOptions" />
    </FilterBar>

    <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
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
              Tenant
            </th>
            <th
              class="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              Contact
            </th>
            <th
              class="border-b border-slate-200 px-4 py-3 text-right text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              Rent (COP)
            </th>
            <th
              class="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              Start
            </th>
            <th
              class="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              End
            </th>
            <th
              class="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              Status
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
            <td class="border-b border-slate-100 px-4 py-3">{{ row.propertyName }}</td>
            <td class="border-b border-slate-100 px-4 py-3">{{ row.tenantName }}</td>
            <td class="border-b border-slate-100 px-4 py-3">{{ row.tenantContact }}</td>
            <td
              class="border-b border-slate-100 px-4 py-3 text-right tabular-nums whitespace-nowrap"
            >
              {{ row.rent }}
            </td>
            <td class="border-b border-slate-100 px-4 py-3">{{ row.startDate }}</td>
            <td class="border-b border-slate-100 px-4 py-3">{{ row.endDate }}</td>
            <td class="border-b border-slate-100 px-4 py-3">
              <StatusBadge
                :label="row.statusLabel"
                :tone="CONTRACT_STATUS_TONE[row.status as ContractStatus]"
              />
            </td>
            <td class="border-b border-slate-100 px-4 py-3 whitespace-nowrap">
              <div class="flex gap-3">
                <router-link
                  class="text-primary hover:underline"
                  :to="{ name: 'contract-edit', params: { id: String(row.id) } }"
                >
                  Edit
                </router-link>
                <button
                  class="text-red-600 hover:underline"
                  type="button"
                  @click="onDelete(String(row.id), String(row.tenantName))"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="tableRows.length === 0">
            <td class="px-4 py-12 text-center" colspan="8">
              <p class="m-0 text-sm font-medium text-slate-500">
                {{ selectedStatus ? 'No contracts in that status' : 'No contracts yet' }}
              </p>
              <p class="mt-1 mb-0 text-sm text-slate-400">
                {{
                  selectedStatus
                    ? 'Change the status filter to see the rest.'
                    : 'Register the first one with the “New contract” button.'
                }}
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
