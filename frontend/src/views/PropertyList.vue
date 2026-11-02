<script setup lang="ts">
// --- External imports ---
import type { ChartData } from 'chart.js';
import { computed, onMounted, ref } from 'vue';

// --- Internal imports ---
import ChartCard from '../components/ChartCard.vue';
import FilterBar from '../components/FilterBar.vue';
import FilterSelect from '../components/FilterSelect.vue';
import PageHeader from '../components/PageHeader.vue';
import StatusBadge from '../components/StatusBadge.vue';
import { CHART_NAVY, CHART_PRIMARY } from '../config/chart.config';
import { PROPERTY_STATUS_TONE, RENTAL_MODE_TONE } from '../enums/badge-tones';
import { PropertyStatusLabel } from '../enums/PropertyStatus';
import { PropertyType, PropertyTypeLabel } from '../enums/PropertyType';
import { RentalModeLabel } from '../enums/RentalMode';
import type { PropertyInterface } from '../interfaces/PropertyInterface';
import type { SelectOption } from '../interfaces/SelectOption';
import { PropertyService as propertyService } from '../services/property.service';
import { useAuthStore } from '../stores/auth';
import { FinanceCalculator } from '../utils/finance';
import { CurrencyFormatter } from '../utils/format';

// --- Types ---
interface PropertyTableRow extends PropertyInterface {
  rentalLabel: string;
  rent: string;
  statusLabel: string;
  typeLabel: string;
}

// --- Stores ---
const authStore = useAuthStore();

// --- State ---
const selectedCity = ref('');
const selectedType = ref('');
const visibleProperties = ref<PropertyInterface[]>([]);

// --- Computed ---
const cities = computed(() => propertyService.cities(visibleProperties.value));

const estimatedRentByCityChart = computed<ChartData<'bar'>>(() => {
  const rentByCity = FinanceCalculator.sumEstimatedRentByCity(matchingProperties.value);
  return {
    labels: rentByCity.map((row) => row.city),
    datasets: [
      {
        label: 'Estimated rent (COP)',
        backgroundColor: CHART_PRIMARY,
        data: rentByCity.map((row) => row.amount),
      },
    ],
  };
});

const hasActiveFilters = computed(() => Boolean(selectedCity.value || selectedType.value));

const matchingProperties = computed(() =>
  visibleProperties.value.filter(
    (property) =>
      (!selectedCity.value || property.city === selectedCity.value) &&
      (!selectedType.value || property.type === selectedType.value),
  ),
);

const propertiesByTypeChart = computed<ChartData<'bar'>>(() => {
  const countByType = propertyService.countByType(matchingProperties.value);
  const types = Object.keys(countByType) as PropertyType[];
  return {
    labels: types.map((type) => PropertyTypeLabel[type] ?? type),
    datasets: [
      {
        label: 'Properties',
        backgroundColor: CHART_NAVY,
        data: types.map((type) => countByType[type]),
      },
    ],
  };
});

const tableRows = computed<PropertyTableRow[]>(() =>
  matchingProperties.value.map((property) => ({
    ...property,
    typeLabel: PropertyTypeLabel[property.type] ?? property.type,
    rentalLabel: RentalModeLabel[property.rentalMode] ?? property.rentalMode,
    statusLabel: PropertyStatusLabel[property.status] ?? property.status,
    rent: CurrencyFormatter.formatNumber(property.estimatedMonthlyRent),
  })),
);

const typeFilterOptions: SelectOption[] = Object.values(PropertyType).map((type) => ({
  value: type,
  label: PropertyTypeLabel[type],
}));

// --- Methods ---
/** Resets the filters to their initial state. */
function clearFilters(): void {
  selectedCity.value = '';
  selectedType.value = '';
}

/** Deletes a property after user confirmation. */
function onDelete(id: string, name: string): void {
  if (!window.confirm(`Delete property "${name}"? This cannot be undone.`)) return;
  void propertyService.remove(id).then(reloadFromApi);
}

/** Reloads the properties visible for the current session. */
async function reloadFromApi(): Promise<void> {
  visibleProperties.value = await propertyService.listForUser(authStore.user);
}

// --- Lifecycle ---
onMounted(() => void reloadFromApi());
</script>

<template>
  <section>
    <PageHeader
      title="Properties"
      :subtitle="`${matchingProperties.length} of ${visibleProperties.length} properties in your portfolio`"
    >
      <template #actions>
        <router-link
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white no-underline transition hover:bg-primary-dark"
          :to="{ name: 'property-new' }"
        >
          + New property
        </router-link>
      </template>
    </PageHeader>

    <FilterBar>
      <FilterSelect v-model="selectedCity" label="City" :options="cities" />
      <FilterSelect v-model="selectedType" label="Type" :options="typeFilterOptions" />
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
      <ChartCard title="Properties by type" type="bar" :chart-data="propertiesByTypeChart" />
      <ChartCard title="Estimated rent by city" type="bar" :chart-data="estimatedRentByCityChart" />
    </div>

    <div class="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-sidebar/[0.04]">
            <th
              class="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              Name
            </th>
            <th
              class="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              City
            </th>
            <th
              class="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              Type
            </th>
            <th
              class="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              Rental mode
            </th>
            <th
              class="border-b border-slate-200 px-4 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              Status
            </th>
            <th
              class="border-b border-slate-200 px-4 py-3 text-right text-xs font-semibold tracking-wide text-slate-500 uppercase"
            >
              Estimated rent (COP)
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
            <td class="border-b border-slate-100 px-4 py-3">{{ row.name }}</td>
            <td class="border-b border-slate-100 px-4 py-3">{{ row.city }}</td>
            <td class="border-b border-slate-100 px-4 py-3">{{ row.typeLabel }}</td>
            <td class="border-b border-slate-100 px-4 py-3">
              <StatusBadge :label="row.rentalLabel" :tone="RENTAL_MODE_TONE[row.rentalMode]" />
            </td>
            <td class="border-b border-slate-100 px-4 py-3">
              <StatusBadge :label="row.statusLabel" :tone="PROPERTY_STATUS_TONE[row.status]" />
            </td>
            <td
              class="border-b border-slate-100 px-4 py-3 text-right tabular-nums whitespace-nowrap"
            >
              {{ row.rent }}
            </td>
            <td class="border-b border-slate-100 px-4 py-3 whitespace-nowrap">
              <div class="flex gap-3">
                <router-link
                  class="text-primary hover:underline"
                  :to="{ name: 'property-edit', params: { id: String(row.id) } }"
                >
                  Edit
                </router-link>
                <button
                  class="text-red-600 hover:underline"
                  type="button"
                  @click="onDelete(String(row.id), String(row.name))"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="tableRows.length === 0">
            <td class="px-4 py-12 text-center" colspan="7">
              <p class="m-0 text-sm font-medium text-slate-500">
                {{ hasActiveFilters ? 'No properties match the filters' : 'No properties yet' }}
              </p>
              <p class="mt-1 mb-0 text-sm text-slate-400">
                {{
                  hasActiveFilters
                    ? 'Try removing one of the filters.'
                    : 'Register the first one with the “New property” button.'
                }}
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
