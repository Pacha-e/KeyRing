<script setup lang="ts">
// Propiedades: selector + tabla + gráfico Chart.js, con CRUD completo.
import { computed, ref } from 'vue'
import DataTable, { type TableColumn } from '../components/DataTable.vue'
import FilterSelect, { type SelectOption } from '../components/FilterSelect.vue'
import FilterBar from '../components/FilterBar.vue'
import PageHeader from '../components/PageHeader.vue'
import StatusBadge from '../components/StatusBadge.vue'
import ChartCard from '../components/ChartCard.vue'
import * as propertyService from '../services/property.service'
import { sumEstimatedRentByCity } from '../utils/finance'
import { formatNumber } from '../utils/format'
import { CHART_NAVY, CHART_PRIMARY } from '../config/chart.config'
import { PROPERTY_STATUS_TONE, RENTAL_MODE_TONE } from '../utils/badges'
import {
  PropertyType,
  PropertyTypeLabel,
  RentalMode,
  RentalModeLabel,
  PropertyStatus,
  PropertyStatusLabel,
} from '../interfaces/enums'
import { useAuthStore } from '../stores/auth'
import type { PropertyInterface } from '../interfaces/PropertyInterface'
import type { ChartData } from 'chart.js'

const authStore = useAuthStore()

const visibleProperties = ref<PropertyInterface[]>([])
const selectedCity = ref('')
const selectedType = ref('')

/** Recarga las propiedades visibles para la sesión actual. */
function reloadFromStorage(): void {
  visibleProperties.value = propertyService.listForUser(authStore.user)
}

// Se carga aqui y no en onMounted: LocalStorage responde de inmediato,
// asi la primera pintada ya trae los datos en vez de una tabla vacia.
reloadFromStorage()

const cities = computed(() => propertyService.cities(visibleProperties.value))
const typeOptions: SelectOption[] = Object.values(PropertyType).map((v) => ({
  value: v,
  label: PropertyTypeLabel[v],
}))

const tableColumns: TableColumn[] = [
  { key: 'name', label: 'Nombre' },
  { key: 'city', label: 'Ciudad' },
  { key: 'typeLabel', label: 'Tipo' },
  { key: 'rentalLabel', label: 'Modalidad' },
  { key: 'statusLabel', label: 'Estado' },
  { key: 'rent', label: 'Arriendo estimado (COP)', align: 'right' },
]

/** Hay algún filtro puesto, y por tanto algo que limpiar. */
const hasActiveFilters = computed(() => Boolean(selectedCity.value || selectedType.value))

/** Devuelve los filtros a su estado inicial. */
function clearFilters(): void {
  selectedCity.value = ''
  selectedType.value = ''
}

const matchingProperties = computed(() =>
  visibleProperties.value.filter(
    (p) =>
      (!selectedCity.value || p.city === selectedCity.value) &&
      (!selectedType.value || p.type === selectedType.value),
  ),
)

const tableRows = computed(() =>
  matchingProperties.value.map((p) => ({
    ...p,
    typeLabel: PropertyTypeLabel[p.type] ?? p.type,
    rentalLabel: RentalModeLabel[p.rentalMode] ?? p.rentalMode,
    statusLabel: PropertyStatusLabel[p.status] ?? p.status,
    rent: formatNumber(p.estimatedMonthlyRent),
  })),
)

// Gráfico 1: cuántas propiedades hay de cada tipo, según el filtro aplicado
const propertiesByTypeChart = computed<ChartData<'bar'>>(() => {
  const countByType = propertyService.countByType(matchingProperties.value)
  const types = Object.keys(countByType) as PropertyType[]
  return {
    labels: types.map((type) => PropertyTypeLabel[type] ?? type),
    datasets: [
      {
        label: 'Propiedades',
        backgroundColor: CHART_NAVY,
        data: types.map((type) => countByType[type]),
      },
    ],
  }
})

// Gráfico 2: cuánto arriendo estimado concentra cada ciudad. Responde a una
// pregunta distinta del anterior: no cuántos inmuebles hay, sino cuánto rinden.
const estimatedRentByCityChart = computed<ChartData<'bar'>>(() => {
  const rentByCity = sumEstimatedRentByCity(matchingProperties.value)
  return {
    labels: rentByCity.map((row) => row.city),
    datasets: [
      {
        label: 'Arriendo estimado (COP)',
        backgroundColor: CHART_PRIMARY,
        data: rentByCity.map((row) => row.amount),
      },
    ],
  }
})

/**
 * Elimina una propiedad tras confirmación del usuario.
 * @param id identificador de la propiedad
 * @param nombre nombre mostrado en la confirmación
 */
function onDelete(id: string, nombre: string): void {
  if (!window.confirm(`¿Eliminar la propiedad "${nombre}"? Esta acción no se puede deshacer.`)) {
    return
  }
  propertyService.remove(id)
  reloadFromStorage()
}
</script>

<template>
  <section>
    <PageHeader
      title="Propiedades"
      :subtitle="`${matchingProperties.length} de ${visibleProperties.length} inmuebles en tu portafolio`"
    >
      <template #actions>
        <router-link
          class="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white no-underline transition hover:bg-primary-dark"
          :to="{ name: 'property-new' }"
        >
          + Nueva propiedad
        </router-link>
      </template>
    </PageHeader>

    <FilterBar>
      <FilterSelect v-model="selectedCity" label="Ciudad" :options="cities" />
      <FilterSelect v-model="selectedType" label="Tipo" :options="typeOptions" />
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
      <ChartCard title="Propiedades por tipo" type="bar" :chart-data="propertiesByTypeChart" />
      <ChartCard
        title="Ingreso estimado por ciudad"
        type="bar"
        :chart-data="estimatedRentByCityChart"
      />
    </div>

    <div class="mt-6">
      <DataTable
        :columns="tableColumns"
        :rows="tableRows"
        :empty-message="
          hasActiveFilters
            ? 'Ninguna propiedad coincide con el filtro'
            : 'Todavía no hay propiedades'
        "
        :empty-hint="
          hasActiveFilters
            ? 'Prueba a quitar alguno de los filtros.'
            : 'Registra la primera con el botón “Nueva propiedad”.'
        "
      >
        <template #cell-rentalLabel="{ value, row }">
          <StatusBadge
            :label="String(value)"
            :tone="RENTAL_MODE_TONE[row.rentalMode as RentalMode]"
          />
        </template>
        <template #cell-statusLabel="{ value, row }">
          <StatusBadge
            :label="String(value)"
            :tone="PROPERTY_STATUS_TONE[row.status as PropertyStatus]"
          />
        </template>
        <template #actions="{ row }">
          <div class="flex gap-3">
            <router-link
              class="text-primary hover:underline"
              :to="{ name: 'property-edit', params: { id: String(row.id) } }"
            >
              Editar
            </router-link>
            <button
              class="text-red-600 hover:underline"
              type="button"
              @click="onDelete(String(row.id), String(row.name))"
            >
              Eliminar
            </button>
          </div>
        </template>
      </DataTable>
    </div>
  </section>
</template>
