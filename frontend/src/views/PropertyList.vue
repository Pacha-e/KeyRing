<script setup lang="ts">
// Propiedades: selector + tabla + gráfico Chart.js, con CRUD completo.
import { computed, onMounted, ref } from 'vue'
import DataTable, { type TableColumn } from '../components/DataTable.vue'
import FilterSelect, { type SelectOption } from '../components/FilterSelect.vue'
import ChartCard from '../components/ChartCard.vue'
import * as propertyService from '../services/property.service'
import {
  PropertyType,
  PropertyTypeLabel,
  RentalModeLabel,
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

onMounted(reloadFromStorage)

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
  { key: 'rent', label: 'Arriendo estimado (COP)' },
]

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
    rent: p.estimatedMonthlyRent.toLocaleString('es-CO'),
  })),
)

// Gráfico: cuántas propiedades hay de cada tipo, según el filtro aplicado
const chartData = computed<ChartData<'bar'>>(() => {
  const porTipo = propertyService.countByType(matchingProperties.value)
  const tipos = Object.keys(porTipo) as PropertyType[]
  return {
    labels: tipos.map((t) => PropertyTypeLabel[t] ?? t),
    datasets: [
      {
        label: 'Propiedades',
        backgroundColor: '#2563eb',
        data: tipos.map((t) => porTipo[t]),
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
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold">Propiedades</h1>
      <router-link
        class="rounded-lg bg-primary px-4 py-2 text-sm text-white no-underline hover:bg-primary-dark"
        :to="{ name: 'property-new' }"
      >
        + Nueva propiedad
      </router-link>
    </div>

    <div class="mb-4 flex flex-wrap items-end gap-4">
      <FilterSelect v-model="selectedCity" label="Ciudad" :options="cities" />
      <FilterSelect v-model="selectedType" label="Tipo" :options="typeOptions" />
    </div>

    <ChartCard title="Propiedades por tipo" type="bar" :chart-data="chartData" />

    <div class="mt-6">
      <DataTable :columns="tableColumns" :rows="tableRows">
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
