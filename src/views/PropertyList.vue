<script setup lang="ts">
// Lista de propiedades: selector (ciudad, tipo, estado) + tabla + gráfico Chart.js + eliminar.
// Una de las 2 páginas obligatorias con selector + tabla + gráfico (junto con Transacciones).
import { computed, ref } from 'vue'
import DataTable, { type TableColumn } from '../components/DataTable.vue'
import FilterSelect, { type SelectOption } from '../components/FilterSelect.vue'
import ChartCard from '../components/ChartCard.vue'
import StatusBadge, { type BadgeTone } from '../components/StatusBadge.vue'
import { getProperties, deleteProperty } from '../services/property.service'
import { calculateEstimatedIncomeByCity } from '../utils/finance'
import {
  PropertyType,
  PropertyTypeLabel,
  RentalMode,
  RentalModeLabel,
  PropertyStatus,
  PropertyStatusLabel,
} from '../interfaces/enums'
import type { PropertyInterface } from '../interfaces/PropertyInterface'
import type { ChartData } from 'chart.js'

// ref (no const plano) para que la tabla se actualice al eliminar sin recargar la página
const properties = ref<PropertyInterface[]>(getProperties())

const city = ref('')
const type = ref('')
const status = ref('')

const cities = computed(() => [...new Set(properties.value.map((p) => p.city))])
const typeOptions: SelectOption[] = Object.values(PropertyType).map((v) => ({
  value: v,
  label: PropertyTypeLabel[v] ?? v,
}))
const statusOptions: SelectOption[] = Object.values(PropertyStatus).map((v) => ({
  value: v,
  label: PropertyStatusLabel[v] ?? v,
}))

const columns: TableColumn[] = [
  { key: 'name', label: 'Nombre' },
  { key: 'city', label: 'Ciudad' },
  { key: 'typeLabel', label: 'Tipo' },
  { key: 'rentalLabel', label: 'Modalidad' },
  { key: 'statusLabel', label: 'Estado' },
]

const filtered = computed(() =>
  properties.value.filter(
    (p) =>
      (!city.value || p.city === city.value) &&
      (!type.value || p.type === type.value) &&
      (!status.value || p.status === status.value),
  ),
)

const rows = computed(() =>
  filtered.value.map((p) => ({
    ...p,
    typeLabel: PropertyTypeLabel[p.type] ?? p.type,
    rentalLabel: RentalModeLabel[p.rentalMode] ?? p.rentalMode,
    statusLabel: PropertyStatusLabel[p.status] ?? p.status,
  })),
)

// Gráfico: ingreso mensual estimado por ciudad, sobre el conjunto filtrado
const chartData = computed<ChartData<'bar'>>(() => {
  const byCity = calculateEstimatedIncomeByCity(filtered.value)
  return {
    labels: byCity.map((c) => c.city),
    datasets: [
      { label: 'Ingreso estimado (COP)', backgroundColor: '#b3543a', data: byCity.map((c) => c.amount) },
    ],
  }
})

function onDelete(id: string, name: string) {
  if (!confirm(`¿Eliminar la propiedad "${name}"? Esta acción no se puede deshacer.`)) return
  deleteProperty(id)
  properties.value = getProperties()
}

const statusTone: Record<PropertyStatus, BadgeTone> = {
  [PropertyStatus.ACTIVE]: 'green',
  [PropertyStatus.VACANT]: 'gray',
}

const rentalTone: Record<RentalMode, BadgeTone> = {
  [RentalMode.AIRBNB]: 'dark',
  [RentalMode.FIXED_CONTRACT]: 'blue',
  [RentalMode.BOTH]: 'purple',
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
      <FilterSelect v-model="city" label="Ciudad" :options="cities" />
      <FilterSelect v-model="type" label="Tipo" :options="typeOptions" />
      <FilterSelect v-model="status" label="Estado" :options="statusOptions" />
    </div>

    <ChartCard title="Ingreso estimado por ciudad" type="bar" :chart-data="chartData" />

    <div class="mt-6">
      <DataTable :columns="columns" :rows="rows">
        <template #cell-statusLabel="{ value, row }">
          <StatusBadge :label="String(value)" :tone="statusTone[row.status as PropertyStatus]" />
        </template>
        <template #cell-rentalLabel="{ value, row }">
          <StatusBadge :label="String(value)" :tone="rentalTone[row.rentalMode as RentalMode]" />
        </template>
        <template #actions="{ row }">
          <router-link
            class="text-primary hover:underline"
            :to="{ name: 'property-edit', params: { id: String(row.id) } }"
          >
            Editar
          </router-link>
          <button
            class="ml-3 text-red-600 hover:underline"
            type="button"
            @click="onDelete(String(row.id), String(row.name))"
          >
            Eliminar
          </button>
        </template>
      </DataTable>
    </div>
  </section>
</template>
