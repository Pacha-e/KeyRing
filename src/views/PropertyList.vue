<script setup>
// Lista de propiedades con filtro por ciudad y tabla reutilizable.
// TODO equipo: acciones de eliminar, detalle y paginación.
import { computed, ref } from 'vue'
import DataTable from '../components/DataTable.vue'
import FilterSelect from '../components/FilterSelect.vue'
import { getAll, KEYS } from '../services/storage'
import { PropertyTypeLabel, RentalModeLabel, PropertyStatusLabel } from '../models/enums'

const properties = getAll(KEYS.properties)

const city = ref('')
const cities = [...new Set(properties.map((p) => p.city))]

const columns = [
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
    <div class="page-header">
      <h1>Propiedades</h1>
      <router-link class="btn" :to="{ name: 'property-new' }">+ Nueva propiedad</router-link>
    </div>

    <div class="filters-bar">
      <FilterSelect v-model="city" label="Ciudad" :options="cities" />
    </div>

    <DataTable :columns="columns" :rows="rows">
      <template #actions="{ row }">
        <router-link :to="{ name: 'property-edit', params: { id: row.id } }">Editar</router-link>
      </template>
    </DataTable>
  </section>
</template>
