<script setup lang="ts">
// Lista de propiedades con filtro por ciudad y tabla reutilizable.
// TODO equipo: acciones de eliminar, detalle y paginación.
import { computed, ref } from 'vue'
import DataTable, { type TableColumn } from '../components/DataTable.vue'
import FilterSelect from '../components/FilterSelect.vue'
import { getAll, KEYS } from '../services/storage'
import {
  PropertyTypeLabel,
  RentalModeLabel,
  PropertyStatusLabel,
} from '../interfaces/enums'
import type { PropertyInterface } from '../interfaces/PropertyInterface'

const properties = getAll<PropertyInterface>(KEYS.properties)

const city = ref('')
const cities = [...new Set(properties.map((p) => p.city))]

const columns: TableColumn[] = [
  { key: 'name', label: 'Nombre' },
  { key: 'city', label: 'Ciudad' },
  { key: 'typeLabel', label: 'Tipo' },
  { key: 'rentalLabel', label: 'Modalidad' },
  { key: 'statusLabel', label: 'Estado' },
]

const rows = computed(() =>
  properties
    .filter((p) => !city.value || p.city === city.value)
    .map((p) => ({
      ...p,
      typeLabel: PropertyTypeLabel[p.type] ?? p.type,
      rentalLabel: RentalModeLabel[p.rentalMode] ?? p.rentalMode,
      statusLabel: PropertyStatusLabel[p.status] ?? p.status,
    })),
)
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
    </div>

    <DataTable :columns="columns" :rows="rows">
      <template #actions="{ row }">
        <router-link
          class="text-primary hover:underline"
          :to="{ name: 'property-edit', params: { id: String(row.id) } }"
        >
          Editar
        </router-link>
      </template>
    </DataTable>
  </section>
</template>
