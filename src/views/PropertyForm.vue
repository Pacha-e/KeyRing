<script setup>
// Formulario de propiedad: sirve para crear (/properties/new) y editar (/properties/:id/edit).
// TODO equipo: validaciones más estrictas y selección de propietario.
import { reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { create, update, getById, KEYS } from '../services/storage'
import { PropertyType, RentalMode, PropertyStatus } from '../models/enums'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const editing = computed(() => Boolean(route.params.id))
const existente = editing.value ? getById(KEYS.properties, route.params.id) : null

const form = reactive({
  name: existente?.name ?? '',
  address: existente?.address ?? '',
  city: existente?.city ?? '',
  type: existente?.type ?? PropertyType.APARTMENT,
  rentalMode: existente?.rentalMode ?? RentalMode.AIRBNB,
  status: existente?.status ?? PropertyStatus.VACANT,
  estimatedMonthlyRent: existente?.estimatedMonthlyRent ?? 0,
  adminFee: existente?.adminFee ?? 0,
  otherFixedCosts: existente?.otherFixedCosts ?? 0,
})

const typeOptions = Object.entries(PropertyType).map(([, v]) => v)
const modeOptions = Object.entries(RentalMode).map(([, v]) => v)
const statusOptions = Object.entries(PropertyStatus).map(([, v]) => v)

function onSubmit() {
  const data = { ...form, ownerId: auth.user?.id ?? null }
  if (editing.value) {
    update(KEYS.properties, route.params.id, data)
  } else {
    create(KEYS.properties, data)
  }
  router.push({ name: 'properties' })
}
</script>

<template>
  <section class="card" style="max-width: 560px">
    <h1>{{ editing ? 'Editar propiedad' : 'Nueva propiedad' }}</h1>
    <form @submit.prevent="onSubmit">
      <label class="form-group">
        <span>Nombre</span>
        <input v-model="form.name" required />
      </label>
      <label class="form-group">
        <span>Dirección</span>
        <input v-model="form.address" required />
      </label>
      <label class="form-group">
        <span>Ciudad</span>
        <input v-model="form.city" required />
      </label>
      <label class="form-group">
        <span>Tipo</span>
        <select v-model="form.type">
          <option v-for="t in typeOptions" :key="t" :value="t">{{ t }}</option>
        </select>
      </label>
      <label class="form-group">
        <span>Modalidad de arriendo</span>
        <select v-model="form.rentalMode">
          <option v-for="m in modeOptions" :key="m" :value="m">{{ m }}</option>
        </select>
      </label>
      <label class="form-group">
        <span>Estado</span>
        <select v-model="form.status">
          <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
        </select>
      </label>
      <label class="form-group">
        <span>Arriendo mensual estimado (COP)</span>
        <input v-model.number="form.estimatedMonthlyRent" type="number" min="0" />
      </label>
      <label class="form-group">
        <span>Cuota de administración (COP)</span>
        <input v-model.number="form.adminFee" type="number" min="0" />
      </label>
      <label class="form-group">
        <span>Otros costos fijos (COP)</span>
        <input v-model.number="form.otherFixedCosts" type="number" min="0" />
      </label>
      <button class="btn" type="submit">Guardar</button>
      <router-link class="btn btn-secondary" :to="{ name: 'properties' }">Cancelar</router-link>
    </form>
  </section>
</template>
